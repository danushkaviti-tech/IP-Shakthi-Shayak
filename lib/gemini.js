import { GoogleGenerativeAI } from "@google/generative-ai";

const FAST_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
];

export async function askGemini(prompt) {
  const result = await askGeminiWithUsage(prompt);
  return result.text;
}

export async function* askGeminiStream(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    yield "IP-SAKTI Assistant note: GEMINI_API_KEY is not defined in environment variables.";
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of FAST_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const textChunk = chunk.text();
        if (textChunk) {
          yield textChunk;
        }
      }
      return;
    } catch (err) {
      console.warn(`Streaming with model ${modelName} failed, trying fallback:`, err?.message || err);
      lastError = err;
    }
  }

  const fallback = await askGeminiWithUsage(prompt);
  yield fallback.text;
}

export async function askGeminiWithUsage(prompt) {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment variables.");
    const fallbackText = "IP-SAKTI Assistant note: GEMINI_API_KEY is missing. Please check your .env.local file.";
    return {
      text: fallbackText,
      latencyMs: Date.now() - startTime,
      usage: {
        promptTokens: Math.ceil(prompt.length / 4),
        completionTokens: Math.ceil(fallbackText.length / 4),
        totalTokens: Math.ceil((prompt.length + fallbackText.length) / 4),
      },
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of FAST_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const latencyMs = Date.now() - startTime;

      const usageMetadata = response.usageMetadata;
      const promptTokens = usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
      const completionTokens = usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4);
      const totalTokens = usageMetadata?.totalTokenCount || (promptTokens + completionTokens);

      return {
        text,
        latencyMs,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
      };
    } catch (err) {
      console.warn(`Model ${modelName} attempt failed:`, err?.message || err);
      lastError = err;
    }
  }

  console.error("All Gemini model attempts exhausted:", lastError);
  const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
  const text = `IP-SAKTI Assistant note: Gemini API service error (${errorMsg}). Please verify model availability.`;
  const latencyMs = Date.now() - startTime;

  return {
    text,
    latencyMs,
    usage: {
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: Math.ceil(text.length / 4),
      totalTokens: Math.ceil((prompt.length + text.length) / 4),
    },
  };
}
