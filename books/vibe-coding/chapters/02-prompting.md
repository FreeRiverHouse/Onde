# Chapter 2: The Art of Prompting for Code

The difference between a frustrating AI session and a productive one usually comes down to one thing: how you ask.

This isn't about magic words or secret prompts. It's about communication. The AI is smart, but it can't read your mind. Yet.

## Be Specific, Get Specific

Bad prompt:
> "Make me a website"

Better prompt:
> "Create a Next.js landing page with a hero section, three feature cards, and a contact form. Use Tailwind CSS. Mobile responsive."

Best prompt:
> "Create a Next.js landing page for a children's book publisher. Hero section with book cover image, tagline 'Stories that spark imagination'. Three feature cards: 'Illustrated Books', 'Educational Content', 'Multi-language'. Contact form at bottom. Tailwind CSS, mobile-first. Color palette: warm yellows and soft blues."

The more context you provide, the closer the AI gets to what you actually want.

## Context is King

AI doesn't know:
- Your project structure (unless you show it)
- Your coding preferences (unless you tell it)
- Your business goals (unless you explain them)
- What you tried before (unless you share it)

**Always include relevant context**:

```
I'm building a Telegram bot for a publishing company.
Current file structure:
- src/bot.ts (main bot logic)
- src/handlers/ (command handlers)
- src/api/ (external API calls)

I need to add a command that lets users approve or reject
posts before they go live. The approval should be stored
in a JSON file for now (we'll add a database later).
```

This prompt tells the AI:
- What project you're working on
- How it's organized
- What you need
- Future considerations

## The Iterative Dance

Code surfing is a conversation, not a monologue.

**Round 1**: Ask for what you want
```
Create a function that generates a PDF from HTML
```

**Round 2**: Refine based on result
```
Good, but add support for custom fonts.
Use Puppeteer instead of html-pdf.
```

**Round 3**: Handle edge cases
```
What if the HTML has images?
Convert them to base64 first.
```

**Round 4**: Polish
```
Add error handling and a progress log.
```

Four rounds, complete solution. Each round builds on the last.

## When to Start Over

Sometimes the AI goes down the wrong path. Signs it's time to reset:

- You've been fixing the same bug for 5+ iterations
- The code is getting more complex, not simpler
- You realize your initial request was wrong

**Don't sunk-cost yourself.** Say:

> "Let's start fresh. Forget the previous approach. Here's what I actually need: [clearer description]"

## The Magic Phrases

Certain phrases unlock better responses:

**For exploration**:
- "What are my options for..."
- "Compare approaches for..."
- "What would you recommend for..."

**For precision**:
- "Show me the exact code for..."
- "Step by step, how do I..."
- "Give me a minimal example of..."

**For debugging**:
- "This code gives error [X]. Why?"
- "What's wrong with this approach?"
- "How would you fix this?"

**For improvement**:
- "How can I make this more efficient?"
- "What am I missing?"
- "Review this code for issues"

## Prompt Templates

Save prompts that work. Here are some starters:

### New Feature
```
I need to add [FEATURE] to [PROJECT].
Current relevant code: [paste or describe]
Requirements:
- [Requirement 1]
- [Requirement 2]
Constraints:
- [Constraint 1]
- [Constraint 2]
```

### Bug Fix
```
Bug: [What's happening]
Expected: [What should happen]
Code: [relevant code]
Error message: [if any]
What I've tried: [previous attempts]
```

### Code Review
```
Review this code for:
- Security issues
- Performance problems
- Code style
- Edge cases

[paste code]
```

### Architecture Decision
```
I need to choose between:
A) [Option A]
B) [Option B]

Context: [project description]
Priorities: [speed? maintainability? scalability?]

Which do you recommend and why?
```

## The Meta-Skill

The real skill in prompting is knowing what you don't know.

If you're unsure about something, ask:
> "What questions should I be asking about [topic]?"

The AI will help you discover the unknown unknowns.

## Common Mistakes

**Too vague**: "Make it better"
→ Better: "Make it faster by caching the API responses"

**Too much at once**: "Build me a complete e-commerce platform"
→ Better: "Start with a product listing page"

**No context**: "Fix this bug"
→ Better: "This function returns null when the input is empty. It should return an empty array."

**Ignoring errors**: "It doesn't work"
→ Better: "I get 'TypeError: Cannot read property X of undefined' on line 42"

## Practice Exercise

Try this prompt with your AI:

```
I want to build a simple CLI tool that:
1. Reads a markdown file
2. Extracts all headers (# and ##)
3. Outputs them as a table of contents

Use Node.js. Keep it under 50 lines.
Show me the code and explain each part.
```

Watch how the AI responds. Then iterate:
- "Add line numbers to each header"
- "Support ### headers too"
- "Make it work with stdin so I can pipe files"

This is code surfing. Each wave builds on the last.

---

*"A well-asked question is half-answered."*

---

Next: [Chapter 3: Your First Project →](./03-first-project.md)
