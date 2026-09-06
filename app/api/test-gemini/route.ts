import { askGemini } from "../test-gemini/gemini.js";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || !question.trim()) {
      return Response.json(
        {
          error: "Question is required",
        },
        {
          status: 400,
        }
      );
    }

    const answer = await askGemini(question);

    return Response.json({
      answer,
    });

  } catch (error) {
    console.error("ASK API ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate answer",
      },
      {
        status: 503,
      }
    );
  }
}