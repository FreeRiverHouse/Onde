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

- **Embeddings**: Local (Chroma/FAISS) or OpenAI
- **Retrieval**: Semantic search with re-ranking
- **Integration**: Fed into SE-Bot Claude prompts as context
