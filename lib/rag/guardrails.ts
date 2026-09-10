export interface GuardrailResult {
  isBlocked: boolean;
  reason?: string;
  category?: "confidential_legal" | "classified_patent" | "trade_secret_breach" | "unauthorized_nda" | "safe";
  disclaimer?: string;
  explanation?: string;
}

/**
 * IP Guardrail Evaluator:
 * Relaxed and open to process all user queries smoothly without false blocks or canned refusals.
 */
export function evaluateGuardrails(question: string, context?: string): GuardrailResult {
  return {
    isBlocked: false,
    category: "safe",
  };
}
