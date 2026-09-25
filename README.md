# Meera Bot

A Telegram bot that takes Meera's raw notes and drafts them into polished posts using Gemini.

## How it works

1. Meera sends a note as a text message to the Telegram bot
2. The bot forwards the note to Gemini along with her voice instructions
3. Gemini returns a draft post written in her voice
4. The bot sends the draft back in the same chat

## Setup

### 1. Add your voice instructions

Open [`lib/voice.js`](lib/voice.js) and replace the placeholder with Meera's writing style instructions.

### 2. Create a Telegram bot

- Message [@BotFather](https://t.me/BotFather) on Telegram
- Run `/newbot` and follow the prompts
- Copy the token it gives you

### 3. Get a Gemini API key

- Go to [Google AI Studio](https://aistudio.google.com)
- Create an API key

### 4. Deploy to Vercel

```bash
cd meera-bot
npm install
vercel deploy --prod
```

### 5. Set environment variables in Vercel

In your Vercel project dashboard → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | From BotFather |
| `GEMINI_API_KEY` | From Google AI Studio |
| `TELEGRAM_WEBHOOK_SECRET` | Any random string (optional but recommended) |

### 6. Register the webhook

After deploying, run this once to tell Telegram where to send messages:

```bash
TELEGRAM_BOT_TOKEN=your_token \
VERCEL_URL=https://your-app.vercel.app \
TELEGRAM_WEBHOOK_SECRET=your_secret \
npm run set-webhook
```

That's it — Meera can now send notes to the bot and get drafts back instantly.

## Project structure

```
meera-bot/
├── api/
│   └── webhook.js        # Vercel serverless function — receives Telegram messages
├── lib/
│   ├── gemini.js         # Calls Gemini with the note + voice instructions
│   ├── telegram.js       # Helpers to send messages back via Telegram API
│   └── voice.js          # Meera's voice/style instructions for Gemini
├── scripts/
│   └── set-webhook.js    # One-time script to register the Telegram webhook
├── .env.example          # Copy to .env for local testing
├── package.json
└── vercel.json
```
