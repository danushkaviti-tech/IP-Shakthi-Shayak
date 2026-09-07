import { generateRAGAnswer } from "@/lib/rag/generate";
import { logTokenUsage } from "@/lib/tokenTracker";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { question, language = "English", attachedFiles = [] } = await request.json();

    if (!question?.trim()) {
      return Response.json(
        {
          success: false,
          error: "Question is required",
        },
        { status: 400 }
      );
    }

    const result = await generateRAGAnswer(
      question.trim(),
      language,
      attachedFiles
    );

    // Record token usage in MongoDB
    await logTokenUsage({
      userId: session?.user?.id,
      userEmail: session?.user?.email || "guest@ipsakti.gov.in",
      role: (session?.user as any)?.role || "user",
      question: question.trim(),
      language,
      questionType: (result.type as "conversation" | "rag") || "rag",
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      totalTokens: result.totalTokens,
      latencyMs: result.latencyMs,
      sourcesCount: result.sources?.length || 0,
      classification: result.classification,
    });

    return Response.json({
      success: true,
      ...result,
    });
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
