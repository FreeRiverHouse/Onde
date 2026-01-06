# Conversation History

This folder stores conversation history for each agent, organized by book project.

## Structure

```
conversations/
├── gianni-parola/
│   ├── salmo-23-bambini.json
│   ├── ai-spiegata-bambini.json
│   └── ...
└── pino-pennello/
    ├── salmo-23-bambini.json
    ├── ai-spiegata-bambini.json
    └── ...
```

## Format

Each JSON file contains:
```json
{
  "agent": "gianni-parola",
  "book": "salmo-23-bambini",
  "conversations": [
    {
      "timestamp": "2025-01-05T10:30:00Z",
      "role": "user",
      "content": "..."
    },
    {
      "timestamp": "2025-01-05T10:30:05Z",
      "role": "assistant",
      "content": "..."
    }
  ],
  "decisions": [
    {
      "timestamp": "2025-01-05T10:35:00Z",
      "topic": "tone",
      "decision": "Law of Attraction / Abundance mindset",
      "reasoning": "..."
    }
  ]
}
```

## Usage

The agents automatically load the last N messages as context when you chat with them.
This gives them "memory" of previous conversations about each book.
