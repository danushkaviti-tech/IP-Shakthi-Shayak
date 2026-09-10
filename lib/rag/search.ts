import { generateEmbedding } from "@/lib/embeddings/embed";
import { getKnowledgeCollection } from "./chroma";
import clientPromise from "@/lib/mongodb";

export interface SearchResultItem {
  id?: string;
  document: string;
  source: string;
  content: string;
  section: string;
  page?: string;
  jurisdiction?: string;
  ipType?: string;
  productType?: string;
  highlight?: string;
  score: number;
}

/**
 * Searches ChromaDB vector store and falls back to MongoDB full-text search
 * to guarantee documents stored in database are retrieved.
 */
export async function searchKnowledge(
  query: string,
  topK = 5,
  filters?: Record<string, string>
) {
  const cleanQuery = query.trim();
  const results: {
    documents: string[][];
    metadatas: any[][];
    distances: number[][];
  } = {
    documents: [[]],
    metadatas: [[]],
    distances: [[]],
  };

  // 1. Vector Search via ChromaDB
  try {
    const embedding = await generateEmbedding(cleanQuery);
    const collection = await getKnowledgeCollection();

    let where: any = undefined;
    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([key, value]) => ({
        [key]: { $eq: value },
      }));
      where = conditions.length === 1 ? conditions[0] : { $and: conditions };
    }

    const chromaRes = await collection.query({
      queryEmbeddings: [embedding],
      nResults: topK,
      ...(where ? { where } : {}),
    });

    if (chromaRes?.documents?.[0] && chromaRes.documents[0].length > 0) {
      return chromaRes;
    }
  } catch (chromaError: any) {
    console.warn("ChromaDB vector search failed or empty, using MongoDB fallback:", chromaError?.message || chromaError);
  }

  // 2. Direct MongoDB Ingestion Fallback (Searches uploaded team documents & PDFs)
  try {
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("documents");

    const queryTerms = cleanQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !["who", "what", "is", "the", "and"].includes(w));

    // Search by regex terms on rawText and fileName
    const searchRegexes = queryTerms.map((term) => new RegExp(term, "i"));
    const mongoDocs = await collection
      .find({
        $or: [
          { rawText: { $in: searchRegexes } },
          { name: { $in: searchRegexes } },
          { originalName: { $in: searchRegexes } },
        ],
      })
      .limit(topK)
      .toArray();

    if (mongoDocs && mongoDocs.length > 0) {
      const docsArr: string[] = [];
      const metasArr: any[] = [];
      const distsArr: number[] = [];

      for (const doc of mongoDocs) {
        const text = (doc.rawText || "").trim();
        if (!text) continue;

        // Extract the most relevant paragraph
        const paragraphs = text.split(/\n{2,}|\r\n{2,}/).filter((p: string) => p.trim().length > 20);
        let bestParagraph = paragraphs[0] || text.slice(0, 500);

        for (const p of paragraphs) {
          const lowerP = p.toLowerCase();
          if (queryTerms.some((t) => lowerP.includes(t))) {
            bestParagraph = p.trim();
            break;
          }
        }

        docsArr.push(bestParagraph);
        metasArr.push({
          document: doc.name || doc.originalName || "Uploaded Document",
          source: doc.name || doc.originalName || "Uploaded Document",
          section: `${doc.name || "Document"} • Database Record`,
          page: "Page 1",
          jurisdiction: doc.jurisdiction || "India",
          ipType: doc.ipType || "Document Record",
          productType: "Database Ingested Document",
          fullText: text,
          highlight: bestParagraph.slice(0, 200) + "...",
        });
        distsArr.push(0.05); // low distance = high match confidence
      }

      if (docsArr.length > 0) {
        results.documents = [docsArr];
        results.metadatas = [metasArr];
        results.distances = [distsArr];
        return results;
      }
    }
  } catch (mongoError) {
    console.warn("MongoDB fallback query error:", mongoError);
  }

  return results;
}