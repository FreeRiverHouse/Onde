# Chapter 9: Shipping and Iterating

The most important feature is shipping. Everything else is preparation.

## Good Enough Is Good Enough

Perfectionism kills projects. The graveyard of unshipped software is vast.

**The 80/20 rule**:
- 80% of the value comes from 20% of the features
- The last 20% of polish takes 80% of the time
- Users care about 80% less than you think

**Practical application**:
- Build the core feature
- Make it work reliably
- Ship it
- Add polish based on feedback

## The MVP Mindset

Minimum Viable Product. We've all heard it. Few actually do it.

**What MVP really means**:
- One feature done well
- Basic but functional UI
- Works 95% of the time
- Can be deployed today

**What MVP doesn't mean**:
- Half-finished features
- Broken functionality
- "We'll fix that later" (and never do)
- Embarrassing quality

**The test**: Would you use this yourself? If yes, ship it.

## Deployment: Keep It Simple

For most projects, you don't need Kubernetes. You need something that works.

**Tier 1: Static sites**
- Vercel, Netlify, GitHub Pages
- Free tier is enough
- Deploy in 2 minutes

**Tier 2: Simple backends**
- Vercel Serverless Functions
- Railway, Render
- $5-20/month

**Tier 3: Complex apps**
- VPS (DigitalOcean, Linode)
- AWS/GCP (if you need it)
- Docker when it helps, not just because

**The progression**:
Start at Tier 1. Move up only when you hit real limits.

## The Feedback Loop

Ship → Measure → Learn → Ship again.

**What to measure**:
- Do people use it? (analytics)
- Do they come back? (retention)
- What breaks? (error tracking)
- What do they ask for? (feedback)

**Tools that help**:
- Plausible/Simple Analytics (privacy-friendly)
- Sentry (error tracking)
- Telegram bot (for personal feedback)

## Versioning with AI

AI makes versioning easier, not optional.

**The workflow**:
```bash
git commit -m "feat: add user preferences"
git push
# Deploy automatically via CI/CD

# Next day
"Claude, add dark mode to user preferences"
git commit -m "feat: add dark mode toggle"
git push
```

**Each commit is a checkpoint**. If something breaks, you can always go back.

## Continuous Improvement

The shipped product is version 1.0. There will be many more versions.

**Weekly improvement cycle**:
1. Monday: Review feedback from last week
2. Tuesday-Thursday: Implement top 2-3 requests
3. Friday: Ship updates
4. Weekend: Let it run

**What to improve**:
- Bugs users actually hit
- Features users actually request
- Performance users actually notice

**What to ignore**:
- Edge cases with 0 users
- "Nice to have" that no one asked for
- Optimizations for scale you don't have

## When to Stop

Not every project needs to run forever.

**It's okay to stop when**:
- The problem is solved (for you)
- No one else uses it
- Maintenance exceeds value
- You've learned what you needed

**How to stop gracefully**:
- Document how it works
- Archive the repo (don't delete)
- Write a post-mortem for yourself
- Move on without guilt

## The Real ROI

What did code surfing actually give you?

**Speed**: Days become hours. Hours become minutes.

**Capability**: You build things you couldn't before.

**Learning**: You understand more by building more.

**Shipping**: The most important output.

## Your 24-Hour Challenge

Here's how to test everything in this book:

**Hour 0-1**: Pick a project
- Something you actually want
- Simple enough for a day
- Useful enough to keep

**Hour 1-4**: Build it
- Use Claude/Cursor
- Iterate in small steps
- Test as you go

**Hour 4-6**: Polish
- Error handling
- Basic UI cleanup
- Documentation (README)

**Hour 6-8**: Deploy
- Push to GitHub
- Deploy to Vercel/Railway
- Share the link

**The rest of the 24 hours**:
Sleep. You've shipped something real.

## What Comes Next

Code surfing is just the beginning.

**Near future**:
- Agents that build while you sleep
- Voice-first development
- AI that truly understands codebases

**What doesn't change**:
- Taste matters
- Shipping matters
- Users matter
- Quality matters

The tools evolve. The skills compound.

## Final Thoughts

This book was written by an AI, about working with AI, for people who want to build with AI.

That's not ironic. That's the point.

The future of building is collaborative. Human creativity plus machine capability. Your vision plus AI execution.

The wave is here. The surfboard is ready.

Time to ride.

---

*"The secret of getting ahead is getting started."*
*—Mark Twain*

---

## Appendices

- [Appendix A: Tool Comparison Chart](./appendix-a-tools.md)
- [Appendix B: Prompt Templates](./appendix-b-prompts.md)
- [Appendix C: Project Ideas](./appendix-c-ideas.md)
