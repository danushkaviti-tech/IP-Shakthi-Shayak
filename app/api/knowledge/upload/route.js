import { extractPDFText } from "@/lib/rag/pdf";
import { splitText } from "@/lib/rag/chunk";
import { generateEmbedding } from "@/lib/embeddings/embed";
import { addKnowledge } from "@/lib/rag/chroma";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";
import fs from "fs/promises";
import path from "path";

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

      // Save raw text to data/documents
      const docsDir = path.join(process.cwd(), "data", "documents");
      await fs.mkdir(docsDir, { recursive: true });
      const textFilePath = path.join(docsDir, `${docTitle.replace(/[^a-z0-9_-]/gi, "_")}.txt`);
      await fs.writeFile(textFilePath, text, "utf-8");

      const client = await clientPromise;
      const db = client.db("ip-sakti");
      const documents = db.collection("documents");

      const result = await documents.insertOne({
        userEmail: session.user.email,
        name: `${docTitle}.txt`,
        originalName: `${docTitle}.txt`,
        filePath: textFilePath,
        chunks: chunks.length,
        characters: text.length,
        type: "text/plain",
        jurisdiction,
        ipType,
        status: "Indexed",
        uploadedAt: new Date(),
      });

      return Response.json({
        success: true,
        message: "Text indexed successfully into ChromaDB",
        file: `${docTitle}.txt`,
        totalCharacters: text.length,
        totalChunks: chunks.length,
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
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save physical file to disk for downloading/viewing
    const docsDir = path.join(process.cwd(), "data", "documents");
    await fs.mkdir(docsDir, { recursive: true });
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(docsDir, safeFileName);
    await fs.writeFile(filePath, buffer);

    let text = "";
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      text = await extractPDFText(buffer);
    } else {
      // Text file
      text = buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return Response.json(
        {
          success: false,
          error: "Could not extract readable text from document",
        },
        { status: 400 }
      );
    }

    const chunks = splitText(text, 1000, 200);

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

    // Save in MongoDB
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const documents = db.collection("documents");

    const result = await documents.insertOne({
      userEmail: session.user.email,
      name: file.name,
      originalName: file.name,
      filePath,
      chunks: chunks.length,
      characters: text.length,
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