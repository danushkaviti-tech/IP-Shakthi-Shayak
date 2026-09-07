import { askGemini } from "@/lib/gemini";

export type QuestionClassification = {
  jurisdiction: string;
  ipType: string;
  productType: string;
  purpose: string;
  language: string;
};

export async function classifyQuestion(
  question: string
): Promise<QuestionClassification> {

  const prompt = `
You are the classification engine for IP-SAKTI Sahayak.

Classify the user's question for Intellectual Property
and Ayurveda regulatory retrieval.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT add explanations.
Do NOT add extra fields.

Use exactly this structure:

{
  "jurisdiction": "",
  "ipType": "",
  "productType": "",
  "purpose": "",
  "language": ""
}

Allowed values:

jurisdiction:
"India"
"International"
"USA"
"EU"
"Unknown"

ipType:
"Patent"
"Trademark"
"Copyright"
"GI"
"Design"
"Plant Variety"
"Trade Secret"
"ABS"
"Regulatory"
"Multiple"
"Unknown"

productType:
"Ayurvedic Formulation"
"Ayurvedic Medicine"
"Food"
"Cosmetic"
"Plant"
"Herbal Product"
"Research"
"Unknown"

purpose:
"Patent Protection"
"Trademark Protection"
"GI Protection"
"Regulatory Compliance"
"Prior Art Search"
"ABS Compliance"
"General Information"
"Unknown"

language:
"English"
"Hindi"
"Telugu"
"Other"

Rules:

1. Infer the values from the user's question when possible.

2. If the question does not provide enough information,
use "Unknown".

3. Do not invent information.

4. For an Ayurvedic formulation or medicine question,
select the appropriate Ayurveda product type.

5. If the question is about patent protection,
use "Patent" and "Patent Protection".

6. If the question is about trademark protection,
use "Trademark" and "Trademark Protection".

7. If the question concerns multiple IP areas,
use "Multiple".

USER QUESTION:
${question}
`;

  const raw = await askGemini(prompt);

  const defaultClassification: QuestionClassification = {
    jurisdiction: "India",
    ipType: "Patent",
    productType: "Ayurvedic Formulation",
    purpose: "Patent Protection",
    language: "Other",
  };

  try {
    const rawStr = String(raw || "");
    // Extract JSON substring between { and }
    const jsonMatch = rawStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        jurisdiction: parsed.jurisdiction || "India",
        ipType: parsed.ipType || "Patent",
        productType: parsed.productType || "Ayurvedic Formulation",
        purpose: parsed.purpose || "Patent Protection",
        language: parsed.language || "English",
      };
    }
    return defaultClassification;
  } catch (error) {
    console.warn("Classifier JSON parse fallback applied:", error);
    return defaultClassification;
  }
}