# 🎮 Game User System - Piano Tecnico

## Stato Attuale dei Giochi

### Architettura
I giochi su onde.la seguono due pattern:

1. **Giochi statici** (`apps/surfboard/public/static-games/`) — HTML/JS monolitici serviti da Cloudflare Pages
2. **App standalone** (`apps/moonlight-house/`, `apps/skin-creator/`) — React/Vite, buildate e copiate come static assets

### Catalogo Giochi (da `apps/surfboard/src/app/games/page.tsx`)

| Gioco | Tipo | Status | localStorage Attuale |
|-------|------|--------|---------------------|
| Minecraft Skin Creator | Next.js static export | beta | `minecraft-skin-autosave`, `minecraft-my-skins`, `minecraft-skin-ai-history`, `skin-creator-achievements` |
| Moonlight Magic House | React/Vite (14k+ LOC) | beta | `moonlight-house-save` (salvataggio completo: stats, achievements, costumi, toybox, diario, ecc.) |
| Science Lab | HTML statico | beta | `scienceLab_discovered` |
| Code Builder | HTML statico | beta | `codeBuilder_completed` |
| Story Creator | HTML statico | beta | `storyCreator_stories` |
| Ocean Explorer | HTML statico | beta | `oceanExplorer_discovered` |
| VR Reader | HTML statico | alpha | nessuno |

### Cosa funziona già
- ✅ Ogni gioco ha il **proprio sistema di salvataggio** in localStorage
- ✅ Moonlight House ha un save system molto maturo (stats, achievements, costumi, toybox, diario, friend code, personality)
- ✅ Skin Creator ha achievements e autosave
- ✅ I giochi statici salvano progresso (scoperte/livelli completati)
- ✅ `onde-portal` ha un settings system (`onde-settings`) con export/import

### Cosa manca
- ❌ **Nessun concetto di "utente"** — tutto è anonimo e device-locked
- ❌ **Nessuna connessione tra giochi** — ogni gioco è un silo
- ❌ **Nessun tracking** — non sappiamo quanti giocatori ci sono
- ❌ **Nessuna portabilità** — cambi device = perdi tutto
- ❌ **Nessuna leaderboard / social** — non puoi confrontarti con altri

---

## Proposta Tecnica: `onde-gamer` SDK

### Filosofia
- **Zero-friction**: niente registrazione, niente email, niente password
- **Progressive**: username opzionale, si può giocare senza
- **Non-invasivo**: i giochi esistenti continuano a funzionare senza modifiche
- **Incrementale**: localStorage oggi, sync backend domani

### Architettura

```
┌─────────────────────────────────────────────┐
│              onde-gamer.js                   │
│         (modulo JS condiviso)                │
├─────────────┬───────────────┬───────────────┤
│  Identity   │   Progress    │   Analytics   │
│  Manager    │   Manager     │   Tracker     │
├─────────────┴───────────────┴───────────────┤
│            localStorage / cookie             │
├─────────────────────────────────────────────┤
│     (futuro) Cloudflare KV / D1 sync        │
└─────────────────────────────────────────────┘
```

### 1. Identity Manager

```javascript
// Generazione automatica di un ID anonimo (UUID v4)
// Username opzionale — prompt amichevole al primo gioco
// Avatar auto-generato (emoji-based)

onde.gamer.id       // "g_a1b2c3d4" (generato automaticamente)
onde.gamer.username // "LunaFan42" (scelto dall'utente o null)
onde.gamer.avatar   // "🐰" (scelto o random)
```

**Flusso utente:**
1. Primo accesso a un gioco → Si genera un `gamerId` silenziosamente
2. Quando il gioco lo richiede (es. leaderboard, condivisione) → prompt amichevole: "Come ti vuoi chiamare?"
3. Username salvato in localStorage, condiviso tra tutti i giochi (stesso dominio)
4. Mai obbligatorio — il gioco funziona anche senza

### 2. Progress Manager

```javascript
// API unificata per salvare/caricare progressi
onde.gamer.save('moonlight-house', { coins: 150, level: 5, ... })
onde.gamer.load('moonlight-house') // → { coins: 150, level: 5, ... }

// Cross-game stats aggregate
onde.gamer.stats // { totalGamesPlayed: 4, totalPlaytime: 120, ... }
```

**Storage:**
- `onde-gamer-identity` — ID + username + avatar + createdAt
- `onde-gamer-stats` — stats aggregate cross-game
- `onde-gamer-{gameId}` — progressi specifici per gioco
- I giochi esistenti continuano a usare le LORO chiavi — il sistema legge anche quelle

### 3. Analytics Tracker (leggero)

```javascript
// Tracking minimale, privacy-first
onde.gamer.track('game_start', { game: 'moonlight-house' })
onde.gamer.track('achievement', { game: 'skin-creator', name: 'first-skin' })
```

**Fase 1 (localStorage):**
- Conta sessioni di gioco per gioco
- Tempo di gioco totale
- Achievements sbloccati

**Fase 2 (backend Cloudflare):**
- Beacon API per invio anonimo
- Cloudflare Analytics Engine (gratis) o KV per aggregati
- Nessun dato personale — solo conteggi

---

## Implementazione: `onde-gamer.js`

### File: `apps/surfboard/public/static-games/onde-gamer.js`

Modulo JS vanilla (no framework dependency) che qualsiasi gioco può includere:

```html
<script src="/static-games/onde-gamer.js"></script>
```

O per giochi React/Vite:
```javascript
import { OndeGamer } from '/static-games/onde-gamer.js'
```

### API Pubblica

```javascript
// === IDENTITY ===
OndeGamer.getId()                    // string - gamer ID (auto-generated)
OndeGamer.getUsername()              // string | null
OndeGamer.setUsername(name)          // void - salva username
OndeGamer.getAvatar()               // string (emoji)
OndeGamer.setAvatar(emoji)          // void
OndeGamer.getProfile()              // { id, username, avatar, createdAt, stats }
OndeGamer.promptUsername(options?)   // Promise<string|null> - mostra prompt UI

// === PROGRESS ===
OndeGamer.save(gameId, data)         // void - salva progressi gioco
OndeGamer.load(gameId)               // object | null - carica progressi
OndeGamer.clear(gameId)              // void - cancella progressi gioco

// === STATS (cross-game) ===
OndeGamer.getStats()                 // { totalGames, totalPlaytime, ... }
OndeGamer.startSession(gameId)       // void - inizio sessione di gioco
OndeGamer.endSession(gameId)         // void - fine sessione (salva tempo)

// === UI COMPONENTS ===
OndeGamer.showProfileBadge(container?) // Mostra badge utente nell'angolo
OndeGamer.showUsernamePrompt()        // Modal per scegliere/cambiare nome
```

### Username Prompt UI

Modal CSS-in-JS minimalista, tema Onde (dark, teal accents):

```
┌──────────────────────────────┐
│     🎮 Scegli il tuo nome!  │
│                              │
│  ┌──────────────────────┐    │
│  │ _                    │    │
│  └──────────────────────┘    │
│                              │
│  Avatar: 🐰 🦊 🐱 🐶 🦄 🐸  │
│                              │
│    [ Gioca! ]  [ Dopo ]      │
└──────────────────────────────┘
```

- Non bloccante — "Dopo" chiude e gioca anonimamente
- Validazione soft (2-20 chars, no HTML)
- Si adatta al tema del gioco genitore

---

## Step di Implementazione

### Fase 1: Core SDK (localStorage only) ✅ DA FARE ORA
1. Creare `apps/surfboard/public/static-games/onde-gamer.js`
2. Implementare Identity Manager (ID, username, avatar)
3. Implementare Progress Manager (save/load)
4. Implementare Stats tracker locale
5. Creare UI prompt username (CSS-in-JS, modal)
6. Creare profile badge component

### Fase 2: Integrazione Giochi
1. Aggiungere `<script>` ai giochi statici (science-lab, code-builder, ocean-explorer, story-creator)
2. Integrare in moonlight-house (leggere/scrivere save data esistente)
3. Integrare in skin-creator
4. Aggiungere profile badge alla games page

### Fase 3: Backend Sync (Cloudflare)
1. Cloudflare D1 database: `gamers`, `progress`, `sessions`
2. Worker API: `/api/gamer/sync` — push/pull progressi
3. Opzionale: leaderboard per gioco
4. Export code: codice 6-char per trasferire profilo tra device

### Fase 4: Social Features
1. Leaderboard per gioco nella games page
2. Achievement wall globale
3. "Amici" via friend code (come moonlight-house già fa)
4. Stickers/badges sbloccabili cross-game

---

## Compatibilità con Sistema Esistente

Il SDK **non rompe nulla**. I giochi esistenti continuano a funzionare com'è.

L'integrazione è graduale:
- **Livello 0** (nessuna modifica): Il SDK legge le chiavi localStorage esistenti per popolare stats
- **Livello 1** (1 riga): `<script src="/static-games/onde-gamer.js"></script>` — abilita il profile badge
- **Livello 2** (poche righe): `OndeGamer.save()` / `OndeGamer.load()` al posto di `localStorage.setItem/getItem` diretto
- **Livello 3** (più lavoro): Integrazione piena con achievements cross-game, leaderboard, ecc.

---

## Note Tecniche

- **Dominio**: tutto sotto `onde.surf` → localStorage condiviso tra tutti i giochi ✅
- **Size target**: < 10KB minified per `onde-gamer.js`
- **Zero dependencies**: vanilla JS, niente framework
- **ESM + IIFE**: funziona sia con `<script>` che con `import`
- **Kid-friendly**: UI grande, colorata, emoji, niente testo piccolo
