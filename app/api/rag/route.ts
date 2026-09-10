import { generateRAGStreamPipeline, AttachedFileContext } from "@/lib/rag/generate";
import { extractPDFText } from "@/lib/rag/pdf";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      stream = true,
    } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return Response.json({ success: false, error: "Question is required" }, { status: 400 });
    }

    // SIH 26045 Ingestion Validation: Convert base64 PDF buffers into verified raw text
    const validatedAttachedFiles: AttachedFileContext[] = [];

    if (Array.isArray(attachedFiles)) {
      for (const file of attachedFiles) {
        if (!file || typeof file.content !== "string" || !file.content.trim()) continue;

        let finalContent = file.content;

        if (finalContent.startsWith("BASE64_PDF:")) {
          try {
            const base64Data = finalContent.replace("BASE64_PDF:", "");
            const buffer = Buffer.from(base64Data, "base64");
            const extracted = await extractPDFText(buffer);
            if (extracted && extracted.trim()) {
              finalContent = extracted;
            }
          } catch (pdfErr) {
            console.error("PDF Base64 extraction error in route:", pdfErr);
          }
        }

        if (finalContent.trim()) {
          validatedAttachedFiles.push({
            name: String(file.name || "Uploaded Document"),
            content: finalContent,
            type: file.type ? String(file.type) : "Document Analysis",
          });
        }
      }
    }

    if (stream) {
      const textEncoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateRAGStreamPipeline(
              question.trim(),
              language,
              validatedAttachedFiles,
              chatHistory,
              userEmail
            )) {
              controller.enqueue(textEncoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            controller.close();
          } catch (streamErr: any) {
            controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ event: "error", error: streamErr?.message })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    return Response.json({ success: false, error: "Streaming required" }, { status: 400 });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}