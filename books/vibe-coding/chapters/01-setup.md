# Chapter 1: Setting Up Your Surfboard

Before you catch your first wave, you need the right equipment. In code surfing, your "surfboard" is your development environment—the AI assistant, the terminal, and the invisible infrastructure that makes everything flow.

## Choosing Your AI Assistant

Not all AI assistants are created equal. Here's what matters:

| Tool | Best For | Limitations |
|------|----------|-------------|
| **Claude Code** | Terminal-first development, file editing, Git | Requires CLI comfort |
| **Cursor** | IDE integration, visual editing | Subscription model |
| **GitHub Copilot** | Autocomplete, inline suggestions | Less conversational |
| **ChatGPT** | Quick questions, brainstorming | No file access |
| **Grok** | Image generation, X integration | Limited coding focus |

**My recommendation**: Start with Claude Code if you're comfortable in a terminal. It can read your files, edit them, run commands, and maintain context across your entire project.

## The Conversation as Your Dev Log

Here's a mindset shift: your conversation with the AI *is* your development log.

Traditional development:
1. Think about what to build
2. Write code
3. Test
4. Debug
5. Repeat

Code surfing:
1. Describe what you want
2. AI writes code
3. You review and refine
4. AI adjusts
5. Ship

The conversation captures your intent, the iterations, the decisions. It's documentation that writes itself.

## File Structure That AI Understands

AI works better when your project is organized predictably:

```
project/
├── README.md          # AI reads this first
├── CLAUDE.md          # Special instructions for Claude
├── src/               # Source code
├── tests/             # Test files
├── docs/              # Documentation
└── package.json       # Dependencies
```

**Pro tip**: Create a `CLAUDE.md` file with project-specific instructions. The AI will read it automatically and follow your rules.

Example `CLAUDE.md`:
```markdown
# Project Rules

- Use TypeScript, not JavaScript
- All API calls go through src/api/
- Run tests before committing
- Never commit .env files
```

## Environment Variables and Secrets

**Never put secrets in your code.** AI will see them. Git will track them. This is basic, but it's worth repeating.

```bash
# .env (gitignored)
API_KEY=your-secret-key
DATABASE_URL=postgres://...

# In code
const apiKey = process.env.API_KEY;
```

## The Automation Mindset

Here's where code surfing gets powerful: **automate everything repeatable**.

If you do something twice, ask yourself:
- Can I script this?
- Can I make the AI do this automatically?
- Can I create a workflow that handles this forever?

Examples from real projects:
- **PDF generation**: One command creates print-ready books
- **Social media**: Bot posts with approval workflow
- **Deployment**: Push to Git, production updates automatically

The goal is to reduce friction to zero. The less you have to think about *how* to do something, the more you can focus on *what* to build.

## Levels of Automation

As your projects grow, so should your automation:

### Level 1: Manual (Where We Start)
- Run commands by hand
- Copy files manually
- Deploy by uploading

### Level 2: Scripts (Where Most Projects Live)
- `npm run build` does everything
- One command to deploy
- AI-generated utility scripts

### Level 3: Pipelines (Production Ready)
- Git push triggers builds
- Automated testing
- Staging → Production promotion

### Level 4: Full CI/CD (Enterprise Scale)
- Multiple environments (dev, staging, production)
- Automated rollbacks
- Feature flags
- Monitoring and alerts

**Where should you be?** Probably Level 2 for most projects. Don't over-engineer. But know that Level 3-4 exists for when you need it.

## Pre-Production vs Production

Even for small projects, separating environments saves headaches:

```
Development (your machine)
    ↓
Staging (test server)
    ↓
Production (real users)
```

**Minimum viable separation**:
- Use different API keys for dev/prod
- Have a test database
- Don't test on production (you'll break things)

For now, a simple approach:
```javascript
const isProd = process.env.NODE_ENV === 'production';
const apiUrl = isProd
  ? 'https://api.yourapp.com'
  : 'http://localhost:3000';
```

As apps grow, you'll want proper staging servers. But start simple.

## Your First Setup Checklist

- [ ] AI assistant installed and configured
- [ ] Terminal comfortable (or IDE ready)
- [ ] Git initialized
- [ ] `.env` file created (and gitignored)
- [ ] `CLAUDE.md` with project rules
- [ ] Basic folder structure in place

Don't overthink this. You can always reorganize later. The point is to start surfing, not to build the perfect surfboard.

---

*"Premature optimization is the root of all evil. But no optimization is the root of all slowness."*

---

Next: [Chapter 2: The Art of Prompting →](./02-prompting.md)
