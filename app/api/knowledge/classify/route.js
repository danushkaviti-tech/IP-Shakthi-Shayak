import { classifyQuestion } from "@/lib/rag/classifier";

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (!question?.trim()) {
      return Response.json(
        {
          success: false,
          error: "Question is required",
        },
        { status: 400 }
      );
    }

    const classification =
      await classifyQuestion(question.trim());

    return Response.json({
      success: true,
      question: question.trim(),
      classification,
    });

  } catch (error) {
    console.error(
      "Classification Error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Classification failed",
      },
      { status: 500 }
    );
  }
}