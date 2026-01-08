/**
 * HandsFree Server - Control Claude Code from anywhere
 *
 * This server provides a web dashboard to approve/reject Claude Code permissions
 * from your phone while washing dishes, cooking, etc.
 *
 * Usage:
 *   npm start
 *   Open http://localhost:3456 on your phone (same WiFi network)
 */

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');

const app = express();
const PORT = 3456;

app.use(cors());
app.use(express.json());

// Store pending permissions
let pendingPermissions = [];
let lastApproval = null;

// Get local IP for displaying on console
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

// Main dashboard HTML
const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>HandsFree - Claude Code</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: white;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
      opacity: 0.9;
    }

    .tagline {
      font-size: 14px;
      opacity: 0.6;
      margin-bottom: 40px;
    }

    .status {
      font-size: 16px;
      margin-bottom: 30px;
      padding: 15px 25px;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      text-align: center;
    }

    .status.waiting {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .buttons {
      display: flex;
      gap: 30px;
      margin-bottom: 40px;
    }

    .btn {
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }

    .btn:active {
      transform: scale(0.95);
    }

    .btn-1 {
      width: 100px;
      height: 100px;
      font-size: 36px;
      background: linear-gradient(145deg, #e74c3c, #c0392b);
      color: white;
      box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
    }

    .btn-2 {
      width: 140px;
      height: 140px;
      font-size: 48px;
      background: linear-gradient(145deg, #f1c40f, #f39c12);
      color: #1a1a2e;
      box-shadow: 0 12px 35px rgba(241, 196, 15, 0.5);
    }

    .btn-1:hover {
      box-shadow: 0 12px 35px rgba(231, 76, 60, 0.6);
    }

    .btn-2:hover {
      box-shadow: 0 16px 45px rgba(241, 196, 15, 0.7);
    }

    .labels {
      display: flex;
      gap: 70px;
      margin-bottom: 40px;
      font-size: 12px;
      opacity: 0.7;
    }

    .label-1 { margin-left: -5px; }
    .label-2 { margin-right: -10px; }

    .feedback {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 80px;
      animation: pop 0.5s ease-out forwards;
      pointer-events: none;
    }

    @keyframes pop {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }

    .frh-logo {
      position: fixed;
      bottom: 20px;
      opacity: 0.3;
      font-size: 12px;
    }

    .last-action {
      font-size: 12px;
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <div class="logo">HandsFree</div>
  <div class="tagline">Claude Code Approval</div>

  <div class="status waiting" id="status">
    Waiting for Claude Code permissions...
  </div>

  <div class="buttons">
    <button class="btn btn-1" onclick="approve(1)">1</button>
    <button class="btn btn-2" onclick="approve(2)">2</button>
  </div>

  <div class="labels">
    <span class="label-1">Allow Once</span>
    <span class="label-2">Allow Always</span>
  </div>

  <div class="last-action" id="lastAction"></div>

  <div class="frh-logo">Free River House</div>

  <script>
    async function approve(choice) {
      try {
        const response = await fetch('/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice })
        });

        const result = await response.json();

        // Show feedback
        showFeedback(choice === 2 ? '✅' : '👍');

        // Haptic feedback (if supported)
        if (navigator.vibrate) {
          navigator.vibrate(choice === 2 ? [100, 50, 100] : [50]);
        }

        document.getElementById('lastAction').textContent =
          'Last: ' + (choice === 2 ? 'Allow Always' : 'Allow Once') + ' at ' + new Date().toLocaleTimeString();

      } catch (error) {
        showFeedback('❌');
        console.error('Error:', error);
      }
    }

    function showFeedback(emoji) {
      const feedback = document.createElement('div');
      feedback.className = 'feedback';
      feedback.textContent = emoji;
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 500);
    }

    // Poll for status updates
    async function checkStatus() {
      try {
        const response = await fetch('/status');
        const data = await response.json();

        if (data.pending > 0) {
          document.getElementById('status').textContent =
            data.pending + ' permission(s) waiting';
          document.getElementById('status').classList.remove('waiting');
        } else {
          document.getElementById('status').textContent =
            'Waiting for Claude Code permissions...';
          document.getElementById('status').classList.add('waiting');
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }

    // Check status every 2 seconds
    setInterval(checkStatus, 2000);
  </script>
</body>
</html>
`;

// Routes
app.get('/', (req, res) => {
  res.send(dashboardHTML);
});

app.get('/status', (req, res) => {
  res.json({
    pending: pendingPermissions.length,
    lastApproval,
    serverTime: new Date().toISOString()
  });
});

app.post('/approve', (req, res) => {
  const { choice } = req.body;

  lastApproval = {
    choice,
    timestamp: new Date().toISOString()
  };

  console.log('\\n🎯 APPROVED:', choice === 2 ? 'Allow Always (2)' : 'Allow Once (1)');

  // TODO: Actually send keystroke to Claude Code terminal
  // This would require integration with the terminal session
  // For now, we just log it

  res.json({
    success: true,
    choice,
    message: choice === 2 ? 'Allowed (session)' : 'Allowed (once)'
  });
});

// Add a pending permission (would be called by Claude Code hook)
app.post('/permission', (req, res) => {
  const { action, file, command } = req.body;

  const permission = {
    id: Date.now().toString(),
    action,
    file,
    command,
    timestamp: new Date().toISOString()
  };

  pendingPermissions.push(permission);
  console.log('\\n⏳ Permission requested:', permission);

  res.json({ success: true, id: permission.id });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('\\n' + '='.repeat(50));
  console.log('🌊 HandsFree Server - Claude Code Approval');
  console.log('='.repeat(50));
  console.log('\\n📱 Open on your phone:');
  console.log('   http://' + localIP + ':' + PORT);
  console.log('   http://localhost:' + PORT);
  console.log('\\n💡 Press 2 for "Allow Always" (recommended!)');
  console.log('   Press 1 for "Allow Once"');
  console.log('\\n' + '='.repeat(50));
  console.log('Waiting for approvals...\\n');
});
