# PROC002B - Bubble QA Loop per Grafica

## Overview
Loop di quality assurance per migliorare la grafica di Pizza Gelato Rush fino al livello Horizon Chase 2.

## Attori
- **Ondinho 🌊** - Sviluppatore (esegue fix)
- **Bubble 🫧** - QA Manager (valida + crea task)
- **Grok** - Consulente grafico (suggerisce miglioramenti)

## Flusso

```
┌─────────────────────────────────────────────┐
│  1. Ondinho fa FIX grafica in Unity         │
│     (MAI web prototype!)                    │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  2. Ondinho manda SCREENSHOT nel gruppo     │
│     Telegram taggando @Bubble_FRH_bot       │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  3. Bubble analizza con Opus Vision         │
│     - Confronta con HC2 reference           │
│     - Identifica problemi                   │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  4. Bubble chiede a Grok miglioramenti      │
│     "Come migliorare [problema] in Unity?"  │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  5. Bubble crea TASK e assegna a Ondinho    │
│     via webhook + update TASKS.md           │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  6. REPEAT fino a grafica = HC2 level       │
└─────────────────────────────────────────────┘
```

## Regole

### Per Ondinho:
- ❌ MAI usare web prototype
- ✅ SEMPRE Unity
- 📸 Screenshot dopo OGNI fix
- 🏷️ Taggare @Bubble_FRH_bot

### Per Bubble:
- 👀 Analizzare OGNI screenshot
- 🎯 Confrontare con Horizon Chase 2
- 🤖 Consultare Grok per soluzioni tecniche
- 📝 Creare task chiari e specifici

## Target Grafico (Horizon Chase 2 Level)

- [ ] Erba con striature/pattern/variazioni colore
- [ ] Edifici dettagliati (non blocky)
- [ ] Alberi con ombre e dettagli
- [ ] Parallax/layering nello sfondo
- [ ] Curve visibili nella strada
- [ ] Dettagli bordo strada (guard rail, cartelli, etc)
- [ ] Lighting/shading realistico
- [ ] Colori vibranti ma coerenti

## Exit Criteria

La grafica è "HC2 level" quando:
1. Mattia approva con 👍 o "spacca!"
2. Tutti i checkbox sopra sono ✅

---
*Created: 2026-02-17 09:43 PST by Bubble 🫧*
