#!/usr/bin/env python3
"""
Polymarket Sports Betting Optimizer
====================================
Analyzes NBA games and finds mispriced markets based on:
- Team records (win %)
- Home/away advantage (~3-4% edge historically)
- Recent form (last 10 games)

Usage: python polymarket-sports.py
"""

import json
from dataclasses import dataclass
from typing import List, Tuple, Optional
from datetime import datetime

# NBA Home court advantage historically ~3-4%
HOME_ADVANTAGE = 0.035

@dataclass
class Team:
    name: str
    abbrev: str
    wins: int
    losses: int
    
    @property
    def win_pct(self) -> float:
        total = self.wins + self.losses
        return self.wins / total if total > 0 else 0.5
    
    @property 
    def record(self) -> str:
        return f"{self.wins}-{self.losses}"

@dataclass
class Game:
    home_team: Team
    away_team: Team
    home_price: float  # Polymarket price in cents (e.g., 58 = 58¢)
    away_price: float
    game_time: Optional[str] = None

def estimate_win_prob(team1: Team, team2: Team, team1_home: bool = True) -> float:
    """
    Estimate probability team1 wins against team2.
    Uses log5 method (Bill James) with home advantage adjustment.
    
    Log5 formula:
    P(A beats B) = (pA - pA*pB) / (pA + pB - 2*pA*pB)
    where pA = A's win%, pB = B's win%
    """
    p_a = team1.win_pct
    p_b = team2.win_pct
    
    # Avoid division by zero
    if p_a + p_b == 0 or p_a + p_b == 2:
        base_prob = 0.5
    else:
        # Log5 formula
        base_prob = (p_a - p_a * p_b) / (p_a + p_b - 2 * p_a * p_b)
    
    # Apply home court advantage
    if team1_home:
        prob = base_prob + HOME_ADVANTAGE
    else:
        prob = base_prob - HOME_ADVANTAGE
    
    # Bound between 5% and 95%
    return max(0.05, min(0.95, prob))


def analyze_game(game: Game, min_edge: float = 0.08) -> dict:
    """
    Analyze a game for betting opportunities.
    Returns recommendation if edge > min_edge.
    """
    # Calculate our estimated probabilities
    home_prob = estimate_win_prob(game.home_team, game.away_team, team1_home=True)
    away_prob = 1 - home_prob
    
    # Market implied probabilities
    market_home = game.home_price / 100
    market_away = game.away_price / 100
    
    # Calculate edges
    home_edge = home_prob - market_home
    away_edge = away_prob - market_away
    
    result = {
        "game": f"{game.away_team.abbrev} @ {game.home_team.abbrev}",
        "home_team": game.home_team.abbrev,
        "away_team": game.away_team.abbrev,
        "home_record": game.home_team.record,
        "away_record": game.away_team.record,
        "our_home_prob": round(home_prob * 100, 1),
        "our_away_prob": round(away_prob * 100, 1),
        "market_home": game.home_price,
        "market_away": game.away_price,
        "home_edge": round(home_edge * 100, 1),
        "away_edge": round(away_edge * 100, 1),
        "recommendation": None,
        "bet_side": None,
        "bet_price": None,
        "edge": 0
    }
    
    # Check for opportunities
    if home_edge > min_edge:
        result["recommendation"] = f"BET {game.home_team.abbrev} (HOME)"
        result["bet_side"] = "home"
        result["bet_price"] = game.home_price
        result["edge"] = round(home_edge * 100, 1)
    elif away_edge > min_edge:
        result["recommendation"] = f"BET {game.away_team.abbrev} (AWAY)"
        result["bet_side"] = "away"
        result["bet_price"] = game.away_price
        result["edge"] = round(away_edge * 100, 1)
    else:
        result["recommendation"] = "SKIP - No edge"
    
    return result


def kelly_bet_size(edge: float, odds: float, bankroll: float, fraction: float = 0.1) -> float:
    """
    Calculate Kelly criterion bet size.
    edge: our edge (e.g., 0.10 for 10%)
    odds: decimal odds (e.g., price 40¢ = 2.5 odds)
    bankroll: available cash
    fraction: Kelly fraction (0.1 = 10% Kelly for safety)
    """
    if edge <= 0:
        return 0
    
    # Convert price to decimal odds: 40¢ to win $1 = 2.5x
    decimal_odds = 100 / odds if odds > 0 else 1
    
    # Kelly formula: f* = (bp - q) / b
    # where b = decimal odds - 1, p = win prob, q = 1-p
    b = decimal_odds - 1
    p = odds/100 + edge  # Our estimated prob
    q = 1 - p
    
    kelly = (b * p - q) / b if b > 0 else 0
    
    # Apply fraction and cap at 10% of bankroll
    bet = bankroll * kelly * fraction
    return min(bet, bankroll * 0.10)


# ============== CURRENT NBA DATA ==============
# Update this with current team records

NBA_TEAMS = {
    "LAL": Team("Los Angeles Lakers", "LAL", 28, 17),
    "CLE": Team("Cleveland Cavaliers", "CLE", 28, 20),
    "NYK": Team("New York Knicks", "NYK", 28, 18),
    "TOR": Team("Toronto Raptors", "TOR", 29, 19),
    "BOS": Team("Boston Celtics", "BOS", 29, 17),
    "ATL": Team("Atlanta Hawks", "ATL", 23, 25),
    "MIA": Team("Miami Heat", "MIA", 25, 22),
    "ORL": Team("Orlando Magic", "ORL", 23, 22),
    "CHI": Team("Chicago Bulls", "CHI", 23, 23),
    "IND": Team("Indiana Pacers", "IND", 11, 36),
    "CHA": Team("Charlotte Hornets", "CHA", 19, 28),
    "MEM": Team("Memphis Grizzlies", "MEM", 18, 26),
    "NYR": Team("New York Rangers", "NYR", 0, 0),  # NHL - skip
    "NYI": Team("New York Islanders", "NYI", 0, 0),  # NHL - skip
}


def parse_polymarket_games(games_data: List[dict]) -> List[Game]:
    """Parse games from Polymarket format"""
    parsed = []
    for g in games_data:
        home = NBA_TEAMS.get(g.get("home_abbrev"))
        away = NBA_TEAMS.get(g.get("away_abbrev"))
        if home and away and home.wins > 0:  # Valid NBA game
            parsed.append(Game(
                home_team=home,
                away_team=away,
                home_price=g.get("home_price", 50),
                away_price=g.get("away_price", 50),
                game_time=g.get("time")
            ))
    return parsed


def main():
    """Analyze current Polymarket NBA games"""
    
    # Current games from Polymarket (update with live data)
    # Format: away @ home with prices
    current_games = [
        {"away_abbrev": "LAL", "home_abbrev": "CLE", "away_price": 43, "home_price": 58},
        {"away_abbrev": "ATL", "home_abbrev": "BOS", "away_price": 33, "home_price": 68},
        {"away_abbrev": "NYK", "home_abbrev": "TOR", "away_price": 48, "home_price": 53},
        {"away_abbrev": "ORL", "home_abbrev": "MIA", "away_price": 43, "home_price": 57},
        {"away_abbrev": "CHI", "home_abbrev": "IND", "away_price": 56, "home_price": 45},
    ]
    
    games = parse_polymarket_games(current_games)
    
    print("=" * 70)
    print("🏀 POLYMARKET NBA ANALYSIS")
    print("=" * 70)
    print(f"Home advantage factor: {HOME_ADVANTAGE*100:.1f}%")
    print(f"Minimum edge required: 8%")
    print()
    
    opportunities = []
    
    for game in games:
        analysis = analyze_game(game)
        
        emoji = "🎯" if analysis["recommendation"] != "SKIP - No edge" else "⏭️"
        
        print(f"{emoji} {analysis['game']}")
        print(f"   Records: {analysis['away_team']} {analysis['away_record']} @ {analysis['home_team']} {analysis['home_record']}")
        print(f"   Our prob: {analysis['away_team']} {analysis['our_away_prob']}% | {analysis['home_team']} {analysis['our_home_prob']}%")
        print(f"   Market:   {analysis['away_team']} {analysis['market_away']}¢ | {analysis['home_team']} {analysis['market_home']}¢")
        print(f"   Edge:     {analysis['away_team']} {analysis['away_edge']:+.1f}% | {analysis['home_team']} {analysis['home_edge']:+.1f}%")
        print(f"   → {analysis['recommendation']}")
        print()
        
        if analysis["edge"] > 0:
            opportunities.append(analysis)
    
    print("=" * 70)
    print("📊 SUMMARY")
    print("=" * 70)
    
    if opportunities:
        print(f"Found {len(opportunities)} opportunities:")
        for opp in sorted(opportunities, key=lambda x: x["edge"], reverse=True):
            print(f"  • {opp['recommendation']} @ {opp['bet_price']}¢ (edge: {opp['edge']}%)")
        
        # Calculate bet sizing for $48.83 bankroll
        bankroll = 48.83
        print(f"\nBet sizing (bankroll: ${bankroll:.2f}, 10% Kelly):")
        for opp in opportunities:
            bet = kelly_bet_size(opp["edge"]/100, opp["bet_price"], bankroll)
            print(f"  • {opp['recommendation']}: ${bet:.2f}")
    else:
        print("No opportunities found with sufficient edge.")
        print("Markets appear fairly priced based on team records.")


if __name__ == "__main__":
    main()
