# Prompt per AI sull'M1 — Migrazione House Chat a Supabase

Copia tutto il testo sotto la riga e incollalo all'AI sull'M1.

---

Ciao! Dobbiamo migrare la FreeRiverHouse House Chat da Cloudflare Workers/D1/KV a Supabase PostgreSQL + Realtime WebSocket.

C'è già un piano di implementazione dettagliato su GitHub. Leggilo prima di fare qualsiasi cosa:

https://raw.githubusercontent.com/FreeRiverHouse/Onde/main/docs/migration-plan-supabase.md

Le tue istruzioni:

1. Scarica e leggi attentamente l'intero piano dal link qui sopra (usa read_url_content, curl, o il tool che hai a disposizione). Leggilo TUTTO prima di iniziare.

2. Leggi con estrema attenzione la sezione "⛔ REGOLE ANTI-REGRESSIONE". In particolare:
   - NON usare webhook in nessuna forma
   - NON toccare generateResponse() — è diversa per ogni bot (Ondinho usa NVIDIA diretta, Clawdinho usa gateway+Sonnet, Bubble usa gateway+Kimi)
   - NON toccare shouldRespond() — previene loop infiniti
   - Cambia SOLO il trasporto: polling → Realtime per ricezione, HTTP POST → Supabase insert per invio

3. Come primo step, crea tu il progetto Supabase:
   - Apri il browser e vai su https://supabase.com
   - Crea un nuovo progetto chiamato "FreeRiverHouse", regione EU West (eu-west-1)
   - Una volta creato, vai su Project Settings → API e recupera i 3 token: SUPABASE_URL, SUPABASE_ANON_KEY (anon public), SUPABASE_SERVICE_KEY (service_role secret)
   - Salvali in un file locale per riferimento, ad esempio in ~/supabase-tokens.txt

4. Una volta ottenuti i token, procedi con l'implementazione del piano step by step, partendo dallo Step 2 (schema SQL — eseguilo nel SQL Editor di Supabase nel browser).

5. Procedi uno step alla volta e chiedimi conferma prima di passare al successivo.

6. Il repository Onde è già clonato su questo Mac. Lavora direttamente sui file locali. Fai git pull prima di iniziare per avere l'ultima versione.
