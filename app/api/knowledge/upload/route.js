import { extractPDFText } from "@/lib/rag/pdf";
import { splitText } from "@/lib/rag/chunk";
import { generateEmbedding } from "@/lib/embeddings/embed";
import { addKnowledge } from "@/lib/rag/chroma";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    // Check logged-in user
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

    const formData = await request.formData();
    const file = formData.get("file");

    // Check file
    if (!file || typeof file === "string") {
      return Response.json(
        {
          success: false,
          error: "PDF file is required",
        },
        { status: 400 }
      );
    }

    // Check PDF
    if (file.type !== "application/pdf") {
      return Response.json(
        {
          success: false,
          error: "Only PDF files are supported",
        },
        { status: 400 }
      );
    }

    console.log("=================================");
    console.log("PDF UPLOAD STARTED");
    console.log("User:", session.user.email);
    console.log("File:", file.name);
    console.log("=================================");

    // Convert PDF to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text
    console.log("Extracting PDF text...");

    const text = await extractPDFText(buffer);

    if (!text.trim()) {
      return Response.json(
        {
          success: false,
          error: "Could not extract text from PDF",
        },
        { status: 400 }
      );
    }

    console.log("PDF text extracted");
    console.log("Characters:", text.length);

    // Split into chunks
    const chunks = splitText(text, 1000, 200);

    console.log("Total chunks:", chunks.length);

    // Generate embeddings and store in ChromaDB
    console.log("Starting embedding generation...");

    for (let i = 0; i < chunks.length; i++) {
      console.log(
        `Processing chunk ${i + 1}/${chunks.length}`
      );

      const embedding = await generateEmbedding(chunks[i]);

      await addKnowledge(chunks[i], embedding, {
        source: file.name,
        document: file.name,
        section: `Chunk ${i + 1}`,
        jurisdiction: "India",
        language: "English",
        version: "Unknown",

        // Store user information with Chroma metadata
        userEmail: session.user.email,
      });
    }

    console.log("All chunks stored in ChromaDB");

    // =========================================
    // SAVE DOCUMENT INFORMATION IN MONGODB
    // =========================================

    console.log("Connecting to MongoDB...");

    const client = await clientPromise;

    const db = client.db("ip-sakti");

    const documents = db.collection("documents");

    console.log("ABOUT TO SAVE DOCUMENT TO MONGODB");

    const result = await documents.insertOne({
      userEmail: session.user.email,
      name: file.name,
      chunks: chunks.length,
      characters: text.length,
      type: "application/pdf",
      status: "Indexed",
      uploadedAt: new Date(),
    });

    console.log("=================================");
    console.log("MONGODB INSERT SUCCESS");
    console.log("Database: ip-sakti");
    console.log("Collection: documents");
    console.log("Document ID:", result.insertedId);
    console.log("User:", session.user.email);
    console.log("File:", file.name);
    console.log("=================================");

    // Success response
    return Response.json({
      success: true,
      message: "PDF successfully added to knowledge base",
      file: file.name,
      totalCharacters: text.length,
      totalChunks: chunks.length,
      documentId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("=================================");
    console.error("PDF INGESTION ERROR");
    console.error(error);
    console.error("=================================");

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "PDF ingestion failed",
      },
      { status: 500 }
    );
  }
}