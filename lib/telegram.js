const BASE = () =>
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function call(method, body) {
  const res = await fetch(`${BASE()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram ${method} failed: ${text}`);
  }
  return res.json();
}

export function sendMessage(chatId, text) {
  return call("sendMessage", { chat_id: chatId, text });
}

export function sendTypingAction(chatId) {
  return call("sendChatAction", { chat_id: chatId, action: "typing" });
}
