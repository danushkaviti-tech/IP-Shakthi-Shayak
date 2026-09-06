import { searchKnowledge } from "./search";
import { classifyQuestion } from "./classifier";
import { askGemini } from "../../app/api/test-gemini/gemini.js";

function isCasualQuestion(question: string) {
  const text = question.toLowerCase().trim();

  const casualPatterns = [
    "hello",
    "hi",
    "hey",
    "how are you",
    "how r u",
    "how are u",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "thank you",
    "thanks",
    "who are you",
    "what are you",
    "what can you do",
    "bye",
  ];

  return casualPatterns.some((pattern) =>
    text.includes(pattern)
  );
}

export async function generateRAGAnswer(
  question: string,
  language = "English"
) {
  // --------------------------------
  // 1. Handle casual conversation
  // --------------------------------

  if (isCasualQuestion(question)) {
    const prompt = `
You are IP-SAKTI Sahayak, a specialized AI assistant
for Intellectual Property and Ayurveda regulatory guidance.

The user is making a casual conversational statement.

Respond naturally and briefly.

Do NOT search for legal information.
Do NOT mention sources.
Do NOT say that sources are insufficient.
Do NOT provide legal advice.

Respond in ${language}.

USER:
${question}
`;

    const answer = await askGemini(prompt);

    return {
      answer,
      sources: [],
      type: "conversation",
    };
  }

  // --------------------------------
  // 2. Classify the question
  // --------------------------------

  const classification =
    await classifyQuestion(question);

  console.log(
    "Question Classification:",
    classification
  );

  // --------------------------------
  // 3. Build metadata filters
  // --------------------------------

  const filters: Record<string, string> = {};

  if (
    classification.jurisdiction &&
    classification.jurisdiction !== "Unknown"
  ) {
    filters.jurisdiction =
      classification.jurisdiction;
  }

  if (
    classification.ipType &&
    classification.ipType !== "Unknown"
  ) {
    filters.ipType =
      classification.ipType;
  }

  if (
    classification.productType &&
    classification.productType !== "Unknown"
  ) {
    filters.productType =
      classification.productType;
  }

  if (
    classification.language &&
    classification.language !== "Other" &&
    classification.language !== "Unknown"
  ) {
    filters.language =
      classification.language;
  }

  console.log(
    "Chroma Filters:",
    filters
  );

  // --------------------------------
  // 4. Search Chroma using filters
  // --------------------------------

  let results = await searchKnowledge(
    question,
    5,
    filters
  );

  let documents =
    results.documents?.[0] || [];

  let metadatas =
    results.metadatas?.[0] || [];

  // --------------------------------
  // 5. Fallback search
  // --------------------------------

  // If metadata filtering returns nothing,
  // perform normal semantic search.

  if (documents.length === 0) {
    console.log(
      "No filtered results. Running fallback search..."
    );

    results = await searchKnowledge(
      question,
      5
    );

    documents =
      results.documents?.[0] || [];

    metadatas =
      results.metadatas?.[0] || [];
  }

  // --------------------------------
  // 6. Build source context
  // --------------------------------

  const context = documents
    .map((doc, i) => {
      const meta =
        metadatas[i] || {};

      return `
SOURCE ${i + 1}

Document:
${meta.document || "Unknown"}

Section:
${meta.section || "Unknown"}

Jurisdiction:
${meta.jurisdiction || "Unknown"}

IP Type:
${meta.ipType || "Unknown"}

Product Type:
${meta.productType || "Unknown"}

Content:
${doc}
`;
    })
    .join("\n");

  // --------------------------------
  // 7. Generate final answer
  // --------------------------------

  const prompt = `
You are IP-SAKTI Sahayak, an AI assistant specialized
in Intellectual Property and Ayurveda regulatory guidance.

Answer the user's question using ONLY the provided sources.

Respond in ${language}.

USER QUESTION:
${question}

CLASSIFICATION:
Jurisdiction: ${classification.jurisdiction}
IP Type: ${classification.ipType}
Product Type: ${classification.productType}
Purpose: ${classification.purpose}

SOURCES:
${context}

RULES:

1. Use only the provided sources for factual legal
   or regulatory claims.

2. Do not invent laws, regulations, sections,
   dates, authorities, or procedures.

3. Cite the relevant source number when making
   an important claim.

4. If the sources do not contain enough information,
   clearly say that the available knowledge base
   does not contain sufficient information.

5. Do not present the answer as legal advice.

6. Be clear about the jurisdiction.

7. If the question is ambiguous, explain what
   additional information is required.

8. Keep the answer clear and useful.
`;

  const answer =
    await askGemini(prompt);

  return {
    answer,
    sources: metadatas,
    classification,
    type: "rag",
  };
}