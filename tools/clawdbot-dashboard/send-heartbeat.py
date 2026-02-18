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
from datetime import datetime
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


def get_auth_status():
    auth = read_json(AGENT_AUTH)
    try:
        profile = auth["profiles"]["anthropic:claude-cli"]
        token   = profile.get("token", "")
        stats   = auth.get("usageStats", {}).get("anthropic:claude-cli", {})
        cooldown     = stats.get("cooldownUntil")
        error_count  = stats.get("errorCount", 0)
    except (KeyError, TypeError):
        token, cooldown, error_count = "", None, 0

    # Determine account from token suffix
    token_end = token[-12:] if len(token) >= 12 else token
    if token_end == "hRg-PCbGEAAA":
        account = "freeriverhouse@gmail.com"
        tier    = "default_claude_max_5x"
    elif token_end == "DWw-pWTs5AAA":
        account = "magmaticxr@gmail.com"
        tier    = "default_claude_max_20x"
    else:
        account = read_keychain_account()
        tier    = "unknown"

    return {
        "account":    account,
        "tokenEnd":   token_end,
        "tier":       tier,
        "cooldown":   cooldown,
        "errorCount": error_count,
    }


def read_keychain_account():
    try:
        raw = subprocess.check_output(
            ["security", "find-generic-password", "-s", "Claude Code-credentials", "-a", KEYCHAIN_ACCT, "-w"],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        d = json.loads(raw)
        return d.get("claudeAiOauth", {}).get("account", KEYCHAIN_ACCT)
    except Exception:
        return KEYCHAIN_ACCT


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


def main():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] heartbeat macId={MAC_ID}")

    primary, fallbacks          = get_clawdbot_config()
    auth                        = get_auth_status()
    gateway_status, agent_model = get_gateway_status()

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
    }

    print(f"  primary={primary}  gw={gateway_status}  rl7d={rate['sevenD']} ({rate['sevenDUtilization']*100:.0f}%)")

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
