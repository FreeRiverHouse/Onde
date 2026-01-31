# TASKS.md - Lista Task Condivisa

> **Regola:** Un task alla volta. Lock → Work → Done → Next.

## 📋 TASK ATTIVI

### INFRA/MONITORING (Priorità 1)
| ID | Task | Status | Owner | Depends |
|----|------|--------|-------|---------|
| INF-001 | Verificare salute autotrader (uptime, win rate) | DONE | @clawdinho | - |
| INF-002 | Check SSL expiry per onde.la e onde.surf | DONE | @clawdinho | - |
| INF-003 | Verificare cron watchdog attivi e funzionanti | DONE | @clawdinho | - |

### MOONLIGHT HOUSE (Priorità 2)
| ID | Task | Status | Owner | Depends |
|----|------|--------|-------|---------|
| MLH-001 | Review UI dashboard onde.surf per miglioramenti | DONE | @clawdinho | - |
| MLH-002 | Testare flusso autenticazione completo | DONE | @clawdinho | - |
| MLH-003 | Add keyboard shortcut handler for ⌘K quick actions | DONE | @clawdinho | - |
| MLH-004 | Add dark/light theme toggle | DONE | @clawdinho | - |
| MLH-005 | Add loading states for async panels | DONE | @clawdinho | - |
| MLH-006 | Add breadcrumb navigation with keyboard support | DONE | @clawdinho | - |
| MLH-007 | Add notification center panel (alerts, events) | DONE | @clawdinho | - |
| MLH-008 | Add search history + recent commands to palette | DONE | @clawdinho | - |
| MLH-009 | Add agent activity feed to notification center | DONE | @clawdinho | MLH-007 |
| MLH-010 | Add notification sound preferences (mute/sound type) | DONE | @clawdinho | MLH-007 |
| MLH-011 | Add notification persistence with localStorage | DONE | @clawdinho | MLH-007 |
| MLH-012 | Add notification grouping by source/type | TODO | - | MLH-007 |
| MLH-013 | Add swipe-to-dismiss for mobile notifications | TODO | - | MLH-007 |
| MLH-014 | Add desktop push notification permission request | TODO | - | MLH-007 |

### LIBRI/PUBLISHING (Priorità 3)
| ID | Task | Status | Owner | Depends |
|----|------|--------|-------|---------|
| PUB-001 | Check stato catalogo libri disponibili | TODO | - | - |
| PUB-002 | Verificare pipeline traduzione attiva | TODO | - | - |

### CONTENT/SOCIAL (Priorità 4)
| ID | Task | Status | Owner | Depends |
|----|------|--------|-------|---------|
| SOC-001 | Review X presence e engagement recente | TODO | - | - |

### AUTOMATION/IMPROVEMENTS (Priorità 5)
| ID | Task | Status | Owner | Depends |
|----|------|--------|-------|---------|
| AUTO-001 | Creare script check siti live (onde.la, onde.surf HTTP 200) | DONE | @clawdinho | - |
| AUTO-002 | Aggiungere alert per autotrader DRY RUN mode | TODO | - | - |
| AUTO-003 | Documentare stato attuale Kalshi trading in memory | TODO | - | - |
| AUTO-004 | Integrare SystemMonitor check nel ciclo HEARTBEAT | DONE | @clawdinho | - |
| AUTO-005 | Creare watchdog-gpu-load.sh per monitoring periodico | DONE | @clawdinho | AUTO-004 |
| AUTO-006 | Aggiungere gpu-load-critical.alert se CPU/GPU oltre soglia | DONE | @clawdinho | AUTO-005 |

---

## ✅ COMPLETATI OGGI (2026-01-31)

- **INF-001** - Autotrader healthy: running, stable >1h, DRY RUN mode, API OK
- **INF-002** - SSL OK: onde.la (Apr 10), onde.surf (Apr 11) - ~70 days remaining
- **INF-003** - Crons healthy: 10+ watchdog crons active, last run 09:50
- **MLH-001** - Dashboard UI review: premium design, all panels working, added 3 improvement tasks
- **MLH-002** - Auth flow verified: Google OAuth + 6-email whitelist + middleware protection
- **MLH-003** - Global keyboard shortcuts: G-key vim-style nav (G D/S/C/A/H/P/B), toast feedback, ⌘K palette
- **MLH-004** - Dark/light theme toggle: ThemeProvider + ThemeToggle already implemented with system detection
- **MLH-005** - Skeleton loading components: Skeleton, SkeletonPanel, SkeletonList, SkeletonStats, SkeletonChart + shimmer animation
- **MLH-006** - Breadcrumb navigation: route-based breadcrumbs + Alt+← back + Alt+Home dashboard
- **AUTO-001** - Site check script: check-sites-live.sh verifies onde.la + onde.surf HTTP status
- **MLH-007** - NotificationCenter: dropdown panel with alerts/events, badge count, keyboard shortcut (N), mark read/dismiss, filters
- **MLH-008** - CommandPalette search history: localStorage persistence for recent commands + search queries, "Used Nx" counts, quick-select buttons
- **MLH-009** - Agent activity feed: NotificationCenter now fetches from /api/agents + /api/activity, new 'agent' type with 🤖 icon, "Agents" filter tab
- **MLH-010** - Notification sound preferences: Web Audio API sounds (subtle/chime/alert), volume slider, enable/disable toggle, test button, localStorage persistence
- **MLH-011** - Notification persistence: localStorage for dismissed/read IDs, auto-cleanup after 7 days, limit 100/200 entries, persists across sessions

---

*Ultimo aggiornamento: 2026-01-31 11:15 PST*
