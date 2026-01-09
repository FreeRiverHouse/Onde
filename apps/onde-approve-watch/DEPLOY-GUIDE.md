# Guida Deploy su Apple Watch Reale

## Prerequisiti

1. **Apple Developer Account** (gratuito per sviluppo personale)
2. **Xcode** installato su Mac
3. **Apple Watch** accoppiato con iPhone
4. **iPhone** con app Watch installata

---

## Step 1: Configura Developer Account

### Se non hai un Apple Developer Account:
1. Vai su https://developer.apple.com
2. Accedi con il tuo Apple ID
3. Accetta i termini (account gratuito per sviluppo personale)

### In Xcode:
1. Apri Xcode > Settings > Accounts
2. Clicca "+" e aggiungi il tuo Apple ID
3. Xcode creerà automaticamente un Personal Team

---

## Step 2: Genera il Progetto Xcode

```bash
# Vai nella cartella del progetto
cd /Users/mattia/Projects/Onde/apps/onde-approve-watch

# Installa XcodeGen se non l'hai
brew install xcodegen

# Genera il progetto Xcode
xcodegen generate
```

Questo creerà `OndeApprove.xcodeproj`.

---

## Step 3: Configura Signing

1. Apri `OndeApprove.xcodeproj` in Xcode
2. Seleziona il progetto nel Navigator (pannello sinistro)
3. Seleziona il target "OndeApprove WatchKit App"
4. Tab "Signing & Capabilities"
5. Spunta "Automatically manage signing"
6. Seleziona il tuo Personal Team
7. Assicurati che il Bundle Identifier sia unico (es. `com.mattia.OndeApprove`)

**Ripeti per il target "OndeApprove Watch App Extension"** se presente.

---

## Step 4: Collega Apple Watch

### Sul Mac:
1. Assicurati che iPhone sia connesso alla stessa rete WiFi del Mac
2. L'Apple Watch deve essere sbloccato e accoppiato

### In Xcode:
1. Vai su Window > Devices and Simulators
2. Il tuo iPhone dovrebbe apparire
3. L'Apple Watch appare sotto l'iPhone

---

## Step 5: Build & Install

1. In Xcode, seleziona come destinazione: **[Nome Watch] Watch App**
2. Premi **Run (⌘R)**
3. La prima volta Xcode compila e installa l'app
4. Potrebbe richiedere alcuni minuti

### Errori Comuni:

**"Unable to install app"**
- Verifica che Watch sia sbloccato
- Prova a riavviare Watch e iPhone
- Controlla connessione WiFi

**"Code signing error"**
- Verifica che il Bundle ID sia unico
- Prova a cambiare Bundle ID (es. aggiungi .dev alla fine)

**"Watch not paired"**
- Assicurati che Watch sia accoppiato in app Watch su iPhone
- Developer Mode attivo su Watch: Settings > Privacy & Security > Developer Mode

---

## Step 6: Abilita Developer Mode su Watch

Su watchOS 9+, devi abilitare Developer Mode:

1. Su Apple Watch: Settings > Privacy & Security > Developer Mode
2. Attiva Developer Mode
3. Riavvia Watch quando richiesto

---

## Step 7: Trust Developer su iPhone

Dopo la prima installazione:

1. Su iPhone: Settings > General > VPN & Device Management
2. Trova il tuo Developer App certificate
3. Tap per fidarti

---

## Step 8: Configura API Endpoint

L'app deve connettersi all'Agent Queue API.

### Per test locale:

1. Avvia l'Agent Queue sul Mac:
```bash
cd /Users/mattia/Projects/Onde/packages/agent-queue
npx ts-node src/server.ts
```

2. Trova l'IP del Mac:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Es: 192.168.1.50
```

3. Nell'app Watch, vai in Settings e inserisci:
```
http://192.168.1.50:3002
```

### Per produzione:
Usa ngrok o deploy su server pubblico.

---

## Verifica Installazione

1. Apri l'app sull'Apple Watch
2. Dovresti vedere la lista dei task (vuota se nessun task bloccato)
3. Prova il feedback aptico: l'app dovrebbe vibrare al refresh

---

## Troubleshooting

### App non appare su Watch
- Attendi 2-3 minuti dopo l'install
- Riavvia Apple Watch
- Controlla app Watch su iPhone > Le mie app

### Connessione API fallisce
- Verifica che Mac e Watch siano sulla stessa rete
- Prova a pingare l'IP del Mac dall'iPhone
- Assicurati che firewall Mac permetta connessioni sulla porta 3002

### App crasha all'avvio
- Controlla console Xcode per errori
- Verifica configurazione signing
- Reinstalla l'app

---

## Note

- L'app rimane installata 7 giorni con account gratuito
- Per rimanere installata indefinitamente, serve Apple Developer Program ($99/anno)
- Le notifiche push richiedono setup aggiuntivo (vedere task handsfree-001)

---

*Task: handsfree-003*
*Ultimo aggiornamento: 2026-01-09*
