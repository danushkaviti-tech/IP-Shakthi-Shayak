import { generateRAGAnswer } from "@/lib/rag/generate";

export async function POST(request) {

  try {

    const { question, language = "English" } =
      await request.json();

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
      language
    );

    return Response.json({
      success: true,
      ...result,
    });

  } catch (error) {

    console.error("RAG Error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "RAG generation failed",
      },
      { status: 500 }
    );

  }

}