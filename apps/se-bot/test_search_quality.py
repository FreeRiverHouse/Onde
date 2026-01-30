#!/usr/bin/env python3
"""
Test SE-Bot Knowledge Base Search Quality (T478)

Tests the ChromaDB embeddings with sample SE queries to validate
retrieval quality and tune parameters.
"""
import sys
import json
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from kb_search import search, get_context_for_topic

# Test queries that an SE might encounter in meetings
TEST_QUERIES = [
    # Basic SASE/SD-WAN concepts
    ("what is ZTNA", ["zero trust", "trust", "ztna", "access"]),
    ("SD-WAN deployment models", ["deployment", "sd-wan", "models"]),
    ("SASE architecture overview", ["sase", "architecture", "secure"]),
    
    # Competitive positioning
    ("Versa vs Palo Alto", ["palo alto", "prisma", "versa", "competitive"]),
    ("how is Versa different from Zscaler", ["zscaler", "versa", "difference"]),
    ("Cato Networks comparison", ["cato", "comparison", "versa"]),
    
    # Technical deep dives
    ("what is the difference between VPN and ZTNA", ["vpn", "ztna", "difference", "legacy"]),
    ("how does SD-WAN improve network performance", ["performance", "sd-wan", "latency", "optimization"]),
    
    # Objection handling
    ("customer says they already have a firewall", ["firewall", "objection", "legacy"]),
    ("competitor says they have better SASE", ["competitor", "better", "sase"]),
]

def run_tests():
    """Run all test queries and evaluate results."""
    print("🧪 SE-Bot Knowledge Base Search Quality Test")
    print("=" * 60)
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": len(TEST_QUERIES),
        "details": []
    }
    
    for query, expected_keywords in TEST_QUERIES:
        print(f"\n📝 Query: \"{query}\"")
        
        # Search with default parameters
        search_results = search(query, n_results=3)
        
        if not search_results:
            print("   ❌ FAIL: No results returned")
            results["failed"] += 1
            results["details"].append({
                "query": query,
                "status": "fail",
                "reason": "No results"
            })
            continue
        
        # Check if any expected keyword appears in top results
        combined_text = " ".join([r["content"].lower() for r in search_results])
        found_keywords = [kw for kw in expected_keywords if kw.lower() in combined_text]
        
        # Check relevance scores
        top_score = search_results[0]["relevance"] if search_results else 0
        
        # Success criteria:
        # 1. At least one expected keyword found
        # 2. Top result has reasonable relevance score (> 0.3)
        passed = len(found_keywords) > 0 and top_score > 0.3
        
        if passed:
            print(f"   ✅ PASS: Found {len(found_keywords)}/{len(expected_keywords)} keywords")
            print(f"      Top score: {top_score:.3f}")
            print(f"      Keywords found: {found_keywords}")
            results["passed"] += 1
        else:
            print(f"   ❌ FAIL: Found {len(found_keywords)}/{len(expected_keywords)} keywords")
            print(f"      Top score: {top_score:.3f}")
            print(f"      Expected: {expected_keywords}")
            results["failed"] += 1
        
        # Show top result preview
        if search_results:
            preview = search_results[0]["content"][:150].replace("\n", " ")
            print(f"      Top result: {preview}...")
            print(f"      Source: {search_results[0]['source']}")
        
        results["details"].append({
            "query": query,
            "status": "pass" if passed else "fail",
            "top_score": top_score,
            "found_keywords": found_keywords,
            "expected_keywords": expected_keywords,
            "num_results": len(search_results)
        })
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print(f"   Passed: {results['passed']}/{results['total']}")
    print(f"   Failed: {results['failed']}/{results['total']}")
    print(f"   Success rate: {results['passed']/results['total']*100:.1f}%")
    
    # Test get_context_for_topic (used for Claude prompts)
    print("\n🎯 Testing get_context_for_topic()...")
    context = get_context_for_topic("ZTNA vs VPN")
    if context and len(context) > 100:
        print(f"   ✅ Context generated: {len(context)} chars")
        print(f"   Preview: {context[:200]}...")
    else:
        print("   ❌ Context generation failed")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    if results["failed"] == 0:
        print("   ✓ All tests passed! Embeddings quality is good.")
    else:
        print("   • Consider adding more content for failed queries")
        print("   • Review chunking strategy if scores are low")
        print("   • Adjust n_results if relevant content is in lower positions")
    
    # Save results
    output_path = Path(__file__).parent / "search_quality_report.json"
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n📄 Full report saved to: {output_path}")
    
    return results["passed"] == results["total"]

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
