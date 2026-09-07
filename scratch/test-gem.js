import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { askGeminiWithUsage } from "../app/api/test-gemini/gemini.js";

async function test() {
  console.log("Testing askGeminiWithUsage from gemini.js...");
  const res = await askGeminiWithUsage("Explain the basic principle of patent law in 2 sentences.");
  console.log("Response:", JSON.stringify(res, null, 2));
}

test();
