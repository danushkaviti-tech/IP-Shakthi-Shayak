import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserStats, getAdminStats, deleteUserLog } from "@/lib/tokenTracker";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const userRole = (session?.user as any)?.role;
    const userEmail = (session?.user as any)?.email?.toLowerCase() || "";
    const isAdmin = userRole === "admin" || userEmail.includes("danush");

    // Admin users list
    if (type === "users") {
      if (!session?.user || !isAdmin) {
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
          queries: stats.queries,
          tokens: stats.tokens,
        };
      });

      return NextResponse.json({ success: true, users: userList });
    }

    // Admin system stats
    if (type === "admin") {
      if (!session?.user || !isAdmin) {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
      const stats = await getAdminStats();
      return NextResponse.json({ success: true, stats });
    }

    // Default: User stats
    const email = session?.user?.email || "guest@ipsakti.gov.in";
    const stats = await getUserStats(email);
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load telemetry stats" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email || "guest@ipsakti.gov.in";
    const userRole = (session?.user as any)?.role;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    // If deleting a user account
    if (type === "user") {
      const isAdmin = userRole === "admin" || email.toLowerCase().includes("danush");
      if (!session?.user || !isAdmin) {
        return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
      }

      const client = await clientPromise;
      const db = client.db("ip-sakti");
      const usersCol = db.collection("users");
      const { ObjectId } = await import("mongodb");

      const targetUser = await usersCol.findOne({ _id: new ObjectId(id) });
      if (!targetUser) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }

      if ((targetUser.email || "").toLowerCase().includes("danush")) {
        return NextResponse.json({ success: false, error: "Cannot delete master admin account" }, { status: 400 });
      }

      await usersCol.deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ success: true, message: "User deleted successfully" });
    }

    // Deleting inquiry log
    const result = await deleteUserLog(id, email);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process delete request" },
      { status: 500 }
    );
  }
}
