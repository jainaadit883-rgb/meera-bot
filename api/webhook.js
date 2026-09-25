import { scoreNote, extractKeywords, draftPost } from "../lib/gemini.js";
import { sendMessage, sendTypingAction } from "../lib/telegram.js";
import { fetchNewsArticle } from "../lib/news.js";
import { saveNote, saveDraft, updateLatestDraftStatus } from "../lib/supabase.js";

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

  // Handle approval/rejection of the last pending draft
  const command = note.trim().toUpperCase();
  if (command === "APPROVE" || command === "REJECT") {
    const status = command === "APPROVE" ? "approved" : "rejected";
    const updated = await updateLatestDraftStatus(status).catch(() => false);
    await sendMessage(
      chatId,
      updated
        ? `✅ Draft marked as ${status}.`
        : "No pending draft found to update."
    );
    return res.status(200).json({ ok: true });
  }

  await sendTypingAction(chatId).catch(() => {});

  try {
    const noteId = await saveNote(note).catch(() => null);
    const { score, reason } = await scoreNote(note);

    if (score < 6) {
      await sendMessage(
        chatId,
        `⛔ Not drafted (score ${score}/10)\n\n${reason}`
      );
      return res.status(200).json({ ok: true });
    }

    // Extract keywords and fetch a news article in parallel
    const keywords = await extractKeywords(note);
    const newsItem = await fetchNewsArticle(keywords).catch(() => null);

    const draft = await draftPost(note, newsItem);
    await saveDraft(noteId, draft).catch(() => null);

    const verifyBlock = newsItem
      ? `\n\n─────────────────────────────────\nNEWS SOURCE: ${newsItem.title}\nFROM: ${newsItem.source} · ${newsItem.pubDate}\nLINK: ${newsItem.link}\n⚠ Check this before publishing — you are the author of this claim\n─────────────────────────────────`
      : "";

    await sendMessage(chatId, `✍️ Here's your draft:\n\n${draft}${verifyBlock}\n\nReply APPROVE or REJECT to log your decision.`);
  } catch (err) {
    console.error("Error generating draft:", err);
    await sendMessage(
      chatId,
      "Something went wrong while drafting. Please try again."
    );
  }

  return res.status(200).json({ ok: true });
}
