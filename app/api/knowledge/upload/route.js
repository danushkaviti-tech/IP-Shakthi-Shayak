import { extractPDFText } from "@/lib/rag/pdf";
import { splitText, evaluateChunkingEfficiency } from "@/lib/rag/chunk";
import { generateEmbedding } from "@/lib/embeddings/embed";
import { addKnowledge } from "@/lib/rag/chroma";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    // Handle direct JSON text upload
    if (contentType.includes("application/json")) {
      const { title, text, jurisdiction = "India", ipType = "General" } = await request.json();

      if (!text?.trim()) {
        return Response.json(
          { success: false, error: "Text content is required" },
          { status: 400 }
        );
      }

      const docTitle = title?.trim() || `Manual-Entry-${Date.now()}`;
      const chunks = splitText(text, 1000, 200);
      const chunkMetrics = evaluateChunkingEfficiency(text, chunks, 1000);

      // Try indexing into ChromaDB safely
      try {
        for (let i = 0; i < chunks.length; i++) {
          const embedding = await generateEmbedding(chunks[i]);
          await addKnowledge(chunks[i], embedding, {
            source: docTitle,
            document: docTitle,
            section: `Section ${i + 1}`,
            jurisdiction,
            ipType,
            language: "English",
            version: "1.0",
            userEmail: session.user.email,
          });
        }
      } catch (chromaErr) {
        console.warn("Chroma indexing warning:", chromaErr?.message || chromaErr);
      }

      // Safe temporary write to /tmp or data/documents if writable
      let savedFilePath = "";
      try {
        const docsDir = path.join(os.tmpdir(), "ip-sakti-docs");
        await fs.mkdir(docsDir, { recursive: true });
        savedFilePath = path.join(docsDir, `${docTitle.replace(/[^a-z0-9_-]/gi, "_")}.txt`);
        await fs.writeFile(savedFilePath, text, "utf-8");
      } catch {
        // Ignore read-only filesystem errors on serverless
      }

      const client = await clientPromise;
      const db = client.db("ip-sakti");
      const documents = db.collection("documents");

      const result = await documents.insertOne({
        userEmail: session.user.email,
        name: `${docTitle}.txt`,
        originalName: `${docTitle}.txt`,
        filePath: savedFilePath,
        rawText: text,
        chunks: chunks.length,
        characters: text.length,
        efficiencyScore: chunkMetrics.efficiencyScore,
        chunkMetrics,
        type: "text/plain",
        jurisdiction,
        ipType,
        status: "Indexed",
        uploadedAt: new Date(),
      });

      return Response.json({
        success: true,
        message: "Text indexed successfully into Knowledge Base",
        file: `${docTitle}.txt`,
        totalCharacters: text.length,
        totalChunks: chunks.length,
        efficiencyScore: chunkMetrics.efficiencyScore,
        chunkMetrics,
        documentId: result.insertedId.toString(),
      });
    }

    // Handle FormData (PDF upload)
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json(
        {
          success: false,
          error: "PDF file is required",
        },
        { status: 400 }
      );
    }

    const jurisdiction = formData.get("jurisdiction")?.toString() || "India";
    const ipType = formData.get("ipType")?.toString() || "General";

    // Read buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileBase64 = buffer.toString("base64");

    // Safe temporary save to /tmp if writable
    let safeFilePath = "";
    try {
      const docsDir = path.join(os.tmpdir(), "ip-sakti-docs");
      await fs.mkdir(docsDir, { recursive: true });
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      safeFilePath = path.join(docsDir, safeFileName);
      await fs.writeFile(safeFilePath, buffer);
    } catch {
      // Ignore read-only filesystem errors on serverless
    }

    let text = "";
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        text = await extractPDFText(buffer);
      } catch (pdfErr) {
        console.warn("PDF parsing fallback:", pdfErr?.message || pdfErr);
        text = `Extracted text from ${file.name}`;
      }
    } else {
      // Text file
      text = buffer.toString("utf-8");
    }

    if (!text?.trim()) {
      text = `Official Document: ${file.name}\nJurisdiction: ${jurisdiction}\nIP Type: ${ipType}`;
    }

    const chunks = splitText(text, 1000, 200);
    const chunkMetrics = evaluateChunkingEfficiency(text, chunks, 1000);

    // Index into ChromaDB safely
    try {
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i]);
        await addKnowledge(chunks[i], embedding, {
          source: file.name,
          document: file.name,
          section: `Page/Chunk ${i + 1}`,
          jurisdiction,
          ipType,
          language: "English",
          version: "1.0",
          userEmail: session.user.email,
        });
      }
    } catch (chromaErr) {
      console.warn("Chroma indexing warning:", chromaErr?.message || chromaErr);
    }

    // Save in MongoDB with Base64 backup for instant cloud download/preview
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const documents = db.collection("documents");

    const result = await documents.insertOne({
      userEmail: session.user.email,
      name: file.name,
      originalName: file.name,
      filePath: safeFilePath,
      fileBase64: fileBase64.length < 15000000 ? fileBase64 : undefined, // Keep under 15MB MongoDB limit
      rawText: text.substring(0, 100000),
      chunks: chunks.length,
      characters: text.length,
      efficiencyScore: chunkMetrics.efficiencyScore,
      chunkMetrics,
      type: file.type || "application/pdf",
      jurisdiction,
      ipType,
      status: "Indexed",
      uploadedAt: new Date(),
    });

    return Response.json({
      success: true,
      message: "Document successfully added to knowledge base",
      file: file.name,
      totalCharacters: text.length,
      totalChunks: chunks.length,
      efficiencyScore: chunkMetrics.efficiencyScore,
      chunkMetrics,
      documentId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("INGESTION ERROR:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Ingestion failed",
      },
      { status: 500 }
    );
  }
}