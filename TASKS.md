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
| MLH-007 | Add notification center panel (alerts, events) | TODO | - | - |
| MLH-008 | Add search history + recent commands to palette | TODO | - | - |

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
| AUTO-001 | Creare script check siti live (onde.la, onde.surf HTTP 200) | TODO | - | - |
| AUTO-002 | Aggiungere alert per autotrader DRY RUN mode | TODO | - | - |
| AUTO-003 | Documentare stato attuale Kalshi trading in memory | TODO | - | - |

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

---

*Ultimo aggiornamento: 2026-01-31 11:05 PST*
