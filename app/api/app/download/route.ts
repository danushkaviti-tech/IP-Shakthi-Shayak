import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const zipPath = path.join(process.cwd(), "public", "downloads", "IP-SAKTI-Windows-App.zip");

    if (!fs.existsSync(zipPath)) {
      return NextResponse.json({ error: "Download package not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(zipPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="IP-SAKTI-Windows-App.zip"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Download route error:", error);
    return NextResponse.json({ error: "Failed to download app package" }, { status: 500 });
  }
}
