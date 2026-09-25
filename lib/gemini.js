import { GoogleGenerativeAI } from "@google/generative-ai";
import { VOICE_INSTRUCTIONS } from "./voice.js";

const MODEL = "gemini-1.5-flash";

export async function draftPost(note) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `${VOICE_INSTRUCTIONS}

---

Here is Meera's raw note:

${note}

---

Turn this note into a polished draft post in her voice. Return only the draft — no preamble, no explanation.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
