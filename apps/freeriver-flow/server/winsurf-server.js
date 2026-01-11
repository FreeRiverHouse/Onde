/**
 * FreeRiver Flow - Winsurf Server
 * 
 * Server WebSocket che si interfaccia con Winsurf per speech-to-text
 * e poi processa con Claude Code/Windsor
 */

import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import fetch from 'node-fetch';

// Config
const PORT = process.env.WINSURF_PORT || 8888;
const HOST = '0.0.0.0';

// Winsurf API config
const WINSURF_API_URL = 'https://api.winsurf.ai/v1/transcribe';

// Clients connected
const clients = new Map();

// Create WebSocket server
const wss = new WebSocketServer({ 
  host: HOST,
  port: PORT 
});

console.log(`🚀 FreeRiver Flow + Winsurf Server running on ws://${HOST}:${PORT}`);

wss.on('connection', (ws, req) => {
  const clientId = req.socket.remoteAddress;
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const apiKey = url.searchParams.get('api_key');
  
  console.log(`📱 Client connected: ${clientId}`);
  
  if (!apiKey) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'API key required'
    }));
    ws.close();
    return;
  }
  
  clients.set(clientId, {
    ws,
    apiKey,
    isStreaming: false,
    status: 'connected'
  });

  // Send initial status
  sendToClient(clientId, {
    type: 'connected',
    clientId: clientId
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(clientId, message);
    } catch (error) {
      console.error(`❌ Error handling message from ${clientId}:`, error);
      sendToClient(clientId, {
        type: 'error',
        message: 'Invalid message format'
      });
    }
  });

  ws.on('close', () => {
    console.log(`📱 Client disconnected: ${clientId}`);
    clients.delete(clientId);
  });

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${clientId}:`, error);
  });
});

async function handleMessage(clientId, message) {
  const client = clients.get(clientId);
  if (!client) return;

  console.log(`📨 Message from ${clientId}:`, message.type);

  switch (message.type) {
    case 'ping':
      sendToClient(clientId, { type: 'pong' });
      break;

    case 'start_streaming':
      if (!client.isStreaming) {
        client.isStreaming = true;
        client.status = 'listening';
        sendToClient(clientId, {
          type: 'status',
          status: 'listening',
          message: 'Recording started'
        });
        
        // Start collecting audio chunks
        client.audioChunks = [];
      }
      break;

    case 'stop_streaming':
      if (client.isStreaming) {
        client.isStreaming = false;
        client.status = 'processing';
        
        sendToClient(clientId, {
          type: 'status',
          status: 'processing',
          message: 'Processing with Winsurf...'
        });

        // Process audio with Winsurf
        if (client.audioChunks && client.audioChunks.length > 0) {
          const transcription = await processWithWinsurf(clientId, client.audioChunks, client.apiKey);
          
          // Send transcription
          sendToClient(clientId, {
            type: 'transcription',
            text: transcription
          });

          // Process with Claude Code/Windsor
          processWithClaudeCode(clientId, transcription);
        }
      }
      break;

    case 'audio_chunk':
      if (client.isStreaming && client.audioChunks) {
        // Store audio chunk
        client.audioChunks.push(Buffer.from(message.data));
      }
      break;

    default:
      console.log(`❓ Unknown message type: ${message.type}`);
  }
}

async function processWithWinsurf(clientId, audioChunks, apiKey) {
  try {
    console.log(`🎙️ Processing ${audioChunks.length} audio chunks with Winsurf`);
    
    // Combine audio chunks
    const audioBuffer = Buffer.concat(audioChunks);
    
    // Create temporary file
    const tempFile = `/tmp/winsurf_${Date.now()}.wav`;
    fs.writeFileSync(tempFile, audioBuffer);
    
    // Call Winsurf API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFile));
    formData.append('language', 'auto'); // Auto-detect language
    
    const response = await fetch(WINSURF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Winsurf API error: ${response.status}`);
    }
    
    const result = await response.json();
    const transcription = result.text || '';
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    console.log(`📝 Winsurf transcription: "${transcription}"`);
    return transcription;
    
  } catch (error) {
    console.error(`❌ Error processing with Winsurf:`, error);
    return 'Error processing audio';
  }
}

async function processWithClaudeCode(clientId, text) {
  const client = clients.get(clientId);
  if (!client) return;

  try {
    // Simulate Claude Code/Windsor processing
    console.log(`🤖 Processing with Claude Code/Windsor: "${text}"`);
    
    // In real implementation, this would call Claude Code API or Windsor CLI
    // For now, simulate a response
    const response = `Sono Claude Code/Windsor che gira sul tuo Mac! Ho ricevuto: "${text}". Posso aiutarti a scrivere codice, debuggare, e gestire il tuo ambiente di sviluppo. Che progetto vuoi lavorare oggi?`;
    
    // Send streaming response
    sendToClient(clientId, {
      type: 'stream',
      text: response
    });

    // Send final response
    setTimeout(() => {
      sendToClient(clientId, {
        type: 'response',
        text: response,
        actions: []
      });

      // Generate TTS (simulated)
      generateTTS(clientId, response);
    }, 500);

  } catch (error) {
    console.error(`❌ Error processing with Claude Code/Windsor:`, error);
    sendToClient(clientId, {
      type: 'error',
      message: 'Error processing with Claude Code/Windsor'
    });
  }
}

async function generateTTS(clientId, text) {
  const client = clients.get(clientId);
  if (!client) return;

  try {
    console.log(`🔊 Generating TTS for: "${text.substring(0, 50)}..."`);
    
    // Simulate TTS generation
    // In real implementation, this would use a TTS service
    const audioData = Buffer.from('simulated audio data');
    const audioBase64 = audioData.toString('base64');
    
    sendToClient(clientId, {
      type: 'tts',
      data: audioBase64,
      format: 'wav'
    });

    // Update status back to idle
    client.status = 'idle';
    sendToClient(clientId, {
      type: 'status',
      status: 'idle',
      message: 'Ready for next command'
    });

  } catch (error) {
    console.error(`❌ Error generating TTS:`, error);
    client.status = 'idle';
  }
}

function sendToClient(clientId, data) {
  const client = clients.get(clientId);
  if (!client || client.ws.readyState !== WebSocket.OPEN) {
    return;
  }

  try {
    client.ws.send(JSON.stringify(data));
  } catch (error) {
    console.error(`❌ Error sending to client ${clientId}:`, error);
  }
}

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  wss.close();
  process.exit(0);
});

// Health check
setInterval(() => {
  console.log(`💓 Server status - Active clients: ${clients.size}`);
  clients.forEach((client, clientId) => {
    if (client.ws.readyState !== WebSocket.OPEN) {
      console.log(`🗑️ Removing inactive client: ${clientId}`);
      clients.delete(clientId);
    }
  });
}, 30000);
