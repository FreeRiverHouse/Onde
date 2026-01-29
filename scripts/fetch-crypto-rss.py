#!/usr/bin/env python3
"""
Fetch Crypto News from RSS Feeds

Free alternative to Brave Search API for the Grok Fundamental strategy.
Fetches headlines from major crypto news sources and caches them locally.

RSS Sources:
- CoinDesk
- CoinTelegraph
- Bitcoin Magazine
- Decrypt

Usage:
    python fetch-crypto-rss.py          # Fetch and cache news
    python fetch-crypto-rss.py --json   # Output as JSON
    python fetch-crypto-rss.py --force  # Ignore cache, fetch fresh

Author: Clawd (T420 - Free news sources for autotrader)
"""

import os
import sys
import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional
import urllib.request
import urllib.error
from pathlib import Path

# Cache settings
CACHE_FILE = "data/crypto-news-feed.json"
CACHE_TTL_MINUTES = 30  # Refresh every 30 minutes

# RSS Feed URLs
RSS_FEEDS = {
    "coindesk": "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "cointelegraph": "https://cointelegraph.com/rss",
    "bitcoinmagazine": "https://bitcoinmagazine.com/feed",
    "decrypt": "https://decrypt.co/feed",
}

# Timeout for HTTP requests
REQUEST_TIMEOUT = 10


def fetch_rss(url: str, source: str) -> List[Dict]:
    """Fetch and parse an RSS feed."""
    articles = []
    
    try:
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) FRH-Bot/1.0'
            }
        )
        
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
            content = response.read().decode('utf-8')
        
        # Parse XML
        root = ET.fromstring(content)
        
        # Find all items (RSS 2.0 format)
        items = root.findall('.//item')
        
        for item in items[:10]:  # Max 10 per source
            title = item.find('title')
            link = item.find('link')
            pub_date = item.find('pubDate')
            description = item.find('description')
            
            if title is not None:
                article = {
                    "title": title.text or "",
                    "url": link.text if link is not None else "",
                    "source": source,
                    "description": clean_html(description.text) if description is not None and description.text else "",
                }
                
                # Parse publish date
                if pub_date is not None and pub_date.text:
                    try:
                        # Try common RSS date formats
                        for fmt in [
                            "%a, %d %b %Y %H:%M:%S %z",
                            "%a, %d %b %Y %H:%M:%S GMT",
                            "%Y-%m-%dT%H:%M:%S%z",
                        ]:
                            try:
                                dt = datetime.strptime(pub_date.text, fmt)
                                article["published"] = dt.isoformat()
                                break
                            except:
                                continue
                    except:
                        pass
                
                articles.append(article)
                
    except urllib.error.HTTPError as e:
        print(f"HTTP error fetching {source}: {e.code}", file=sys.stderr)
    except urllib.error.URLError as e:
        print(f"URL error fetching {source}: {e.reason}", file=sys.stderr)
    except ET.ParseError as e:
        print(f"XML parse error for {source}: {e}", file=sys.stderr)
    except Exception as e:
        print(f"Error fetching {source}: {e}", file=sys.stderr)
    
    return articles


def clean_html(text: str) -> str:
    """Remove HTML tags from text."""
    if not text:
        return ""
    # Remove HTML tags
    clean = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities
    clean = clean.replace('&nbsp;', ' ')
    clean = clean.replace('&amp;', '&')
    clean = clean.replace('&lt;', '<')
    clean = clean.replace('&gt;', '>')
    clean = clean.replace('&quot;', '"')
    clean = clean.replace('&#39;', "'")
    # Clean up whitespace
    clean = ' '.join(clean.split())
    return clean[:500]  # Truncate long descriptions


def is_cache_valid() -> bool:
    """Check if cache exists and is still fresh."""
    if not os.path.exists(CACHE_FILE):
        return False
    
    try:
        with open(CACHE_FILE, 'r') as f:
            cache = json.load(f)
        
        timestamp = cache.get("timestamp")
        if not timestamp:
            return False
        
        cached_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        age_minutes = (now - cached_time).total_seconds() / 60
        
        return age_minutes < CACHE_TTL_MINUTES
    except:
        return False


def load_cache() -> Optional[Dict]:
    """Load cached news feed."""
    if not os.path.exists(CACHE_FILE):
        return None
    
    try:
        with open(CACHE_FILE, 'r') as f:
            return json.load(f)
    except:
        return None


def save_cache(data: Dict):
    """Save news feed to cache."""
    # Ensure directory exists
    Path(CACHE_FILE).parent.mkdir(parents=True, exist_ok=True)
    
    with open(CACHE_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def fetch_all_feeds(force: bool = False) -> Dict:
    """Fetch news from all RSS feeds."""
    
    # Check cache first (unless force refresh)
    if not force and is_cache_valid():
        cached = load_cache()
        if cached:
            print(f"Using cached news (age: {cached.get('age_minutes', '?')} min)", file=sys.stderr)
            return cached
    
    print("Fetching fresh crypto news from RSS feeds...", file=sys.stderr)
    
    all_articles = []
    successful_sources = []
    failed_sources = []
    
    for source, url in RSS_FEEDS.items():
        articles = fetch_rss(url, source)
        if articles:
            all_articles.extend(articles)
            successful_sources.append(source)
            print(f"  ✓ {source}: {len(articles)} articles", file=sys.stderr)
        else:
            failed_sources.append(source)
            print(f"  ✗ {source}: failed", file=sys.stderr)
    
    # Sort by recency (if published date available)
    def sort_key(article):
        pub = article.get("published", "")
        if pub:
            try:
                return datetime.fromisoformat(pub.replace('Z', '+00:00'))
            except:
                pass
        return datetime.min.replace(tzinfo=timezone.utc)
    
    all_articles.sort(key=sort_key, reverse=True)
    
    # Build result
    result = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sources": successful_sources,
        "failed_sources": failed_sources,
        "article_count": len(all_articles),
        "results": all_articles[:30],  # Keep top 30 recent
    }
    
    # Cache the result
    save_cache(result)
    print(f"Cached {len(all_articles)} articles to {CACHE_FILE}", file=sys.stderr)
    
    return result


def get_recent_headlines(hours: int = 24) -> List[str]:
    """Get headlines from the last N hours for sentiment analysis."""
    data = fetch_all_feeds()
    
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    headlines = []
    
    for article in data.get("results", []):
        # Check if article is recent enough
        pub = article.get("published", "")
        if pub:
            try:
                pub_dt = datetime.fromisoformat(pub.replace('Z', '+00:00'))
                if pub_dt < cutoff:
                    continue
            except:
                pass  # Include if we can't parse date
        
        title = article.get("title", "")
        desc = article.get("description", "")
        
        if title:
            headlines.append(title)
        if desc:
            headlines.append(desc)
    
    return headlines


def main():
    """CLI interface."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Fetch crypto news from RSS feeds")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--force", action="store_true", help="Force refresh (ignore cache)")
    parser.add_argument("--headlines", action="store_true", help="Just output recent headlines")
    parser.add_argument("--hours", type=int, default=24, help="Hours of headlines to fetch")
    
    args = parser.parse_args()
    
    if args.headlines:
        headlines = get_recent_headlines(args.hours)
        if args.json:
            print(json.dumps(headlines, indent=2))
        else:
            for h in headlines[:20]:
                print(f"• {h}")
        return
    
    data = fetch_all_feeds(force=args.force)
    
    if args.json:
        print(json.dumps(data, indent=2))
    else:
        print(f"\n📰 Crypto News Feed")
        print(f"{'='*50}")
        print(f"Sources: {', '.join(data['sources'])}")
        print(f"Articles: {data['article_count']}")
        print(f"Updated: {data['timestamp']}")
        
        print(f"\n📋 Recent Headlines:")
        for article in data['results'][:10]:
            source = article.get('source', 'unknown')
            title = article.get('title', 'No title')
            print(f"  [{source}] {title[:80]}")


if __name__ == "__main__":
    main()
