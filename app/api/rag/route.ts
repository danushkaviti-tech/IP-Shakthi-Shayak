import { generateRAGStreamPipeline } from "@/lib/rag/generate";
import { logTokenUsage } from "@/lib/tokenTracker";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || "guest@ipsakti.gov.in";
    const body = await request.json();
    const {
      question,
      language = "English",
      attachedFiles = [],
      chatHistory = [],
      sessionId,
      stream = true,
    } = body;

    if (!question?.trim()) {
      return Response.json(
        {
          success: false,
          error: "Question is required",
        },
        { status: 400 }
      );
    }

    if (stream) {
      const textEncoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          let classification: any = null;
          let sourcesCount = 0;
          let totalLatency = 0;
          let promptTokens = 0;
          let completionTokens = 0;
          let totalTokens = 0;
          let questionType: "conversation" | "rag" = "rag";

          try {
            for await (const chunk of generateRAGStreamPipeline(
              question.trim(),
              language,
              attachedFiles,
              chatHistory,
              userEmail
            )) {
              if (chunk.event === "meta") {
                const metaData = chunk.data as any;
                classification = metaData?.classification;
                sourcesCount = metaData?.sources?.length || 0;
                questionType = (metaData?.type as "conversation" | "rag") || "rag";
              } else if (chunk.event === "done") {
                const doneData = chunk.data as any;
                totalLatency = doneData?.latencyMs || 0;
                promptTokens = doneData?.promptTokens || 0;
                completionTokens = doneData?.completionTokens || 0;
                totalTokens = doneData?.totalTokens || 0;
              }

              controller.enqueue(
                textEncoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
              );
            }

            // Log token usage after streaming ends
            logTokenUsage({
              userId: session?.user?.id,
              userEmail,
              role: (session?.user as any)?.role || "user",
              question: question.trim(),
              language,
              questionType,
              promptTokens: promptTokens || Math.ceil(question.length / 4),
              completionTokens: completionTokens || 120,
              totalTokens: totalTokens || (promptTokens + completionTokens),
              latencyMs: totalLatency,
              sourcesCount,
              classification,
            }).catch(() => {});

            controller.close();
          } catch (streamErr) {
            console.error("Stream generation error:", streamErr);
            controller.enqueue(
              textEncoder.encode(`data: ${JSON.stringify({ event: "error", error: "Streaming failed" })}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    return Response.json({ success: false, error: "Non-streaming mode not requested" }, { status: 400 });
  } catch (error) {
    console.error("RAG Error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "RAG generation failed",
      },
      { status: 500 }
    );
  }
}
