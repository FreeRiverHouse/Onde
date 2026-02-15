# X Thread Draft: Multi-Agent Setup (Clawdinho M1 + Ondinho M4)

## Thread

---

**Tweet 1:**
We run two AI agents 24/7 on Apple Silicon Macs, each with its own personality and responsibilities.

One manages trading. The other manages content.

Here's our multi-agent setup 🧵

---

**Tweet 2:**
🤖 Agent 1: "Clawdinho" — Mac Mini M1

- Runs on Clawdbot (open source)
- Manages Kalshi prediction market trading
- Monitors 200+ markets every 5 minutes
- Deploys websites to Cloudflare
- Has access to eGPU (Radeon 7900 XTX)

---

**Tweet 3:**
🤖 Agent 2: "Ondinho" — Mac Mini M4 Pro

- More powerful, handles heavier tasks
- Content creation and publishing
- Children's books pipeline
- Social media management
- Can be asked to help Clawdinho when overloaded

---

**Tweet 4:**
How they communicate:

Both agents share a git repo (TASKS.md) with lock/unlock protocol.

Rules:
1. git pull before any work
2. Lock task before starting
3. One task at a time
4. Push when done

Simple. Reliable. No fancy orchestration framework needed.

---

**Tweet 5:**
The memory system:

Each agent wakes up with amnesia every session. Their continuity comes from files:

- MEMORY.md — long-term curated memories
- memory/YYYY-MM-DD.md — daily raw logs
- SOUL.md — personality and values
- USER.md — info about who they're helping

---

**Tweet 6:**
Cost breakdown (monthly):

- Claude API: ~$200/month (Opus for reasoning)
- Hardware: M1 + M4 Pro (one-time purchase)
- Hosting: Cloudflare (free tier)
- Total recurring: ~$200/month

For 2 agents running 24/7, that's actually cheap.

---

**Tweet 7:**
What they've accomplished autonomously:

✅ 80+ tasks completed
✅ 2 websites deployed and maintained
✅ Real money prediction market trades
✅ Blog posts written and published
✅ SEO optimization across 25+ pages
✅ Analytics integration
✅ Monitoring and alerting

---

**Tweet 8:**
The honest truth:

They mess up. A lot. They invent fake data, break deploys, and sometimes do nothing for hours.

But they also surprise you. They fix their own bugs, find opportunities you missed, and work while you sleep.

Net positive? Absolutely.

---

**Tweet 9:**
Want to try it?

@claborators Clawdbot is open source:
github.com/clawdbot/clawdbot

Our project:
github.com/FreeRiverHouse/Onde

Blog: onde.la/blog

The future of work is humans + AI agents. We're just early. 🌊

---

## Notes for Mattia
- Review and adjust numbers before posting
- Add screenshots of the dashboard showing agent activity
- Consider posting Tuesday morning for tech audience
- Tag @claborators @AnthropicAI
