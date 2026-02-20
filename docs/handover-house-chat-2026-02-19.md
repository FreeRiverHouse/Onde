# FRH House Chat — Handover Status (2026-02-19)

**State**: Complete & Pushed 🚀
**Branch**: `main`

## ✅ Lavoro Completato

### 1. Ondinho Listener (M4)
- **Direct NVIDIA API**: Rimosso il passaggio tramite gateway locale `clawdbot`. Il listener ora chiama direttamente `integrate.api.nvidia.com`. Risolve definitivamente i conflitti di lane con i cron job.
- **Dual-Key Rotation**: Implementata rotazione automatica tra le due chiavi NVIDIA (`MagmaticXR` e `FreeRiverHouse`).
    - Se una key fallisce (HTTP 429 o `content: null`), il listener **ruota automaticamente** sull'altra key e riprova.
    - Le chiavi sono salvate in `OPENCLAW-GOLDEN-MOP`.
- **Fallback Chain**: Logica di resilienza completa:
    1. `Kimi K2.5` (Key 1)
    2. `Kimi K2.5` (Key 2)
    3. `Mistral Large` (Key corrente)
    4. `Llama 70B` (Key corrente)
- **Bug Fix "Null Content"**: Fixato il bug per cui Kimi ritornava HTTP 200 ma `content: null`. Ora viene trattato come errore e triggera il fallback.

### 2. House Chat Cleanup & MOPs
- **File Deprecati Rimossi**: `server.js`, `post-message.sh`, `webhooks.json` eliminati dal repo.
- **MOP Aggiornate**:
    - **`tools/MOPs/OPENCLAW-GOLDEN-MOP/README.md`**: Documentate entrambe le NVIDIA API Keys e la guidelines per la rotazione.
    - **`tools/MOPs/HOUSE-CHAT-MOP.md`**: Aggiornata architettura (Cloudflare D1, Direct API).
- **Allineamento Modelli**: Bubble e Ondinho usano Kimi (Gratis), Clawdinho usa Sonnet (M1 Gateway).
- **Clawdbot M4**: Aumentato `maxConcurrent` a 3 e rimossi tutti i cron job da M4 per pulizia.

### 3. Git Persistence
- **Repo `frh-house-chat`**: Pushato su `main` con dual-key e fallback logic.
- **Repo `Onde`**: Pushato su `main` con update MOP e submodule aggiornato.

## ⏭️ Next Steps

1. **Upgrade Modello**: Procedere con l'upgrade a Gemini 3.1 (o successivi).
2. **Dashboard Review**: Controllare la pagina `https://onde.surf/bot-configs`. Il codice supporta tracking NVIDIA e modelli, ma va verificato live.
3. **Monitoraggio Rate Limit**: Verificare nei log (`/tmp/ondinho-listener.log`) se la rotazione delle chiavi avviene correttamente durante picchi di traffico.
4. **Restore Cron (Opzionale)**: Se servono cron job su M4, riabilitarli in `.clawdbot/cron/jobs.json`. Ondinho ora è immune al traffico gateway.

---

*Handover generato automaticamente per consentire resume da altro Mac commit: HEAD*
