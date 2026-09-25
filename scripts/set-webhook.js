// Run this once after deploying to Vercel to register your webhook with Telegram.
// Usage: TELEGRAM_BOT_TOKEN=... VERCEL_URL=https://your-app.vercel.app node scripts/set-webhook.js
//
// Optional: also set TELEGRAM_WEBHOOK_SECRET to lock down the endpoint.

const token = process.env.TELEGRAM_BOT_TOKEN;
const vercelUrl = process.env.VERCEL_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token || !vercelUrl) {
  console.error(
    "Set TELEGRAM_BOT_TOKEN and VERCEL_URL before running this script."
  );
  process.exit(1);
}

const webhookUrl = `${vercelUrl.replace(/\/$/, "")}/api/webhook`;
const params = { url: webhookUrl };
if (secret) params.secret_token = secret;

const res = await fetch(
  `https://api.telegram.org/bot${token}/setWebhook`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }
);

const data = await res.json();
if (data.ok) {
  console.log(`✅ Webhook registered: ${webhookUrl}`);
} else {
  console.error("❌ Failed to register webhook:", data);
  process.exit(1);
}
