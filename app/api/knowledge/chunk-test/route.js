import { splitText } from "@/lib/rag/chunk";
export async function GET() {
  const text = `
    Intellectual Property Rights protect creations of the human mind.
    Patents protect inventions and provide exclusive rights to the inventor.
    Trademarks protect names, logos, symbols and other identifiers.
    Geographical Indications identify products originating from a specific
    geographical region and having qualities associated with that region.
  `;

  const chunks = splitText(text, 100, 20);

  return Response.json({
    success: true,
    totalChunks: chunks.length,
    chunks,
  });
}