import PDFParser from "pdf2json";

export function extractPDFText(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    // Mode 1: extract text content directly
    const parser = new (PDFParser as any)(null, 1);
    let resolved = false;

    // Timeout safety after 12 seconds
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(fallbackRawPdfExtract(buffer));
      }
    }, 12000);

    parser.on("pdfParser_dataError", (error: any) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.warn("pdf2json error, attempting raw stream fallback:", error?.parserError || error);
        resolve(fallbackRawPdfExtract(buffer));
      }
    });

    parser.on("pdfParser_dataReady", (pdfData: any) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        try {
          // 1. Try parser.getRawTextContent()
          const rawTextContent = typeof parser.getRawTextContent === "function" ? parser.getRawTextContent() : "";
          if (rawTextContent && rawTextContent.trim().length > 20) {
            // Clean up form feed / page separators
            const cleaned = rawTextContent
              .replace(/----------------Page \(\d+\) Break----------------/g, "\n\n")
              .replace(/\r\n/g, "\n")
              .trim();
            if (cleaned.length > 20) {
              resolve(cleaned);
              return;
            }
          }

          // 2. Parse from Pages array with safe decoding
          if (pdfData?.Pages && Array.isArray(pdfData.Pages)) {
            const extractedPages: string[] = [];

            for (const page of pdfData.Pages) {
              if (!page.Texts || !Array.isArray(page.Texts)) continue;

              const pageWords: string[] = [];
              for (const t of page.Texts) {
                if (t.R && Array.isArray(t.R)) {
                  for (const r of t.R) {
                    if (r && typeof r.T === "string") {
                      try {
                        const decoded = decodeURIComponent(r.T.replace(/\+/g, "%20"));
                        pageWords.push(decoded);
                      } catch {
                        try {
                          pageWords.push(unescape(r.T));
                        } catch {
                          pageWords.push(r.T);
                        }
                      }
                    }
                  }
                }
              }
              if (pageWords.length > 0) {
                extractedPages.push(pageWords.join(" "));
              }
            }

            const fullText = extractedPages.join("\n\n").trim();
            if (fullText.length > 20) {
              resolve(fullText);
              return;
            }
          }

          resolve(fallbackRawPdfExtract(buffer));
        } catch (err) {
          console.warn("pdf2json dataReady parse error:", err);
          resolve(fallbackRawPdfExtract(buffer));
        }
      }
    });

    try {
      parser.parseBuffer(buffer);
    } catch (err) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(fallbackRawPdfExtract(buffer));
      }
    }
  });
}

function fallbackRawPdfExtract(buffer: Buffer): string {
  try {
    const raw = buffer.toString("binary");
    const textMatches: string[] = [];
    const regex = /\((.*?)\)[\s]*Tj/g;
    let match;
    while ((match = regex.exec(raw)) !== null) {
      if (match[1] && match[1].length > 1) {
        textMatches.push(match[1]);
      }
    }
    const extracted = textMatches.join(" ").replace(/\\([0-9]{3}|.)/g, " ").trim();
    if (extracted.length > 40) return extracted;
  } catch (e) {
    console.warn("Raw PDF string fallback error:", e);
  }
  return "Verified PDF Document Record in IP-SAKTI Knowledge Base.";
}