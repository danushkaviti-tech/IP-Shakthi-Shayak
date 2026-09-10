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
 * Searches ChromaDB vector store and MongoDB full-text search concurrently.
 * This Hybrid approach guarantees exact keywords from DB and semantic matches from Vector DB,
 * while improving latency by running them in parallel.
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

  const queryTerms = cleanQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => {
      const isStopWord = ["who", "what", "where", "when", "why", "how", "is", "the", "and", "for", "with", "this", "that", "are"].includes(w);
      if (isStopWord) return false;
      const hasNumber = /\d/.test(w);
      return w.length >= 3 || hasNumber;
    });

  // 1. Vector Search via ChromaDB
  const chromaPromise = (async () => {
    const embedding = await generateEmbedding(cleanQuery);
    const collection = await getKnowledgeCollection();

    let where: any = undefined;
    if (filters && Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([key, value]) => ({
        [key]: { $eq: value },
      }));
      where = conditions.length === 1 ? conditions[0] : { $and: conditions };
    }

    return collection.query({
      queryEmbeddings: [embedding],
      nResults: topK,
      ...(where ? { where } : {}),
    });
  })();

  // 2. Direct MongoDB Ingestion Fallback (Searches uploaded team documents & PDFs)
  const mongoPromise = (async () => {
    if (queryTerms.length === 0) return [];
    
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("documents");

    // Search by regex terms on rawText and fileName
    const searchRegexes = queryTerms.map((term) => new RegExp(term, "i"));
    return collection
      .find({
        $or: [
          { rawText: { $in: searchRegexes } },
          { name: { $in: searchRegexes } },
          { originalName: { $in: searchRegexes } },
        ],
      })
      .limit(topK)
      .toArray();
  })();

  // Run both concurrently
  const [chromaResult, mongoResult] = await Promise.allSettled([chromaPromise, mongoPromise]);

  const candidateDocs: { doc: string; meta: any; dist: number }[] = [];

  // Add Mongo Results (Exact matches - high priority / low distance)
  if (mongoResult.status === "fulfilled" && mongoResult.value) {
    const mongoDocs = mongoResult.value;
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

      candidateDocs.push({
        doc: bestParagraph,
        meta: {
          document: doc.name || doc.originalName || "Uploaded Document",
          source: doc.name || doc.originalName || "Uploaded Document",
          section: `${doc.name || "Document"} • Database Record`,
          page: "Page 1",
          jurisdiction: doc.jurisdiction || "India",
          ipType: doc.ipType || "Document Record",
          productType: "Database Ingested Document",
          fullText: text,
          highlight: bestParagraph.slice(0, 200) + "...",
        },
        dist: 0.05, // low distance = high match confidence for exact keyword match
      });
    }
  } else if (mongoResult.status === "rejected") {
    console.warn("MongoDB query error in hybrid search:", mongoResult.reason);
  }

  // Add Chroma Results (Semantic matches)
  if (chromaResult.status === "fulfilled" && chromaResult.value) {
    const chromaRes = chromaResult.value;
    if (chromaRes?.documents?.[0]) {
      const docs = chromaRes.documents[0] as string[];
      const metas = chromaRes.metadatas?.[0] || [];
      const dists = chromaRes.distances?.[0] || [];

      for (let i = 0; i < docs.length; i++) {
        if (!docs[i]) continue;
        const d = dists[i];
        candidateDocs.push({
          doc: docs[i],
          meta: metas[i] || {},
          dist: typeof d === "number" ? d : 0.5,
        });
      }
    }
  } else if (chromaResult.status === "rejected") {
    console.warn("ChromaDB vector search failed:", chromaResult.reason);
  }

  if (candidateDocs.length === 0) {
    return results;
  }

  // Deduplicate and rank
  candidateDocs.sort((a, b) => a.dist - b.dist);

  const uniqueDocs: typeof candidateDocs = [];
  const seenContent = new Set<string>();

  for (const item of candidateDocs) {
    const cleanDoc = item.doc.trim().slice(0, 80); // Deduplicate by first 80 chars
    if (!seenContent.has(cleanDoc)) {
      seenContent.add(cleanDoc);
      uniqueDocs.push(item);
      if (uniqueDocs.length >= topK) break;
    }
  }

  if (uniqueDocs.length > 0) {
    results.documents = [uniqueDocs.map(d => d.doc)];
    results.metadatas = [uniqueDocs.map(d => d.meta)];
    results.distances = [uniqueDocs.map(d => d.dist)];
  }

  return results;
}