/**
 * FreeRiver Flow - Mac Server
 * 
 * Server WebSocket che riceve audio dall'iPhone e lo processa con Claude Code
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Config
const PORT = 3847;
const HOST = '0.0.0.0';

// Clients connected
const clients = new Map();

// Create WebSocket server
const wss = new WebSocket.Server({ 
  host: HOST,
  port: PORT 
});

console.log(`🚀 FreeRiver Flow Server running on ws://${HOST}:${PORT}`);

wss.on('connection', (ws, req) => {
  const clientId = req.socket.remoteAddress;
  console.log(`📱 Client connected: ${clientId}`);
  
  clients.set(clientId, {
    ws,
    isRecording: false,
    status: 'connected'
  });

  // Send initial status
  sendToClient(clientId, {
    type: 'status',
    status: 'connected',
    message: 'FreeRiver Flow server ready'
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

    case 'start_recording':
      if (!client.isRecording) {
        client.isRecording = true;
        client.status = 'listening';
        sendToClient(clientId, {
          type: 'status',
          status: 'listening',
          message: 'Recording started'
        });
      }
      break;

    case 'stop_recording':
      if (client.isRecording) {
        client.isRecording = false;
        client.status = 'processing';
        
        // Simulate processing with Claude Code
        sendToClient(clientId, {
          type: 'status',
          status: 'processing',
          message: 'Processing with Claude Code...'
        });

        // Simulate transcription
        setTimeout(() => {
          const transcription = "Hello from FreeRiver Flow! This is a test message from Claude Code.";
          sendToClient(clientId, {
            type: 'transcription',
            text: transcription
          });

          // Process with Claude Code
          processWithClaudeCode(clientId, transcription);
        }, 1000);
      }
      break;

    case 'audio_data':
      // Handle audio data if needed
      console.log(`🎵 Received audio data from ${clientId}`);
      break;

    default:
      console.log(`❓ Unknown message type: ${message.type}`);
  }
}

async function processWithClaudeCode(clientId, text) {
  const client = clients.get(clientId);
  if (!client) return;

  try {
    // Simulate Claude Code processing
    // In real implementation, this would call Claude Code API or CLI
    console.log(`🤖 Processing with Claude Code: "${text}"`);
    
    // Simulate streaming response
    const response = "I'm Claude Code running on your Mac! I can help you build apps, write code, and manage your development workflow. What would you like to work on today?";
    
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
    console.error(`❌ Error processing with Claude Code:`, error);
    sendToClient(clientId, {
      type: 'error',
      message: 'Error processing with Claude Code'
    });
  }
}

async function generateTTS(clientId, text) {
  const client = clients.get(clientId);
  if (!client) return;

  try {
    // Simulate TTS generation
    // In real implementation, this would use a TTS service
    console.log(`🔊 Generating TTS for: "${text.substring(0, 50)}..."`);
    
    // Create a simple audio file (simulated)
    const audioData = Buffer.from('simulated audio data');
    const audioBase64 = audioData.toString('base64');
    
    sendToClient(clientId, {
      type: 'tts',
      audio: audioBase64,
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
