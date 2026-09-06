import { generateEmbedding } from "@/lib/embeddings/embed";

export async function GET() {
  try {
    const text =
      "Patents provide exclusive rights to inventions.";

    const embedding = await generateEmbedding(text);

    return Response.json({
      success: true,
      text,
      dimensions: embedding.length,
      firstFiveValues: embedding.slice(0, 5),
    });
  } catch (error) {
    console.error("Embedding Error:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Embedding generation failed",
      },
      { status: 500 }
    );
  }
}