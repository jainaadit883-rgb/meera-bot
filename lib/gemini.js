import { GoogleGenAI } from "@google/genai";
import { VOICE_INSTRUCTIONS } from "./voice.js";

const MODEL = "gemini-3.8-flash";

export async function draftPost(note) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `${VOICE_INSTRUCTIONS}

---

Here is Meera's raw note:

${note}

---

Turn this note into a polished draft post in her voice. Return only the draft — no preamble, no explanation.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text.trim();
}
