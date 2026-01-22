# Agent Worker - Installazione su Mac M1

## 1. Copia i file sul Mac target

```bash
# Dal Mac dove hai il repo
scp -r /Users/mattiapetrucciani/CascadeProjects/Onde/packages/agent-worker USER@MAC_IP:~/Onde/packages/
```

Oppure clona il repo:
```bash
git clone https://github.com/FreeRiverHouse/Onde.git ~/Onde
```

## 2. Installa dipendenze

```bash
cd ~/Onde/packages/agent-worker
npm install
npx tsc index.ts --outDir dist --esModuleInterop --resolveJsonModule
```

## 3. Configura il LaunchAgent

Modifica `com.onde.agent-worker.plist`:
- Sostituisci `YOUR_USERNAME` con il tuo username
- Sostituisci `YOUR_API_KEY_HERE` con la tua Anthropic API key

```bash
# Verifica il path di node
which node
# Se diverso da /usr/local/bin/node, aggiorna il plist
```

## 4. Crea directory logs

```bash
mkdir -p ~/Onde/packages/agent-worker/logs
```

## 5. Installa il LaunchAgent

```bash
cp com.onde.agent-worker.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.onde.agent-worker.plist
```

## 6. Verifica che funzioni

```bash
# Controlla se gira
launchctl list | grep onde

# Guarda i log
tail -f ~/Onde/packages/agent-worker/logs/stdout.log
```

## Comandi utili

```bash
# Stop
launchctl unload ~/Library/LaunchAgents/com.onde.agent-worker.plist

# Start
launchctl load ~/Library/LaunchAgents/com.onde.agent-worker.plist

# Restart
launchctl unload ~/Library/LaunchAgents/com.onde.agent-worker.plist && \
launchctl load ~/Library/LaunchAgents/com.onde.agent-worker.plist

# Status
launchctl list | grep onde
```

## Test rapido (senza LaunchAgent)

```bash
cd ~/Onde/packages/agent-worker
export ANTHROPIC_API_KEY=your_key
npm start
```
