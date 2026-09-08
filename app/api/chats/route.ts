import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || "guest@ipsakti.gov.in";
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("chat_sessions");

    // Single session details
    if (sessionId) {
      let query: any = { sessionId, userEmail };
      if (ObjectId.isValid(sessionId)) {
        query = {
          $or: [{ _id: new ObjectId(sessionId), userEmail }, { sessionId, userEmail }],
        };
      }
      const chat = await collection.findOne(query);
      if (!chat) {
        return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        session: {
          id: chat.sessionId || chat._id.toString(),
          title: chat.title,
          messages: chat.messages || [],
          language: chat.language || "English",
          updatedAt: chat.updatedAt,
          createdAt: chat.createdAt,
        },
      });
    }

    // List all sessions for user
    const chats = await collection
      .find({ userEmail })
      .project({
        sessionId: 1,
        title: 1,
        language: 1,
        updatedAt: 1,
        createdAt: 1,
        lastMessage: { $slice: ["$messages", -1] },
      })
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      sessions: chats.map((c) => ({
        id: c.sessionId || c._id.toString(),
        title: c.title || "Untitled Session",
        updatedAt: c.updatedAt || c.createdAt || new Date(),
        language: c.language || "English",
      })),
    });
  } catch (error) {
    console.error("Chats GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || "guest@ipsakti.gov.in";
    const body = await req.json();

    const { id, title, messages = [], language = "English" } = body;

    const sessionId = id || `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const inferredTitle =
      title ||
      messages.find((m: any) => m.role === "user")?.content?.slice(0, 45) ||
      "New IP Consultation";

    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("chat_sessions");

    const updateDoc = {
      sessionId,
      userEmail,
      title: inferredTitle,
      messages,
      language,
      updatedAt: new Date(),
    };

    await collection.updateOne(
      { sessionId, userEmail },
      {
        $set: updateDoc,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      sessionId,
      title: inferredTitle,
    });
  } catch (error) {
    console.error("Chats POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save chat session" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || "guest@ipsakti.gov.in";
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("chat_sessions");

    if (all === "true") {
      await collection.deleteMany({ userEmail });
      return NextResponse.json({ success: true, message: "All chat sessions cleared" });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 });
    }

    let query: any = { sessionId: id, userEmail };
    if (ObjectId.isValid(id)) {
      query = {
        $or: [{ _id: new ObjectId(id), userEmail }, { sessionId: id, userEmail }],
      };
    }

    await collection.deleteOne(query);
    return NextResponse.json({ success: true, message: "Chat session deleted" });
  } catch (error) {
    console.error("Chats DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete chat session" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || "guest@ipsakti.gov.in";
    const body = await req.json();
    const { id, title } = body;

    if (!id || !title?.trim()) {
      return NextResponse.json({ success: false, error: "ID and title required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("chat_sessions");

    let query: any = { sessionId: id, userEmail };
    if (ObjectId.isValid(id)) {
      query = {
        $or: [{ _id: new ObjectId(id), userEmail }, { sessionId: id, userEmail }],
      };
    }

    await collection.updateOne(query, {
      $set: { title: title.trim(), updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, title: title.trim() });
  } catch (error) {
    console.error("Chats PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to rename chat session" },
      { status: 500 }
    );
  }
}
