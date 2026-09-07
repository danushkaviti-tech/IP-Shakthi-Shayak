import { ChromaClient } from "chromadb";

const host = process.env.CHROMA_SERVER_HOST || "localhost";
const port = parseInt(process.env.CHROMA_SERVER_HTTP_PORT || "8000", 10);

const client = new ChromaClient({
  ssl: false,
  host,
  port,
});

export async function getKnowledgeCollection() {
  const collection = await client.getOrCreateCollection({
    name: "ip_sakti_knowledge",
    embeddingFunction: null,
  });

  return collection;
}

export async function addKnowledge(
  text: string,
  embedding: number[],
  metadata: {
    source: string;
    document: string;
    section?: string;
    jurisdiction?: string;
    ipType?: string;
    language?: string;
    version?: string;
    userEmail?: string;
  }
) {
  const collection = await getKnowledgeCollection();

  await collection.add({
    ids: [crypto.randomUUID()],
    documents: [text],
    embeddings: [embedding],
    metadatas: [metadata],
  });

  return true;
}

export async function getChromaStats() {
  try {
    const collection = await getKnowledgeCollection();
    const count = await collection.count();
    return {
      connected: true,
      host,
      port,
      collectionName: "ip_sakti_knowledge",
      totalVectors: count,
    };
  } catch (error) {
    console.error("Chroma connection error:", error);
    return {
      connected: false,
      host,
      port,
      collectionName: "ip_sakti_knowledge",
      totalVectors: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}