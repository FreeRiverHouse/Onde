#!/usr/bin/env python3
"""
SE-Bot Knowledge Base Embeddings Builder

Builds a ChromaDB vector store from the knowledge base markdown files.
This enables semantic search for relevant content during meetings.

Usage:
    cd apps/se-bot
    source venv/bin/activate
    python build_embeddings.py

First time setup:
    python3 -m venv venv
    source venv/bin/activate
    pip install chromadb sentence-transformers
"""

import os
import json
from pathlib import Path
from datetime import datetime

# Check if chromadb is available
try:
    import chromadb
    from chromadb.utils import embedding_functions
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    print("⚠️  ChromaDB not installed. Run: pip install chromadb sentence-transformers")

KB_PATH = Path(__file__).parent / "knowledge-base"
DB_PATH = Path(__file__).parent / "chroma_db"

def load_markdown_files():
    """Load all markdown files from knowledge-base directory."""
    documents = []
    metadatas = []
    ids = []
    
    for md_file in KB_PATH.rglob("*.md"):
        if md_file.name == "README.md":
            continue
            
        content = md_file.read_text(encoding='utf-8')
        relative_path = md_file.relative_to(KB_PATH)
        
        # Split by sections for better chunking
        sections = split_into_sections(content, str(relative_path))
        
        for i, (section_title, section_content) in enumerate(sections):
            if len(section_content.strip()) < 50:  # Skip tiny sections
                continue
                
            doc_id = f"{relative_path.stem}_{i}"
            documents.append(section_content)
            metadatas.append({
                "source": str(relative_path),
                "section": section_title,
                "category": str(relative_path.parent),
                "indexed_at": datetime.now().isoformat()
            })
            ids.append(doc_id)
    
    return documents, metadatas, ids

def split_into_sections(content: str, source: str):
    """Split markdown content into sections by headers."""
    sections = []
    current_section = "intro"
    current_content = []
    
    for line in content.split('\n'):
        if line.startswith('## '):
            if current_content:
                sections.append((current_section, '\n'.join(current_content)))
            current_section = line[3:].strip()
            current_content = [line]
        elif line.startswith('### '):
            if current_content:
                sections.append((current_section, '\n'.join(current_content)))
            current_section = line[4:].strip()
            current_content = [line]
        else:
            current_content.append(line)
    
    if current_content:
        sections.append((current_section, '\n'.join(current_content)))
    
    return sections

def build_database():
    """Build ChromaDB vector store from knowledge base."""
    if not CHROMADB_AVAILABLE:
        print("❌ Cannot build database - ChromaDB not installed")
        return False
    
    print(f"📂 Loading knowledge base from: {KB_PATH}")
    documents, metadatas, ids = load_markdown_files()
    
    if not documents:
        print("❌ No documents found!")
        return False
    
    print(f"📄 Found {len(documents)} document sections")
    
    # Use sentence-transformers for embeddings (runs locally!)
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"  # Fast, good quality, 384 dims
    )
    
    # Create ChromaDB client
    client = chromadb.PersistentClient(path=str(DB_PATH))
    
    # Delete existing collection if exists
    try:
        client.delete_collection("se_bot_kb")
    except:
        pass
    
    # Create new collection
    collection = client.create_collection(
        name="se_bot_kb",
        embedding_function=embedding_fn,
        metadata={"description": "SE-Bot SASE/SD-WAN knowledge base"}
    )
    
    print("🔨 Building embeddings...")
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    
    print(f"✅ Database built! {collection.count()} documents indexed")
    print(f"📁 Saved to: {DB_PATH}")
    
    # Save stats
    stats = {
        "total_documents": len(documents),
        "categories": list(set(m["category"] for m in metadatas)),
        "built_at": datetime.now().isoformat(),
        "model": "all-MiniLM-L6-v2"
    }
    
    stats_path = DB_PATH / "stats.json"
    with open(stats_path, 'w') as f:
        json.dump(stats, f, indent=2)
    
    return True

def search_kb(query: str, n_results: int = 5):
    """Search the knowledge base for relevant content."""
    if not CHROMADB_AVAILABLE:
        print("❌ ChromaDB not available")
        return []
    
    if not DB_PATH.exists():
        print("❌ Database not built. Run: python build_embeddings.py")
        return []
    
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    
    client = chromadb.PersistentClient(path=str(DB_PATH))
    collection = client.get_collection("se_bot_kb", embedding_function=embedding_fn)
    
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    return results

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "search":
        query = " ".join(sys.argv[2:])
        print(f"🔍 Searching for: {query}\n")
        results = search_kb(query)
        
        if results and results['documents']:
            for i, (doc, meta, dist) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )):
                print(f"--- Result {i+1} (score: {1-dist:.2f}) ---")
                print(f"📁 {meta['source']} > {meta['section']}")
                print(doc[:500] + "..." if len(doc) > 500 else doc)
                print()
        else:
            print("No results found")
    else:
        build_database()
