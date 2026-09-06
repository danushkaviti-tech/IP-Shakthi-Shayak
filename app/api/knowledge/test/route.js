import { getKnowledgeCollection } from "../../../../lib/rag/chroma";

export async function GET() {
  try {
    const collection = await getKnowledgeCollection();

    return Response.json({
      success: true,
      message: "ChromaDB connected successfully",
      collection: collection.name,
    });
  } catch (error) {
    console.error("ChromaDB Error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to connect to ChromaDB",
      },
      { status: 500 }
    );
  }
}