export interface GuardrailResult {
  isBlocked: boolean;
  reason?: string;
  category?: "confidential_legal" | "classified_patent" | "trade_secret_breach" | "unauthorized_nda" | "safe";
  disclaimer?: string;
  explanation?: string;
}

/**
 * Evaluates user questions against IP security guardrails.
 * 
 * Rules:
 * - Confidential / Restricted Legal queries (trade secrets, non-public patent drafts, NDA breaches, classified litigation documents): BLOCKED with legal compliance refusal.
 * - Medical / Ayurvedic Regulatory / AYUSH / Pharmacological Formulation queries: PERMITTED with standard grounding.
 * - General Intellectual Property / Patent law queries: PERMITTED.
 */
export function evaluateGuardrails(question: string, context?: string): GuardrailResult {
  const text = (question + " " + (context || "")).toLowerCase().trim();

  // Explicit patterns indicating requests for confidential/trade secrets/NDA-protected content
  const confidentialPatterns = [
    /\b(confidential\s+trade\s+secret|proprietary\s+trade\s+secret|confidential\s+patent\s+draft)\b/i,
    /\b(leak\s+confidential|steal\s+patent|hack\s+patent|bypass\s+nda|break\s+nda)\b/i,
    /\b(undisclosed\s+formula|secret\s+formula\s+without\s+permission|unauthorized\s+disclosure)\b/i,
    /\b(classified\s+litigation\s+memo|privileged\s+internal\s+memo|attorney\s+client\s+privileged\s+secret)\b/i,
    /\b(circumvent\s+patent\s+infringement\s+illegally|counterfeit\s+drugs?\s+formulation)\b/i,
    /\b(private\s+corporate\s+ip\s+leak|unreleased\s+drug\s+pipeline\s+secrets?)\b/i,
  ];

  // Specific check for confidential legal / trade secret breaches
  for (const pattern of confidentialPatterns) {
    if (pattern.test(text)) {
      return {
        isBlocked: true,
        category: "confidential_legal",
        reason: "Request violates statutory confidentiality protocols and NDA legal safeguards.",
        disclaimer: "⚠️ SECURITY GUARDRAIL ENFORCED: Under the Indian Patents Act 1970 and Trade Secrets Protection Directives, disclosing non-public confidential drafts, privileged attorney memos, or proprietary trade secrets without authorization is strictly prohibited.",
        explanation: "IP-SAKTI Sahayak cannot process queries that solicit confidential trade secrets, privileged litigation records, or unauthorized patent disclosures. You may query public patent publications, published TKDL prior art, or medical/Ayurvedic regulatory compliance standards.",
      };
    }
  }

  // Medical / Ayurvedic regulatory queries are fully permitted
  const isMedicalAyush = /\b(ayurved|ayush|herb|plant|medic|dosage|clinical|formulation|tkdl|charaka|sushruta|extract|therapeutic)\b/i.test(text);
  if (isMedicalAyush) {
    return {
      isBlocked: false,
      category: "safe",
    };
  }

  // General IP queries are permitted
  return {
    isBlocked: false,
    category: "safe",
  };
}
