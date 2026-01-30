#!/usr/bin/env python3
"""
SE-Bot Prompt Template Loader

Loads and formats response style templates for Claude API calls.
Auto-detects appropriate style based on conversation context.
"""

import re
from pathlib import Path
from typing import Optional, Dict, List, Tuple

# Template directory
PROMPTS_DIR = Path(__file__).parent

# Available styles
STYLES = [
    "technical-deepdive",
    "executive-summary", 
    "competitive-battle-card",
    "objection-handling",
    "demo-suggestion"
]

# Keywords for style detection
STYLE_KEYWORDS = {
    "technical-deepdive": [
        "how does", "protocol", "architecture", "latency", "throughput",
        "packets", "BGP", "OSPF", "IPSec", "config", "CLI", "API",
        "integration", "firewall rules", "routing", "deployment",
        "technical", "engineer", "architect", "deep dive"
    ],
    "executive-summary": [
        "ROI", "cost", "budget", "TCO", "business case", "strategic",
        "board", "CEO", "CIO", "CFO", "CISO", "executive", "leadership",
        "investment", "timeline", "roadmap", "transformation",
        "compliance", "risk", "audit", "quarterly"
    ],
    "competitive-battle-card": [
        "Palo Alto", "Prisma", "Zscaler", "Cato", "Fortinet", "Cisco",
        "competitor", "compared to", "versus", "vs", "alternative",
        "why should we choose", "what makes you different",
        "currently using", "evaluating"
    ],
    "objection-handling": [
        "too expensive", "not ready", "no bandwidth", "concern",
        "worried", "hesitant", "not sure", "risk", "problem",
        "can't", "won't", "don't have", "already have", "just deployed",
        "budget constraints", "team pushback", "security concern"
    ],
    "demo-suggestion": [
        "show me", "can I see", "what does it look like", "demo",
        "try it", "proof of concept", "PoC", "pilot", "test",
        "walk me through", "how would that work", "dashboard",
        "interested in seeing", "curious to see"
    ]
}

# Competitor name detection
COMPETITORS = {
    "palo alto": "Palo Alto Networks (Prisma)",
    "prisma": "Palo Alto Networks (Prisma)",
    "zscaler": "Zscaler",
    "cato": "Cato Networks",
    "fortinet": "Fortinet",
    "cisco": "Cisco",
    "vmware": "VMware (VeloCloud)",
    "velocloud": "VMware (VeloCloud)",
    "cloudflare": "Cloudflare",
    "netskope": "Netskope"
}


def load_prompt(style: str) -> str:
    """Load a prompt template from markdown file."""
    template_path = PROMPTS_DIR / f"{style}.md"
    if not template_path.exists():
        raise ValueError(f"Template not found: {style}")
    
    return template_path.read_text()


def format_prompt(
    style: str,
    context: str = "",
    kb_context: str = "",
    competitor: str = "",
    objection: str = ""
) -> str:
    """Load and format a prompt template with provided values."""
    template = load_prompt(style)
    
    # Replace placeholders
    formatted = template.replace("{context}", context or "(No conversation context)")
    formatted = formatted.replace("{kb_context}", kb_context or "(No KB context retrieved)")
    formatted = formatted.replace("{competitor}", competitor or "the competitor")
    formatted = formatted.replace("{objection}", objection or context)  # Use context as objection if not specified
    
    return formatted


def detect_competitor(text: str) -> Optional[str]:
    """Detect if a competitor is mentioned in the text."""
    text_lower = text.lower()
    for keyword, name in COMPETITORS.items():
        if keyword in text_lower:
            return name
    return None


def detect_style(
    transcript: str,
    kb_results: Optional[List[Dict]] = None,
    audience_hint: Optional[str] = None
) -> Tuple[str, float, Dict]:
    """
    Auto-detect the appropriate response style based on context.
    
    Returns:
        Tuple of (style_name, confidence_score, metadata)
    """
    text_lower = transcript.lower()
    scores: Dict[str, int] = {style: 0 for style in STYLES}
    
    # Score each style based on keyword matches
    for style, keywords in STYLE_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in text_lower:
                scores[style] += 1
    
    # Boost competitive if competitor detected
    competitor = detect_competitor(transcript)
    if competitor:
        scores["competitive-battle-card"] += 5
    
    # Boost based on audience hint
    if audience_hint:
        hint_lower = audience_hint.lower()
        if any(x in hint_lower for x in ["engineer", "technical", "architect", "netops"]):
            scores["technical-deepdive"] += 3
        elif any(x in hint_lower for x in ["executive", "cio", "ciso", "director", "vp", "c-level"]):
            scores["executive-summary"] += 3
    
    # Check KB results for topic hints
    if kb_results:
        kb_text = " ".join([r.get("content", "")[:200] for r in kb_results[:3]]).lower()
        if "objection" in kb_text:
            scores["objection-handling"] += 2
        if "competitive" in kb_text or "versus" in kb_text:
            scores["competitive-battle-card"] += 2
    
    # Find best match
    best_style = max(scores, key=scores.get)
    best_score = scores[best_style]
    
    # Calculate confidence (0-1)
    total_score = sum(scores.values())
    confidence = best_score / total_score if total_score > 0 else 0.5
    
    # Default to technical if no clear winner
    if best_score == 0:
        best_style = "technical-deepdive"
        confidence = 0.3
    
    metadata = {
        "scores": scores,
        "competitor_detected": competitor,
        "audience_hint": audience_hint
    }
    
    return best_style, confidence, metadata


def get_style_for_context(
    transcript: str,
    kb_results: Optional[List[Dict]] = None,
    audience_hint: Optional[str] = None
) -> str:
    """Simple wrapper that returns just the style name."""
    style, _, _ = detect_style(transcript, kb_results, audience_hint)
    return style


def list_styles() -> List[str]:
    """Return list of available styles."""
    return STYLES.copy()


def get_style_description(style: str) -> str:
    """Get a brief description of a style."""
    descriptions = {
        "technical-deepdive": "Detailed technical response for engineers/architects",
        "executive-summary": "Business-focused summary for C-level/directors",
        "competitive-battle-card": "Competitive positioning when competitor mentioned",
        "objection-handling": "Empathetic response to concerns/pushback",
        "demo-suggestion": "Transition to demo when interest detected"
    }
    return descriptions.get(style, "Unknown style")


if __name__ == "__main__":
    # Test the loader
    print("Available styles:")
    for style in list_styles():
        print(f"  - {style}: {get_style_description(style)}")
    
    print("\nTesting style detection:")
    test_cases = [
        "What's the latency for IPSec tunnels in your SD-WAN solution?",
        "What's the ROI? Our CFO needs to see a business case.",
        "We're currently evaluating Zscaler and Palo Alto as well.",
        "I'm not sure our team has bandwidth to deploy a new solution.",
        "Can you show me what the dashboard looks like?",
    ]
    
    for text in test_cases:
        style, confidence, meta = detect_style(text)
        print(f"\n  '{text[:60]}...'")
        print(f"  → Style: {style} (confidence: {confidence:.2f})")
        if meta.get("competitor_detected"):
            print(f"  → Competitor: {meta['competitor_detected']}")
