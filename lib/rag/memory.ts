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

    const extractedDomain = classification?.ipType && classification.ipType !== "Unknown" ? classification.ipType : "Intellectual Property";
    const extractedJurisdiction = classification?.jurisdiction && classification.jurisdiction !== "Unknown" ? classification.jurisdiction : "India";
    
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
 * Format Short-term session dialog turns and Long-term user memories for prompt injection.
 */
export function formatMemoryContext(
  shortTermHistory: ConversationTurn[] = [],
  longTermProfile?: UserMemoryProfile | null
): string {
  const sections: string[] = [];

  // 1. Long-Term Memory Section (Cross-Session Persona & Interests)
  if (longTermProfile) {
    const domains = (longTermProfile.keyDomains || []).slice(-4).join(", ");
    const topics = (longTermProfile.recentTopics || []).slice(-3).map((t) => `• ${t}`).join("\n");
    sections.push(`[LONG-TERM USER MEMORY & PREFERENCES]
- Preferred Language: ${longTermProfile.preferences?.language || "English"}
- Key IP Domains of Interest: ${domains || "Patent & TKDL Regulatory"}
- Prior Consultations Context:
${topics || "General Indian & International IP inquiries"}`);
  }

  // 2. Short-Term Active Session Memory (Previous Dialog Turns)
  if (shortTermHistory.length > 0) {
    const recentTurns = shortTermHistory.slice(-6).map((turn) => {
      const speaker = turn.role === "user" ? "User" : "IP-SAKTI Assistant";
      const snippet = turn.content.length > 350 ? turn.content.slice(0, 350) + "..." : turn.content;
      return `${speaker}: ${snippet}`;
    }).join("\n");

    sections.push(`[SHORT-TERM CONVERSATION HISTORY (Active Session)]
${recentTurns}`);
  }

  return sections.join("\n\n");
}
