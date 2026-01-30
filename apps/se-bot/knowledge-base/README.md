# SE-Bot Knowledge Base

Knowledge base for the Sales Engineering AI copilot. Contains domain knowledge for SASE, SD-WAN, and Versa Networks products.

## Structure

```
knowledge-base/
├── domains/
│   ├── versa-networks/     # Versa-specific products and features
│   ├── sase/               # SASE architecture and concepts
│   ├── sd-wan/             # SD-WAN fundamentals
│   ├── security/           # Zero Trust, ZTNA, firewall
│   └── networking/         # BGP, OSPF, VPN, cloud
├── competitive/            # Competitive positioning vs Palo Alto, Zscaler, etc.
├── use-cases/              # Common customer scenarios
├── objections/             # Handling objections and FUD
└── style/                  # Mattia's communication style guide
```

## Adding Content

1. Place markdown files in appropriate domain folder
2. Run embedding script to index (coming soon)
3. SE-Bot will automatically use for RAG

## Priority Content Needed

- [ ] Versa VOS architecture overview
- [ ] SASE vs traditional architecture comparison
- [ ] Competitive comparison matrix (Versa vs Palo Alto, Zscaler, Cato)
- [ ] Common objections handling playbook
- [ ] Mattia's SE style guide (terminology, approach, phrases)

## Tech Stack

- **Embeddings**: ChromaDB with sentence-transformers (all-MiniLM-L6-v2)
- **Retrieval**: Semantic search with cosine similarity
- **Integration**: Fed into SE-Bot Claude prompts as context

## Building the Vector Database

```bash
cd apps/se-bot

# First time setup
python3 -m venv venv
source venv/bin/activate
pip install chromadb sentence-transformers

# Build embeddings
python build_embeddings.py

# Test search
python build_embeddings.py search "zero trust architecture"
```

## Using in Code

```python
from kb_search import search, get_context_for_topic

# Basic search
results = search("ZTNA vs VPN")

# Get formatted context for Claude prompt
context = get_context_for_topic("customer asking about zero trust")
```

## Files

- `build_embeddings.py` - Builds ChromaDB from markdown files
- `kb_search.py` - Search module for SE-Bot integration
- `chroma_db/` - Vector database (created after build)
