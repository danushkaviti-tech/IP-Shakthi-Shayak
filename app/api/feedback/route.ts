import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email || "guest@ipsakti.gov.in";
    const body = await req.json();

    const {
      messageId,
      question,
      answer,
      rating, // "positive" | "negative"
      tags = [],
      comment = "",
      language = "English",
    } = body;

    if (!rating || (rating !== "positive" && rating !== "negative")) {
      return NextResponse.json(
        { success: false, error: "Rating must be 'positive' or 'negative'" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const feedbackCol = db.collection("response_feedback");

    const feedbackDoc = {
      userEmail,
      userId: session?.user?.id || "guest",
      messageId: messageId || `msg-${Date.now()}`,
      rating,
      tags,
      comment: comment?.trim() || "",
      question: question || "",
      answer: answer ? String(answer).slice(0, 4000) : "",
      language,
      modelTrained: true, // Marked for RLHF / dataset alignment fine-tuning
      createdAt: new Date(),
    };

    await feedbackCol.insertOne(feedbackDoc);

    // Update global feedback metrics
    const statsCol = db.collection("system_stats");
    await statsCol.updateOne(
      { _id: "global" as any },
      {
        $inc: {
          totalFeedback: 1,
          positiveFeedback: rating === "positive" ? 1 : 0,
          negativeFeedback: rating === "negative" ? 1 : 0,
        },
        $set: { lastFeedbackAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully for model alignment & training",
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit response feedback" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { computeFeedbackPerformanceAnalytics } = await import(
      "@/lib/feedbackAnalytics"
    );
    const metrics = await computeFeedbackPerformanceAnalytics();
    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("Feedback analytics GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute model feedback analytics" },
      { status: 500 }
    );
  }
}

