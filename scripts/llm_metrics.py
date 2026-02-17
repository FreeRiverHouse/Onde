#!/usr/bin/env python3
"""
Local LLM Metrics Tracking
Logs usage and calculates token savings vs Claude API.

Usage:
    from scripts.llm_metrics import log_usage, get_daily_summary, estimate_savings
    
    # Log a usage event
    log_usage(
        task_type="coding",
        model="qwen2.5-coder:7b",
        latency_sec=23.6,
        tokens_in=150,
        tokens_out=200
    )
    
    # Get summary
    summary = get_daily_summary()
    savings = estimate_savings()
"""

import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional, List, Dict, Any

# Config
METRICS_DIR = Path(__file__).parent.parent / "data" / "metrics"
USAGE_FILE = METRICS_DIR / "local-llm-usage.jsonl"
DAILY_SUMMARY_FILE = METRICS_DIR / "local-llm-daily-summary.json"

# Claude API costs (per 1M tokens, approximate)
CLAUDE_COSTS = {
    "claude-3-opus": {"input": 15.0, "output": 75.0},
    "claude-3-sonnet": {"input": 3.0, "output": 15.0},
    "claude-3-haiku": {"input": 0.25, "output": 1.25},
    "claude-3.5-sonnet": {"input": 3.0, "output": 15.0},
}
DEFAULT_CLAUDE_MODEL = "claude-3.5-sonnet"

# Local costs (electricity only, rough estimate)
LOCAL_COST_PER_HOUR = 0.10  # ~$0.10/hr for GPU electricity


@dataclass
class UsageEvent:
    """A single LLM usage event."""
    timestamp: str
    task_type: str
    model: str
    latency_sec: float
    tokens_in: int = 0
    tokens_out: int = 0
    success: bool = True
    error: Optional[str] = None
    
    def to_dict(self) -> dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, d: dict) -> "UsageEvent":
        return cls(**d)


def ensure_dir():
    """Ensure metrics directory exists."""
    METRICS_DIR.mkdir(parents=True, exist_ok=True)


def log_usage(
    task_type: str,
    model: str,
    latency_sec: float,
    tokens_in: int = 0,
    tokens_out: int = 0,
    success: bool = True,
    error: Optional[str] = None
) -> UsageEvent:
    """Log a local LLM usage event."""
    ensure_dir()
    
    event = UsageEvent(
        timestamp=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        task_type=task_type,
        model=model,
        latency_sec=latency_sec,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
        success=success,
        error=error
    )
    
    with open(USAGE_FILE, "a") as f:
        f.write(json.dumps(event.to_dict()) + "\n")
    
    return event


def load_events(since: datetime = None) -> List[UsageEvent]:
    """Load usage events, optionally filtering by date."""
    if not USAGE_FILE.exists():
        return []
    
    events = []
    with open(USAGE_FILE) as f:
        for line in f:
            if line.strip():
                try:
                    event = UsageEvent.from_dict(json.loads(line))
                    if since:
                        event_time = datetime.fromisoformat(event.timestamp.rstrip("Z"))
                        if event_time < since:
                            continue
                    events.append(event)
                except:
                    continue
    
    return events


def get_daily_summary(date: datetime = None) -> Dict[str, Any]:
    """Get usage summary for a specific day (default: today)."""
    if date is None:
        date = datetime.utcnow()
    
    day_start = datetime(date.year, date.month, date.day)
    day_end = day_start + timedelta(days=1)
    
    events = load_events(since=day_start)
    events = [e for e in events 
              if datetime.fromisoformat(e.timestamp.rstrip("Z")) < day_end]
    
    if not events:
        return {
            "date": day_start.strftime("%Y-%m-%d"),
            "total_calls": 0,
            "successful_calls": 0,
            "total_tokens_in": 0,
            "total_tokens_out": 0,
            "avg_latency_sec": 0,
            "by_task_type": {},
            "by_model": {}
        }
    
    # Aggregate
    by_task = {}
    by_model = {}
    
    for e in events:
        # By task type
        if e.task_type not in by_task:
            by_task[e.task_type] = {"calls": 0, "tokens": 0, "latency": []}
        by_task[e.task_type]["calls"] += 1
        by_task[e.task_type]["tokens"] += e.tokens_in + e.tokens_out
        by_task[e.task_type]["latency"].append(e.latency_sec)
        
        # By model
        if e.model not in by_model:
            by_model[e.model] = {"calls": 0, "tokens": 0}
        by_model[e.model]["calls"] += 1
        by_model[e.model]["tokens"] += e.tokens_in + e.tokens_out
    
    # Calculate averages
    for task in by_task.values():
        task["avg_latency"] = sum(task["latency"]) / len(task["latency"])
        del task["latency"]
    
    successful = [e for e in events if e.success]
    latencies = [e.latency_sec for e in successful]
    
    return {
        "date": day_start.strftime("%Y-%m-%d"),
        "total_calls": len(events),
        "successful_calls": len(successful),
        "total_tokens_in": sum(e.tokens_in for e in events),
        "total_tokens_out": sum(e.tokens_out for e in events),
        "avg_latency_sec": sum(latencies) / len(latencies) if latencies else 0,
        "by_task_type": by_task,
        "by_model": by_model
    }


def estimate_savings(
    tokens_in: int = None,
    tokens_out: int = None,
    latency_hours: float = None,
    claude_model: str = DEFAULT_CLAUDE_MODEL
) -> Dict[str, float]:
    """Estimate cost savings vs Claude API.
    
    If no args provided, uses total from usage log.
    """
    if tokens_in is None or tokens_out is None:
        events = load_events()
        tokens_in = sum(e.tokens_in for e in events)
        tokens_out = sum(e.tokens_out for e in events)
        latency_hours = sum(e.latency_sec for e in events) / 3600
    
    costs = CLAUDE_COSTS.get(claude_model, CLAUDE_COSTS[DEFAULT_CLAUDE_MODEL])
    
    # Claude cost
    claude_cost = (tokens_in / 1_000_000) * costs["input"]
    claude_cost += (tokens_out / 1_000_000) * costs["output"]
    
    # Local cost (electricity)
    local_cost = latency_hours * LOCAL_COST_PER_HOUR
    
    return {
        "tokens_processed": tokens_in + tokens_out,
        "claude_would_cost": round(claude_cost, 4),
        "local_cost": round(local_cost, 4),
        "savings": round(claude_cost - local_cost, 4),
        "savings_percent": round((1 - local_cost/claude_cost) * 100, 1) if claude_cost > 0 else 0
    }


def main():
    """CLI: Show summary and savings."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Local LLM metrics")
    parser.add_argument("--days", type=int, default=7, help="Days to summarize")
    parser.add_argument("--json", action="store_true", help="JSON output")
    
    args = parser.parse_args()
    
    # Load events from last N days
    since = datetime.now(timezone.utc) - timedelta(days=args.days)
    events = load_events(since=since)
    
    summary = {
        "period": f"last {args.days} days",
        "total_calls": len(events),
        "successful": len([e for e in events if e.success]),
        "tokens_in": sum(e.tokens_in for e in events),
        "tokens_out": sum(e.tokens_out for e in events),
    }
    
    if events:
        summary["avg_latency_sec"] = sum(e.latency_sec for e in events) / len(events)
    
    savings = estimate_savings()
    
    if args.json:
        print(json.dumps({"summary": summary, "savings": savings}, indent=2))
    else:
        print("📊 Local LLM Usage Metrics")
        print(f"   Period: {summary['period']}")
        print(f"   Total calls: {summary['total_calls']}")
        print(f"   Successful: {summary['successful']}")
        print(f"   Tokens: {summary['tokens_in']:,} in, {summary['tokens_out']:,} out")
        if "avg_latency_sec" in summary:
            print(f"   Avg latency: {summary['avg_latency_sec']:.1f}s")
        print()
        print("💰 Savings Estimate")
        print(f"   Claude would cost: ${savings['claude_would_cost']:.4f}")
        print(f"   Local cost: ${savings['local_cost']:.4f}")
        print(f"   Saved: ${savings['savings']:.4f} ({savings['savings_percent']:.1f}%)")


if __name__ == "__main__":
    main()
