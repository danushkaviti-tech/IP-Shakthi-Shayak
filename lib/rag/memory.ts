import clientPromise from "@/lib/mongodb";

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface UserMemoryProfile {
  userEmail: string;
  keyDomains: string[];
  recentTopics: string[];
  preferences: {
    language?: string;
    jurisdiction?: string;
    ipType?: string;
  };
  notes: string[];
  updatedAt: Date;
}

/**
 * Fetch persistent long-term memory facts for a user across previous sessions.
 */
export async function getUserLongTermMemory(userEmail: string): Promise<UserMemoryProfile | null> {
  if (!userEmail || userEmail === "guest@ipsakti.gov.in") return null;

  try {
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const col = db.collection<UserMemoryProfile>("user_memories");

    const record = await col.findOne({ userEmail: userEmail.toLowerCase() });
    return record;
  } catch (error) {
    console.warn("Could not fetch user long-term memory:", error);
    return null;
  }
}

/**
 * Asynchronously extract and update user long-term memory context.
 */
export async function updateUserLongTermMemory(
  userEmail: string,
  question: string,
  classification?: Record<string, string | undefined> | null,
  language = "English"
) {
  if (!userEmail || userEmail === "guest@ipsakti.gov.in") return;

  try {
    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const col = db.collection<UserMemoryProfile>("user_memories");

    const extractedDomain =
      classification?.ipType && classification.ipType !== "Unknown"
        ? classification.ipType
        : "Intellectual Property";
    const extractedJurisdiction =
      classification?.jurisdiction && classification.jurisdiction !== "Unknown"
        ? classification.jurisdiction
        : "India";

    // Clean topic snippet from question
    const topicSnippet = question.length > 80 ? question.slice(0, 80) + "..." : question;

    await col.updateOne(
      { userEmail: userEmail.toLowerCase() },
      {
        $addToSet: {
          keyDomains: { $each: [extractedDomain] },
          recentTopics: { $each: [topicSnippet] },
        },
        $set: {
          "preferences.language": language,
          "preferences.jurisdiction": extractedJurisdiction,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.warn("Could not update user long-term memory:", error);
  }
}

/**
 * Sanitize assistant responses to prevent prompt echoing and recursive loops.
 */
function cleanMessageContent(rawContent: string): string {
  if (!rawContent) return "";
  return rawContent
    .replace(/\[LONG-TERM USER MEMORY[\s\S]*?\[SHORT-TERM CONVERSATION HISTORY[\s\S]*?\n\n/gi, "")
    .replace(/\[LONG-TERM USER MEMORY[\s\S]*?\n\n/gi, "")
    .replace(/\[SHORT-TERM CONVERSATION HISTORY[\s\S]*?\n\n/gi, "")
    .replace(/### IP-SAKTI Sahayak Legal Guidance[\s\S]*?\n\n/gi, "")
    .replace(/Inquiry:.*?\n/gi, "")
    .trim();
}

/**
 * Format Short-term session dialog turns and Long-term user memories as read-only background context.
 */
export function formatMemoryContext(
  shortTermHistory: ConversationTurn[] = [],
  longTermProfile?: UserMemoryProfile | null
): string {
  const sections: string[] = [];

  // 1. Long-Term Preferences (Facts Only)
  if (longTermProfile) {
    const domains = (longTermProfile.keyDomains || []).slice(-4).join(", ");
    const topics = (longTermProfile.recentTopics || [])
      .slice(-3)
      .map((t) => cleanMessageContent(t))
      .filter(Boolean)
      .map((t) => `• ${t}`)
      .join("\n");

    sections.push(`User Background Preferences:
- Preferred Language: ${longTermProfile.preferences?.language || "English"}
- Focus Domains: ${domains || "Patent & Regulatory Guidance"}
${topics ? `- Recent Focus Areas:\n${topics}` : ""}`);
  }

  // 2. Short-Term Dialog Context (Cleaned & Wrapped)
  if (shortTermHistory.length > 0) {
    const recentTurns = shortTermHistory
      .slice(-4)
      .map((turn) => {
        const cleaned = cleanMessageContent(turn.content);
        if (!cleaned) return null;
        const speaker = turn.role === "user" ? "User Inquiry" : "Prior Assistant Summary";
        const snippet = cleaned.length > 200 ? cleaned.slice(0, 200) + "..." : cleaned;
        return `${speaker}: ${snippet}`;
      })
      .filter(Boolean)
      .join("\n");

    if (recentTurns) {
      sections.push(`Prior Turn Context (Reference Only - Do Not Quote Or Output):\n${recentTurns}`);
    }
  }

  if (sections.length === 0) return "";

  return `<background_context>\n${sections.join("\n\n")}\n</background_context>`;
}