import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserStats, getAdminStats, deleteUserLog } from "@/lib/tokenTracker";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // Admin users list
    if (type === "users") {
      if (!session?.user || (session.user as any).role !== "admin") {
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
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role || "user",
          createdAt: u.createdAt || new Date(),
          queries: stats.queries,
          tokens: stats.tokens,
        };
      });

      return NextResponse.json({ success: true, users: userList });
    }

    // Admin system stats
    if (type === "admin") {
      if (!session?.user || (session.user as any).role !== "admin") {
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Log ID is required" }, { status: 400 });
    }

    const result = await deleteUserLog(id, email);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete inquiry log" },
      { status: 500 }
    );
  }
}
