import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "en";

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Clean text snippet for speech
    const cleanText = text
      .replace(/[*#_`~>]/g, "")
      .replace(/\[\d+\]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Map language code
    const langCodeMap: Record<string, string> = {
      te: "te",
      telugu: "te",
      hi: "hi",
      hindi: "hi",
      ta: "ta",
      tamil: "ta",
      bn: "bn",
      bengali: "bn",
      mr: "mr",
      marathi: "mr",
      gu: "gu",
      gujarati: "gu",
      kn: "kn",
      kannada: "kn",
      ml: "ml",
      malayalam: "ml",
      es: "es",
      fr: "fr",
      de: "de",
      en: "en",
    };

    const targetLang = langCodeMap[lang.toLowerCase()] || "en";
    const chunk = cleanText.slice(0, 190);
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
      targetLang
    )}&q=${encodeURIComponent(chunk)}`;

    const response = await fetch(googleTTSUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "TTS upstream fetch failed" },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("TTS Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "TTS generation failed" },
      { status: 500 }
    );
  }
}
