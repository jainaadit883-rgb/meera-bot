import { GoogleGenAI } from "@google/genai";
import { VOICE_INSTRUCTIONS } from "./voice.js";

const MODEL = "gemini-3.8-flash";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function scoreNote(note) {
  const ai = getAI();

  const prompt = `You are evaluating whether a founder's raw note has enough substance to become a LinkedIn post.

Score it from 0 to 10 using these criteria:
- Does it contain a real insight, observation, or experience? (not a task or reminder)
- Is there enough content to write a post from? (not just a fragment)
- Would a reader learn something or find it interesting?

Return ONLY a JSON object in this exact format, nothing else:
{"score": <number>, "reason": "<one sentence explaining the score>"}

The note:
${note}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const text = response.text.trim();
  const json = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(json);
}

export async function draftPost(note) {
  const ai = getAI();

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
