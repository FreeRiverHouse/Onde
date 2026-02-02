# TASKS.md - Lista Task Condivisa

> **Regola:** Un task alla volta. Lock → Work → Done → Next.

## 📋 TASK ATTIVI

### INFRA/MONITORING (Priorità 1)
| ID | Task | Status | Owner | Depends |
|----|------|--------|-------|---------|
| INF-001 | Verificare salute autotrader (uptime, win rate) | DONE | @clawdinho | - |
| INF-002 | Check SSL expiry per onde.la e onde.surf | DONE | @clawdinho | - |
| INF-003 | Verificare cron watchdog attivi e funzionanti | DONE | @clawdinho | - |
| INF-004 | Setup staging environment (test.onde.la o onde.surf) che duplica onde.la | TODO | - | - |
| INF-005 | Aggiornare procedure deploy: staging first, then prod | TODO | - | INF-004 |
| INF-006 | Creare script test automatici pre-deploy (tutte pagine, health check) | TODO | - | INF-004 |

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
| MLH-012 | Add notification grouping by source/type | DONE | @clawdinho | MLH-007 |
| MLH-013 | Add swipe-to-dismiss for mobile notifications | DONE | @clawdinho | MLH-007 |
| MLH-014 | Add desktop push notification permission request | DONE | @clawdinho | MLH-007 |
| MLH-015 | Add haptic feedback on swipe dismiss (vibration API) | DONE | @clawdinho | MLH-013 |
| MLH-016 | Add notification badge count to browser tab title | DONE | @clawdinho | MLH-007 |
| MLH-017 | Add pull-to-refresh in notification panel (mobile) | DONE | @clawdinho | MLH-007 |
| MLH-018 | Add keyboard navigation within notification list (j/k up/down, Enter to expand) | DONE | @clawdinho | MLH-007 |
| MLH-019 | Add notification mute/DND mode with schedule (quiet hours) | DONE | @clawdinho | MLH-007 |
| MLH-020 | Add notification export (download history as JSON/CSV) | DONE | @clawdinho | MLH-007 |
| MLH-021 | Add keyboard navigation for grouped notifications (expand/collapse with Enter) | DONE | @clawdinho | MLH-018 |
| MLH-022 | Add notification snooze (remind later) functionality | TODO | - | MLH-007 |
| MLH-023 | Add notification action buttons (quick actions per notification type) | TODO | - | MLH-007 |
| MLH-024 | Add notification filters persistence (save selected filter to localStorage) | TODO | - | MLH-007 |
| MLH-025 | Add notification dismiss-all button with confirmation | TODO | - | MLH-007 |
| MLH-026 | Add notification priority levels (low/medium/high/urgent) with visual indicators | TODO | - | MLH-007 |

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
| AUTO-002 | Aggiungere alert per autotrader DRY RUN mode | DONE | @clawdinho | - |
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

- **MLH-012** - Notification grouping: dropdown to group by "None", "By Type", or "By Source" with collapsible sections, unread badges, localStorage persistence

## ✅ COMPLETATI OGGI (2026-02-05)

- **MLH-019** - DND mode with quiet hours: useDndMode hook, enable/disable toggle, schedule with time pickers (overnight support), allow urgent alerts option, integrated with playSound and desktop notifications, amber color scheme for DND UI
- **MLH-020** - Notification export: exportNotificationsAsJson/Csv helpers, download button with dropdown menu, proper CSV escaping, timestamped filenames
- **MLH-021** - Keyboard nav for grouped notifications: j/k navigate groups, Enter expand/collapse, Space toggle all, lifted expandedGroups state, groupRefs for scroll-into-view, visual selection ring, dynamic footer shortcuts

- **MLH-013** - Swipe-to-dismiss mobile: touch handlers with useSwipeToDismiss hook, visual feedback (red background, opacity change), threshold-based dismiss, "← swipe" hint on mobile
- **MLH-014** - Desktop push notification permission: useDesktopNotifications hook, permission request flow, enable/disable toggle, showPreview option, test notification button, auto-notify on new alerts
- **MLH-015** - Haptic feedback on swipe dismiss: triggerHapticFeedback helper, medium vibration when crossing threshold, success vibration pattern on dismiss
- **MLH-016** - Notification badge in tab title: useEffect updates document.title with (N) prefix when unread count > 0, cleans up on unmount
- **MLH-017** - Pull-to-refresh in notification panel: usePullToRefresh hook with touch gesture detection, visual indicator, resistance/threshold mechanics, haptic feedback, mobile-only (hidden on sm+)
- **MLH-018** - Keyboard navigation in notification list: j/k to navigate up/down with wrap-around, Enter to mark as read, x/Delete/Backspace to dismiss, Home/End for first/last, visual cyan ring on selected item, scroll into view, footer shows shortcuts

---

*Ultimo aggiornamento: 2026-01-31 12:28 PST*

### GAMES (Priorità 3)
| ID | Task | Status | Owner | Depends |
|----|------|--------|-------|---------|
| GAM-001 | Skin Creator: Mobile UX improvements (3D preview visibility, toolbar, gestures) | TODO | - | - |
| GAM-002 | Skin Creator: Test su vari device mobile | TODO | - | GAM-001 |
| GAM-003 | Skin Creator: Layout landscape mode | TODO | - | GAM-001 |
