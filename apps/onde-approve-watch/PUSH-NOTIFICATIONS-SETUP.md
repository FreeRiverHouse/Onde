# Push Notifications Setup - Onde Approve Watch

Guida completa per configurare le notifiche push per l'Apple Watch.

## Indice

1. [Panoramica](#panoramica)
2. [Prerequisiti](#prerequisiti)
3. [Configurazione Apple Developer](#configurazione-apple-developer)
4. [Configurazione Server](#configurazione-server)
5. [Payload Notifiche](#payload-notifiche)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Panoramica

### Flusso Notifiche

```
┌─────────────┐     ┌──────────────┐     ┌─────────┐     ┌──────────────┐
│ Agent Queue │────▶│ Push Server  │────▶│  APNs   │────▶│ Apple Watch  │
│   (Node.js) │     │  (Node.js)   │     │ (Apple) │     │              │
└─────────────┘     └──────────────┘     └─────────┘     └──────────────┘
      │                    │                                    │
      │                    │                                    │
      ▼                    ▼                                    ▼
   Agente si           Invia push                         Mattia riceve
   blocca e            con payload                        notifica e
   richiede            task info                          approva
   approvazione
```

### Tipi di Notifiche

| Tipo | Categoria | Azioni | Quando |
|------|-----------|--------|--------|
| **Agente Bloccato** | `BLOCKED_TASK` | Approva, Visualizza | Agente richiede approvazione |
| **Task Completato** | `INFO` | - | Agente completa lavoro |
| **Errore Agente** | `INFO` | - | Agente incontra errore |
| **Promemoria** | `INFO` | - | Task bloccati da troppo tempo |

---

## Prerequisiti

### Apple Developer Account

- Account Apple Developer attivo ($99/anno)
- App ID registrato con Push Notifications capability
- APNs Authentication Key (.p8)

### Server

- Node.js 18+
- Libreria `@parse/node-apn` o `apn`
- HTTPS per produzione

### Watch App

- watchOS 9.0+
- Bundle ID corretto
- Push Notifications entitlement

---

## Configurazione Apple Developer

### 1. Creare App ID

1. Vai su [Apple Developer Console](https://developer.apple.com/account)
2. Certificates, Identifiers & Profiles → Identifiers
3. Clicca "+" per nuovo identificatore
4. Seleziona "App IDs" → Continue
5. Seleziona "watchOS App" → Continue
6. Inserisci:
   - Description: `Onde Approve Watch`
   - Bundle ID: `com.ondepublishing.OndeApprove.watchkitapp`
7. Capabilities: ✅ Push Notifications
8. Continue → Register

### 2. Creare APNs Key

1. Keys → "+" per nuova key
2. Key Name: `OndeApproveAPNs`
3. ✅ Apple Push Notifications service (APNs)
4. Continue → Register → Download
5. **IMPORTANTE**: Salva il file `.p8` in modo sicuro!
6. Annota il Key ID (es. `ABC123XYZ`)
7. Annota il Team ID (visibile in alto a destra)

### 3. Configurare Xcode

Nel progetto Xcode:

1. Target → Signing & Capabilities
2. "+ Capability" → Push Notifications
3. Background Modes → ✅ Remote notifications

In `Info.plist` aggiungi:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

---

## Configurazione Server

### Struttura Directory

```
packages/push-service/
├── src/
│   ├── apns.ts           # Client APNs
│   ├── server.ts         # Express server
│   └── types.ts          # TypeScript types
├── keys/
│   └── AuthKey_XXX.p8    # APNs key (gitignore!)
├── package.json
└── .env                  # Config (gitignore!)
```

### Installazione

```bash
mkdir -p packages/push-service
cd packages/push-service
npm init -y
npm install apn express dotenv typescript ts-node @types/node @types/express
```

### File .env

```env
# APNs Configuration
APNS_KEY_ID=ABC123XYZ
APNS_TEAM_ID=YOUR_TEAM_ID
APNS_BUNDLE_ID=com.ondepublishing.OndeApprove.watchkitapp
APNS_KEY_PATH=./keys/AuthKey_ABC123XYZ.p8
APNS_PRODUCTION=false

# Server
PORT=3003
AGENT_QUEUE_URL=http://localhost:3002
```

### APNs Client (apns.ts)

```typescript
// packages/push-service/src/apns.ts

import apn from 'apn';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// APNs Provider Options
const apnsOptions: apn.ProviderOptions = {
  token: {
    key: path.resolve(process.env.APNS_KEY_PATH || './keys/AuthKey.p8'),
    keyId: process.env.APNS_KEY_ID || '',
    teamId: process.env.APNS_TEAM_ID || '',
  },
  production: process.env.APNS_PRODUCTION === 'true',
};

// Create APNs provider
let provider: apn.Provider | null = null;

export function getProvider(): apn.Provider {
  if (!provider) {
    provider = new apn.Provider(apnsOptions);
  }
  return provider;
}

// Notification payload types
export interface BlockedTaskPayload {
  taskId: string;
  agentName: string;
  agentType: string;
  blockedReason: string;
  priority: 'low' | 'medium' | 'high';
}

export interface InfoPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Send blocked task notification
export async function sendBlockedTaskNotification(
  deviceToken: string,
  payload: BlockedTaskPayload
): Promise<apn.Responses> {
  const notification = new apn.Notification();

  // Alert content
  notification.alert = {
    title: `${getAgentEmoji(payload.agentType)} ${payload.agentName}`,
    subtitle: 'Agente bloccato',
    body: payload.blockedReason,
  };

  // Sound and badge
  notification.sound = 'default';
  notification.badge = 1;

  // Category for actions
  notification.category = 'BLOCKED_TASK';

  // Custom payload
  notification.payload = {
    taskId: payload.taskId,
    agentName: payload.agentName,
    agentType: payload.agentType,
    blockedReason: payload.blockedReason,
    priority: payload.priority,
    timestamp: new Date().toISOString(),
  };

  // Topic (bundle ID)
  notification.topic = process.env.APNS_BUNDLE_ID || '';

  // Priority (10 = immediate)
  notification.priority = payload.priority === 'high' ? 10 : 5;

  // Expiration (1 hour)
  notification.expiry = Math.floor(Date.now() / 1000) + 3600;

  return getProvider().send(notification, deviceToken);
}

// Send info notification
export async function sendInfoNotification(
  deviceToken: string,
  payload: InfoPayload
): Promise<apn.Responses> {
  const notification = new apn.Notification();

  notification.alert = {
    title: payload.title,
    body: payload.body,
  };

  notification.sound = 'default';
  notification.category = 'INFO';
  notification.topic = process.env.APNS_BUNDLE_ID || '';

  if (payload.data) {
    notification.payload = payload.data;
  }

  return getProvider().send(notification, deviceToken);
}

// Send silent notification (background refresh trigger)
export async function sendSilentNotification(
  deviceToken: string,
  data: Record<string, any>
): Promise<apn.Responses> {
  const notification = new apn.Notification();

  notification.contentAvailable = true;
  notification.topic = process.env.APNS_BUNDLE_ID || '';
  notification.payload = data;
  notification.priority = 5; // Silent must be priority 5

  return getProvider().send(notification, deviceToken);
}

// Helper: Get emoji for agent type
function getAgentEmoji(agentType: string): string {
  const emojis: Record<string, string> = {
    editore_capo: '📚',
    gianni_parola: '✍️',
    pina_pennello: '🎨',
    pa_agent: '🤖',
    pr_agent: '📱',
    dev_agent: '💻',
  };
  return emojis[agentType] || '🤖';
}

// Cleanup on shutdown
export function shutdown(): void {
  if (provider) {
    provider.shutdown();
    provider = null;
  }
}
```

### Server (server.ts)

```typescript
// packages/push-service/src/server.ts

import express from 'express';
import dotenv from 'dotenv';
import {
  sendBlockedTaskNotification,
  sendInfoNotification,
  sendSilentNotification,
  shutdown,
  BlockedTaskPayload,
} from './apns';

dotenv.config();

const app = express();
app.use(express.json());

// In-memory device token storage (use Redis in production!)
const deviceTokens = new Map<string, DeviceInfo>();

interface DeviceInfo {
  token: string;
  platform: string;
  appVersion: string;
  deviceModel: string;
  osVersion: string;
  registeredAt: Date;
  lastSeen: Date;
}

// MARK: - Device Registration

// Register device token
app.post('/devices/register', (req, res) => {
  const { deviceToken, platform, appVersion, deviceModel, osVersion } = req.body;

  if (!deviceToken) {
    return res.status(400).json({ error: 'deviceToken required' });
  }

  deviceTokens.set(deviceToken, {
    token: deviceToken,
    platform,
    appVersion,
    deviceModel,
    osVersion,
    registeredAt: new Date(),
    lastSeen: new Date(),
  });

  console.log(`📱 Device registered: ${deviceToken.substring(0, 16)}...`);

  res.json({ success: true, message: 'Device registered' });
});

// Unregister device token
app.post('/devices/unregister', (req, res) => {
  const { deviceToken } = req.body;

  if (deviceToken) {
    deviceTokens.delete(deviceToken);
    console.log(`📱 Device unregistered: ${deviceToken.substring(0, 16)}...`);
  }

  res.json({ success: true });
});

// List registered devices (admin)
app.get('/devices', (req, res) => {
  const devices = Array.from(deviceTokens.values()).map(d => ({
    ...d,
    token: d.token.substring(0, 16) + '...',
  }));

  res.json({ devices, count: devices.length });
});

// MARK: - Send Notifications

// Send blocked task notification to all devices
app.post('/notify/blocked', async (req, res) => {
  const payload: BlockedTaskPayload = req.body;

  if (!payload.taskId || !payload.agentName || !payload.blockedReason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const results = [];

  for (const [token, device] of deviceTokens) {
    try {
      const result = await sendBlockedTaskNotification(token, payload);

      if (result.failed.length > 0) {
        // Remove invalid tokens
        const failed = result.failed[0];
        if (failed.status === '410' || failed.response?.reason === 'Unregistered') {
          deviceTokens.delete(token);
          console.log(`🗑️ Removed invalid token: ${token.substring(0, 16)}...`);
        }
        results.push({ token: token.substring(0, 16), success: false, error: failed.response?.reason });
      } else {
        results.push({ token: token.substring(0, 16), success: true });
        device.lastSeen = new Date();
      }
    } catch (error) {
      results.push({ token: token.substring(0, 16), success: false, error: String(error) });
    }
  }

  console.log(`📤 Sent blocked notification for ${payload.agentName}: ${results.filter(r => r.success).length}/${results.length} delivered`);

  res.json({ results, sent: results.filter(r => r.success).length });
});

// Send info notification
app.post('/notify/info', async (req, res) => {
  const { title, body, data } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body required' });
  }

  const results = [];

  for (const [token, device] of deviceTokens) {
    try {
      const result = await sendInfoNotification(token, { title, body, data });

      if (result.failed.length > 0) {
        results.push({ token: token.substring(0, 16), success: false });
      } else {
        results.push({ token: token.substring(0, 16), success: true });
        device.lastSeen = new Date();
      }
    } catch (error) {
      results.push({ token: token.substring(0, 16), success: false });
    }
  }

  res.json({ results, sent: results.filter(r => r.success).length });
});

// Send silent notification (trigger background refresh)
app.post('/notify/silent', async (req, res) => {
  const data = req.body.data || {};

  const results = [];

  for (const [token] of deviceTokens) {
    try {
      const result = await sendSilentNotification(token, data);
      results.push({ success: result.failed.length === 0 });
    } catch {
      results.push({ success: false });
    }
  }

  res.json({ sent: results.filter(r => r.success).length });
});

// MARK: - Health Check

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    devices: deviceTokens.size,
    uptime: process.uptime(),
  });
});

// MARK: - Start Server

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, () => {
  console.log(`🔔 Push Notification Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  shutdown();
  server.close();
});
```

### Integrazione con Agent Queue

Nel server Agent Queue, quando un agente si blocca:

```typescript
// packages/agent-queue/src/server.ts

import axios from 'axios';

const PUSH_SERVICE_URL = process.env.PUSH_SERVICE_URL || 'http://localhost:3003';

// When an agent becomes blocked
async function notifyBlockedTask(task: AgentTask) {
  try {
    await axios.post(`${PUSH_SERVICE_URL}/notify/blocked`, {
      taskId: task.id,
      agentName: task.agentName,
      agentType: task.agentType,
      blockedReason: task.blockedReason,
      priority: task.priority,
    });
    console.log(`📲 Push notification sent for blocked task: ${task.id}`);
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

// In the task update endpoint
app.post('/tasks/:id/block', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const task = await blockTask(id, reason);

  // Send push notification
  await notifyBlockedTask(task);

  res.json({ success: true, task });
});
```

---

## Payload Notifiche

### Blocked Task Notification

```json
{
  "aps": {
    "alert": {
      "title": "🎨 Pina Pennello",
      "subtitle": "Agente bloccato",
      "body": "Serve approvazione per generare immagini copertina libro 'AIKO 3'"
    },
    "sound": "default",
    "badge": 1,
    "category": "BLOCKED_TASK",
    "mutable-content": 1
  },
  "taskId": "task-abc123",
  "agentName": "Pina Pennello",
  "agentType": "pina_pennello",
  "blockedReason": "Serve approvazione per generare immagini copertina libro 'AIKO 3'",
  "priority": "high",
  "timestamp": "2026-01-09T10:30:00Z"
}
```

### Info Notification

```json
{
  "aps": {
    "alert": {
      "title": "✅ Task completato",
      "body": "Gianni Parola ha finito di scrivere il capitolo 3"
    },
    "sound": "default",
    "category": "INFO"
  },
  "taskId": "task-xyz789",
  "completedAt": "2026-01-09T11:00:00Z"
}
```

### Silent Notification

```json
{
  "aps": {
    "content-available": 1
  },
  "action": "refresh",
  "timestamp": "2026-01-09T12:00:00Z"
}
```

---

## Testing

### Test Locale con cURL

```bash
# Register fake device token
curl -X POST http://localhost:3003/devices/register \
  -H "Content-Type: application/json" \
  -d '{"deviceToken": "abc123test", "platform": "watchos"}'

# Send test blocked notification
curl -X POST http://localhost:3003/notify/blocked \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-123",
    "agentName": "Pina Pennello",
    "agentType": "pina_pennello",
    "blockedReason": "Test notification",
    "priority": "high"
  }'

# Check health
curl http://localhost:3003/health
```

### Test con Apple Push Notification Console

Apple offre un tool online per testare push notifications:
https://developer.apple.com/notifications/push-notifications-console/

### Test su Simulator

Il simulator non supporta push notifications. Serve un device fisico.

### Test su Device Reale

1. Build & run l'app su Apple Watch fisico
2. Concedi permesso notifiche quando richiesto
3. Verifica che il device token venga registrato (log server)
4. Invia notifica di test
5. Verifica ricezione su Watch

---

## Troubleshooting

### Notifiche non arrivano

| Problema | Soluzione |
|----------|-----------|
| Device token non valido | Verifica che l'app sia registrata correttamente con APNs |
| Certificati scaduti | Rinnova APNs key su Apple Developer |
| Bundle ID sbagliato | Verifica che `notification.topic` corrisponda al Bundle ID |
| Sandbox vs Production | `APNS_PRODUCTION=true` per App Store, `false` per dev |
| Firewall blocca APNs | Apri porte 443, 2195, 2196 verso `api.push.apple.com` |

### Errori comuni APNs

| Codice | Significato | Azione |
|--------|-------------|--------|
| `400 BadDeviceToken` | Token non valido | Rimuovi token dal database |
| `403 BadCertificate` | Problema autenticazione | Verifica .p8 key |
| `410 Unregistered` | Device non registrato | Rimuovi token |
| `413 PayloadTooLarge` | Payload > 4KB | Riduci payload |

### Log utili

```bash
# Xcode Console - cerca questi log
# ✅ Registrazione OK
📱 APNs Device Token: abc123...

# ❌ Errori
❌ APNs Registration failed: ...
```

### Verifica entitlements

```bash
# Nel progetto Xcode
cat OndeApprove.entitlements
# Deve contenere:
# <key>aps-environment</key>
# <string>development</string>  (o "production" per App Store)
```

---

## Checklist Deploy

- [ ] APNs key (.p8) salvata in modo sicuro
- [ ] Variabili ambiente configurate
- [ ] Bundle ID corretto
- [ ] Push Notifications capability abilitata
- [ ] Background Modes → Remote notifications abilitato
- [ ] Device token storage persistente (Redis)
- [ ] Monitoring errori APNs
- [ ] Rate limiting per evitare spam
- [ ] Cleanup token invalidi automatico

---

## Risorse

- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [node-apn Documentation](https://github.com/node-apn/node-apn)
- [APNs Provider API](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server)
- [watchOS Background Tasks](https://developer.apple.com/documentation/watchkit/background_execution)

---

*Documentazione Push Notifications - Onde Approve Watch - Gennaio 2026*
