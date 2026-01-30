# SE-Bot Response Style Templates

This directory contains Claude prompt templates for different response styles during SE meetings.

## Available Styles

| Style | Use When | Audience |
|-------|----------|----------|
| `technical-deepdive` | Network engineers asking detailed questions | IT/NetOps/SecOps |
| `executive-summary` | C-level/business stakeholders | CIO, CISO, CFO |
| `competitive-battle-card` | Customer mentions competitor | Any (adapt tone) |
| `objection-handling` | Customer pushback or concerns | Any |
| `demo-suggestion` | Customer shows interest in seeing the product | Any |

## Usage

Templates use placeholders:
- `{context}` - Recent conversation transcript (last 2-3 min)
- `{kb_context}` - Retrieved knowledge base context (RAG results)
- `{competitor}` - Detected competitor name (for battle cards)
- `{objection}` - Specific objection to address

## Integration

```python
from prompts.loader import load_prompt, get_style_for_context

# Auto-detect style from context
style = get_style_for_context(transcript, kb_results)

# Load and format prompt
prompt = load_prompt(style, context=transcript, kb_context=kb_context)
```

## Adding New Styles

1. Create a new `.md` file in this directory
2. Use the standard placeholder format
3. Add to the style detection logic in `loader.py`
