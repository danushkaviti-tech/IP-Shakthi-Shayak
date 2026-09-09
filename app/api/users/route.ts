import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userEmail = (session?.user as any)?.email?.toLowerCase() || "";

    if (!session?.user || (userRole !== "admin" && !userEmail.includes("danush"))) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const usersCol = db.collection("users");
    const logsCol = db.collection("token_logs");

    const users = await usersCol.find({}).sort({ createdAt: -1 }).toArray();
    const logs = await logsCol.find({}).toArray();

    const userStatsMap: Record<string, { queries: number; tokens: number }> = {};
    logs.forEach((log) => {
      const email = log.userEmail?.toLowerCase() || "";
      if (!userStatsMap[email]) {
        userStatsMap[email] = { queries: 0, tokens: 0 };
      }
      userStatsMap[email].queries += 1;
      userStatsMap[email].tokens += log.totalTokens || 0;
    });

    const userList = users.map((u) => {
      const email = u.email?.toLowerCase() || "";
      const stats = userStatsMap[email] || { queries: 0, tokens: 0 };
      const isMasterAdmin = email.includes("danush") || u.role === "admin";
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: isMasterAdmin ? "admin" : (u.role || "user"),
        createdAt: u.createdAt || new Date(),
        queries: Math.max(u.lifetimeQueries || 0, stats.queries),
        tokens: Math.max(u.lifetimeTokens || 0, stats.tokens),
      };
    });

    return NextResponse.json({ success: true, users: userList });
  } catch (error) {
    console.error("GET users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const adminEmail = (session?.user as any)?.email?.toLowerCase() || "";

    // Verify Admin authentication
    if (!session?.user || (userRole !== "admin" && !adminEmail.includes("danush"))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("id");

    if (!userId) {
      try {
        const body = await req.json();
        userId = body.id;
      } catch {
        // No body
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Target User ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const usersCol = db.collection("users");
    const logsCol = db.collection("token_logs");
    const chatsCol = db.collection("chat_sessions");
    const inquiryCol = db.collection("inquiry_logs");

    let targetObjId: ObjectId;
    try {
      targetObjId = new ObjectId(userId);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid User ID format" },
        { status: 400 }
      );
    }

    // Find the user to be deleted
    const targetUser = await usersCol.findOne({ _id: targetObjId });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found in database" },
        { status: 404 }
      );
    }

    const targetEmail = (targetUser.email || "").toLowerCase().trim();

    // Protect primary Master Admin account from deletion
    if (targetEmail === "danush@ipsakti.gov.in" || targetEmail === "danush" || targetEmail.includes("danush")) {
      return NextResponse.json(
        { success: false, error: "Protected Account: Primary administrator cannot be deleted" },
        { status: 400 }
      );
    }

    // Delete user from users collection
    const deleteResult = await usersCol.deleteOne({ _id: targetObjId });

    // Purge associated user logs and chat history
    if (targetEmail) {
      await Promise.allSettled([
        logsCol.deleteMany({ userEmail: targetEmail }),
        chatsCol.deleteMany({ userEmail: targetEmail }),
        inquiryCol.deleteMany({ userEmail: targetEmail }),
      ]);
    }

    return NextResponse.json({
      success: true,
      message: `User account "${targetUser.name || targetEmail}" and related records deleted successfully.`,
      deletedId: userId,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete user account" },
      { status: 500 }
    );
  }
}
