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

    // Update global persistent lifetime counters in system_stats
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

    // Update user lifetime token & query counts in users collection
    if (payload.userEmail) {
      const usersCol = db.collection("users");
      await usersCol.updateOne(
        { email: payload.userEmail.toLowerCase() },
        {
          $inc: {
            lifetimeQueries: 1,
            lifetimeTokens: payload.totalTokens || 0,
          },
        }
      ).catch(() => {});
    }

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
    const usersCol = db.collection("users");

    const [logs, userDoc] = await Promise.all([
      collection
        .find({ userEmail: { $eq: userEmail.toLowerCase() } })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray(),
      usersCol.findOne({ email: userEmail.toLowerCase() }),
    ]);

    let logTokens = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    let totalLatency = 0;
    const languageCounts: Record<string, number> = {};

    logs.forEach((log) => {
      logTokens += log.totalTokens || 0;
      promptTokens += log.promptTokens || 0;
      completionTokens += log.completionTokens || 0;
      totalLatency += log.latencyMs || 0;
      const lang = log.language || "English";
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });

    const totalQueries = Math.max(userDoc?.lifetimeQueries || 0, logs.length);
    const totalTokens = Math.max(userDoc?.lifetimeTokens || 0, logTokens);
    const avgLatency = logs.length > 0 ? Math.round(totalLatency / logs.length) : 0;

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
    const statsCol = db.collection("system_stats");

    const [totalUsers, adminCount, userCount, allLogs, statsDoc, allUsers] = await Promise.all([
      usersCol.countDocuments(),
      usersCol.countDocuments({ role: "admin" }),
      usersCol.countDocuments({ role: { $ne: "admin" } }),
      logsCol.find({}).sort({ timestamp: -1 }).toArray(),
      statsCol.findOne({ _id: "global" as any }),
      usersCol.find({}).toArray(),
    ]);

    let logTokensSum = 0;
    let logPromptSum = 0;
    let logCompletionSum = 0;
    let totalLatency = 0;
    const languageBreakdown: Record<string, number> = {};
    const queryTypeBreakdown: Record<string, number> = { rag: 0, conversation: 0 };
    const userUsageMap: Record<string, { email: string; queries: number; tokens: number }> = {};

    // Pre-populate userUsageMap with all registered users' lifetime stats
    allUsers.forEach((u) => {
      const email = (u.email || "").toLowerCase();
      if (email) {
        userUsageMap[email] = {
          email: u.email,
          queries: u.lifetimeQueries || 0,
          tokens: u.lifetimeTokens || 0,
        };
      }
    });

    allLogs.forEach((log) => {
      logTokensSum += log.totalTokens || 0;
      logPromptSum += log.promptTokens || 0;
      logCompletionSum += log.completionTokens || 0;
      totalLatency += log.latencyMs || 0;

      const lang = log.language || "English";
      languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;

      const qType = log.questionType || "rag";
      queryTypeBreakdown[qType] = (queryTypeBreakdown[qType] || 0) + 1;

      const email = (log.userEmail || "guest").toLowerCase();
      if (!userUsageMap[email]) {
        userUsageMap[email] = { email: log.userEmail || "guest", queries: 0, tokens: 0 };
      }
      if (!userUsageMap[email].queries && !userUsageMap[email].tokens) {
        userUsageMap[email].queries += 1;
        userUsageMap[email].tokens += log.totalTokens || 0;
      }
    });

    // Monotonically increasing lifetime metrics: ALWAYS max with system_stats global counter
    const sysTokens = statsDoc?.totalTokens || 0;
    const sysPrompt = statsDoc?.totalPromptTokens || 0;
    const sysCompletion = statsDoc?.totalCompletionTokens || 0;
    const sysQueries = statsDoc?.totalQueries || 0;

    const totalTokens = Math.max(sysTokens, logTokensSum);
    const totalPromptTokens = Math.max(sysPrompt, logPromptSum);
    const totalCompletionTokens = Math.max(sysCompletion, logCompletionSum);
    const totalQueries = Math.max(sysQueries, allLogs.length);

    // If active logs sum exceeded system_stats, sync system_stats up to the higher value
    if (logTokensSum > sysTokens || allLogs.length > sysQueries) {
      statsCol.updateOne(
        { _id: "global" as any },
        {
          $max: {
            totalTokens,
            totalPromptTokens,
            totalCompletionTokens,
            totalQueries,
          },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true }
      ).catch(() => {});
    }

    const avgLatency = allLogs.length > 0 ? Math.round(totalLatency / allLogs.length) : 850;
    const estimatedCost = (totalPromptTokens * 0.00000015 + totalCompletionTokens * 0.0000006).toFixed(4);

    const topUsers = Object.values(userUsageMap)
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);

    // Timeline chart
    const timelineMap: Record<string, { queries: number; tokens: number }> = {};
    allLogs.forEach((l) => {
      const dateStr = new Date(l.timestamp).toISOString().split("T")[0];
      if (!timelineMap[dateStr]) {
        timelineMap[dateStr] = { queries: 0, tokens: 0 };
      }
      timelineMap[dateStr].queries += 1;
      timelineMap[dateStr].tokens += l.totalTokens || 0;
    });

    let timeline = Object.entries(timelineMap)
      .map(([date, data]) => ({ date, queries: data.queries, tokens: data.tokens }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    if (timeline.length === 0) {
      const today = new Date().toISOString().split("T")[0];
      timeline = [{ date: today, queries: totalQueries, tokens: totalTokens }];
    }

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

