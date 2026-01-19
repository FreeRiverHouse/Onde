# Onde Automation System

**Version:** 1.0
**Created:** 2026-01-19
**Architect:** Automation Architect Agent

---

## Overview

This document describes the complete automation infrastructure for Onde/FreeRiverHouse. The goal is **ZERO human intervention** for routine tasks, with humans reviewing and approving polished work rather than babysitting processes.

## Philosophy

1. **Human intervention is technical debt** - Every manual step is a bottleneck
2. **Fail loudly** - If something breaks, notify immediately
3. **Idempotent** - Scripts can run multiple times without damage
4. **Self-healing** - Automatic recovery where possible
5. **Observable** - Everything logged and traceable

---

## Directory Structure

```
Onde/
├── automation/
│   ├── scripts/           # Executable automation scripts
│   │   ├── health-check.sh
│   │   ├── daily-report.sh
│   │   ├── notify-telegram.sh
│   │   ├── cleanup-old-files.sh
│   │   ├── service-manager.sh
│   │   └── book-production-pipeline.sh
│   ├── logs/              # Automation logs
│   └── config/            # Configuration files
├── docs/
│   └── procedures/        # Step-by-step procedures
└── AUTOMATION.md          # This file
```

---

## LaunchAgents (Persistent Processes)

All LaunchAgents are located at `~/Library/LaunchAgents/`

### Active Services

| Service | Label | Schedule | Purpose |
|---------|-------|----------|---------|
| Onde Bot | `com.frh.onde-bot` | Always | Telegram bot for PR & posting |
| Health Check | `com.onde.health-check` | Every 5 min | System health monitoring |
| Daily Report | `com.onde.daily-report` | 08:00 daily | Morning status summary |
| Cleanup | `com.onde.cleanup` | 03:00 daily | Disk cleanup automation |

### Managing Services

```bash
# Check all service status
/Users/mattiapetrucciani/CascadeProjects/Onde/automation/scripts/service-manager.sh status

# Start/stop/restart a service
./service-manager.sh start onde-bot
./service-manager.sh stop onde-bot
./service-manager.sh restart onde-bot

# View service logs
./service-manager.sh logs onde-bot 100
```

### Manual LaunchAgent Commands

```bash
# Load a LaunchAgent
launchctl load ~/Library/LaunchAgents/com.onde.health-check.plist

# Unload a LaunchAgent
launchctl unload ~/Library/LaunchAgents/com.onde.health-check.plist

# Check if running
launchctl list | grep onde
```

---

## Automation Scripts

### health-check.sh

**Purpose:** Monitors system health and alerts on issues
**Schedule:** Every 5 minutes via LaunchAgent
**Alerts:** Telegram (with 1-hour cooldown to prevent spam)

**Checks performed:**
- LaunchAgent running status
- Disk space (alerts if > 90%)
- Telegram API responsiveness
- Bot process health
- Error count in logs

**Manual run:**
```bash
/Users/mattiapetrucciani/CascadeProjects/Onde/automation/scripts/health-check.sh check
```

**Test alert:**
```bash
./health-check.sh test
```

---

### daily-report.sh

**Purpose:** Sends morning status summary to Telegram
**Schedule:** 08:00 daily

**Report includes:**
- System status
- Disk usage
- Bot uptime
- Git activity (commits today, uncommitted changes)
- Error count (24h)

**Manual run:**
```bash
/Users/mattiapetrucciani/CascadeProjects/Onde/automation/scripts/daily-report.sh
```

---

### notify-telegram.sh

**Purpose:** Quick helper to send Telegram notifications
**Usage by other scripts and manual notifications**

```bash
# Simple message
./notify-telegram.sh "Your message here"

# HTML formatted message
./notify-telegram.sh "<b>Bold</b> message" HTML
```

---

### cleanup-old-files.sh

**Purpose:** Prevents disk from filling up
**Schedule:** 03:00 daily

**Actions:**
- Truncates log files > 50MB (keeps last 10k lines)
- Deletes old logs (> 7 days)
- Cleans node_modules cache
- Removes old test screenshots

**Manual run:**
```bash
# Normal run (only if disk > 85%)
./cleanup-old-files.sh

# Force full cleanup
./cleanup-old-files.sh -f
```

---

### service-manager.sh

**Purpose:** Centralized control for all Onde services

**Commands:**
```bash
./service-manager.sh status        # All services
./service-manager.sh status onde-bot
./service-manager.sh start onde-bot
./service-manager.sh stop onde-bot
./service-manager.sh restart onde-bot
./service-manager.sh logs onde-bot 100
./service-manager.sh list
```

---

### book-production-pipeline.sh

**Purpose:** Orchestrates book production workflow

**Usage:**
```bash
# Initialize new book
./book-production-pipeline.sh meditations classics setup

# Validate book structure
./book-production-pipeline.sh meditations classics validate

# Generate EPUB
./book-production-pipeline.sh meditations classics epub

# Generate PDF
./book-production-pipeline.sh meditations classics pdf

# Send for review
./book-production-pipeline.sh meditations classics review
```

**Categories:** classics, tech, spirituality, poetry

---

## Monitoring & Alerting

### Alert Flow

```
Issue Detected
      ↓
health-check.sh
      ↓
Check cooldown (1 hour)
      ↓
Send to Telegram (7505631979)
      ↓
Log to /automation/logs/
```

### Log Locations

| Log | Path | Retention |
|-----|------|-----------|
| Health Check | `/tmp/onde-health-check.log` | 7 days |
| Daily Report | `/tmp/onde-daily-report.log` | 7 days |
| Bot Output | `/tmp/frh-onde-bot.log` | 7 days |
| Cleanup | `/automation/logs/cleanup.log` | Auto-truncated |
| Book Pipeline | `/automation/logs/book-pipeline.log` | 7 days |

### Telegram Notifications

**Bot Token:** `8528268093:AAGNZUcYBm8iMcn9D_oWr565rpxm9riNkBM`
**Chat ID:** `7505631979`

**Notification Types:**
- Health alerts (critical issues)
- Daily reports (08:00)
- Book production updates
- Task completion confirmations

---

## Self-Healing Mechanisms

### KeepAlive

The following services have `KeepAlive: true` in their plist:
- `com.frh.onde-bot` - Restarts automatically if it crashes

### Automatic Retry

- Health check alerts have 1-hour cooldown to prevent spam
- Cleanup script runs with fault tolerance

### Disk Space Management

When disk > 85%:
1. Truncate large logs
2. Clean old logs (> 7 days)
3. Clean caches
4. Send alert if still critical

---

## Adding New Automation

### 1. Create a New Script

```bash
# Create script
touch /Users/mattiapetrucciani/CascadeProjects/Onde/automation/scripts/my-script.sh
chmod +x /Users/mattiapetrucciani/CascadeProjects/Onde/automation/scripts/my-script.sh
```

### 2. Script Template

```bash
#!/bin/bash
# =============================================================================
# SCRIPT NAME
# Description of what this script does
# =============================================================================

set -e

ONDE_DIR="/Users/mattiapetrucciani/CascadeProjects/Onde"
LOG_FILE="$ONDE_DIR/automation/logs/my-script.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Use notify-telegram.sh for notifications
notify() {
    "$ONDE_DIR/automation/scripts/notify-telegram.sh" "$1"
}

main() {
    log "Starting..."
    # Your logic here
    log "Completed"
}

main "$@"
```

### 3. Create LaunchAgent (if scheduled)

Create at `~/Library/LaunchAgents/com.onde.my-script.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.onde.my-script</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/mattiapetrucciani/CascadeProjects/Onde/automation/scripts/my-script.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>3600</integer>
    <key>StandardOutPath</key>
    <string>/tmp/onde-my-script.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/onde-my-script.log</string>
</dict>
</plist>
```

**Schedule options:**
- `StartInterval`: Run every N seconds
- `StartCalendarInterval`: Run at specific time (Hour, Minute, Day, etc.)

### 4. Load the LaunchAgent

```bash
launchctl load ~/Library/LaunchAgents/com.onde.my-script.plist
```

### 5. Update service-manager.sh

Add your new service to the SERVICES array in `service-manager.sh`.

---

## Existing Agents (Claude Agents)

Located at `/Users/mattiapetrucciani/CascadeProjects/.claude/agents/`

| Agent | File | Role |
|-------|------|------|
| Automation Architect | `automation-architect.md` | Designs automations |
| Continuous Improvement | `continuous-improvement.md` | Process optimization |
| Editore Capo | `editore-capo.md` | Book production orchestration |
| Gianni Parola | `gianni-parola.md` | Writing agent |
| Pino Pennello | `pino-pennello.md` | Illustration agent |
| Enzo PR | `enzo-pr.md` | PR & social media |
| Sally | `sally.md` | Sales agent |
| Video Factory | `video-factory.md` | Video production |

---

## Procedures Documentation

Located at `/Users/mattiapetrucciani/CascadeProjects/Onde/docs/procedures/`

| Procedure | File | Purpose |
|-----------|------|---------|
| New App | `NEW-APP-PROCEDURE.md` | Creating new web apps |
| Upgrade App | `UPGRADE-APP-PROCEDURE.md` | Upgrading existing apps |
| Website | `WEBSITE-PROCEDURES.md` | Portal deployment |
| Book Production | `BOOK-PRODUCTION-SOP.md` | Book creation workflow |
| Book Factory | `BOOK_FACTORY.md` | Claude handoff guide |

---

## Troubleshooting

### Bot not running?

```bash
# Check status
./service-manager.sh status onde-bot

# Check logs
./service-manager.sh logs onde-bot 50

# Restart
./service-manager.sh restart onde-bot
```

### Health check not running?

```bash
# Check if loaded
launchctl list | grep health

# Manually load
launchctl load ~/Library/LaunchAgents/com.onde.health-check.plist
```

### Disk full?

```bash
# Force cleanup
./cleanup-old-files.sh -f

# Check what's using space
du -sh /Users/mattiapetrucciani/* | sort -hr | head -20
```

### Telegram not working?

```bash
# Test notification
./notify-telegram.sh "Test message"

# Check API
curl -s "https://api.telegram.org/bot8528268093:AAGNZUcYBm8iMcn9D_oWr565rpxm9riNkBM/getMe"
```

---

## Human Intervention Points (Remaining)

These still require human action:

| Action | Why | Mitigation |
|--------|-----|------------|
| Approving books | Quality judgment | Clear approval workflow via Telegram |
| Social media posting | Brand safety | Pre-approval queue in bot |
| New API keys | Security | Document rotation procedure |
| Major releases | Risk management | Staged rollout automation |
| Style decisions | Creative judgment | Style guide automation |

---

## Metrics

Track these to measure automation success:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Manual interventions/day | < 5 | Telegram interaction count |
| System uptime | > 99.5% | Health check logs |
| Alert response time | < 1 hour | Telegram timestamps |
| Disk usage | < 80% | Daily report |
| Bot uptime | > 99% | Service manager |

---

## Changelog

### 2026-01-19
- Initial automation system created
- Health check with alerting
- Daily reports at 08:00
- Disk cleanup at 03:00
- Service manager for all services
- Book production pipeline
- Master documentation

---

*This document is the single source of truth for Onde automation.*
*Update when adding new automations.*
