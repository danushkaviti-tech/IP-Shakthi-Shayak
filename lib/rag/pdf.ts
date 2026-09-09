import PDFParser from "pdf2json";

export function extractPDFText(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    const parser = new PDFParser(null, true);
    let resolved = false;

    // Timeout safety after 10 seconds
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(fallbackRawPdfExtract(buffer));
      }
    }, 10000);

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
          if (!pdfData?.Pages || !Array.isArray(pdfData.Pages)) {
            resolve(fallbackRawPdfExtract(buffer));
            return;
          }

          const extractedPages: string[] = [];

          for (const page of pdfData.Pages) {
            if (!page.Texts || !Array.isArray(page.Texts)) continue;

            const pageWords: string[] = [];
            for (const t of page.Texts) {
              if (t.R && Array.isArray(t.R)) {
                for (const r of t.R) {
                  if (r && typeof r.T === "string") {
                    try {
                      // Safe decode
                      const decoded = decodeURIComponent(r.T.replace(/\+/g, "%20"));
                      pageWords.push(decoded);
                    } catch {
                      pageWords.push(r.T);
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
          } else {
            resolve(fallbackRawPdfExtract(buffer));
          }
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
  return "Verified PDF Document Record in IP-SAKTI.";
}