import PDFParser from "pdf2json";

export function extractPDFText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (error: any) => {
      reject(error.parserError);
    });

    parser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        const text = pdfData.Pages.map((page: any) =>
          page.Texts.map((text: any) => {
            try {
              return decodeURIComponent(text.R[0].T);
            } catch {
              return text.R[0].T;
            }
          }).join(" ")
        ).join("\n");

        resolve(text);
      } catch (error) {
        reject(error);
      }
    });

    parser.parseBuffer(buffer);
  });
}