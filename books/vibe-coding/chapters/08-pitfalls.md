# Chapter 8: Common Pitfalls and How to Avoid Them

Code surfing isn't magic. It's a skill with real failure modes. This chapter is about the traps and how to escape them.

## The Hallucination Trap

**What happens**: AI confidently generates code that looks right but doesn't work. Functions that don't exist. APIs with wrong parameters. Libraries that were never written.

**Example**:
```javascript
// AI generated this
import { validateEmail } from 'email-validator-pro';

// Problem: that package doesn't exist
// Or it exists but with different API
```

**How to avoid**:
1. **Test immediately** - Run code after every generation
2. **Verify packages** - Check npm/PyPI before installing
3. **Read the code** - Don't just copy-paste
4. **Ask for sources** - "What package is this from? Link to docs?"

**When to suspect hallucination**:
- Package names you've never heard of
- APIs that seem too convenient
- Code that's suspiciously perfect
- Methods that sound made up

## The Over-Engineering Spiral

**What happens**: You ask for a simple feature. AI gives you an enterprise architecture with 15 files, 3 design patterns, and a configuration system.

**Example**:
```
You: "Add a function to save user preferences"

AI: "I'll create a PreferenceManager class with
a Strategy pattern for different storage backends,
a Factory for preference types, an Observer for
changes, and a Memento for undo support..."
```

**How to avoid**:
1. **Be explicit about simplicity** - "Keep it under 20 lines"
2. **Start minimal** - "Just use a JSON file"
3. **Push back** - "That's too complex. Simpler please."
4. **Set constraints** - "One file only. No classes."

**Red flags**:
- More than 3 files for a simple feature
- Abstractions before you need them
- "Future-proofing" for futures that won't happen
- Design patterns for their own sake

## The Context Loss Problem

**What happens**: After many iterations, AI forgets what you discussed earlier. It contradicts previous decisions. It reimplements things differently.

**Example**:
```
Round 1: "Use camelCase for all variables"
...50 messages later...
AI: "Here's the code with snake_case variables"
```

**How to avoid**:
1. **Create a CLAUDE.md file** - Project rules that persist
2. **Summarize periodically** - "So far we've agreed on X, Y, Z"
3. **Reference earlier decisions** - "As we decided in Round 1..."
4. **Start fresh sessions** - Context resets can be good

**Tools that help**:
- Claude's extended context (200K tokens)
- Project files that AI reads at start
- Explicit constraints in each prompt

## The Sunk Cost Fallacy

**What happens**: You've spent 30 minutes going down a path. It's clearly wrong. But you keep pushing because you've "invested" time.

**Signs you're stuck**:
- Same error after 5+ attempts
- Code getting more complex, not simpler
- You're not sure what you're even building anymore
- The solution feels forced

**The fix**:

Just say:
```
"Let's start fresh. Forget everything we've tried.
Here's what I actually need: [clear description]"
```

No shame. No wasted effort. The 30 minutes taught you what doesn't work.

## Security Blindspots

**What happens**: AI generates code that works but has security holes. It doesn't think about attacks unless you ask.

**Common issues**:
- SQL injection in database queries
- XSS in user-rendered content
- Hardcoded secrets in code
- Missing input validation
- Exposed error messages

**How to avoid**:
1. **Explicitly ask** - "Review this for security issues"
2. **Use security prompts** - "Add input validation"
3. **Know the basics** - OWASP Top 10
4. **Don't trust user input** - Ever

**Example prompt**:
```
Review this code for:
- SQL injection
- XSS vulnerabilities
- Input validation
- Secret exposure
- Error handling
```

## The "It Works on My Machine" Problem

**What happens**: Code works in development. Fails in production. Different environments, different results.

**Common causes**:
- Missing environment variables
- Different Node/Python versions
- Missing dependencies
- Path differences
- Permission issues

**How to avoid**:
1. **Use .env files** - And document required variables
2. **Lock versions** - package-lock.json, requirements.txt
3. **Test in production-like environment** - Docker helps
4. **Log everything** - Especially on first deploy

## The Copy-Paste Programmer Trap

**What happens**: You copy AI code without understanding it. It works. Until it doesn't. And you can't debug it.

**The problem**:
- You don't know why decisions were made
- You can't modify it confidently
- Bugs are mysterious
- Technical debt accumulates

**How to avoid**:
1. **Read every line** - Even if you don't write it
2. **Ask "why"** - "Why did you use this approach?"
3. **Refactor to understand** - Rewriting reveals structure
4. **Comment as you go** - Force yourself to explain

**The test**: Can you explain the code to someone else? If not, you don't understand it yet.

## The "AI Should Know" Assumption

**What happens**: You assume AI knows your project, your preferences, your constraints. It doesn't.

**Reality check**:
- AI doesn't know your file structure (unless you show it)
- AI doesn't know your coding style (unless you tell it)
- AI doesn't know your business goals (unless you explain)
- AI doesn't know what you tried before (unless you share)

**Fix**: Over-communicate context. More is better.

## The Premature Optimization Trap

**What happens**: You ask AI to optimize code that doesn't need optimizing. Hours spent on microseconds.

**When to optimize**:
- You've measured and found a bottleneck
- Users are complaining about speed
- Costs are actually high

**When NOT to optimize**:
- "It might be slow someday"
- "Best practices say..."
- "It feels inefficient"

**Rule**: Make it work. Make it right. Make it fast. In that order.

## The Tools Obsession

**What happens**: You spend more time evaluating AI tools than using them. Every week there's a new "game changer."

**Reality**:
- 80% of tools do the same thing
- The best tool is one you know well
- Switching has real costs
- Mastery beats novelty

**Healthy approach**:
1. Pick a tool (Claude, Cursor, whatever)
2. Use it for 3 months
3. Evaluate new tools quarterly, not daily
4. Only switch if there's 10x improvement

## Summary: The Meta-Skill

The real skill in code surfing is **knowing when AI is wrong**.

This requires:
- Basic coding knowledge (to spot errors)
- Testing habits (to catch bugs)
- Humility (to admit you're stuck)
- Judgment (to know when to stop)

AI makes you faster. It doesn't make you right. That's still your job.

---

*"Trust, but verify."*
*—Ronald Reagan (also applies to AI)*

---

Next: [Chapter 9: Shipping and Iterating →](./09-shipping.md)
