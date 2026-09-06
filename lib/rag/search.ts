import { generateEmbedding } from "@/lib/embeddings/embed";
import { getKnowledgeCollection } from "./chroma";

export async function searchKnowledge(
  query: string,
  topK = 5,
  filters?: Record<string, string>
) {
  const embedding = await generateEmbedding(query);

  const collection = await getKnowledgeCollection();

  let where: any = undefined;

  if (filters && Object.keys(filters).length > 0) {
    const conditions = Object.entries(filters).map(
      ([key, value]) => ({
        [key]: { $eq: value },
      })
    );

    if (conditions.length === 1) {
      where = conditions[0];
    } else {
      where = {
        $and: conditions,
      };
    }
  }

  const results = await collection.query({
    queryEmbeddings: [embedding],
    nResults: topK,
    ...(where ? { where } : {}),
  });

  return results;
}