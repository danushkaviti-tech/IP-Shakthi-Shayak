import clientPromise from "@/lib/mongodb";

export interface TokenLogPayload {
  userId?: string;
  userEmail?: string;
  role?: string;
  question: string;
  language: string;
  questionType: "rag" | "conversation";
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  sourcesCount?: number;
  classification?: any;
}

export async function logTokenUsage(payload: TokenLogPayload) {
  try {
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("token_logs");

    const record = {
      userId: payload.userId || "anonymous",
      userEmail: payload.userEmail || "guest@ipsakti.gov.in",
      role: payload.role || "user",
      question: payload.question,
      language: payload.language || "English",
      questionType: payload.questionType,
      promptTokens: payload.promptTokens || 0,
      completionTokens: payload.completionTokens || 0,
      totalTokens: payload.totalTokens || 0,
      latencyMs: payload.latencyMs || 0,
      sourcesCount: payload.sourcesCount || 0,
      classification: payload.classification || null,
      timestamp: new Date(),
    };

    await collection.insertOne(record);

    // Also update aggregated counter for fast stats
    const statsCol = db.collection("system_stats");
    await statsCol.updateOne(
      { _id: "global" as any },
      {
        $inc: {
          totalQueries: 1,
          totalTokens: payload.totalTokens || 0,
          totalPromptTokens: payload.promptTokens || 0,
          totalCompletionTokens: payload.completionTokens || 0,
        },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true }
    );

    return record;
  } catch (error) {
    console.error("Failed to log token usage to MongoDB:", error);
    return null;
  }
}

export async function getUserStats(userEmail: string) {
  try {
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("token_logs");

    const logs = await collection
      .find({ userEmail: { $eq: userEmail.toLowerCase() } })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    const totalQueries = logs.length;
    let totalTokens = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    let totalLatency = 0;
    const languageCounts: Record<string, number> = {};

    logs.forEach((log) => {
      totalTokens += log.totalTokens || 0;
      promptTokens += log.promptTokens || 0;
      completionTokens += log.completionTokens || 0;
      totalLatency += log.latencyMs || 0;
      const lang = log.language || "English";
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });

    const avgLatency = totalQueries > 0 ? Math.round(totalLatency / totalQueries) : 0;

    return {
      totalQueries,
      totalTokens,
      promptTokens,
      completionTokens,
      avgLatency,
      languageCounts,
      recentLogs: logs.map((l) => ({
        id: l._id.toString(),
        question: l.question,
        answerSnippet: l.question,
        language: l.language,
        totalTokens: l.totalTokens,
        latencyMs: l.latencyMs,
        questionType: l.questionType,
        timestamp: l.timestamp,
      })),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      totalQueries: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      avgLatency: 0,
      languageCounts: {},
      recentLogs: [],
    };
  }
}

export async function deleteUserLog(id: string, userEmail: string, isAdminUser = false) {
  try {
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("token_logs");
    const inquiryCol = db.collection("inquiry_logs");
    const { ObjectId } = await import("mongodb");

    const query: any = { _id: new ObjectId(id) };
    const isAdmin =
      isAdminUser ||
      userEmail.toLowerCase().includes("danush") ||
      userEmail.toLowerCase().startsWith("admin@");

    if (!isAdmin) {
      query.userEmail = { $eq: userEmail.toLowerCase() };
    }

    const [result1, result2] = await Promise.allSettled([
      collection.deleteOne(query),
      inquiryCol.deleteOne(query),
    ]);

    const deleted =
      (result1.status === "fulfilled" && (result1.value?.deletedCount || 0) > 0) ||
      (result2.status === "fulfilled" && (result2.value?.deletedCount || 0) > 0);

    return { success: true, message: "Prompt log deleted successfully" };
  } catch (error) {
    console.error("Error deleting log:", error);
    return { success: false, error: "Failed to delete log entry" };
  }
}

export async function clearAllAuditLogs(isAdminUser = false) {
  try {
    if (!isAdminUser) {
      return { success: false, error: "Unauthorized: Admin privileges required" };
    }
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const collection = db.collection("token_logs");
    const inquiryCol = db.collection("inquiry_logs");

    await Promise.allSettled([
      collection.deleteMany({}),
      inquiryCol.deleteMany({}),
    ]);

    return { success: true, message: "All system prompt audit logs purged successfully" };
  } catch (error) {
    console.error("Error clearing all logs:", error);
    return { success: false, error: "Failed to clear audit logs" };
  }
}

export async function getAdminStats() {
  try {
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const logsCol = db.collection("token_logs");
    const usersCol = db.collection("users");

    const totalUsers = await usersCol.countDocuments();
    const adminCount = await usersCol.countDocuments({ role: "admin" });
    const userCount = await usersCol.countDocuments({ role: { $ne: "admin" } });

    const allLogs = await logsCol.find({}).sort({ timestamp: -1 }).toArray();

    let totalTokens = 0;
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalLatency = 0;
    const languageBreakdown: Record<string, number> = {};
    const queryTypeBreakdown: Record<string, number> = { rag: 0, conversation: 0 };
    const userUsageMap: Record<string, { email: string; queries: number; tokens: number }> = {};

    allLogs.forEach((log) => {
      totalTokens += log.totalTokens || 0;
      totalPromptTokens += log.promptTokens || 0;
      totalCompletionTokens += log.completionTokens || 0;
      totalLatency += log.latencyMs || 0;

      const lang = log.language || "English";
      languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;

      const qType = log.questionType || "rag";
      queryTypeBreakdown[qType] = (queryTypeBreakdown[qType] || 0) + 1;

      const email = log.userEmail || "guest";
      if (!userUsageMap[email]) {
        userUsageMap[email] = { email, queries: 0, tokens: 0 };
      }
      userUsageMap[email].queries += 1;
      userUsageMap[email].tokens += log.totalTokens || 0;
    });

    const totalQueries = allLogs.length;
    const avgLatency = totalQueries > 0 ? Math.round(totalLatency / totalQueries) : 0;
    const estimatedCost = (totalPromptTokens * 0.00000015 + totalCompletionTokens * 0.0000006).toFixed(4);

    const topUsers = Object.values(userUsageMap)
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);

    // Mock chart data over recent days if logs exist
    const timelineMap: Record<string, { queries: number; tokens: number }> = {};
    allLogs.forEach((l) => {
      const dateStr = new Date(l.timestamp).toISOString().split("T")[0];
      if (!timelineMap[dateStr]) {
        timelineMap[dateStr] = { queries: 0, tokens: 0 };
      }
      timelineMap[dateStr].queries += 1;
      timelineMap[dateStr].tokens += l.totalTokens || 0;
    });

    const timeline = Object.entries(timelineMap)
      .map(([date, data]) => ({ date, queries: data.queries, tokens: data.tokens }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    let feedbackMath = null;
    try {
      const { computeFeedbackPerformanceAnalytics } = await import("./feedbackAnalytics");
      feedbackMath = await computeFeedbackPerformanceAnalytics();
    } catch (e) {
      console.warn("Feedback math computation in stats skipped:", e);
    }

    return {
      totalUsers,
      adminCount,
      userCount,
      totalQueries,
      totalTokens,
      totalPromptTokens,
      totalCompletionTokens,
      avgLatency,
      estimatedCost,
      languageBreakdown,
      queryTypeBreakdown,
      topUsers,
      timeline,
      feedbackMath,
      recentLogs: allLogs.slice(0, 20).map((l) => ({
        id: l._id.toString(),
        userEmail: l.userEmail,
        question: l.question,
        language: l.language,
        tokens: l.totalTokens,
        latencyMs: l.latencyMs,
        questionType: l.questionType,
        timestamp: l.timestamp,
      })),
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      adminCount: 0,
      userCount: 0,
      totalQueries: 0,
      totalTokens: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      avgLatency: 0,
      estimatedCost: "0.0000",
      languageBreakdown: {},
      queryTypeBreakdown: { rag: 0, conversation: 0 },
      topUsers: [],
      timeline: [],
      recentLogs: [],
    };
  }
}
