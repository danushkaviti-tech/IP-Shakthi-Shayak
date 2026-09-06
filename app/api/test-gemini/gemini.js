import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askGemini(prompt) {
  try {
    console.log("Sending request to Gemini...");

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: prompt,
    });

    console.log("Gemini response received.");

    return interaction.output_text;

  } catch (error) {
    console.error("Gemini Error:", error);

    throw new Error(
      "Gemini is temporarily unavailable. Please try again."
    );
  }
}