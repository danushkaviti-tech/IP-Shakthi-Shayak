import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    console.log("SESSION:", session);

    if (!session?.user?.email) {
      return Response.json(
        {
          success: false,
          error: "User not logged in",
        },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ip-sakti");

    const documents = db.collection("documents");

    const allDocuments = await documents.find({}).toArray();

    console.log("ALL DOCUMENTS:", allDocuments);

    const userDocuments = await documents
      .find({
        userEmail: session.user.email,
      })
      .sort({
        uploadedAt: -1,
      })
      .toArray();

    console.log("USER DOCUMENTS:", userDocuments);

    return Response.json({
      success: true,
      documents: userDocuments.map((doc) => ({
        id: doc._id.toString(),
        name: doc.name,
        chunks: doc.chunks,
        characters: doc.characters,
        type: doc.type,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
      })),
      totalDocuments: userDocuments.length,
      totalChunks: userDocuments.reduce(
        (sum, doc) => sum + (doc.chunks || 0),
        0
      ),
    });
  } catch (error) {
    console.error("DOCUMENT FETCH ERROR:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch documents",
      },
      { status: 500 }
    );
  }
}