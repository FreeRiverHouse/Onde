#!/usr/bin/env python3
"""
SE-Bot: Meeting Context Analyzer + Claude RAG

The intelligence layer that processes meeting transcripts, retrieves relevant
knowledge from the KB, and generates suggested responses using Claude.

Architecture:
    Transcript Stream → Context Analyzer → KB Search (RAG) → Claude API → Suggestions

Usage:
    python context_analyzer.py                         # Start analyzing (needs transcription)
    python context_analyzer.py --transcript file.txt   # Analyze from file
    python context_analyzer.py --test "How does ZTNA work?"  # Test single query

Integration:
    from context_analyzer import MeetingContextAnalyzer
    
    analyzer = MeetingContextAnalyzer()
    suggestions = analyzer.analyze("customer asking about VPN replacement")
    for s in suggestions:
        print(f"[{s.style}] {s.text}")
"""

import argparse
import sys
import time
import os
import json
import queue
import threading
from pathlib import Path
from typing import Optional, List, Dict, Callable
from dataclasses import dataclass, field
from datetime import datetime

# Local imports
from kb_search import search, get_context_for_topic, get_stats
from prompts.loader import detect_style, format_prompt, detect_competitor

# Check for Anthropic SDK
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


# Configuration
DEFAULT_MODEL = "claude-sonnet-4-20250514"
DEFAULT_MAX_TOKENS = 500
CONTEXT_WINDOW_SECONDS = 120.0  # 2 minutes of conversation context
SUGGESTION_COOLDOWN = 3.0  # Minimum seconds between suggestions
MIN_TRANSCRIPT_LENGTH = 20  # Minimum chars before analyzing


@dataclass
class Suggestion:
    """A suggested response for the meeting."""
    text: str
    style: str
    confidence: float
    kb_sources: List[str]
    reasoning: str = ""
    created_at: float = field(default_factory=time.time)


@dataclass
class AnalysisResult:
    """Result from analyzing meeting context."""
    suggestions: List[Suggestion]
    detected_style: str
    style_confidence: float
    detected_competitor: Optional[str]
    kb_hits: int
    latency_ms: float
    transcript_snippet: str


class MeetingContextAnalyzer:
    """
    Analyzes meeting context and generates suggested responses.
    
    Uses RAG (Retrieval-Augmented Generation) to combine:
    - Real-time transcript context
    - Knowledge base retrieval
    - Claude API for response generation
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = DEFAULT_MODEL,
        callback: Optional[Callable[[AnalysisResult], None]] = None
    ):
        self.model = model
        self.callback = callback
        
        # Set up Claude client
        self._api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self._client = None
        
        if ANTHROPIC_AVAILABLE and self._api_key:
            self._client = anthropic.Anthropic(api_key=self._api_key)
        
        # Analysis state
        self._last_analysis_time = 0.0
        self._analysis_queue = queue.Queue()
        self._running = False
        self._thread: Optional[threading.Thread] = None
        
        # KB status
        self._kb_stats = get_stats()
    
    def analyze(
        self, 
        transcript: str, 
        force_style: Optional[str] = None,
        include_reasoning: bool = False
    ) -> AnalysisResult:
        """
        Analyze transcript and generate suggestions.
        
        Args:
            transcript: The meeting transcript/conversation to analyze
            force_style: Override auto-detected style
            include_reasoning: Include Claude's reasoning in output
            
        Returns:
            AnalysisResult with suggestions and metadata
        """
        start_time = time.time()
        
        # Skip if too short
        if len(transcript.strip()) < MIN_TRANSCRIPT_LENGTH:
            return AnalysisResult(
                suggestions=[],
                detected_style="unknown",
                style_confidence=0.0,
                detected_competitor=None,
                kb_hits=0,
                latency_ms=0.0,
                transcript_snippet=transcript[:100]
            )
        
        # Detect style and competitor
        if force_style:
            style = force_style
            style_confidence = 1.0
        else:
            style, style_confidence, _ = detect_style(transcript)
        
        competitor = detect_competitor(transcript)
        
        # Search knowledge base
        kb_context = get_context_for_topic(transcript, max_chars=3000)
        kb_results = search(transcript, n_results=5)
        kb_sources = [r['source'] for r in kb_results if r['relevance'] > 0.3]
        
        # Generate suggestions
        suggestions = []
        
        if self._client:
            # Use Claude API
            claude_response = self._generate_with_claude(
                transcript=transcript,
                kb_context=kb_context,
                style=style,
                competitor=competitor,
                include_reasoning=include_reasoning
            )
            
            if claude_response:
                suggestions.append(Suggestion(
                    text=claude_response['text'],
                    style=style,
                    confidence=style_confidence,
                    kb_sources=kb_sources,
                    reasoning=claude_response.get('reasoning', '')
                ))
        else:
            # Fallback: Return KB context as suggestion
            if kb_results:
                top_result = kb_results[0]
                suggestions.append(Suggestion(
                    text=f"(KB) {top_result['content'][:500]}...",
                    style="kb-lookup",
                    confidence=top_result['relevance'],
                    kb_sources=kb_sources,
                    reasoning="Claude API not available - showing KB result"
                ))
        
        latency_ms = (time.time() - start_time) * 1000
        
        result = AnalysisResult(
            suggestions=suggestions,
            detected_style=style,
            style_confidence=style_confidence,
            detected_competitor=competitor,
            kb_hits=len(kb_results),
            latency_ms=latency_ms,
            transcript_snippet=transcript[:200]
        )
        
        self._last_analysis_time = time.time()
        
        return result
    
    def _generate_with_claude(
        self,
        transcript: str,
        kb_context: str,
        style: str,
        competitor: Optional[str],
        include_reasoning: bool = False
    ) -> Optional[Dict]:
        """Generate response using Claude API."""
        if not self._client:
            return None
        
        try:
            # Build prompt
            prompt = format_prompt(
                style=style,
                context=transcript,
                kb_context=kb_context,
                competitor=competitor or ""
            )
            
            # Add reasoning request if needed
            if include_reasoning:
                prompt += "\n\nAfter your suggested response, add a brief '---REASONING---' section explaining your approach."
            
            # Call Claude
            response = self._client.messages.create(
                model=self.model,
                max_tokens=DEFAULT_MAX_TOKENS,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            text = response.content[0].text
            
            # Parse reasoning if present
            reasoning = ""
            if "---REASONING---" in text:
                parts = text.split("---REASONING---")
                text = parts[0].strip()
                reasoning = parts[1].strip() if len(parts) > 1 else ""
            
            return {
                "text": text,
                "reasoning": reasoning
            }
        
        except Exception as e:
            print(f"⚠️ Claude API error: {e}", file=sys.stderr)
            return None
    
    def start_background_analysis(
        self,
        transcript_getter: Callable[[], str],
        interval: float = 5.0
    ):
        """
        Start background analysis loop.
        
        Args:
            transcript_getter: Function that returns current transcript
            interval: Seconds between analysis runs
        """
        if self._running:
            return
        
        self._running = True
        
        def analysis_loop():
            last_transcript = ""
            
            while self._running:
                time.sleep(interval)
                
                # Get current transcript
                transcript = transcript_getter()
                
                # Skip if no change
                if transcript == last_transcript:
                    continue
                
                # Skip if too soon
                if time.time() - self._last_analysis_time < SUGGESTION_COOLDOWN:
                    continue
                
                # Analyze
                result = self.analyze(transcript)
                
                # Notify callback
                if self.callback and result.suggestions:
                    self.callback(result)
                
                last_transcript = transcript
        
        self._thread = threading.Thread(target=analysis_loop, daemon=True)
        self._thread.start()
    
    def stop_background_analysis(self):
        """Stop background analysis loop."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
    
    @property
    def is_running(self) -> bool:
        return self._running
    
    @property
    def kb_available(self) -> bool:
        return self._kb_stats.get('status') == 'ready'
    
    @property
    def claude_available(self) -> bool:
        return self._client is not None


def main():
    parser = argparse.ArgumentParser(
        description="SE-Bot: Meeting Context Analyzer + Claude RAG",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --test "How does ZTNA compare to VPN?"
  %(prog)s --test "Palo Alto is cheaper than Versa"
  %(prog)s --transcript meeting.txt
  %(prog)s --style technical-deepdive --test "BGP routing setup"

Styles:
  auto (default)         - Auto-detect best style
  technical-deepdive     - For network engineers
  executive-summary      - For C-level executives
  competitive-battle-card - When competitor mentioned
  objection-handling     - For objections/concerns
  demo-suggestion        - When demo interest detected
        """
    )
    
    parser.add_argument('--test', '-t', type=str,
                       help='Test with a single query')
    parser.add_argument('--transcript', '-f', type=str,
                       help='Analyze transcript from file')
    parser.add_argument('--style', '-s', type=str, default='auto',
                       help='Force specific style (default: auto)')
    parser.add_argument('--reasoning', '-r', action='store_true',
                       help='Include reasoning in output')
    parser.add_argument('--json', '-j', action='store_true',
                       help='Output as JSON')
    parser.add_argument('--status', action='store_true',
                       help='Show system status and exit')
    
    args = parser.parse_args()
    
    analyzer = MeetingContextAnalyzer()
    
    # Status check
    if args.status:
        print("🤖 SE-Bot Context Analyzer Status")
        print("=" * 40)
        print(f"Knowledge Base: {'✅ Ready' if analyzer.kb_available else '❌ Not available'}")
        if analyzer.kb_available:
            stats = get_stats()
            print(f"  Documents: {stats.get('document_count', 0)}")
            print(f"  Categories: {', '.join(stats.get('categories', []))}")
        print(f"Claude API: {'✅ Available' if analyzer.claude_available else '⚠️ Not configured (set ANTHROPIC_API_KEY)'}")
        return 0
    
    # Get transcript
    transcript = ""
    
    if args.test:
        transcript = args.test
    elif args.transcript:
        with open(args.transcript) as f:
            transcript = f.read()
    else:
        parser.print_help()
        return 1
    
    # Force style if specified
    force_style = args.style if args.style != 'auto' else None
    
    # Analyze
    print(f"\n📝 Analyzing: \"{transcript[:100]}{'...' if len(transcript) > 100 else ''}\"", 
          file=sys.stderr)
    print("=" * 60, file=sys.stderr)
    
    result = analyzer.analyze(
        transcript=transcript,
        force_style=force_style,
        include_reasoning=args.reasoning
    )
    
    if args.json:
        output = {
            "detected_style": result.detected_style,
            "style_confidence": result.style_confidence,
            "detected_competitor": result.detected_competitor,
            "kb_hits": result.kb_hits,
            "latency_ms": round(result.latency_ms, 2),
            "suggestions": [
                {
                    "text": s.text,
                    "style": s.style,
                    "confidence": s.confidence,
                    "sources": s.kb_sources,
                    "reasoning": s.reasoning
                }
                for s in result.suggestions
            ]
        }
        print(json.dumps(output, indent=2))
    else:
        # Human-readable output
        print(f"\n🎯 Style: {result.detected_style} (confidence: {result.style_confidence:.0%})")
        
        if result.detected_competitor:
            print(f"⚔️ Competitor: {result.detected_competitor}")
        
        print(f"📚 KB hits: {result.kb_hits}")
        print(f"⏱️ Latency: {result.latency_ms:.0f}ms")
        
        print("\n" + "=" * 60)
        print("💡 SUGGESTED RESPONSES:")
        print("=" * 60)
        
        for i, s in enumerate(result.suggestions, 1):
            print(f"\n[{i}] ({s.style}, {s.confidence:.0%})")
            print("-" * 40)
            print(s.text)
            
            if s.kb_sources:
                print(f"\n📖 Sources: {', '.join(s.kb_sources)}")
            
            if s.reasoning:
                print(f"\n🧠 Reasoning: {s.reasoning}")
        
        if not result.suggestions:
            print("\n⚠️ No suggestions generated.")
            if not analyzer.claude_available:
                print("   (Set ANTHROPIC_API_KEY for Claude-powered suggestions)")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
