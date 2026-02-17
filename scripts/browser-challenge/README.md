# Browser Navigation Challenge Agent

An AI agent that solves the [Browser Navigation Challenge](https://serene-frangipane-7fd25b.netlify.app/) using Claude + Playwright.

## Challenge
- Solve 30 browser automation challenges in under 5 minutes
- Track time, tokens, and cost metrics
- From: https://x.com/adcock_brett/status/2018417226895028414

## Setup

```bash
cd scripts/browser-challenge
pip install -r requirements.txt
playwright install chromium

# Set API key
export ANTHROPIC_API_KEY="your-key"
```

## Run

```bash
python agent.py
```

## How It Works

1. **Playwright** captures browser state (simplified DOM snapshot)
2. **Claude** analyzes the snapshot and decides the next action
3. **Agent** executes the action (click, type, scroll, etc.)
4. Repeat until challenge complete or time limit reached

## Output

- Real-time progress in terminal
- `challenge_results.json` with full statistics
- Metrics: time, tokens, cost, actions, errors

## Architecture

```
┌─────────────┐     snapshot     ┌─────────┐
│  Playwright │ ───────────────► │  Claude │
│  (Browser)  │ ◄─────────────── │  (AI)   │
└─────────────┘     action       └─────────┘
```

## Optimization Ideas

- [ ] Parallel snapshot + action (pipeline)
- [ ] Cache common UI patterns
- [ ] Use vision model for complex UIs
- [ ] Fine-tune prompts per challenge type
- [ ] Reduce snapshot size further
