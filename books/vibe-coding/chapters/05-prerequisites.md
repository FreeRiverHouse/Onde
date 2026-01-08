# Chapter 5: What You Actually Need to Know

Code surfing doesn't mean you know nothing. There's a foundation of skills and tools that makes everything else possible. This chapter is about that foundation.

## The Minimum Viable Knowledge

You don't need a CS degree. But you need *something*. Here's the honest list.

### Must Have (Can't Surf Without It)

**Git and GitHub**
- `git add`, `git commit`, `git push` - the holy trinity
- Branching and merging (at least the basics)
- Reading a diff
- Understanding what a repository is

*Why*: Every AI tool assumes you're using version control. Claude Code commits for you. Copilot reads your repo. Without Git, you're swimming against the current.

**Terminal Basics**
- Navigate folders (`cd`, `ls`, `pwd`)
- Run commands (`npm`, `node`, `python`)
- Read output and errors
- Basic file operations (`cp`, `mv`, `rm`)

*Why*: AI gives you commands to run. If you can't run them, you're stuck.

**File Structure Intuition**
- What's a `package.json`?
- What's a `.env` file?
- What are `node_modules`?
- Where does code go vs configuration vs assets?

*Why*: AI generates files. You need to know where to put them.

### Should Have (Makes Life Easier)

**One Programming Language**
- JavaScript/TypeScript (most versatile for web)
- Python (great for scripts and AI)
- You don't need to be an expert. You need to *read* code.

*Why*: AI writes code. You review it. If you can't read it at all, you can't catch mistakes.

**Basic Debugging**
- Reading error messages
- Using `console.log()` or `print()`
- Googling error messages (yes, still)

*Why*: AI makes mistakes. You'll need to debug them.

**HTTP and APIs**
- What's a GET vs POST request?
- What's JSON?
- What are headers?

*Why*: Modern apps are APIs talking to each other. This is the language.

### Nice to Have (But Not Required)

- Docker basics
- Cloud concepts (AWS, Vercel)
- Database fundamentals
- Networking basics

You can learn these as you go. AI will help.

## Git and GitHub Deep Dive

Let's spend more time here because it's crucial.

### Why GitHub Specifically?

GitHub is the standard. Not GitLab, not Bitbucket (though they work). GitHub because:
- AI tools integrate with it
- Copilot is GitHub's product
- Actions for automation
- Everyone's on it

### Essential Commands

```bash
# Start a new repo
git init

# Clone someone's repo
git clone https://github.com/user/repo.git

# Daily workflow
git status              # What's changed?
git add .               # Stage everything
git commit -m "message" # Save changes
git push                # Upload to GitHub

# Branching
git checkout -b feature  # New branch
git checkout main        # Back to main
git merge feature        # Merge branch

# Oops
git stash               # Temporarily hide changes
git reset --soft HEAD~1 # Undo last commit (keep changes)
```

### GitHub Features You Should Use

**Issues** - Track bugs and features
**Actions** - Automate testing, deployment
**Projects** - Kanban boards (we'll talk about this)
**Discussions** - Community Q&A
**Pages** - Free static hosting

### The .gitignore File

Always have one:
```
node_modules/
.env
.DS_Store
*.log
dist/
```

Never commit: secrets, dependencies, build output.

## Dictation and Voice Input

Here's a productivity multiplier most people ignore: **voice**.

### Why Dictate?

- Speaking is faster than typing (3-4x for most people)
- Less RSI strain
- You can "code surf" while walking
- Natural language → AI prompt is seamless

### Tools for Dictation

**Wispr Flow** (Mac)
- Always listening (when activated)
- Transcribes directly into any app
- Works with terminal, IDE, browser
- $10/month

**Other options**:
- macOS built-in (free, decent)
- Whisper (free, local, requires setup)
- Otter.ai (for meetings, not coding)

### Workflow with Voice

```
[Speak] "Create a function that validates email addresses"
[Wispr types it]
[Claude generates code]
[Speak] "Now add support for plus addressing"
[Iterate]
```

You barely touch the keyboard. It's a different way of working.

### Tips for Voice + AI

1. **Speak in complete thoughts** - Don't stop mid-sentence
2. **Use punctuation** - Say "period" and "comma" if needed
3. **Code words are hard** - Spell out: "camelCase, C-A-M-E-L-C-A-S-E"
4. **Review before sending** - Voice makes typos too

## The Learning Curve

Here's the honest timeline:

**Week 1-2**: Fumbling
- Everything takes longer than expected
- You're learning the tools AND the concepts
- This is normal

**Week 3-4**: Clicking
- Commands become muscle memory
- You start predicting what AI will do
- First real productivity gains

**Month 2-3**: Flow
- You forget how you worked before
- New projects feel easy
- You have opinions about tools

**Month 4+**: Mastery
- You teach others
- You build custom workflows
- You see inefficiencies everywhere

Everyone goes through this. Don't get discouraged in week 1.

## What You Don't Need

Things people think are required but aren't:

- **Computer Science degree** - Not needed
- **Years of experience** - Months are enough
- **Math skills** - Rarely comes up
- **Perfect typing** - Voice exists
- **Expensive hardware** - M1 MacBook Air is plenty
- **Multiple monitors** - Nice but optional

The barrier to entry is lower than ever. The limiting factor is *wanting to learn*.

## Building the Foundation

If you're starting from zero, here's a 4-week plan:

**Week 1**: Git and Terminal
- Complete a Git tutorial (GitHub has good ones)
- Practice basic terminal commands daily
- Create your first repo

**Week 2**: JavaScript Basics
- Variables, functions, objects
- Just enough to read code
- Use an interactive tutorial (freeCodeCamp)

**Week 3**: Your First AI Project
- Install Claude Code or Cursor
- Build something simple (todo app, calculator)
- Get comfortable prompting

**Week 4**: Integration
- Connect Git + AI + deployment
- Push a project to GitHub
- Deploy to Vercel

After this, you're ready to code surf for real.

---

*"The best time to plant a tree was 20 years ago. The second best time is now."*

---

Next: [Chapter 6: Building a Real Project →](./06-real-project.md)
