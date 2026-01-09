#!/usr/bin/env node
/**
 * HandsFree Vibe Surfing Server
 * Permette di approvare Claude Code da Apple Watch / iPhone / Web
 *
 * Porta: 8888
 * Endpoints:
 *   POST /approve -> manda "2" (approva)
 *   POST /reject  -> manda "1" (rifiuta)
 *   GET  /status  -> stato del server
 *   GET  /        -> dashboard web con bottoni giganti
 *
 * @author Onde Engineering
 * @date 2026-01-08
 */

const http = require('http');
const { spawn } = require('child_process');
const os = require('os');

const PORT = 8888;
const HOST = '0.0.0.0';

let lastAction = null;
let lastActionTime = null;
let approveCount = 0;
let rejectCount = 0;
const startTime = new Date();

/**
 * Ottieni l'IP locale per accesso da iPhone
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

function sendToTerminal(key) {
    const script = `
        tell application "Terminal"
            activate
            tell application "System Events"
                keystroke "${key}"
                keystroke return
            end tell
        end tell
    `;
    spawn('osascript', ['-e', script]);
}

async function handleRequest(req, res) {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (url.pathname === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getDashboardHTML());
        return;
    }

    if (url.pathname === '/approve' && req.method === 'POST') {
        sendToTerminal('2');
        lastAction = 'APPROVED';
        lastActionTime = new Date().toISOString();
        approveCount++;
        console.log(`[${lastActionTime}] APPROVED (total: ${approveCount})`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, action: 'approve', count: approveCount }));
        return;
    }

    if (url.pathname === '/reject' && req.method === 'POST') {
        sendToTerminal('1');
        lastAction = 'REJECTED';
        lastActionTime = new Date().toISOString();
        rejectCount++;
        console.log(`[${lastActionTime}] REJECTED (total: ${rejectCount})`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, action: 'reject', count: rejectCount }));
        return;
    }

    if (url.pathname === '/status' && req.method === 'GET') {
        const uptime = Math.floor((new Date() - startTime) / 1000);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            server: 'running',
            lastAction,
            lastActionTime,
            approveCount,
            rejectCount,
            uptime,
            uptimeFormatted: `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${uptime%60}s`,
            localIP: getLocalIP(),
            port: PORT
        }));
        return;
    }

    res.writeHead(404); res.end('Not Found');
}

function getDashboardHTML() {
    const localIP = getLocalIP();
    return `<!DOCTYPE html>
<html><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>HandsFree - Onde</title>
    <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>2</text></svg>">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body {
            height: 100%;
            overflow: hidden;
            touch-action: manipulation;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 20px;
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        h1 {
            font-size: 1.3rem;
            font-weight: 500;
            opacity: 0.7;
            letter-spacing: 0.5px;
        }
        .subtitle {
            font-size: 0.85rem;
            opacity: 0.4;
            margin-top: 5px;
        }
        .buttons {
            display: flex;
            flex-direction: column;
            gap: 25px;
            width: 100%;
            max-width: 320px;
        }
        button {
            border: none;
            border-radius: 30px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
            -webkit-user-select: none;
            user-select: none;
        }
        button:active {
            transform: scale(0.96);
        }
        .approve {
            background: linear-gradient(135deg, #f4d03f 0%, #f1c40f 50%, #d4ac0d 100%);
            color: #1a1a2e;
            font-size: 5rem;
            padding: 60px 0;
            box-shadow: 0 10px 40px rgba(244, 208, 63, 0.3), inset 0 2px 0 rgba(255,255,255,0.3);
            text-shadow: 0 1px 0 rgba(255,255,255,0.3);
        }
        .approve:active {
            box-shadow: 0 5px 20px rgba(244, 208, 63, 0.4);
        }
        .reject {
            background: linear-gradient(135deg, #2d3436 0%, #1e272e 100%);
            color: #888;
            font-size: 2.5rem;
            padding: 35px 0;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .reject:active {
            background: #1e272e;
        }
        #feedback {
            margin-top: 30px;
            font-size: 1.1rem;
            min-height: 30px;
            font-weight: 500;
            transition: opacity 0.3s;
        }
        .feedback-approve { color: #f4d03f; }
        .feedback-reject { color: #888; }
        .stats {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.75rem;
            opacity: 0.3;
        }
        .ip-info {
            font-family: 'SF Mono', 'Monaco', monospace;
            background: rgba(255,255,255,0.05);
            padding: 4px 10px;
            border-radius: 8px;
            display: inline-block;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .pulsing { animation: pulse 0.5s ease-in-out; }
    </style>
</head><body>
    <div class="header">
        <h1>HandsFree Vibe Surfing</h1>
        <p class="subtitle">Control Claude Code remotely</p>
    </div>
    <div class="buttons">
        <button class="approve" onclick="approve()">2</button>
        <button class="reject" onclick="reject()">1</button>
    </div>
    <p id="feedback"></p>
    <div class="stats">
        <span class="ip-info">${localIP}:${PORT}</span>
    </div>
    <script>
        let approves = 0, rejects = 0;

        async function approve() {
            const fb = document.getElementById('feedback');
            fb.textContent = 'APPROVATO';
            fb.className = 'feedback-approve pulsing';
            if(navigator.vibrate) navigator.vibrate(50);
            try {
                const res = await fetch('/approve', {method:'POST'});
                const data = await res.json();
                approves = data.count;
            } catch(e) { fb.textContent = 'Errore connessione'; }
            setTimeout(() => fb.className = 'feedback-approve', 500);
        }

        async function reject() {
            const fb = document.getElementById('feedback');
            fb.textContent = 'RIFIUTATO';
            fb.className = 'feedback-reject pulsing';
            if(navigator.vibrate) navigator.vibrate([30, 50, 30]);
            try {
                const res = await fetch('/reject', {method:'POST'});
                const data = await res.json();
                rejects = data.count;
            } catch(e) { fb.textContent = 'Errore connessione'; }
            setTimeout(() => fb.className = 'feedback-reject', 500);
        }

        // Previeni zoom su double-tap
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) e.preventDefault();
        }, { passive: false });
    </script>
</body></html>`;
}

const server = http.createServer(handleRequest);
server.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    console.log(`
====================================
   HandsFree Vibe Surfing Server
====================================

Server attivo su:
  - Locale:  http://localhost:${PORT}
  - Rete:    http://${localIP}:${PORT}

Endpoints:
  POST /approve  -> Manda "2" (approva)
  POST /reject   -> Manda "1" (rifiuta)
  GET  /status   -> Stato del server
  GET  /         -> Dashboard web

Da iPhone/iPad sulla stessa rete WiFi:
  http://${localIP}:${PORT}

====================================
    `);
});
