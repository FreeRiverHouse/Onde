#!/usr/bin/env python3
"""
send-heartbeat.py
Legge lo stato di ClawdBot locale e lo invia a onde.surf/api/bot-configs/heartbeat.
Gira ogni ~1 min via LaunchAgent. Gestisce anche comandi di switch dal server.

CONFIGURAZIONE (variabili in cima al file):
  MAC_ID    - identificativo univoco del Mac (m1, bubble, m4)
  HOSTNAME  - nome leggibile
  BOT_NAME  - nome Telegram del bot
"""

import json
import os
import re
import subprocess
import urllib.error
import urllib.request
from datetime import datetime, date
from pathlib import Path

# ─── CONFIG ────────────────────────────────────────────────────────────────────
MAC_ID   = os.environ.get("CLAWDBOT_MAC_ID", "m1")
HOSTNAME = os.environ.get("CLAWDBOT_HOSTNAME", subprocess.getoutput("hostname -s"))
BOT_NAME = os.environ.get("CLAWDBOT_BOT_NAME", "@ClawdFRH_bot")

ONDSURF_URL    = "https://onde.surf/api/bot-configs/heartbeat"
SHARED_SECRET  = "FRH-BOTS-2026"
KEYCHAIN_ACCT  = "mattia"   # freeriverhouse@gmail.com - NON usare "Claude Code" (magmaticxr)!

CONFIG_FILE    = Path.home() / ".clawdbot/clawdbot.json"
AGENT_AUTH     = Path.home() / ".clawdbot/agents/main/agent/auth-profiles.json"
GATEWAY_LOG    = Path.home() / ".clawdbot/logs/gateway.log"
NVIDIA_USAGE   = Path.home() / ".clawdbot/nvidia-usage.json"
SWITCH_SCRIPT  = Path(__file__).parent.parent / "cambio-account-clawdbot-token.sh"
# ───────────────────────────────────────────────────────────────────────────────


def read_json(path: Path):
    try:
        return json.loads(path.read_text())
    except Exception:
        return {}


def get_clawdbot_config():
    cfg = read_json(CONFIG_FILE)
    try:
        defaults = cfg["agents"]["defaults"]["model"]
        primary   = defaults.get("primary", "unknown")
        fallbacks = defaults.get("fallbacks", [])
    except (KeyError, TypeError):
        primary, fallbacks = "unknown", []
    return primary, fallbacks


def get_keychain_token(account: str) -> str:
    """Read OAuth access token from macOS keychain for given account name."""
    try:
        raw = subprocess.check_output(
            ["security", "find-generic-password", "-s", "Claude Code-credentials", "-a", account, "-w"],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        d = json.loads(raw)
        return d.get("claudeAiOauth", {}).get("accessToken", "")
    except Exception:
        return ""


def get_auth_status():
    auth = read_json(AGENT_AUTH)
    try:
        profile = auth["profiles"]["anthropic:claude-cli"]
        # Support both old "token" key and new "access" key (gateway updated structure)
        token   = profile.get("access", profile.get("token", ""))
        stats   = auth.get("usageStats", {}).get("anthropic:claude-cli", {})
        cooldown     = stats.get("cooldownUntil")
        error_count  = stats.get("errorCount", 0)
    except (KeyError, TypeError):
        token, cooldown, error_count = "", None, 0

    token_end = token[-12:] if len(token) >= 12 else token

    # Identify account by comparing active token against keychain tokens
    # Magmaticxr is the "bad" account - if we detect it, report it
    mgx_token = get_keychain_token("Claude Code")  # magmaticxr
    frh_token = get_keychain_token(KEYCHAIN_ACCT)  # freeriverhouse (account "mattia")

    if mgx_token and token == mgx_token:
        account = "magmaticxr@gmail.com"
        tier    = "default_claude_max_20x"
    elif frh_token and token == frh_token:
        account = "freeriverhouse@gmail.com"
        tier    = "default_claude_max_5x"
    else:
        # Token refreshed independently - infer from keychain rateLimitTier
        account, tier = read_keychain_account()

    return {
        "account":    account,
        "tokenEnd":   token_end,
        "tier":       tier,
        "cooldown":   cooldown,
        "errorCount": error_count,
    }


def read_keychain_account():
    """Return (email, tier) from keychain for the primary account."""
    try:
        raw = subprocess.check_output(
            ["security", "find-generic-password", "-s", "Claude Code-credentials", "-a", KEYCHAIN_ACCT, "-w"],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        d = json.loads(raw)
        oauth = d.get("claudeAiOauth", {})
        tier = oauth.get("rateLimitTier", "unknown")
        # No 'account' email field in keychain - map KEYCHAIN_ACCT to known email
        email_map = {
            "mattia": "freeriverhouse@gmail.com",
            "mattiapetrucciani": "freeriverhouse@gmail.com",
        }
        email = email_map.get(KEYCHAIN_ACCT, f"{KEYCHAIN_ACCT}@?")
        return email, tier
    except Exception:
        return "freeriverhouse@gmail.com", "unknown"


def get_nvidia_usage() -> dict:
    """Legge il file di usage NVIDIA generato dal proxy locale."""
    try:
        raw = json.loads(NVIDIA_USAGE.read_text())
        today_str = date.today().isoformat()
        today_data = raw.get("today", {})
        # Se il dato è di ieri (proxy spento), today tokens = 0
        today_tokens = today_data.get("tokens", 0) if today_data.get("date") == today_str else 0
        today_calls  = today_data.get("calls", 0)  if today_data.get("date") == today_str else 0
        return {
            "todayTokens": today_tokens,
            "todayCalls":  today_calls,
            "totalTokens": raw.get("total", 0),
            "totalCalls":  raw.get("totalCalls", 0),
            "lastUpdated": raw.get("lastUpdated"),
        }
    except Exception:
        return {
            "todayTokens": 0,
            "todayCalls":  0,
            "totalTokens": 0,
            "totalCalls":  0,
            "lastUpdated": None,
        }


def get_gateway_status():
    try:
        pids = subprocess.check_output(["pgrep", "-f", "clawdbot-gateway"], stderr=subprocess.DEVNULL)
        status = "running" if pids.strip() else "stopped"
    except Exception:
        status = "stopped"

    # Read current agent model from log
    agent_model = "unknown"
    try:
        log_content = GATEWAY_LOG.read_text(errors="ignore")
        matches = re.findall(r"\[gateway\] agent model: (.+)", log_content)
        if matches:
            agent_model = matches[-1].strip()
    except Exception:
        pass

    return status, agent_model


def get_rate_limit(token: str):
    """Call Anthropic API to get rate limit headers."""
    result = {
        "fiveH":              "unknown",
        "sevenD":             "unknown",
        "sevenDUtilization":  0.0,
        "sevenDSonnetStatus": "unknown",
    }
    if not token:
        return result
    try:
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            method="POST",
            headers={
                "Authorization":  f"Bearer {token}",
                "anthropic-version": "2023-06-01",
                "anthropic-beta": "oauth-2025-04-20",
                "content-type":   "application/json",
            },
            data=json.dumps({
                "model": "claude-sonnet-4-6",
                "max_tokens": 1,
                "messages": [{"role": "user", "content": "hi"}],
            }).encode(),
        )
        try:
            r = urllib.request.urlopen(req, timeout=10)
            headers = dict(r.headers)
        except urllib.error.HTTPError as e:
            headers = dict(e.headers)

        def h(key):
            return headers.get(key) or headers.get(key.lower()) or ""

        result["fiveH"]              = h("anthropic-ratelimit-unified-5h-status") or "allowed"
        result["sevenD"]             = h("anthropic-ratelimit-unified-7d-status") or "unknown"
        result["sevenDSonnetStatus"] = h("anthropic-ratelimit-unified-7d_sonnet-status") or "unknown"
        util_raw                     = h("anthropic-ratelimit-unified-7d-utilization")
        result["sevenDUtilization"]  = float(util_raw) if util_raw else 0.0
    except Exception:
        pass
    return result


def get_fresh_token():
    try:
        raw = subprocess.check_output(
            ["security", "find-generic-password", "-s", "Claude Code-credentials", "-a", KEYCHAIN_ACCT, "-w"],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        d = json.loads(raw)
        return d["claudeAiOauth"]["accessToken"]
    except Exception:
        return ""


def execute_command(cmd: dict):
    """Execute a command received from onde.surf."""
    action = cmd.get("action")
    model  = cmd.get("model", "")
    print(f"[cmd] action={action} model={model}")

    if action == "switch":
        # Determine --model flag
        if "sonnet" in model:
            flag = "sonnet"
        elif "opus" in model:
            flag = "opus"
        else:
            flag = "sonnet"
        script = str(SWITCH_SCRIPT)
        if Path(script).exists():
            subprocess.run(["bash", script, "--model", flag], timeout=60)
        else:
            print(f"[cmd] script not found: {script}")

    elif action == "refresh-token":
        script = str(SWITCH_SCRIPT)
        if Path(script).exists():
            subprocess.run(["bash", script], timeout=60)
        else:
            print(f"[cmd] script not found: {script}")


def send_heartbeat(payload: dict):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        ONDSURF_URL,
        method="POST",
        headers={
            "Content-Type":  "application/json",
            "x-frh-secret":  SHARED_SECRET,
            "User-Agent":    "FRH-Heartbeat/1.0",
        },
        data=data,
    )
    try:
        r = urllib.request.urlopen(req, timeout=15)  # type: ignore[assignment]
        return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        print(f"[heartbeat] HTTP {e.code}: {e.read().decode()[:200]}")
        return None
    except Exception as ex:
        print(f"[heartbeat] error: {ex}")
        return None


def auto_fix_token_if_wrong(auth: dict):
    """
    Se il token attivo è magmaticxr (rate limited), auto-esegue il fix script.
    Root cause: il gateway re-sincronizza dal keychain macOS ogni 15 min (EXTERNAL_CLI_SYNC_TTL_MS).
    Il keychain entry 'Claude Code' può contenere il token sbagliato se Claude Code CLI
    è stato usato con l'account magmaticxr. Il fix script aggiorna sia auth-profiles.json
    sia il keychain 'Claude Code', quindi il gateway terrà freeriverhouse anche dopo il restart.
    """
    if auth.get("account") == "magmaticxr@gmail.com":
        print(f"  [auto-fix] token sbagliato rilevato ({auth['tokenEnd']}), eseguo fix...")
        if Path(str(SWITCH_SCRIPT)).exists():
            result = subprocess.run(
                ["bash", str(SWITCH_SCRIPT), "--model", "sonnet"],
                capture_output=True, text=True, timeout=60
            )
            if result.returncode == 0:
                print("  [auto-fix] OK - token ripristinato a freeriverhouse")
                return True
            else:
                print(f"  [auto-fix] FAIL: {result.stderr[:100]}")
        else:
            print(f"  [auto-fix] script non trovato: {SWITCH_SCRIPT}")
    return False


def main():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] heartbeat macId={MAC_ID}")

    primary, fallbacks          = get_clawdbot_config()
    auth                        = get_auth_status()
    gateway_status, agent_model = get_gateway_status()
    nvidia_usage                = get_nvidia_usage()

    # Auto-fix se token sbagliato (magmaticxr invece di freeriverhouse)
    if auto_fix_token_if_wrong(auth):
        auth = get_auth_status()  # Rileggi dopo fix

    # Get fresh token for rate limit check
    token = get_fresh_token()

    # Only check rate limit if token is available
    rate = get_rate_limit(token) if token else {
        "fiveH": "unknown", "sevenD": "unknown",
        "sevenDUtilization": 0.0, "sevenDSonnetStatus": "unknown"
    }

    # Use agent_model from log if config says unknown
    if primary == "unknown" and agent_model != "unknown":
        primary = agent_model

    payload = {
        "macId":           MAC_ID,
        "hostname":        HOSTNAME,
        "botName":         BOT_NAME,
        "primaryModel":    primary,
        "fallbacks":       fallbacks,
        "account":         auth["account"],
        "tokenEnd":        auth["tokenEnd"],
        "tier":            auth["tier"],
        "cooldown":        auth["cooldown"],
        "errorCount":      auth["errorCount"],
        "gatewayStatus":   gateway_status,
        "rateLimitStatus": rate,
        "nvidiaUsage":     nvidia_usage,
    }

    nvidia_str = f"kimi today={nvidia_usage['todayTokens']}tok/{nvidia_usage['todayCalls']}calls  total={nvidia_usage['totalTokens']}tok"
    print(f"  primary={primary}  gw={gateway_status}  rl7d={rate['sevenD']} ({rate['sevenDUtilization']*100:.0f}%)  {nvidia_str}")

    response = send_heartbeat(payload)
    if response:
        cmd = response.get("pendingCommand")
        if cmd:
            print(f"  [cmd] received: {cmd}")
            execute_command(cmd)
        else:
            print("  ok - no pending commands")
    else:
        print("  failed to send heartbeat")


if __name__ == "__main__":
    main()
