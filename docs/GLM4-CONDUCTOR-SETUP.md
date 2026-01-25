# GLM-4.7 + Conductor Setup Guide

> **"Sostituisci Claude con un'alternativa 20x più economica"** - ironico, visto che te lo sta spiegando Claude stesso. 😏

## Overview

Questo setup permette di:
- Usare **GLM-4.7 Flash** (di Zhipu AI via Z.ai) invece di Claude
- Runnare **multipli agenti** in parallelo con **Conductor**
- Risparmiare ~95% sui costi API per task di coding
- Gestire task lunghi con git worktrees

## Performance Comparison

| Model | Input $/M tokens | Output $/M tokens | Speed | Quality |
|-------|------------------|-------------------|-------|---------|
| Claude Sonnet | $3.00 | $15.00 | Fast | Excellent |
| Claude Opus | $15.00 | $75.00 | Medium | Best |
| **GLM-4.7 Flash** | $0.14 | $0.56 | Fast | Good |

**Risparmio**: ~20x rispetto a Sonnet, ~100x rispetto a Opus

---

## Passo 1: Ottieni API Key Z.ai

1. Vai su [Z.AI Open Platform](https://z.ai/model-api)
2. Registrati o loggati
3. Vai su [API Keys](https://z.ai/manage-apikey/apikey-list)
4. Genera una nuova API key
5. (Opzionale) Sottoscrivi il "GLM Coding Plan" per più concurrency

**Free Tier**: 1 concurrency (sufficiente per iniziare)

---

## Passo 2: Installa Claude Code

```bash
npm install -g @anthropic-ai/claude-code

# Verifica installazione
claude --version
```

---

## Passo 3: Configura Claude Code per GLM-4.7

### Metodo 1: Helper Automatico (Raccomandato)

```bash
npx @z_ai/coding-helper
```

Segui le istruzioni sullo schermo.

### Metodo 2: Script macOS/Linux

```bash
curl -O "https://cdn.bigmodel.cn/install/claude_code_zai_env.sh" && bash ./claude_code_zai_env.sh
```

### Metodo 3: Configurazione Manuale

Modifica `~/.claude/settings.json`:

```json
{
    "$schema": "https://json.schemastore.org/claude-code-settings.json",
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "tua_zai_api_key_qui",
        "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
        "API_TIMEOUT_MS": "3000000"
    }
}
```

**IMPORTANTE**:
- Sostituisci `tua_zai_api_key_qui` con la tua vera API key
- Il timeout lungo (3M ms = 50 min) è necessario per task complessi
- Riapri il terminale dopo le modifiche

---

## Passo 4: Installa Conductor (macOS only)

1. Scarica Conductor da [conductor.build](https://conductor.build)
2. Installa e apri l'app
3. Aggiungi il tuo repository Git
4. La configurazione GLM-4.7 dal Passo 3 si applica automaticamente

### Come funziona Conductor

- **Git Worktrees**: Ogni agente lavora su un branch separato
- **Plan Mode**: Crea piani di implementazione con GLM-4.7
- **Background Agents**: Task lunghi senza bloccare il terminale
- **PR Generation**: Crea automaticamente Pull Request per review

---

## Passo 5: Workflow Multi-Agent

### Lancio Agenti in Parallelo

```bash
# In Conductor UI:
# 1. Crea nuovo agente
# 2. Assegna task specifico
# 3. L'agente usa git worktree per lavorare isolato
# 4. Monitora progresso dalla UI
```

### Esempio Workflow

1. **Plan Mode**: Chiedi a GLM-4.7 di creare un piano
2. **Review Plan**: Verifica i passaggi proposti
3. **Execute**: Conductor crea branch + worktree
4. **Monitor**: Segui il progresso dalla UI
5. **PR**: Conductor genera PR per review
6. **Merge**: Approva e mergia

---

## Integrazione con Onde

Nel progetto Onde, esiste già un client Z.ai in:
```
/packages/core/src/llm/zai-client.ts
```

### Uso Programmatico

```typescript
import { ZaiClient } from '@onde/core';

const zai = new ZaiClient(process.env.ZAI_API_KEY);

// Chat semplice
const response = await zai.chat("Scrivi una poesia sul mare");

// Per social post
const post = await zai.generatePost("Promuovi Meditations", "onde");

// Per scrittura creativa
const text = await zai.writeCreative("Storia per bambini", "bambini");

// Traduzione
const translated = await zai.translate("Hello world", "italiano");
```

---

## Troubleshooting

### "API key not configured"
- Verifica che `ZAI_API_KEY` sia settata in `.env` o direttamente in `settings.json`

### Timeout su task lunghi
- Aumenta `API_TIMEOUT_MS` in settings.json (max consigliato: 3600000 = 1 ora)

### Rate limiting
- Free tier ha 1 concurrency - aspetta che il task finisca prima del prossimo
- Oppure sottoscrivi un piano a pagamento per più concurrency

### Conductor non vede la configurazione
- Riavvia Conductor dopo aver modificato settings.json
- Verifica che le variabili d'ambiente siano caricate correttamente

---

## Links Utili

- [Z.ai Open Platform](https://z.ai)
- [Z.ai API Documentation](https://z.ai/model-api)
- [Conductor](https://conductor.build)
- [Claude Code](https://github.com/anthropics/claude-code)
- [GLM-4.7 Flash Specs](https://z.ai/model/glm-4.7-flash)

---

*Ultimo aggiornamento: 2026-01-25*
*Scritto ironicamente da Claude, che sta documentando la propria sostituzione* 😏
