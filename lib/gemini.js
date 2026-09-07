import { GoogleGenerativeAI } from "@google/generative-ai";

export async function askGemini(prompt) {
  const result = await askGeminiWithUsage(prompt);
  return result.text;
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

  const modelsToTry = [
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-pro-latest",
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Sending request to Gemini API (${modelName})...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const latencyMs = Date.now() - startTime;

      const usageMetadata = response.usageMetadata;
      const promptTokens = usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
      const completionTokens = usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4);
      const totalTokens = usageMetadata?.totalTokenCount || (promptTokens + completionTokens);

      console.log(`Gemini response received from ${modelName} (${latencyMs}ms, ${totalTokens} tokens).`);

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
  const text = `IP-SAKTI Assistant note: Gemini API service error (${errorMsg}). Please verify model availability and key settings.`;
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
