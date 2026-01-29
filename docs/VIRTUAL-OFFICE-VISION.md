# 🏠 Free River House - Virtual Office Vision

## La Visione

**Oggi:** Un ufficio virtuale 2D su onde.surf dove vedi gli agenti AI lavorare, assegni task, e monitori l'attività.

**Domani:** Un mondo VR dove Mattia e Clawdinho si incontrano in spiaggia (o in un ufficio futuristico) per le riunioni. Mattia parla, dà direzioni, e Clawdinho coordina il team di agenti AI.

## Core Concept: "Vibecoding Gamificato"

L'idea è trasformare il lavoro con AI in un'esperienza visuale, interattiva e divertente:
- **Vedi** gli agenti muoversi nelle stanze mentre lavorano
- **Assegna** task con un click
- **Osserva** i progressi in tempo reale
- **Parla** direttamente con gli agenti (chat/voice)
- **Coordina** come un manager nel suo ufficio virtuale

## Gli Agenti di Free River House

### 🤖 Core Team (Real Agents - Connected to Clawdbot)
| Agent | Ruolo | Stanza | Descrizione |
|-------|-------|--------|-------------|
| **Clawdinho** 🏄 | Main AI / Coordinatore | Office | Il boss. Coordina tutto, parla con Mattia, delega ai sub-agent |
| **Onde-bot** 🌊 | Brother Agent | Lounge | Sub-agent per task paralleli, autonomo ma coordinato da Clawdinho |

### ✍️ Creative Team
| Agent | Ruolo | Stanza | Descrizione |
|-------|-------|--------|-------------|
| **Editore Capo** | Editorial Director | Office | Supervisiona contenuti editoriali |
| **Pina Pennello** | Illustratrice | Studio | Crea illustrazioni per libri |
| **Gianni Parola** | Scrittore | Library | Scrive testi e storie |

### ⚙️ Tech Team
| Agent | Ruolo | Stanza | Descrizione |
|-------|-------|--------|-------------|
| **Engineering Dept** | Dev Lead | Lab | Sviluppo e architettura |
| **QA Test Engineer** | Quality | Lab | Testing e validazione |
| **Automation Architect** | DevOps | Lab | CI/CD, automazioni |

### 📱 Media & PR
| Agent | Ruolo | Stanza | Descrizione |
|-------|-------|--------|-------------|
| **OndePR** | Social Media | Lounge | Gestisce presence social |
| **Video Factory** | Video Production | Studio | Crea contenuti video |
| **Sally** | Assistant | Office | Supporto generale |

### 🎮 Future: CEO & Strategy
| Agent | Ruolo | Stanza | Descrizione |
|-------|-------|--------|-------------|
| **CEO Orchestrator** | Strategy | Office | Visione e pianificazione |

## Roadmap

### Phase 1: Foundation (Attuale) ✅
- [x] UI 2D con stanze isometriche
- [x] Agenti che si muovono nelle stanze
- [x] Sistema task (assign, status, completion)
- [x] Chat con agenti (ask questions)
- [x] Stato real-time (working/idle)

### Phase 2: Real Agent Integration 🔄
- [ ] Aggiungere Clawdinho e Onde-bot come agenti visuali
- [ ] Connettere status reale da Clawdbot sessions
- [ ] Mostrare cosa sta facendo Clawdinho in tempo reale
- [ ] Log attività live per ogni agente
- [ ] Notifiche quando un agente completa un task

### Phase 3: Enhanced Interaction
- [ ] Voice input per assegnare task
- [ ] Voice output (TTS) per risposte agenti
- [ ] Command palette globale (⌘K)
- [ ] Task dependencies e workflow
- [ ] Gantt/timeline view dei task

### Phase 4: Gamification
- [ ] XP e livelli per agenti (basati su task completati)
- [ ] Achievements/badges
- [ ] Daily/weekly goals con progress bar
- [ ] "Mood" degli agenti basato su workload
- [ ] Celebrazioni animate quando task completati

### Phase 5: VR Ready
- [ ] Export scene per WebXR
- [ ] 3D environment (beach office, futuristic HQ)
- [ ] Spatial audio
- [ ] Hand tracking per interazioni
- [ ] Integrazione con Bender AI per generare ambienti

## Tech Stack

### Current (2D Web)
- **Frontend:** Next.js + React + Tailwind
- **State:** React hooks + polling API
- **Backend:** Cloudflare Workers (edge)
- **Database:** D1 (SQLite on edge)
- **Auth:** NextAuth

### Future (VR)
- **3D Engine:** Three.js / React Three Fiber
- **VR Runtime:** WebXR
- **Scene Gen:** Bender AI (generative 3D)
- **Voice:** Whisper (input) + ElevenLabs (output)
- **Real-time:** WebSocket per sync stato

## API Integration

### Agent Status Flow
```
Clawdbot Gateway
    ↓
/api/sync (polling 10-15s)
    ↓
FreeRiverHouse.tsx
    ↓
Visual agents update
```

### Task Flow
```
User clicks agent → Creates task via /api/agent-tasks
    ↓
Task stored in D1
    ↓
Clawdbot polls /api/agent-tasks?status=pending
    ↓
Agent claims task → status: in_progress
    ↓
Agent completes → status: done, result: "..."
    ↓
UI updates automatically
```

## Design Principles

1. **Real-time First** - Tutto deve aggiornarsi live, no refresh
2. **Mobile First** - Funziona su telefono (touch friendly)
3. **Delightful** - Animazioni smooth, feedback visivo, micro-interactions
4. **Private** - Solo per Mattia (auth required)
5. **Scalable** - Pronto per crescere verso VR

## Files & Structure

```
apps/surfboard/
├── src/
│   ├── app/
│   │   ├── house/page.tsx      # Main dashboard
│   │   └── frh/page.tsx        # Alternative view
│   ├── components/
│   │   ├── FreeRiverHouse.tsx  # Core component
│   │   └── AgentsPanel.tsx     # Agent list
│   └── lib/
│       └── agents.ts           # Agent configs
├── public/
│   └── house/
│       ├── agents/             # Agent avatars
│       └── rooms/              # Room backgrounds
```

---

*"Il futuro è una riunione in spiaggia VR dove parliamo di task e coordiniamo agenti AI."*
— Mattia & Clawdinho, 2025
