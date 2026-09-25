import { draftPost } from "../lib/gemini.js";
import { sendMessage, sendTypingAction } from "../lib/telegram.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Reject requests that don't carry the right secret header (if one is configured)
  const secret = req.headers["x-telegram-bot-api-secret-token"];
  if (
    process.env.TELEGRAM_WEBHOOK_SECRET &&
    secret !== process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { message } = req.body ?? {};

  // Ignore anything without a text message (photos, stickers, etc.)
  if (!message?.text) {
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;
  const note = message.text;

  // Show typing indicator while Gemini thinks
  await sendTypingAction(chatId).catch(() => {});

  try {
    const draft = await draftPost(note);
    await sendMessage(chatId, `✍️ Here's your draft:\n\n${draft}`);
  } catch (err) {
    console.error("Error generating draft:", err);
    await sendMessage(
      chatId,
      "Something went wrong while drafting. Please try again."
    );
  }

  return res.status(200).json({ ok: true });
}
