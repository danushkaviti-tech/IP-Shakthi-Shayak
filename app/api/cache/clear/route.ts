import { NextResponse } from "next/server";
import { clearRAGCache } from "@/lib/cache/redis";

export async function POST() {
  try {
    const result = await clearRAGCache();
    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
      details: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to clear cache",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
