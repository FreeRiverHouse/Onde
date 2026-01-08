# Chapter 6: Building Something Real

Enough theory. Let's build.

This chapter walks through a real project: a Telegram bot that handles content approval for a publishing workflow. This is something we actually built and use daily.

## The Problem

You're running a small publishing operation. You create content (posts, images, PDFs) and need someone to approve them before they go live. Email is slow. Slack is noisy. You want something simple.

**Solution**: A Telegram bot that sends content for approval and posts it when approved.

## The Stack

- **Node.js** - Runtime
- **Telegram Bot API** - Messaging
- **X API** - Social posting
- **File system** - Simple storage (no database yet)

## Step 1: Define What We Want

Before touching code, I described the bot to Claude:

```
I need a Telegram bot for content approval.

Workflow:
1. Bot receives a message with content (text, image, or both)
2. Bot sends it to me (admin) with Approve/Reject buttons
3. If I tap Approve, it posts to X
4. If I tap Reject, it asks for changes
5. Track what's been approved/rejected in a JSON file

Use node-telegram-bot-api package.
Store X API credentials in .env
```

This is my complete prompt. Notice:
- Clear workflow (numbered steps)
- Specific package suggestion
- Environment variable mention
- Simple storage decision

## Step 2: Scaffold the Project

Claude generated:

```javascript
// bot.js
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Store pending approvals
let pending = {};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // Only process from admin
  if (chatId.toString() !== ADMIN_CHAT_ID) {
    return bot.sendMessage(chatId, 'Unauthorized');
  }

  // Store content for approval
  const id = Date.now().toString();
  pending[id] = {
    text: msg.text,
    photo: msg.photo ? msg.photo[msg.photo.length - 1].file_id : null,
    timestamp: new Date().toISOString()
  };

  // Send approval request
  const keyboard = {
    inline_keyboard: [[
      { text: '✅ Approve', callback_data: `approve_${id}` },
      { text: '❌ Reject', callback_data: `reject_${id}` }
    ]]
  };

  await bot.sendMessage(ADMIN_CHAT_ID,
    `New content:\n\n${msg.text || '[Image]'}`,
    { reply_markup: keyboard }
  );
});

// Handle button presses
bot.on('callback_query', async (query) => {
  const [action, id] = query.data.split('_');
  const content = pending[id];

  if (!content) {
    return bot.answerCallbackQuery(query.id, { text: 'Content not found' });
  }

  if (action === 'approve') {
    // Post to X
    await postToX(content);
    delete pending[id];
    await bot.answerCallbackQuery(query.id, { text: 'Posted!' });
  } else {
    delete pending[id];
    await bot.answerCallbackQuery(query.id, { text: 'Rejected' });
  }
});
```

First iteration: ~50 lines. Working prototype.

## Step 3: Iterate

**Me**: "Add persistence so pending items survive restarts"

Claude added:
```javascript
const PENDING_FILE = './pending.json';

function loadPending() {
  try {
    return JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function savePending() {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));
}
```

**Me**: "Add a /status command that shows pending count"

Claude added:
```javascript
bot.onText(/\/status/, (msg) => {
  const count = Object.keys(pending).length;
  bot.sendMessage(msg.chat.id, `Pending items: ${count}`);
});
```

**Me**: "Add error handling for the X posting"

```javascript
try {
  await postToX(content);
  bot.sendMessage(ADMIN_CHAT_ID, '✅ Posted successfully');
} catch (error) {
  bot.sendMessage(ADMIN_CHAT_ID, `❌ Failed: ${error.message}`);
}
```

Each iteration: 2-5 minutes. Total build time: ~30 minutes.

## Step 4: Deploy

For a simple bot, this is enough:
```bash
npm install
node bot.js
```

Keep it running with pm2:
```bash
npm install -g pm2
pm2 start bot.js --name "approval-bot"
pm2 save
```

Now it runs forever (until the server restarts, then pm2 brings it back).

## The Finished Product

After iterations, the bot:
- Receives content via Telegram
- Shows inline approve/reject buttons
- Posts approved content to X
- Logs everything
- Handles errors gracefully
- Persists state to disk

Total code: ~150 lines
Build time: ~1 hour (including testing)
Value delivered: Saves 10+ minutes per approval

## What We Learned

**The prompt matters more than the code.** A clear description of what you want beats vague requests.

**Iterate in small steps.** Don't ask for everything at once. Add features one by one.

**Test as you go.** Run the bot after each change. Catch errors early.

**Ship the MVP.** The first version didn't have persistence. It worked. We added it later.

## Your Turn

Try building something similar:
1. A bot that reminds you to drink water
2. A script that backs up a folder to cloud storage
3. A CLI that fetches weather and displays it nicely

Start simple. Add features. Ship.

---

*"Done is better than perfect. But done AND working is best."*

---

Next: [Chapter 7: Building PDFs and Documents →](./07-pdf-generation.md)
