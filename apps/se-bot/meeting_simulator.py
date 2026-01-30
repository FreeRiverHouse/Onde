#!/usr/bin/env python3
"""
SE-Bot Meeting Simulator

Test harness for simulating meeting conversations without actual audio.
Tests the full RAG pipeline: transcript → KB lookup → response generation.

Usage:
    # Run interactive mode
    python meeting_simulator.py
    
    # Run batch test with sample scenarios
    python meeting_simulator.py --batch
    
    # Single query test
    python meeting_simulator.py --query "What's the difference between ZTNA and VPN?"
    
    # With Claude response generation (requires ANTHROPIC_API_KEY)
    python meeting_simulator.py --with-claude
"""

import os
import sys
import json
import time
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from kb_search import search, get_context_for_topic, get_stats
from prompts.loader import (
    format_prompt, detect_style, detect_competitor, 
    list_styles, get_style_description
)

# Sample meeting scenarios (customer questions)
SAMPLE_SCENARIOS = [
    {
        "id": "ztna-vpn-1",
        "category": "ZTNA",
        "context": "Enterprise customer evaluating remote access solutions",
        "transcript": "So we're currently using Cisco AnyConnect for our VPN. What would be the main benefits of switching to ZTNA?",
        "expected_topics": ["zero trust", "vpn", "remote access"]
    },
    {
        "id": "sdwan-roi-1", 
        "category": "SD-WAN",
        "context": "Finance director asking about cost savings",
        "transcript": "Can you give me some concrete numbers on the ROI? We're spending a lot on MPLS circuits right now.",
        "expected_topics": ["roi", "mpls", "cost", "savings"]
    },
    {
        "id": "security-1",
        "category": "Security",
        "context": "CISO concerned about threats",
        "transcript": "How does your solution handle lateral movement threats? We had a ransomware incident last year.",
        "expected_topics": ["security", "ransomware", "lateral movement", "threat"]
    },
    {
        "id": "competitive-1",
        "category": "Competitive",
        "context": "Customer comparing vendors",
        "transcript": "We're also looking at Palo Alto Prisma. What makes Versa different?",
        "expected_topics": ["palo alto", "prisma", "competitive", "differentiation"]
    },
    {
        "id": "deployment-1",
        "category": "Deployment",
        "context": "IT architect asking about implementation",
        "transcript": "What's the typical deployment timeline? We have 200 branch offices globally.",
        "expected_topics": ["deployment", "branch", "timeline", "implementation"]
    },
    {
        "id": "cloud-1",
        "category": "Cloud",
        "context": "DevOps lead asking about cloud connectivity",
        "transcript": "We're heavily invested in AWS and Azure. How does this integrate with our cloud workloads?",
        "expected_topics": ["cloud", "aws", "azure", "integration"]
    },
    {
        "id": "compliance-1",
        "category": "Compliance",
        "context": "Healthcare customer with compliance requirements",
        "transcript": "We need to be HIPAA compliant. Does your solution support the necessary audit logging and encryption?",
        "expected_topics": ["compliance", "hipaa", "audit", "encryption"]
    },
    {
        "id": "objection-1",
        "category": "Objections",
        "context": "Customer raising concerns about complexity",
        "transcript": "This seems really complex. Our team is already stretched thin. How much training would we need?",
        "expected_topics": ["complexity", "training", "learning curve"]
    },
    {
        "id": "performance-1",
        "category": "Performance",
        "context": "Network engineer asking technical questions",
        "transcript": "What kind of throughput can we expect? We need at least 10 Gbps at the data center.",
        "expected_topics": ["throughput", "performance", "bandwidth"]
    },
    {
        "id": "sase-explain-1",
        "category": "SASE",
        "context": "Executive new to SASE concept",
        "transcript": "I keep hearing about SASE everywhere. Can you explain what it actually means in simple terms?",
        "expected_topics": ["sase", "definition", "architecture"]
    }
]

# Latency thresholds (in seconds)
LATENCY_TARGET = 2.0  # Target: <2s for full pipeline
LATENCY_WARN = 1.5    # Warning threshold
KB_LATENCY_TARGET = 0.5  # KB lookup should be <500ms


def simulate_transcription(text: str) -> Tuple[str, float]:
    """
    Simulate transcription delay (would be Whisper in real system).
    Returns text and simulated latency.
    """
    # In production this would come from Whisper
    # Simulate ~100-300ms transcription delay
    sim_latency = 0.15
    time.sleep(0.01)  # Minimal actual delay for testing
    return text, sim_latency


def get_kb_context(transcript: str) -> Tuple[str, float, List[Dict]]:
    """
    Retrieve relevant KB context for transcript.
    Returns context string, latency, and raw search results.
    """
    start = time.time()
    results = search(transcript, n_results=5)
    context = get_context_for_topic(transcript, max_chars=3000)
    latency = time.time() - start
    return context, latency, results


def generate_response_prompt(
    transcript: str, 
    context: str, 
    style: Optional[str] = None,
    kb_results: Optional[List[Dict]] = None
) -> Tuple[str, str, float]:
    """
    Build the Claude prompt for response generation.
    
    If style is provided, uses that template.
    If style is "auto", detects the best style.
    If style is None, uses the default prompt.
    
    Returns: (prompt, detected_style, confidence)
    """
    detected_style = None
    confidence = 0.0
    
    # Handle style selection
    if style == "auto" or style is None:
        detected_style, confidence, meta = detect_style(transcript, kb_results)
        competitor = meta.get("competitor_detected")
        objection = transcript if detected_style == "objection-handling" else ""
    elif style in list_styles():
        detected_style = style
        confidence = 1.0
        competitor = detect_competitor(transcript)
        objection = transcript if style == "objection-handling" else ""
    else:
        # Invalid style, fall back to default
        detected_style = None
    
    # Use template if we have a valid style
    if detected_style:
        prompt = format_prompt(
            detected_style,
            context=transcript,
            kb_context=context,
            competitor=competitor or "",
            objection=objection
        )
        return prompt, detected_style, confidence
    
    # Default prompt (original behavior)
    prompt = f"""You are an expert Sales Engineer for Versa Networks, a leading SASE/SD-WAN vendor.
You're in a customer meeting and need to respond to the following question/comment.

## Meeting Context
A customer just said: "{transcript}"

## Relevant Knowledge Base Content
{context}

## Response Guidelines
- Be conversational but professional
- Use concrete examples and numbers when available
- Address the customer's underlying concern, not just the surface question
- If comparing to competitors, be factual and avoid FUD
- Keep response concise (2-3 key points max)

## Your Response (as if speaking in the meeting):"""
    return prompt, "default", 1.0


def call_claude(prompt: str) -> Tuple[Optional[str], float]:
    """
    Call Claude API for response generation.
    Returns response text and latency.
    """
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        return None, 0.0
    
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        
        start = time.time()
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )
        latency = time.time() - start
        
        return response.content[0].text, latency
    except Exception as e:
        print(f"⚠️  Claude API error: {e}")
        return None, 0.0


def run_single_test(scenario: Dict, with_claude: bool = False, verbose: bool = True) -> Dict:
    """
    Run a single meeting simulation test.
    Returns test results with latencies.
    """
    result = {
        "id": scenario["id"],
        "category": scenario["category"],
        "timestamp": datetime.now().isoformat(),
        "transcript": scenario["transcript"],
        "latencies": {},
        "success": True,
        "warnings": []
    }
    
    if verbose:
        print(f"\n{'='*60}")
        print(f"📋 Scenario: {scenario['id']} ({scenario['category']})")
        print(f"   Context: {scenario['context']}")
        print(f"   Transcript: \"{scenario['transcript'][:80]}...\"" if len(scenario['transcript']) > 80 else f"   Transcript: \"{scenario['transcript']}\"")
    
    # Step 1: Simulate transcription
    transcript, trans_latency = simulate_transcription(scenario["transcript"])
    result["latencies"]["transcription"] = round(trans_latency, 3)
    
    # Step 2: KB lookup
    context, kb_latency, raw_results = get_kb_context(transcript)
    result["latencies"]["kb_lookup"] = round(kb_latency, 3)
    result["kb_results_count"] = len(raw_results)
    result["kb_top_relevance"] = raw_results[0]["relevance"] if raw_results else 0
    
    if kb_latency > KB_LATENCY_TARGET:
        result["warnings"].append(f"KB lookup slow: {kb_latency:.2f}s > {KB_LATENCY_TARGET}s target")
    
    if verbose:
        print(f"\n   📚 KB Results: {len(raw_results)} docs, top relevance: {result['kb_top_relevance']:.2f}")
        if raw_results:
            print(f"   📄 Top source: {raw_results[0]['source']} > {raw_results[0].get('section', 'N/A')}")
    
    # Step 3: Generate response (if Claude enabled)
    claude_response = None
    style = scenario.get("style", "auto")  # Use style from scenario, default to auto
    if with_claude:
        prompt, detected_style, style_confidence = generate_response_prompt(
            transcript, context, style=style, kb_results=raw_results
        )
        result["detected_style"] = detected_style
        result["style_confidence"] = round(style_confidence, 2)
        
        claude_response, claude_latency = call_claude(prompt)
        result["latencies"]["claude"] = round(claude_latency, 3)
        result["claude_response"] = claude_response
        
        if verbose:
            print(f"\n   🎨 Style: {detected_style} (confidence: {style_confidence:.0%})")
            if claude_response:
                print(f"\n   🤖 Claude Response ({claude_latency:.2f}s):")
                print(f"   {claude_response[:200]}..." if len(claude_response) > 200 else f"   {claude_response}")
    
    # Calculate total latency
    total_latency = sum(result["latencies"].values())
    result["latencies"]["total"] = round(total_latency, 3)
    
    if total_latency > LATENCY_TARGET:
        result["warnings"].append(f"Total latency high: {total_latency:.2f}s > {LATENCY_TARGET}s target")
        result["success"] = False
    
    if verbose:
        status = "✅" if result["success"] else "⚠️"
        print(f"\n   {status} Total latency: {total_latency:.2f}s (target: <{LATENCY_TARGET}s)")
        if result["warnings"]:
            for w in result["warnings"]:
                print(f"   ⚠️  {w}")
    
    return result


def run_batch_test(scenarios: List[Dict] = None, with_claude: bool = False) -> Dict:
    """
    Run batch test with all sample scenarios.
    Returns aggregate results.
    """
    if scenarios is None:
        scenarios = SAMPLE_SCENARIOS
    
    print(f"\n🧪 Running batch test with {len(scenarios)} scenarios...")
    print(f"   Claude generation: {'enabled' if with_claude else 'disabled'}")
    
    results = []
    for scenario in scenarios:
        result = run_single_test(scenario, with_claude=with_claude, verbose=True)
        results.append(result)
    
    # Aggregate stats
    latencies = [r["latencies"]["total"] for r in results]
    kb_latencies = [r["latencies"]["kb_lookup"] for r in results]
    
    summary = {
        "timestamp": datetime.now().isoformat(),
        "scenarios_tested": len(results),
        "scenarios_passed": sum(1 for r in results if r["success"]),
        "avg_total_latency": round(sum(latencies) / len(latencies), 3),
        "max_total_latency": round(max(latencies), 3),
        "avg_kb_latency": round(sum(kb_latencies) / len(kb_latencies), 3),
        "warnings": sum(len(r["warnings"]) for r in results),
        "with_claude": with_claude,
        "results": results
    }
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"📊 BATCH TEST SUMMARY")
    print(f"{'='*60}")
    print(f"   Scenarios: {summary['scenarios_passed']}/{summary['scenarios_tested']} passed")
    print(f"   Avg latency: {summary['avg_total_latency']:.2f}s (target: <{LATENCY_TARGET}s)")
    print(f"   Max latency: {summary['max_total_latency']:.2f}s")
    print(f"   Avg KB lookup: {summary['avg_kb_latency']:.3f}s")
    print(f"   Warnings: {summary['warnings']}")
    
    if summary['scenarios_passed'] == summary['scenarios_tested']:
        print(f"\n   ✅ ALL TESTS PASSED!")
    else:
        print(f"\n   ⚠️  {summary['scenarios_tested'] - summary['scenarios_passed']} tests had issues")
    
    return summary


def interactive_mode(with_claude: bool = False):
    """
    Interactive mode: type questions and see responses.
    """
    print("\n🎤 SE-Bot Meeting Simulator - Interactive Mode")
    print("   Type customer questions to see KB retrieval + response suggestions")
    print("   Type 'quit' or 'exit' to stop\n")
    
    if with_claude:
        if os.environ.get('ANTHROPIC_API_KEY'):
            print("   ✅ Claude API enabled\n")
        else:
            print("   ⚠️  ANTHROPIC_API_KEY not set, Claude responses disabled\n")
            with_claude = False
    
    while True:
        try:
            query = input("🗣️  Customer says: ").strip()
            if query.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Bye!")
                break
            
            if not query:
                continue
            
            scenario = {
                "id": "interactive",
                "category": "Interactive",
                "context": "User-provided query",
                "transcript": query,
                "expected_topics": []
            }
            
            run_single_test(scenario, with_claude=with_claude, verbose=True)
            print()
            
        except KeyboardInterrupt:
            print("\n\n👋 Bye!")
            break
        except EOFError:
            break


def main():
    parser = argparse.ArgumentParser(description="SE-Bot Meeting Simulator")
    parser.add_argument("--batch", action="store_true", help="Run batch test with sample scenarios")
    parser.add_argument("--query", "-q", type=str, help="Single query to test")
    parser.add_argument("--with-claude", action="store_true", help="Enable Claude response generation")
    parser.add_argument("--output", "-o", type=str, help="Save results to JSON file")
    parser.add_argument("--stats", action="store_true", help="Show KB stats and exit")
    parser.add_argument("--style", "-s", type=str, 
                        choices=["auto"] + list_styles(),
                        default="auto",
                        help="Response style template (auto|technical-deepdive|executive-summary|competitive-battle-card|objection-handling|demo-suggestion)")
    parser.add_argument("--list-styles", action="store_true", help="List available response styles and exit")
    
    args = parser.parse_args()
    
    # List styles and exit
    if args.list_styles:
        print("\n📋 Available Response Styles:\n")
        for style in list_styles():
            print(f"   {style}")
            print(f"      {get_style_description(style)}\n")
        return 0
    
    # Check KB status first
    stats = get_stats()
    print(f"📊 Knowledge Base: {stats['status']}")
    if stats['status'] == 'ready':
        print(f"   Documents: {stats['document_count']}")
        print(f"   Categories: {', '.join(stats['categories'])}")
    else:
        print(f"   ⚠️  {stats.get('reason', 'Unknown error')}")
        print("   Run 'python build_embeddings.py' to build the KB")
        return 1
    
    if args.stats:
        return 0
    
    # Run appropriate mode
    if args.query:
        scenario = {
            "id": "cli-query",
            "category": "CLI",
            "context": "Command line query",
            "transcript": args.query,
            "expected_topics": [],
            "style": args.style  # Pass style to scenario
        }
        result = run_single_test(scenario, with_claude=args.with_claude, verbose=True)
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\n💾 Results saved to {args.output}")
        
    elif args.batch:
        summary = run_batch_test(with_claude=args.with_claude)
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(summary, f, indent=2)
            print(f"\n💾 Results saved to {args.output}")
    
    else:
        interactive_mode(with_claude=args.with_claude)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
