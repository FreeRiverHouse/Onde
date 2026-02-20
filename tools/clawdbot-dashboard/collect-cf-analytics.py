#!/usr/bin/env python3
"""
collect-cf-analytics.py
Raccoglie analytics da Cloudflare GraphQL API e li scrive in D1 (onde-surf-db).
Gira ogni giorno via LaunchAgent.

DATI REALI da Cloudflare - pageviews, unique visitors, requests.
"""

import json
import os
import subprocess
import urllib.error
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

# ─── CONFIG ────────────────────────────────────────────────────────────────────
WRANGLER_CONFIG = Path.home() / "Library/Preferences/.wrangler/config/default.toml"
ACCOUNT_ID = "91ddd4ffd23fb9da94bb8c2a99225a3f"

ZONES = {
    "onde.surf": "5c8ed77a62e5b4fef107c6b80d563773",
    "onde.la":   "5f1b2fe544f1a925765305fefcf36fe1",
}

# Metric key mapping per zone
METRIC_KEYS = {
    "onde.surf": {
        "pageviews": "ga_pageviews",
        "users":     "ga_users",
        "sessions":  "ga_sessions",
    },
    "onde.la": {
        "pageviews": "ondela_pageviews",
        "users":     "ondela_users",
    },
}
# ───────────────────────────────────────────────────────────────────────────────


def get_wrangler_token() -> str:
    """Read OAuth token from wrangler config."""
    try:
        content = WRANGLER_CONFIG.read_text()
        for line in content.splitlines():
            if "oauth_token" in line and "=" in line:
                return line.split("=", 1)[1].strip().strip('"')
    except Exception as e:
        print(f"[error] Cannot read wrangler config: {e}")
    return ""


def fetch_cloudflare_analytics(token: str, zone_id: str, days: int = 7) -> list[dict]:
    """Fetch daily analytics from Cloudflare GraphQL API."""
    date_end = datetime.now().strftime("%Y-%m-%d")
    date_start = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    query = f"""query {{
        viewer {{
            zones(filter: {{zoneTag: "{zone_id}"}}) {{
                httpRequests1dGroups(
                    limit: {days},
                    filter: {{date_geq: "{date_start}", date_leq: "{date_end}"}},
                    orderBy: [date_ASC]
                ) {{
                    dimensions {{ date }}
                    sum {{ requests pageViews }}
                    uniq {{ uniques }}
                }}
            }}
        }}
    }}"""

    data = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4/graphql",
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        data=data,
    )

    try:
        r = urllib.request.urlopen(req, timeout=15)
        result = json.loads(r.read().decode())
        zones = result.get("data", {}).get("viewer", {}).get("zones", [])
        if zones:
            return zones[0].get("httpRequests1dGroups", [])
    except urllib.error.HTTPError as e:
        print(f"[error] Cloudflare API HTTP {e.code}: {e.read().decode()[:200]}")
    except Exception as e:
        print(f"[error] Cloudflare API: {e}")

    return []


def write_to_d1(sql_statements: list[str]):
    """Write metrics to D1 via wrangler CLI."""
    if not sql_statements:
        print("[skip] No SQL statements to execute")
        return

    # Write to temp file
    sql_file = Path("/tmp/cf-analytics-update.sql")
    sql_file.write_text("\n".join(sql_statements))

    try:
        result = subprocess.run(
            ["npx", "wrangler", "d1", "execute", "onde-surf-db", "--remote", f"--file={sql_file}"],
            capture_output=True, text=True, timeout=30,
            cwd=str(Path.home() / "Onde/apps/surfboard"),
        )
        if result.returncode == 0:
            print(f"[d1] OK - {len(sql_statements)} statements executed")
        else:
            print(f"[d1] FAIL: {result.stderr[:200]}")
    except Exception as e:
        print(f"[d1] error: {e}")
    finally:
        sql_file.unlink(missing_ok=True)


def main():
    now = datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] Collecting Cloudflare analytics...")

    token = get_wrangler_token()
    if not token:
        print("[error] No wrangler OAuth token found. Run 'npx wrangler login' first.")
        return

    all_sql = []

    for site, zone_id in ZONES.items():
        print(f"  Fetching {site}...")
        groups = fetch_cloudflare_analytics(token, zone_id, days=7)

        if not groups:
            print(f"  [warn] No data for {site}")
            continue

        keys = METRIC_KEYS[site]
        source = f"cloudflare-{site}"

        for g in groups:
            date = g["dimensions"]["date"]
            pv = g["sum"]["pageViews"]
            reqs = g["sum"]["requests"]
            uniq = g["uniq"]["uniques"]

            all_sql.append(
                f"INSERT OR REPLACE INTO metrics (metric_key, metric_value, metric_date, source) "
                f"VALUES ('{keys['pageviews']}', {pv}, '{date}', '{source}');"
            )
            all_sql.append(
                f"INSERT OR REPLACE INTO metrics (metric_key, metric_value, metric_date, source) "
                f"VALUES ('{keys['users']}', {uniq}, '{date}', '{source}');"
            )
            if "sessions" in keys:
                all_sql.append(
                    f"INSERT OR REPLACE INTO metrics (metric_key, metric_value, metric_date, source) "
                    f"VALUES ('{keys['sessions']}', {reqs}, '{date}', '{source}');"
                )

        latest = groups[-1] if groups else {}
        if latest:
            d = latest["dimensions"]["date"]
            print(f"  {site}: {latest['sum']['pageViews']}pv / {latest['uniq']['uniques']}u ({d})")

    if all_sql:
        print(f"\n  Writing {len(all_sql)} metrics to D1...")
        write_to_d1(all_sql)
    else:
        print("  No data collected")

    print(f"  Done.")


if __name__ == "__main__":
    main()
