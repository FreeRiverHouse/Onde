#!/usr/bin/env python3
"""
SE-Bot Competitor Tracker

Tracks competitor mentions during meetings, logs to JSONL,
and provides quick differentiators for battle card mode.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from collections import Counter

# Data directory
DATA_DIR = Path(__file__).parent.parent.parent / "data" / "se-bot"
MENTIONS_FILE = DATA_DIR / "competitor-mentions.jsonl"

# Competitor database with differentiators
COMPETITORS = {
    "palo alto": {
        "name": "Palo Alto Networks (Prisma)",
        "aliases": ["palo alto", "prisma", "palo", "prisma access", "prisma sase"],
        "differentiators": [
            ("strength", "Single-pass architecture provides better performance with less latency"),
            ("strength", "Unified management across SD-WAN and security from day one"),
            ("strength", "Native multi-tenant design, not bolted-on acquisitions"),
            ("caution", "Palo Alto has strong brand recognition in firewall market"),
        ],
        "weaknesses": [
            "Prisma is stitched together from acquisitions (CloudGenix, Aporeto)",
            "Complex licensing with multiple SKUs",
            "Often requires professional services for deployment"
        ]
    },
    "zscaler": {
        "name": "Zscaler",
        "aliases": ["zscaler", "zscaler zia", "zscaler zpa", "z scaler"],
        "differentiators": [
            ("strength", "Full SD-WAN + Security stack, Zscaler requires separate SD-WAN"),
            ("strength", "On-prem and cloud-native options vs cloud-only"),
            ("strength", "Deterministic routing with real-time traffic steering"),
            ("caution", "Zscaler is strong in cloud-first, pure SWG/CASB scenarios"),
        ],
        "weaknesses": [
            "No native SD-WAN - partners with third parties",
            "Proxy-based architecture adds latency for certain apps",
            "Limited on-prem security appliance options"
        ]
    },
    "cato": {
        "name": "Cato Networks",
        "aliases": ["cato", "cato networks", "cato sase"],
        "differentiators": [
            ("strength", "True branch integration - not just cloud PoPs"),
            ("strength", "Carrier-grade reliability with 99.99% SLA"),
            ("strength", "Advanced threat protection with ML-based detection"),
            ("caution", "Cato has good unified experience for simpler deployments"),
        ],
        "weaknesses": [
            "Limited edge compute capabilities",
            "Smaller global backbone compared to enterprise vendors",
            "Fewer advanced SD-WAN features (app-aware routing)"
        ]
    },
    "fortinet": {
        "name": "Fortinet",
        "aliases": ["fortinet", "fortigate", "fortisase", "forti"],
        "differentiators": [
            ("strength", "Purpose-built silicon (ASICs) vs custom FortiASIC that locks you in"),
            ("strength", "Multi-vendor flexibility - no vendor lock-in"),
            ("strength", "Cloud-native SASE vs firewall-first architecture stretched to cloud"),
            ("caution", "Fortinet has competitive pricing and large install base"),
        ],
        "weaknesses": [
            "Security-first, SD-WAN bolted on",
            "FortiOS complexity for cloud-native use cases",
            "SASE offering still maturing"
        ]
    },
    "cisco": {
        "name": "Cisco",
        "aliases": ["cisco", "cisco meraki", "meraki", "viptela", "cisco sd-wan"],
        "differentiators": [
            ("strength", "Modern architecture vs legacy Viptela acquisition"),
            ("strength", "Simpler licensing vs Cisco's complex DNA/Smart licensing"),
            ("strength", "Unified SASE platform vs fragmented Cisco portfolio"),
            ("caution", "Cisco has strong enterprise relationships and bundle deals"),
        ],
        "weaknesses": [
            "Viptela SD-WAN still being integrated years after acquisition",
            "Multiple overlapping products (Meraki vs Viptela vs Umbrella)",
            "Complex licensing models"
        ]
    },
    "vmware": {
        "name": "VMware (VeloCloud)",
        "aliases": ["vmware", "velocloud", "vmware sase", "vmware sd-wan"],
        "differentiators": [
            ("strength", "True SASE vs SD-WAN with security partnerships"),
            ("strength", "Native security stack - no third-party dependency"),
            ("strength", "Broadcom acquisition uncertainty - customer risk"),
            ("neutral", "VMware has strong virtualization ecosystem"),
        ],
        "weaknesses": [
            "Security requires third-party partners",
            "Broadcom acquisition creating customer uncertainty",
            "Limited cloud-native capabilities"
        ]
    },
    "cloudflare": {
        "name": "Cloudflare",
        "aliases": ["cloudflare", "cloudflare one", "cf one"],
        "differentiators": [
            ("strength", "Full SD-WAN capabilities vs CDN extended to SASE"),
            ("strength", "Enterprise-grade WAN optimization and routing"),
            ("strength", "Mature security stack with threat intelligence"),
            ("caution", "Cloudflare has excellent developer experience and edge network"),
        ],
        "weaknesses": [
            "CDN background - WAN optimization still maturing",
            "Limited branch appliance options",
            "Newer to enterprise networking"
        ]
    },
    "netskope": {
        "name": "Netskope",
        "aliases": ["netskope"],
        "differentiators": [
            ("strength", "Unified SD-WAN + SSE vs SSE-only platform"),
            ("strength", "True multi-tenant architecture from ground up"),
            ("strength", "Real-time traffic steering vs proxy-based approach"),
            ("caution", "Netskope is strong in DLP and CASB for cloud apps"),
        ],
        "weaknesses": [
            "No native SD-WAN - acquired Infiot",
            "Primarily focused on data security, not networking",
            "Higher price point"
        ]
    }
}


def get_competitor_info(text: str) -> Optional[Dict]:
    """
    Detect competitor from text and return their info.
    Returns None if no competitor detected.
    """
    text_lower = text.lower()
    for key, info in COMPETITORS.items():
        for alias in info["aliases"]:
            if alias in text_lower:
                return info
    return None


def get_competitor_name(text: str) -> Optional[str]:
    """Simple detection returning just the competitor name."""
    info = get_competitor_info(text)
    return info["name"] if info else None


def get_quick_differentiators(competitor_name: str, max_items: int = 3) -> List[Tuple[str, str]]:
    """
    Get quick differentiators vs a specific competitor.
    Returns list of (type, text) tuples where type is 'strength', 'caution', or 'neutral'.
    """
    for key, info in COMPETITORS.items():
        if info["name"] == competitor_name or competitor_name.lower() in info["aliases"]:
            return info["differentiators"][:max_items]
    return []


def log_mention(
    competitor: str,
    transcript_snippet: str,
    response_style: str = "competitive-battle-card",
    session_id: Optional[str] = None
) -> None:
    """Log a competitor mention to the JSONL file."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "competitor": competitor,
        "transcript_snippet": transcript_snippet[:500],  # Limit size
        "response_style": response_style,
        "session_id": session_id
    }
    
    with open(MENTIONS_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")


def get_mention_stats(days: int = 30) -> Dict:
    """Get statistics on competitor mentions over the last N days."""
    if not MENTIONS_FILE.exists():
        return {"total": 0, "by_competitor": {}, "recent": []}
    
    cutoff = datetime.now().timestamp() - (days * 24 * 60 * 60)
    mentions = []
    
    with open(MENTIONS_FILE, "r") as f:
        for line in f:
            try:
                entry = json.loads(line)
                entry_time = datetime.fromisoformat(entry["timestamp"])
                if entry_time.timestamp() >= cutoff:
                    mentions.append(entry)
            except (json.JSONDecodeError, KeyError):
                continue
    
    # Count by competitor
    competitor_counts = Counter(m["competitor"] for m in mentions)
    
    return {
        "total": len(mentions),
        "by_competitor": dict(competitor_counts.most_common()),
        "recent": mentions[-10:],  # Last 10 mentions
        "most_common": competitor_counts.most_common(1)[0] if competitor_counts else None
    }


def format_battle_card_suggestions(competitor: str) -> List[Dict]:
    """
    Generate formatted suggestion cards for battle card mode.
    Each card has: text, type (strength/caution), color.
    """
    differentiators = get_quick_differentiators(competitor)
    
    suggestions = []
    for diff_type, text in differentiators:
        if diff_type == "strength":
            color = "green"
            badge = "✓ Strength"
        elif diff_type == "caution":
            color = "yellow"
            badge = "⚠️ Caution"
        else:
            color = "blue"
            badge = "ℹ️ Note"
        
        suggestions.append({
            "text": text,
            "type": diff_type,
            "color": color,
            "badge": badge,
            "competitor": competitor
        })
    
    return suggestions


def get_all_competitors() -> List[str]:
    """Return list of all tracked competitor names."""
    return [info["name"] for info in COMPETITORS.values()]


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--stats":
        stats = get_mention_stats()
        print(f"Competitor Mention Stats (30 days):")
        print(f"  Total mentions: {stats['total']}")
        print(f"  By competitor:")
        for comp, count in stats.get("by_competitor", {}).items():
            print(f"    {comp}: {count}")
        if stats.get("most_common"):
            print(f"  Most mentioned: {stats['most_common'][0]} ({stats['most_common'][1]} times)")
    else:
        # Test detection
        test_phrases = [
            "We're currently evaluating Zscaler and Palo Alto",
            "How do you compare to Cato Networks?",
            "We have Fortinet firewalls already",
            "Just random text with no competitor"
        ]
        
        print("Competitor Detection Tests:")
        for phrase in test_phrases:
            info = get_competitor_info(phrase)
            if info:
                print(f"\n'{phrase}'")
                print(f"  → Detected: {info['name']}")
                print(f"  → Differentiators:")
                for diff_type, text in info['differentiators'][:3]:
                    print(f"    [{diff_type}] {text}")
            else:
                print(f"\n'{phrase}' → No competitor detected")
