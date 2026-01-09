#!/usr/bin/env node
/**
 * HandsFree Vibe Surfing Server
 * Permette di approvare Claude Code da Apple Watch / iPhone / Web
 */

const http = require('http');
const { spawn } = require('child_process');

const PORT = 8888;
const HOST = '0.0.0.0';

let lastAction = null;
let lastActionTime = null;

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
        lastAction = 'APPROVED'; lastActionTime = new Date().toISOString();
        console.log(`[${lastActionTime}] APPROVED`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, action: 'approve' }));
        return;
    }

    if (url.pathname === '/reject' && req.method === 'POST') {
        sendToTerminal('1');
        lastAction = 'REJECTED'; lastActionTime = new Date().toISOString();
        console.log(`[${lastActionTime}] REJECTED`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, action: 'reject' }));
        return;
    }

    if (url.pathname === '/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ server: 'running', lastAction, lastActionTime }));
        return;
    }

    res.writeHead(404); res.end('Not Found');
}

function getDashboardHTML() {
    return `<!DOCTYPE html>
<html><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HandsFree</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, sans-serif; background: linear-gradient(135deg, #1a1a2e, #16213e); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
        h1 { font-size: 1.5rem; margin-bottom: 40px; opacity: 0.8; }
        .buttons { display: flex; flex-direction: column; gap: 30px; }
        button { border: none; border-radius: 25px; font-size: 3rem; font-weight: bold; cursor: pointer; padding: 50px 80px; }
        .approve { background: linear-gradient(135deg, #f4d03f, #f1c40f); color: #1a1a2e; }
        .reject { background: #2d3436; color: white; padding: 30px 60px; font-size: 2rem; }
        #feedback { margin-top: 30px; font-size: 1.2rem; min-height: 30px; }
    </style>
</head><body>
    <h1>HandsFree Vibe Surfing</h1>
    <div class="buttons">
        <button class="approve" onclick="approve()">2</button>
        <button class="reject" onclick="reject()">1</button>
    </div>
    <p id="feedback"></p>
    <script>
        async function approve() {
            await fetch('/approve', {method:'POST'});
            document.getElementById('feedback').textContent = 'APPROVATO';
            if(navigator.vibrate) navigator.vibrate(50);
        }
        async function reject() {
            await fetch('/reject', {method:'POST'});
            document.getElementById('feedback').textContent = 'RIFIUTATO';
            if(navigator.vibrate) navigator.vibrate(50);
        }
    </script>
</body></html>`;
}

const server = http.createServer(handleRequest);
server.listen(PORT, HOST, () => {
    console.log('HandsFree Server attivo su http://localhost:' + PORT);
    console.log('Da iPhone: http://<IP_MAC>:' + PORT);
});
