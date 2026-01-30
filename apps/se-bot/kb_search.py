#!/usr/bin/env python3
"""
SE-Bot Knowledge Base Search Module

Provides semantic search over the SASE/SD-WAN knowledge base.
Used by the meeting context analyzer to find relevant content.

Usage:
    from kb_search import search, get_context_for_topic

    # Basic search
    results = search("zero trust architecture")
    
    # Get formatted context for Claude prompt
    context = get_context_for_topic("customer asking about ZTNA vs VPN")
"""

import os
from pathlib import Path
from typing import List, Dict, Optional

# Check if chromadb is available
try:
    import chromadb
    from chromadb.utils import embedding_functions
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

DB_PATH = Path(__file__).parent / "chroma_db"
_client = None
_collection = None

def _get_collection():
    """Get or create ChromaDB collection singleton."""
    global _client, _collection
    
    if not CHROMADB_AVAILABLE:
        return None
    
    if _collection is not None:
        return _collection
    
    if not DB_PATH.exists():
        return None
    
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    
    _client = chromadb.PersistentClient(path=str(DB_PATH))
    _collection = _client.get_collection("se_bot_kb", embedding_function=embedding_fn)
    
    return _collection

def search(query: str, n_results: int = 5) -> List[Dict]:
    """
    Search the knowledge base.
    
    Args:
        query: Search query (natural language)
        n_results: Max number of results
        
    Returns:
        List of results with content, source, section, and relevance score
    """
    collection = _get_collection()
    if collection is None:
        return []
    
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    if not results or not results['documents']:
        return []
    
    formatted = []
    for doc, meta, dist in zip(
        results['documents'][0],
        results['metadatas'][0],
        results['distances'][0]
    ):
        formatted.append({
            "content": doc,
            "source": meta.get("source", "unknown"),
            "section": meta.get("section", ""),
            "category": meta.get("category", ""),
            "relevance": round(1 - dist, 3)  # Convert distance to similarity
        })
    
    return formatted

def get_context_for_topic(topic: str, max_chars: int = 3000) -> str:
    """
    Get formatted context for a meeting topic.
    
    This returns a string suitable for including in a Claude prompt,
    containing relevant knowledge base content.
    
    Args:
        topic: The meeting topic or question
        max_chars: Maximum characters to return
        
    Returns:
        Formatted context string with sources
    """
    results = search(topic, n_results=5)
    
    if not results:
        return "No relevant knowledge base content found."
    
    context_parts = []
    total_chars = 0
    
    for r in results:
        if r['relevance'] < 0.3:  # Skip low relevance results
            continue
            
        # Format: [Source > Section] Content
        source_info = f"[{r['source']}"
        if r['section']:
            source_info += f" > {r['section']}"
        source_info += "]"
        
        entry = f"{source_info}\n{r['content']}\n"
        
        if total_chars + len(entry) > max_chars:
            break
            
        context_parts.append(entry)
        total_chars += len(entry)
    
    if not context_parts:
        return "No sufficiently relevant knowledge base content found."
    
    return "\n---\n".join(context_parts)

def get_categories() -> List[str]:
    """Get all knowledge base categories."""
    collection = _get_collection()
    if collection is None:
        return []
    
    # Get all unique categories from metadata
    all_items = collection.get()
    if not all_items or not all_items['metadatas']:
        return []
    
    categories = set()
    for meta in all_items['metadatas']:
        if 'category' in meta:
            categories.add(meta['category'])
    
    return sorted(list(categories))

def get_stats() -> Dict:
    """Get knowledge base statistics."""
    collection = _get_collection()
    if collection is None:
        return {"status": "unavailable", "reason": "ChromaDB not available or DB not built"}
    
    return {
        "status": "ready",
        "document_count": collection.count(),
        "categories": get_categories(),
        "db_path": str(DB_PATH)
    }

# Quick test
if __name__ == "__main__":
    import sys
    
    stats = get_stats()
    print(f"📊 Knowledge Base Status: {stats['status']}")
    
    if stats['status'] == 'ready':
        print(f"   Documents: {stats['document_count']}")
        print(f"   Categories: {', '.join(stats['categories'])}")
        
        if len(sys.argv) > 1:
            query = " ".join(sys.argv[1:])
            print(f"\n🔍 Searching: {query}\n")
            print(get_context_for_topic(query))
