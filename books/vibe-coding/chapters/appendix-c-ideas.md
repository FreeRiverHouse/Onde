# Appendix C: Project Ideas to Practice

10 projects you can build in a day with code surfing.

## Beginner (2-4 hours each)

### 1. Personal Dashboard
**What**: A single page showing your important info at a glance.

**Features**:
- Current weather
- Today's calendar events
- Quick links
- Motivational quote

**Stack**: HTML + CSS + JavaScript
**Prompt**: "Create a personal dashboard that shows weather and links"

---

### 2. Markdown Note Taker
**What**: A simple app to write and save markdown notes.

**Features**:
- Write in markdown
- Preview rendered HTML
- Save to local storage
- Export to file

**Stack**: React or Vanilla JS
**Prompt**: "Build a markdown editor with live preview and local storage"

---

### 3. Habit Tracker
**What**: Track daily habits with streaks.

**Features**:
- Add habits
- Check off daily
- Show streak count
- Simple stats

**Stack**: React + Local Storage
**Prompt**: "Create a habit tracker with streak counting"

---

## Intermediate (4-6 hours each)

### 4. Telegram Bot for Reminders
**What**: A bot that sends you reminders.

**Features**:
- `/remind [time] [message]` - Set reminder
- `/list` - Show pending reminders
- `/cancel [id]` - Cancel reminder
- Stores in JSON file

**Stack**: Node.js + node-telegram-bot-api
**Prompt**: "Build a Telegram reminder bot with natural language time parsing"

---

### 5. URL Shortener
**What**: Create short links, track clicks.

**Features**:
- Shorten URLs
- Custom slugs
- Click counting
- Simple analytics

**Stack**: Next.js + SQLite
**Prompt**: "Create a URL shortener with click tracking using Next.js"

---

### 6. Invoice Generator
**What**: Create and export professional invoices.

**Features**:
- Company/client info
- Line items with calculations
- Tax handling
- PDF export

**Stack**: React + jsPDF or Puppeteer
**Prompt**: "Build an invoice generator that exports to PDF"

---

### 7. Content Approval Bot
**What**: Review content before posting to social media.

**Features**:
- Receive content via Telegram
- Show approve/reject buttons
- Post to X when approved
- Log history

**Stack**: Node.js + Telegram Bot API + X API
**Prompt**: "Create a Telegram bot for approving social media posts"

---

## Advanced (6-10 hours each)

### 8. Personal API
**What**: A unified API for your personal data.

**Features**:
- Endpoints for: /now, /projects, /bookmarks
- Simple auth
- CORS for embedding
- JSON responses

**Stack**: Express or Fastify + SQLite
**Prompt**: "Build a personal API with endpoints for /now and /projects"

---

### 9. Expense Tracker with Categories
**What**: Track spending with categories and reports.

**Features**:
- Add expenses with category
- Monthly/weekly views
- Category breakdown
- Export to CSV

**Stack**: Next.js + Postgres (or SQLite)
**Prompt**: "Create an expense tracker with category-based reporting"

---

### 10. AI Writing Assistant
**What**: A tool to help with writing tasks.

**Features**:
- Paste text, get suggestions
- Improve clarity
- Fix grammar
- Multiple tones

**Stack**: Next.js + OpenAI or Claude API
**Prompt**: "Build a writing assistant that improves text clarity using AI"

---

## Project Selection Guide

**Pick based on your interest**:
- Into productivity? → Habit Tracker, Dashboard
- Like automation? → Telegram Bots
- Building a business? → Invoice Generator, URL Shortener
- Learning APIs? → Personal API, AI Assistant

**Pick based on your skill level**:
- First project? → Markdown Note Taker
- Some experience? → Telegram Bot
- Want a challenge? → AI Writing Assistant

**The meta-rule**: Build something you'll actually use. Motivation comes from utility.

---

## How to Approach Each Project

1. **Start with the prompt** - Describe what you want
2. **Get the scaffold** - Basic structure and files
3. **Add core feature** - The one thing it must do
4. **Test it** - Does it actually work?
5. **Add second feature** - Iterate
6. **Deploy** - Make it real
7. **Use it** - The real test

Don't build all 10. Build 1, ship it, use it. Then build the next.

---

*"The best project is the one you finish."*
