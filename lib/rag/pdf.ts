import PDFParser from "pdf2json";
import zlib from "zlib";

/**
 * Robust PDF text extractor supporting native pdf2json and zlib flatedecode stream parsing.
 */
export function extractPDFText(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    let resolved = false;

    // Resolve ESM / CJS module interop
    const ParserConstructor =
      typeof PDFParser === "function"
        ? PDFParser
        : (PDFParser as any)?.default || PDFParser;

    let parser: any;
    try {
      parser = new ParserConstructor(null, 1);
    } catch {
      try {
        parser = new (ParserConstructor as any)();
      } catch (ctorErr) {
        console.warn("Failed to instantiate PDFParser, using deep stream extractor:", ctorErr);
        resolve(fallbackDeepPdfExtract(buffer));
        return;
      }
    }

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(fallbackDeepPdfExtract(buffer));
      }
    }, 8000);

    parser.on("pdfParser_dataError", (error: any) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.warn("pdf2json error, falling back:", error?.parserError || error);
        resolve(fallbackDeepPdfExtract(buffer));
      }
    });

    parser.on("pdfParser_dataReady", (pdfData: any) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        try {
          // 1. Check getRawTextContent
          if (typeof parser.getRawTextContent === "function") {
            const raw = parser.getRawTextContent();
            if (raw && raw.trim().length > 30) {
              const cleaned = raw
                .replace(/----------------Page \(\d+\) Break----------------/g, "\n\n")
                .replace(/\r\n/g, "\n")
                .trim();
              if (cleaned.length > 30) {
                resolve(cleaned);
                return;
              }
            }
          }

          // 2. Extract from Pages array
          if (pdfData?.Pages && Array.isArray(pdfData.Pages)) {
            const pageTexts: string[] = [];
            for (let i = 0; i < pdfData.Pages.length; i++) {
              const page = pdfData.Pages[i];
              if (!page.Texts || !Array.isArray(page.Texts)) continue;

              const lineWords: string[] = [];
              for (const t of page.Texts) {
                if (t.R && Array.isArray(t.R)) {
                  for (const r of t.R) {
                    if (r && typeof r.T === "string") {
                      try {
                        lineWords.push(decodeURIComponent(r.T.replace(/\+/g, "%20")));
                      } catch {
                        try {
                          lineWords.push(unescape(r.T));
                        } catch {
                          lineWords.push(r.T);
                        }
                      }
                    }
                  }
                }
              }

              if (lineWords.length > 0) {
                pageTexts.push(lineWords.join(" "));
              }
            }

            const joined = pageTexts.join("\n\n").trim();
            if (joined.length > 30) {
              resolve(joined);
              return;
            }
          }

          resolve(fallbackDeepPdfExtract(buffer));
        } catch (err) {
          console.warn("pdfData extraction error:", err);
          resolve(fallbackDeepPdfExtract(buffer));
        }
      }
    });

    try {
      parser.parseBuffer(buffer);
    } catch (err) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(fallbackDeepPdfExtract(buffer));
      }
    }
  });
}

/**
 * Decompresses FlateDecode streams using native zlib to extract raw text
 * even if pdf2json fails completely.
 */
function fallbackDeepPdfExtract(buffer: Buffer): string {
  try {
    const extractedTextParts: string[] = [];

    // Find stream ... endstream blocks
    const streamStartRegex = /stream[\r\n]+/g;
    const streamEndStr = "endstream";
    const binary = buffer.toString("binary");

    let match: RegExpExecArray | null;
    while ((match = streamStartRegex.exec(binary)) !== null) {
      const startIndex = match.index + match[0].length;
      const endIndex = binary.indexOf(streamEndStr, startIndex);
      if (endIndex === -1) continue;

      const streamBuffer = buffer.subarray(startIndex, endIndex);

      // Attempt zlib inflation
      let decompressed: Buffer | null = null;
      try {
        decompressed = zlib.inflateSync(streamBuffer);
      } catch {
        try {
          decompressed = zlib.inflateRawSync(streamBuffer);
        } catch {
          decompressed = null;
        }
      }

      const textToScan = decompressed ? decompressed.toString("utf-8") : streamBuffer.toString("binary");

      // Extract Tj and TJ text patterns
      const textMatches = textToScan.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g);
      if (textMatches) {
        for (const item of textMatches) {
          const clean = item
            .replace(/[()\[\]]|Tj|TJ/g, " ")
            .replace(/\\([0-9]{3}|.)/g, " ")
            .trim();
          if (clean.length > 1) {
            extractedTextParts.push(clean);
          }
        }
      }
    }

    const result = extractedTextParts.join(" ").replace(/\s+/g, " ").trim();
    if (result.length > 40) {
      return result;
    }
  } catch (err) {
    console.warn("Deep PDF text fallback error:", err);
  }

  return "";
}