# Deploy Onde Approve su Apple Watch Fisico

## Prerequisiti

1. **Mac con Xcode 15+** installato
2. **Apple Watch** paired con iPhone
3. **iPhone** con app Watch installata
4. **Apple Developer Account** (anche gratuito funziona per test)
5. **XcodeGen** installato (`brew install xcodegen`)

---

## Step 1: Generare il Progetto Xcode

```bash
cd /Users/mattia/Projects/Onde/apps/onde-approve-watch
xcodegen generate
```

Questo crea `OndeApprove.xcodeproj`.

---

## Step 2: Configurare Signing

1. Apri `OndeApprove.xcodeproj` in Xcode
2. Vai su Project → Signing & Capabilities
3. Seleziona il tuo Team (Apple ID)
4. Xcode generera automaticamente un provisioning profile

**Se usi account gratuito:**
- L'app funziona per 7 giorni, poi va reinstallata
- Per uso permanente serve Apple Developer Program ($99/anno)

---

## Step 3: Connettere Apple Watch

1. Connetti iPhone al Mac via cavo USB
2. Assicurati che Watch e iPhone siano paired
3. In Xcode, seleziona:
   - Scheme: `OndeApprove Watch App`
   - Destination: `[Nome] Watch`

---

## Step 4: Build & Run

1. Premi `Cmd + R` oppure click su Play
2. Xcode builda e installa su Watch
3. Prima installazione puo richiedere 2-3 minuti
4. L'app appare nel menu Watch

---

## Step 5: Configurare API

All'avvio dell'app:

1. Swipe left per Settings
2. Inserisci l'URL dell'Agent Queue API:
   - Se in locale: `http://192.168.1.X:3002` (IP del Mac)
   - Se con ngrok: `https://abc123.ngrok.io`
3. Salva

---

## Troubleshooting

### "Unable to install app"
- Verifica che Watch sia sbloccato e carico
- Riavvia Watch e riprova
- Verifica che iPhone e Watch siano sulla stessa rete WiFi del Mac

### App non appare su Watch
- Vai su iPhone → Watch app → Installed on Apple Watch
- Forza sync: Watch app → General → Reset → Reset Sync Data

### Signing errors
- Xcode → Preferences → Accounts → assicurati che l'account sia loggato
- Cambia Bundle ID se conflitto con altra app

### API non raggiungibile
- Verifica che Agent Queue sia in esecuzione
- Verifica che Mac e Watch siano sulla stessa rete
- Se usi ngrok, assicurati che il tunnel sia attivo

---

## Distribuzione Permanente

### Opzione 1: TestFlight (raccomandato)
1. Archivio in Xcode: Product → Archive
2. Upload su App Store Connect
3. Aggiungi tester interni/esterni
4. Installa via TestFlight

### Opzione 2: App Store
1. Crea app su App Store Connect
2. Prepara screenshot e descrizione
3. Submit per review
4. Pubblicazione dopo approvazione Apple

### Opzione 3: Enterprise Distribution
- Richiede Apple Developer Enterprise Program
- Solo per uso interno aziendale

---

## Checklist Pre-Deploy

- [ ] Xcode installato e aggiornato
- [ ] Apple Watch paired con iPhone
- [ ] Progetto Xcode generato con xcodegen
- [ ] Signing configurato correttamente
- [ ] Bundle ID unico
- [ ] Icon e assets presenti
- [ ] Agent Queue API funzionante
- [ ] Testato su Simulator prima del device

---

*Creato: 2026-01-09*
*Task: handsfree-003*
