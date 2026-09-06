import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false,
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