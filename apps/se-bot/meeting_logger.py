#!/usr/bin/env python3
"""
SE-Bot Meeting Transcript Logger

Logs meeting interactions to JSONL for fine-tuning and analysis.
Supports anonymization of customer names and sensitive data.
"""

import re
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, List

# Default log directory
LOG_DIR = Path(__file__).parent.parent.parent / "data" / "se-bot" / "meeting-logs"


def ensure_log_dir():
    """Create log directory if it doesn't exist."""
    LOG_DIR.mkdir(parents=True, exist_ok=True)


def get_today_log_path() -> Path:
    """Get path to today's log file."""
    ensure_log_dir()
    return LOG_DIR / f"{datetime.now().strftime('%Y-%m-%d')}.jsonl"


def anonymize_text(text: str, replacements: Optional[Dict[str, str]] = None) -> str:
    """
    Anonymize text by replacing common patterns.
    
    Args:
        text: Text to anonymize
        replacements: Optional dict of {pattern: replacement}
    
    Returns:
        Anonymized text
    """
    if not text:
        return text
    
    # Apply custom replacements first
    if replacements:
        for pattern, replacement in replacements.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    # Common patterns to anonymize
    patterns = [
        # Email addresses
        (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]'),
        # Phone numbers
        (r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '[PHONE]'),
        # IP addresses
        (r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', '[IP]'),
        # Company names (common patterns)
        (r'\b(Acme|Contoso|Fabrikam|Northwind|Adventure Works)\s*(Inc|Corp|LLC|Ltd)?\b', '[COMPANY]'),
    ]
    
    for pattern, replacement in patterns:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    return text


def log_interaction(
    interaction: Dict,
    anonymize: bool = False,
    custom_replacements: Optional[Dict[str, str]] = None,
    feedback: Optional[str] = None
) -> str:
    """
    Log a meeting interaction to JSONL.
    
    Args:
        interaction: Dict with transcript, kb_results, response, etc.
        anonymize: Whether to anonymize sensitive data
        custom_replacements: Custom patterns to replace
        feedback: Optional feedback (👍/👎/neutral)
    
    Returns:
        ID of logged interaction
    """
    log_path = get_today_log_path()
    
    # Generate unique ID for this interaction
    interaction_id = str(uuid.uuid4())[:8]
    
    # Build log entry
    entry = {
        "id": interaction_id,
        "timestamp": datetime.now().isoformat(),
        "scenario_id": interaction.get("id", "unknown"),
        "category": interaction.get("category", "unknown"),
    }
    
    # Extract and optionally anonymize transcript
    transcript = interaction.get("transcript", "")
    if anonymize:
        transcript = anonymize_text(transcript, custom_replacements)
    entry["transcript"] = transcript
    
    # KB retrieval info
    entry["kb_results_count"] = interaction.get("kb_results_count", 0)
    entry["kb_top_relevance"] = interaction.get("kb_top_relevance", 0.0)
    
    # Get KB sources if available
    if "kb_sources" in interaction:
        entry["kb_sources"] = interaction["kb_sources"][:3]  # Top 3 sources
    
    # Style detection
    entry["detected_style"] = interaction.get("detected_style", "default")
    entry["style_confidence"] = interaction.get("style_confidence", 0.0)
    
    # Response (if Claude was used)
    response = interaction.get("claude_response", "")
    if anonymize and response:
        response = anonymize_text(response, custom_replacements)
    entry["response"] = response
    
    # Latencies
    entry["latencies"] = interaction.get("latencies", {})
    
    # Feedback
    if feedback:
        entry["feedback"] = feedback
    
    # Success/warnings
    entry["success"] = interaction.get("success", True)
    entry["warnings"] = interaction.get("warnings", [])
    
    # Append to log file
    with open(log_path, "a") as f:
        f.write(json.dumps(entry) + "\n")
    
    return interaction_id


def add_feedback(interaction_id: str, feedback: str, log_date: Optional[str] = None) -> bool:
    """
    Add feedback to an existing interaction.
    
    Args:
        interaction_id: ID of the interaction (first 8 chars of UUID)
        feedback: Feedback value (thumbs_up, thumbs_down, neutral)
        log_date: Optional date (YYYY-MM-DD) if not today
    
    Returns:
        True if feedback was added, False if interaction not found
    """
    if log_date:
        log_path = LOG_DIR / f"{log_date}.jsonl"
    else:
        log_path = get_today_log_path()
    
    if not log_path.exists():
        return False
    
    # Read all entries
    entries = []
    with open(log_path, "r") as f:
        for line in f:
            entries.append(json.loads(line))
    
    # Find and update the entry
    found = False
    for entry in entries:
        if entry.get("id") == interaction_id:
            entry["feedback"] = feedback
            entry["feedback_timestamp"] = datetime.now().isoformat()
            found = True
            break
    
    if not found:
        return False
    
    # Write back
    with open(log_path, "w") as f:
        for entry in entries:
            f.write(json.dumps(entry) + "\n")
    
    return True


def export_for_finetuning(
    output_path: Path,
    days: int = 30,
    min_relevance: float = 0.3,
    require_feedback: bool = False,
    positive_only: bool = True
) -> Dict:
    """
    Export logged interactions for Claude fine-tuning.
    
    Args:
        output_path: Path to write the fine-tuning dataset
        days: Number of days to include
        min_relevance: Minimum KB relevance score to include
        require_feedback: Only include interactions with feedback
        positive_only: Only include positive feedback (👍)
    
    Returns:
        Dict with export stats
    """
    from datetime import timedelta
    
    entries = []
    stats = {
        "total_scanned": 0,
        "total_exported": 0,
        "by_category": {},
        "by_style": {},
        "avg_relevance": 0.0
    }
    
    # Scan log files
    start_date = datetime.now() - timedelta(days=days)
    for log_file in sorted(LOG_DIR.glob("*.jsonl")):
        try:
            file_date = datetime.strptime(log_file.stem, "%Y-%m-%d")
            if file_date < start_date:
                continue
        except ValueError:
            continue
        
        with open(log_file, "r") as f:
            for line in f:
                entry = json.loads(line)
                stats["total_scanned"] += 1
                
                # Filter by relevance
                if entry.get("kb_top_relevance", 0) < min_relevance:
                    continue
                
                # Filter by feedback
                if require_feedback:
                    if "feedback" not in entry:
                        continue
                    if positive_only and entry["feedback"] != "thumbs_up":
                        continue
                
                # Skip entries without response
                if not entry.get("response"):
                    continue
                
                entries.append(entry)
                stats["total_exported"] += 1
                
                # Track stats
                cat = entry.get("category", "unknown")
                stats["by_category"][cat] = stats["by_category"].get(cat, 0) + 1
                
                style = entry.get("detected_style", "default")
                stats["by_style"][style] = stats["by_style"].get(style, 0) + 1
    
    # Calculate avg relevance
    if entries:
        stats["avg_relevance"] = sum(e.get("kb_top_relevance", 0) for e in entries) / len(entries)
    
    # Write fine-tuning format (Claude messages format)
    with open(output_path, "w") as f:
        for entry in entries:
            finetune_entry = {
                "messages": [
                    {
                        "role": "user",
                        "content": entry["transcript"]
                    },
                    {
                        "role": "assistant",
                        "content": entry["response"]
                    }
                ],
                "metadata": {
                    "category": entry.get("category"),
                    "style": entry.get("detected_style"),
                    "kb_relevance": entry.get("kb_top_relevance"),
                    "feedback": entry.get("feedback")
                }
            }
            f.write(json.dumps(finetune_entry) + "\n")
    
    return stats


def get_log_stats(days: int = 7) -> Dict:
    """
    Get statistics about logged interactions.
    
    Args:
        days: Number of days to include
    
    Returns:
        Dict with stats
    """
    from datetime import timedelta
    
    stats = {
        "total_interactions": 0,
        "with_response": 0,
        "with_feedback": 0,
        "positive_feedback": 0,
        "negative_feedback": 0,
        "by_category": {},
        "by_style": {},
        "avg_latency": 0.0,
        "avg_relevance": 0.0
    }
    
    latencies = []
    relevances = []
    
    start_date = datetime.now() - timedelta(days=days)
    for log_file in sorted(LOG_DIR.glob("*.jsonl")):
        try:
            file_date = datetime.strptime(log_file.stem, "%Y-%m-%d")
            if file_date < start_date:
                continue
        except ValueError:
            continue
        
        with open(log_file, "r") as f:
            for line in f:
                entry = json.loads(line)
                stats["total_interactions"] += 1
                
                if entry.get("response"):
                    stats["with_response"] += 1
                
                if "feedback" in entry:
                    stats["with_feedback"] += 1
                    if entry["feedback"] == "thumbs_up":
                        stats["positive_feedback"] += 1
                    elif entry["feedback"] == "thumbs_down":
                        stats["negative_feedback"] += 1
                
                cat = entry.get("category", "unknown")
                stats["by_category"][cat] = stats["by_category"].get(cat, 0) + 1
                
                style = entry.get("detected_style", "default")
                stats["by_style"][style] = stats["by_style"].get(style, 0) + 1
                
                if "latencies" in entry and "total" in entry["latencies"]:
                    latencies.append(entry["latencies"]["total"])
                
                if "kb_top_relevance" in entry:
                    relevances.append(entry["kb_top_relevance"])
    
    if latencies:
        stats["avg_latency"] = sum(latencies) / len(latencies)
    if relevances:
        stats["avg_relevance"] = sum(relevances) / len(relevances)
    
    return stats


if __name__ == "__main__":
    # Test the logger
    print("📝 SE-Bot Meeting Logger\n")
    
    # Show stats
    stats = get_log_stats(days=7)
    print(f"Last 7 days stats:")
    print(f"  Total interactions: {stats['total_interactions']}")
    print(f"  With responses: {stats['with_response']}")
    print(f"  With feedback: {stats['with_feedback']}")
    print(f"  Positive feedback: {stats['positive_feedback']}")
    print(f"  Negative feedback: {stats['negative_feedback']}")
    if stats["avg_latency"] > 0:
        print(f"  Avg latency: {stats['avg_latency']:.2f}s")
    if stats["avg_relevance"] > 0:
        print(f"  Avg KB relevance: {stats['avg_relevance']:.2f}")
    
    print(f"\nLog directory: {LOG_DIR}")
    print(f"Today's log: {get_today_log_path()}")
