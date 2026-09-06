import { generateEmbedding } from "@/lib/embeddings/embed";
import { addKnowledge } from "@/lib/rag/chroma";

export async function GET() {
  try {
    const text =
      "Patents provide exclusive rights to inventions for a limited period.";

    const embedding = await generateEmbedding(text);

    await addKnowledge(text, embedding, {
      source: "Test Document",
      document: "IP Basics",
      section: "Patents",
      jurisdiction: "India",
      ipType: "Patent",
      language: "English",
      version: "Test v1",
    });

    return Response.json({
      success: true,
      message: "Chunk stored successfully in ChromaDB",
      embeddingDimensions: embedding.length,
    });
  } catch (error) {
    console.error("Storage Error:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Failed to store chunk",
      },
      { status: 500 }
    );
  }
}