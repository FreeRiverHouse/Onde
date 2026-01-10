/**
 * Free River Flow - Mac Server
 *
 * Questo server gira sul Mac di Mattia e riceve comandi vocali
 * dall'app mobile. L'AI (Claude) gira QUI, non sul telefono.
 *
 * Architettura:
 * 📱 iPhone → 🌐 WebSocket → 🖥️ Mac (questo server) → Claude Code
 *
 * Per avviare: npm start
 * Per tunnel pubblico: npm run tunnel
 */

import { WebSocketServer } from 'ws';
import express from 'express';
import { createServer } from 'http';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import OpenAI from 'openai';

// Config
const PORT = process.env.PORT || 3847;
const WHISPER_MODEL = 'whisper-1';

// OpenAI per Whisper (speech-to-text) - lazy initialization
let openai = null;

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY non configurata. Speech-to-text non disponibile.');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

// Express per health check e info
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Free River Flow Server',
    version: '1.0.0',
    status: 'running',
    capabilities: ['voice-to-text', 'claude-code', 'tts'],
    connectedClients: wss?.clients?.size || 0
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// HTTP server
const server = createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });

// Mappa clienti connessi
const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = `client-${Date.now()}`;
  const clientIp = req.socket.remoteAddress;

  console.log(`\n🔗 Nuovo client connesso: ${clientId} da ${clientIp}`);

  clients.set(clientId, {
    ws,
    ip: clientIp,
    connectedAt: new Date(),
    lastActivity: new Date()
  });

  // Manda info connessione
  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    message: 'Connesso a Free River Flow Server',
    capabilities: ['voice', 'text', 'tts']
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, clientId, message);
    } catch (err) {
      // Potrebbe essere audio binario
      if (Buffer.isBuffer(data)) {
        await handleAudioData(ws, clientId, data);
      } else {
        console.error('Errore parsing messaggio:', err);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Formato messaggio non valido'
        }));
      }
    }
  });

  ws.on('close', () => {
    console.log(`👋 Client disconnesso: ${clientId}`);
    clients.delete(clientId);
  });

  ws.on('error', (err) => {
    console.error(`❌ Errore WebSocket ${clientId}:`, err);
  });
});

/**
 * Gestisce messaggi JSON dal client
 */
async function handleMessage(ws, clientId, message) {
  console.log(`📨 Messaggio da ${clientId}:`, message.type);

  const client = clients.get(clientId);
  if (client) client.lastActivity = new Date();

  switch (message.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;

    case 'text':
      // Comando testuale diretto
      await processCommand(ws, clientId, message.text);
      break;

    case 'audio':
      // Audio in base64
      if (message.data) {
        const audioBuffer = Buffer.from(message.data, 'base64');
        await handleAudioData(ws, clientId, audioBuffer);
      }
      break;

    case 'agent':
      // Seleziona agente specifico
      const client = clients.get(clientId);
      if (client) {
        client.currentAgent = message.agent;
        ws.send(JSON.stringify({
          type: 'agent_selected',
          agent: message.agent
        }));
      }
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Tipo messaggio sconosciuto: ${message.type}`
      }));
  }
}

/**
 * Gestisce dati audio binari
 */
async function handleAudioData(ws, clientId, audioBuffer) {
  console.log(`🎤 Audio ricevuto da ${clientId}: ${audioBuffer.length} bytes`);

  ws.send(JSON.stringify({
    type: 'status',
    status: 'transcribing',
    message: 'Trascrizione in corso...'
  }));

  try {
    // Salva audio temporaneo
    const tempPath = join(tmpdir(), `frf-audio-${Date.now()}.webm`);
    writeFileSync(tempPath, audioBuffer);

    // Trascrivi con Whisper
    const transcription = await transcribeAudio(tempPath);

    // Pulisci file temp
    if (existsSync(tempPath)) unlinkSync(tempPath);

    if (!transcription || transcription.trim() === '') {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Nessun audio riconosciuto'
      }));
      return;
    }

    console.log(`📝 Trascrizione: "${transcription}"`);

    ws.send(JSON.stringify({
      type: 'transcription',
      text: transcription
    }));

    // Processa comando
    await processCommand(ws, clientId, transcription);

  } catch (err) {
    console.error('Errore trascrizione:', err);
    ws.send(JSON.stringify({
      type: 'error',
      message: `Errore trascrizione: ${err.message}`
    }));
  }
}

/**
 * Trascrivi audio con Whisper
 */
async function transcribeAudio(filePath) {
  try {
    const { createReadStream } = await import('fs');
    const client = getOpenAI();

    const transcription = await client.audio.transcriptions.create({
      file: createReadStream(filePath),
      model: WHISPER_MODEL,
      language: 'it' // Italiano di default
    });

    return transcription.text;
  } catch (err) {
    console.error('Errore Whisper:', err);
    throw err;
  }
}

/**
 * Processa comando con Claude Code
 */
async function processCommand(ws, clientId, command) {
  console.log(`\n🧠 Processo comando: "${command}"`);

  ws.send(JSON.stringify({
    type: 'status',
    status: 'processing',
    message: 'Claude sta pensando...'
  }));

  try {
    // Esegue Claude Code come subprocess
    const response = await executeClaudeCode(command, (chunk) => {
      // Streaming della risposta
      ws.send(JSON.stringify({
        type: 'stream',
        text: chunk
      }));
    });

    // Risposta finale
    ws.send(JSON.stringify({
      type: 'response',
      text: response.text,
      actions: response.actions || []
    }));

    // TTS se richiesto
    if (response.shouldSpeak !== false) {
      await generateAndSendTTS(ws, response.text);
    }

  } catch (err) {
    console.error('Errore processamento:', err);
    ws.send(JSON.stringify({
      type: 'error',
      message: `Errore: ${err.message}`
    }));
  }
}

/**
 * Esegue Claude Code come subprocess
 * Usa la subscription esistente di Mattia
 *
 * NOTA: Se USE_MOCK_CLAUDE=true, usa risposte simulate per testing
 */
async function executeClaudeCode(prompt, onStream) {
  // Usa mock se richiesto (per testing)
  if (process.env.USE_MOCK_CLAUDE === 'true') {
    return mockClaudeResponse(prompt, onStream);
  }

  return new Promise((resolve, reject) => {
    // Usa claude-code CLI con percorso completo per evitare problemi di PATH
    // shell: false per evitare problemi di escaping con caratteri speciali
    const claudePath = process.env.CLAUDE_PATH || '/opt/homebrew/bin/claude';
    const claude = spawn(claudePath, ['-p', prompt], {
      env: { ...process.env },
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let fullResponse = '';
    let actions = [];

    claude.stdout.on('data', (data) => {
      const chunk = data.toString();
      fullResponse += chunk;

      // Stream al client
      if (onStream) onStream(chunk);
    });

    claude.stderr.on('data', (data) => {
      console.error('Claude stderr:', data.toString());
    });

    claude.on('close', (code) => {
      if (code === 0) {
        resolve({
          text: fullResponse.trim(),
          actions,
          shouldSpeak: true
        });
      } else {
        reject(new Error(`Claude Code exit code: ${code}`));
      }
    });

    claude.on('error', (err) => {
      reject(err);
    });

    // Timeout 5 minuti
    setTimeout(() => {
      claude.kill();
      reject(new Error('Timeout'));
    }, 5 * 60 * 1000);
  });
}

/**
 * Mock response per testing quando Claude CLI non è disponibile
 */
async function mockClaudeResponse(prompt, onStream) {
  const responses = {
    'ciao': 'Ciao! Come posso aiutarti oggi?',
    'hello': 'Hello! How can I help you today?',
    'test': 'Test ricevuto! Il sistema funziona correttamente.',
    default: `Ho ricevuto il tuo messaggio: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}". Sono in modalità test, quindi rispondo con un messaggio pre-impostato.`
  };

  // Simula un piccolo delay
  await new Promise(r => setTimeout(r, 500));

  // Determina la risposta
  const lowerPrompt = prompt.toLowerCase();
  let response = responses.default;
  for (const [key, value] of Object.entries(responses)) {
    if (key !== 'default' && lowerPrompt.includes(key)) {
      response = value;
      break;
    }
  }

  // Simula streaming
  const words = response.split(' ');
  for (const word of words) {
    if (onStream) {
      onStream(word + ' ');
      await new Promise(r => setTimeout(r, 50));
    }
  }

  return {
    text: response,
    actions: [],
    shouldSpeak: true
  };
}

/**
 * Genera TTS e manda al client
 */
async function generateAndSendTTS(ws, text) {
  try {
    // Usa say command su macOS (gratuito)
    const audioPath = join(tmpdir(), `tts-${Date.now()}.aiff`);

    await new Promise((resolve, reject) => {
      const say = spawn('say', ['-o', audioPath, text]);
      say.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`say exit code: ${code}`));
      });
      say.on('error', reject);
    });

    // Leggi e manda audio
    const { readFileSync } = await import('fs');
    const audioData = readFileSync(audioPath);

    ws.send(JSON.stringify({
      type: 'tts',
      format: 'aiff',
      data: audioData.toString('base64')
    }));

    // Pulisci
    if (existsSync(audioPath)) unlinkSync(audioPath);

  } catch (err) {
    console.error('Errore TTS:', err);
    // TTS non critico, non bloccare
  }
}

// Avvia server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌊 FREE RIVER FLOW SERVER                               ║
║                                                           ║
║   Server: http://localhost:${PORT}                         ║
║   WebSocket: ws://localhost:${PORT}                        ║
║                                                           ║
║   Per accesso remoto (iPhone/Watch):                      ║
║   npm run tunnel                                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Chiusura server...');
  wss.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'server_shutdown',
      message: 'Server in chiusura'
    }));
    client.close();
  });
  server.close(() => {
    console.log('Server chiuso.');
    process.exit(0);
  });
});
