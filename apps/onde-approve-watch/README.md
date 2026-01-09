# Onde Approve - Apple Watch App

App per approvare agenti bloccati direttamente dall'Apple Watch.

## Features

- Lista agenti bloccati in tempo reale
- **Tap per approvare** - Un tocco per sbloccare
- **Voce per parlare** - Dettatura per inviare istruzioni
- **Feedback aptico completo** - Vibrazioni per ogni azione
- **Push Notifications** - Notifica immediata quando un agente si blocca
- Pull-to-refresh per aggiornare

## Push Notifications

L'app riceve notifiche push quando un agente si blocca e richiede approvazione.

### Azioni dalla Notifica

| Azione | Descrizione |
|--------|-------------|
| **Approva** | Sblocca l'agente direttamente dalla notifica |
| **Visualizza** | Apre l'app per vedere i dettagli |

### Setup Push Notifications

Vedi [PUSH-NOTIFICATIONS-SETUP.md](./PUSH-NOTIFICATIONS-SETUP.md) per la guida completa.

## Feedback Aptico

L'app usa il feedback aptico dell'Apple Watch per comunicare lo stato delle azioni:

| Evento | Tipo Haptic | Sensazione |
|--------|-------------|------------|
| Approvazione riuscita | `.success` | Doppio tap leggero |
| Approvazione fallita | `.failure` | Vibrazione forte |
| Messaggio inviato | `.success` | Doppio tap leggero |
| Nuovo task bloccato | `.notification` | Tap di notifica |
| Tutti i task risolti | `.success` | Doppio tap leggero |
| Salvataggio settings | `.click` | Click leggero |

Questo permette di usare l'app anche senza guardare lo schermo (es. lavando i piatti).

## Setup

### 1. Genera il progetto Xcode

```bash
# Installa XcodeGen se non l'hai
brew install xcodegen

# Genera il progetto
cd apps/onde-approve-watch
xcodegen generate
```

### 2. Configura l'API

L'app si connette all'Agent Queue API. Di default usa `http://192.168.1.100:3002`.

**Per sviluppo locale:**

Opzione A - Usa ngrok:
```bash
# Nel terminale, esponi la porta 3002
ngrok http 3002

# Copia l'URL (es. https://abc123.ngrok.io)
# Inseriscilo nelle impostazioni dell'app Watch
```

Opzione B - Usa l'IP locale del Mac:
```bash
# Trova l'IP del Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Usa quell'IP nell'app (es. http://192.168.1.50:3002)
```

### 3. Avvia l'Agent Queue API

```bash
cd packages/agent-queue
npx ts-node src/server.ts
```

### 4. Build & Run

1. Apri `OndeApprove.xcodeproj` in Xcode
2. Seleziona il tuo Apple Watch come destinazione
3. Premi Run (⌘R)

## Struttura

```
OndeApprove/
├── OndeApproveApp.swift         # Entry point + App Delegate
├── ContentView.swift            # Lista task bloccate
├── TaskDetailView.swift         # Dettaglio + bottoni Approva/Parla
├── AgentQueueService.swift      # Chiamate API
├── PushNotificationService.swift # Gestione notifiche push
├── Models.swift                 # Strutture dati
└── Assets.xcassets/             # Icone e colori
```

## API Endpoints

L'app usa questi endpoint dell'Agent Queue:

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/tasks` | GET | Lista tutti i task |
| `/tasks/blocked` | GET | Solo task bloccati |
| `/tasks/:id/approve` | POST | Approva/sblocca task |
| `/tasks/:id/message` | POST | Invia messaggio all'agente |

## Roadmap

- [ ] Complication per schermo Watch
- [x] Notifiche push quando un agente si blocca
- [ ] Widget per vedere stato a colpo d'occhio
- [ ] Siri Shortcuts ("Hey Siri, approva Pina")

## Note

Questa app è parte del sistema Onde Agent Queue per gestire workflow con agenti AI.
