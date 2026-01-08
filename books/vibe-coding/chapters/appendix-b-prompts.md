# Appendix B: Prompt Templates

Copy-paste ready prompts for common tasks.

## Project Setup

### New Project Scaffold
```
Create a [LANGUAGE] project for [PURPOSE].

Structure:
- src/ for source code
- tests/ for tests
- README.md with setup instructions

Include:
- Package manager config (package.json / requirements.txt)
- .gitignore
- Basic linting config

Keep it minimal. No unnecessary dependencies.
```

### Add Feature
```
I need to add [FEATURE] to [PROJECT].

Current relevant code:
[paste relevant files or describe structure]

Requirements:
- [Requirement 1]
- [Requirement 2]

Constraints:
- [Max lines/files]
- [Style preferences]
- [Dependencies to use/avoid]
```

## Code Quality

### Code Review
```
Review this code for:
- Security issues (injection, XSS, etc.)
- Performance problems
- Code style consistency
- Edge cases and error handling
- Unnecessary complexity

[paste code]

Be direct. Tell me what's wrong and how to fix it.
```

### Refactor Request
```
Refactor this code to be:
- More readable
- Less complex
- Better structured

Keep the functionality identical.
Don't add features.
Don't over-engineer.

[paste code]
```

### Bug Fix
```
Bug: [What's happening]
Expected: [What should happen]
Code: [relevant code]
Error message: [if any]
What I've tried: [previous attempts]

Help me fix this. Explain the root cause.
```

## API and Backend

### API Endpoint
```
Create an API endpoint that:
- Method: [GET/POST/PUT/DELETE]
- Path: /api/[path]
- Input: [describe expected input]
- Output: [describe expected response]
- Errors: [what errors to handle]

Use [framework: Express/Fastify/etc].
Include input validation and error handling.
```

### Database Query
```
I need a query that:
- Database: [PostgreSQL/SQLite/MongoDB]
- Purpose: [what data to get/update]
- Tables/Collections: [list relevant ones]

Show me the query and explain it.
Include any indexes I should add.
```

## Frontend

### React Component
```
Create a React component for [PURPOSE].

Props:
- [prop1]: [type and description]
- [prop2]: [type and description]

Behavior:
- [behavior 1]
- [behavior 2]

Use [TypeScript/JavaScript].
Use [styling approach: Tailwind/CSS modules/etc].
Keep it simple and reusable.
```

### Form with Validation
```
Create a form for [PURPOSE].

Fields:
- [field1]: [type, validation rules]
- [field2]: [type, validation rules]

On submit: [what should happen]
Show validation errors inline.
Use [form library if any: React Hook Form, etc].
```

## DevOps

### Docker Setup
```
Create a Dockerfile for [PROJECT TYPE].

Requirements:
- Base image: [node:20/python:3.11/etc]
- Build steps: [what needs to compile]
- Runtime: [what runs in production]
- Port: [exposed port]

Include docker-compose.yml if needed.
Keep images small.
```

### CI/CD Pipeline
```
Create a GitHub Actions workflow that:
1. Runs on [push to main / PR / etc]
2. [Tests to run]
3. [Build steps]
4. [Deploy to: Vercel/Railway/etc]

Include caching for dependencies.
Fail fast on errors.
```

## Documentation

### README Template
```
Write a README for [PROJECT] that includes:
1. One-line description
2. Quick start (3 steps max)
3. Configuration options
4. Common commands
5. Contributing guidelines (brief)

Keep it scannable. No walls of text.
```

### API Documentation
```
Document this API:
[paste endpoints or code]

Format:
- Endpoint path and method
- Required headers
- Request body (with examples)
- Response format (with examples)
- Error codes

Use markdown. Keep it practical.
```

## Debugging

### Error Investigation
```
I'm getting this error:
[paste full error message and stack trace]

Relevant code:
[paste code around the error]

Environment:
- [OS, Node version, etc]
- [Recent changes]

What's causing this and how do I fix it?
```

### Performance Issue
```
This code is slow:
[paste code]

Context:
- [Input size / frequency]
- [Current performance: X seconds]
- [Target performance: Y seconds]

How can I make it faster?
Explain the bottleneck.
```

## Architecture

### Design Decision
```
I need to choose between:
A) [Option A with brief description]
B) [Option B with brief description]

Context:
- [Project type and scale]
- [Team size and experience]
- [Priorities: speed/maintainability/cost]

Which do you recommend and why?
What are the tradeoffs?
```

### System Design
```
Design a system for [PURPOSE].

Requirements:
- [Scale: users, requests/second]
- [Data: types, volume]
- [Features: list core features]

Constraints:
- [Budget]
- [Team size]
- [Timeline]

Give me a high-level architecture.
Identify the key decisions.
```

---

*Customize these for your projects. The best prompts are specific.*
