# OpenClaw (ClawdBot) Setup - macOS Catalina (10.15)

**Data:** 2026-02-16
**Status:** IN PROGRESS
**Machine:** MacBook Pro Catalina (Intel)

## Problema: Homebrew non funziona

Catalina (10.15) non è più supportata da Homebrew. Le dipendenze di `openclaw-cli`
(z3, ada-url, llvm, etc.) non compilano. **NON usare `brew install openclaw-cli`.**

## Soluzione: npm + Node 20

OpenClaw funziona con **Node 20 LTS** (testato). Node 20 ha binari precompilati
per Catalina. Node 22+ richiede macOS 11+.

> **Bonus:** C'è un [bug noto](https://github.com/openclaw/openclaw/issues/7519)
> con Node 22 che rompe il Telegram long-polling. Node 20 è più stabile.

## Setup Rapido

```bash
# Usa lo script automatico:
cd ~/Projects/Onde/tools/clawdbot-local-llm
./setup-catalina.sh
```

## Setup Manuale

### Step 1: Installa nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

Chiudi e riapri il terminale.

### Step 2: Installa Node 20

```bash
nvm install 20
nvm use 20
nvm alias default 20
node --version   # v20.x.x
```

### Step 3: Installa OpenClaw

```bash
npm install -g openclaw@latest
```

Se hai errori con `sharp`:
```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```

### Step 4: Verifica PATH

```bash
openclaw --version
```

Se "command not found":
```bash
echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Step 5: Onboarding

```bash
openclaw onboard --install-daemon
```

### Step 6: Verifica

```bash
openclaw doctor
openclaw status
```

## Configurazione Modelli Locali (Opzionale)

Se vuoi usare modelli locali con Ollama:

### Installa Ollama

Download da: https://ollama.com/download/mac
(Il .pkg installer funziona su Catalina)

```bash
# Dopo l'installazione:
ollama pull qwen2.5:7b-instruct-q4_K_M
```

### Avvia Wrapper

```bash
cd ~/Projects/Onde/tools/clawdbot-local-llm
node wrappers/m1-qwen-wrapper.js
```

### Configura OpenClaw per modello locale

Edita `~/.clawdbot/clawdbot.json`:

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "tinygrad": {
        "baseUrl": "http://127.0.0.1:11435/v1",
        "apiKey": "tinygrad",
        "api": "openai-completions",
        "models": [{
          "id": "qwen2.5:7b-instruct-q4_K_M",
          "name": "Qwen2.5-7B (Ollama Q4)",
          "contextWindow": 32768,
          "maxTokens": 4096
        }]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "tinygrad/qwen2.5:7b-instruct-q4_K_M",
        "fallbacks": ["anthropic/claude-opus-4-5"]
      }
    }
  }
}
```

## Differenze da M1/M4

| Feature | Catalina (Intel) | M1/M4 (Apple Silicon) |
|---------|-----------------|----------------------|
| Node.js | 20 LTS (via nvm) | 22+ (brew o nvm) |
| GPU | Intel/AMD discrete | Apple GPU (MLX/Metal) |
| Ollama | CPU only (lento) | GPU accelerato |
| TinyGrad | Non supportato | Supportato (AMD eGPU) |
| MLX | Non disponibile | Nativo Apple Silicon |

## Troubleshooting

### "command not found: openclaw"
```bash
# Verifica dove npm installa i globali
npm prefix -g
ls "$(npm prefix -g)/bin/"

# Aggiungi al PATH
export PATH="$(npm prefix -g)/bin:$PATH"
```

### "Error: Requires Node 22+"
OpenClaw dovrebbe funzionare con Node 20. Se questa versione specifica
richiede 22+, prova:
```bash
# Compila Node 22 da sorgente (lento, ~30 min)
nvm install 22 --source
```

### npm install fallisce
```bash
# Pulisci cache
npm cache clean --force

# Riprova con verbose
npm install -g openclaw@latest --verbose
```

## Riferimenti

- [OpenClaw Install Docs](https://docs.openclaw.ai/install)
- [OpenClaw npm](https://www.npmjs.com/package/openclaw)
- [Node.js 22 on older macOS](https://tech.amikelive.com/node-1687/how-to-install-node-js-22-on-macos-high-sierra/)
- [Node 22 Telegram bug](https://github.com/openclaw/openclaw/issues/7519)
