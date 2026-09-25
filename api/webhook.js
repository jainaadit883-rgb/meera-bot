import { scoreNote, draftPost } from "../lib/gemini.js";
import { sendMessage, sendTypingAction } from "../lib/telegram.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = req.headers["x-telegram-bot-api-secret-token"];
  if (
    process.env.TELEGRAM_WEBHOOK_SECRET &&
    secret !== process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { message } = req.body ?? {};

  if (!message?.text) {
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;
  const note = message.text;

  await sendTypingAction(chatId).catch(() => {});

  try {
    const { score, reason } = await scoreNote(note);

    if (score < 6) {
      await sendMessage(
        chatId,
        `⛔ Not drafted (score ${score}/10)\n\n${reason}`
      );
      return res.status(200).json({ ok: true });
    }

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
