import { searchKnowledge } from "@/lib/rag/search";

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (!question?.trim()) {
      return Response.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const results = await searchKnowledge(question, 5);

    return Response.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Search Error:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Search failed",
      },
      { status: 500 }
    );
  }
}