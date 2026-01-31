const https = require('https');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { askLLM, getLLMStatus } = require('./llm-config');

const TOKEN = '8528268093:AAGNZUcYBm8iMcn9D_oWr565rpxm9riNkBM';
const ONDE_ROOT = process.env.ONDE_ROOT || path.resolve(__dirname, '../..');
const CASCADE_ROOT = process.env.CASCADE_ROOT || path.dirname(ONDE_ROOT);
const QUEUE_FILE = '/tmp/telegram-claude-queue.json';
const AGENTS_DIR = process.env.AGENTS_DIR || path.join(CASCADE_ROOT, '.claude/agents');

let lastUpdateId = 0;

function api(method, params = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendTelegram(chatId, text) {
  if (text.length > 4000) {
    text = text.substring(0, 3900) + '\n\n... (troncato)';
  }
  await api('sendMessage', { chat_id: chatId, text: text, parse_mode: 'HTML' });
}

// Call LLM (KIMI or Claude based on LLM_PROVIDER env)
async function askClaude(prompt) {
  try {
    const response = await askLLM(prompt, {
      workingDir: ONDE_ROOT,
      systemPrompt: `You are a Telegram bot assistant for Onde (publishing house).
Working directory: ${ONDE_ROOT}
Respond concisely in Italian. If asked to do something, do it and report results.`
    });
    return response;
  } catch (e) {
    console.error('LLM error:', e.message);
    // Fallback to simple responses
    return handleSimple(prompt);
  }
}

// Check running Claude sessions
function getRunningClaudeSessions() {
  try {
    const result = execSync('ps aux | grep "claude --chrome" | grep -v grep', { encoding: 'utf8' });
    const lines = result.trim().split('\n').filter(l => l);
    return lines.length;
  } catch (e) {
    return 0;
  }
}

// Get agent status from memory files
function getAgentStatus(agentName) {
  const memoryFile = path.join(AGENTS_DIR, `${agentName}.memory.json`);
  if (fs.existsSync(memoryFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
      return data;
    } catch (e) {
      return null;
    }
  }
  return null;
}

// List all agents and their projects
function getAllAgentsStatus() {
  let msg = '🤖 <b>AGENTI ONDE</b>\n\n';

  // Check running sessions
  const sessions = getRunningClaudeSessions();
  msg += `📡 Sessioni Claude attive: ${sessions}\n\n`;

  // List agents
  const agents = ['editore-capo', 'gianni-parola', 'pino-pennello'];

  for (const agentName of agents) {
    const agent = getAgentStatus(agentName);
    if (agent) {
      msg += `<b>${agent.agent || agentName}</b>`;
      if (agent.role) msg += ` - ${agent.role}`;
      msg += '\n';

      // Show active projects
      if (agent.activeProjects && agent.activeProjects.length > 0) {
        for (const proj of agent.activeProjects) {
          const statusEmoji = proj.status === 'in_production' ? '🔄' :
                             proj.status === 'review' ? '👀' :
                             proj.status === 'completed' ? '✅' : '📋';
          msg += `  ${statusEmoji} ${proj.title}: ${proj.phase || proj.status}\n`;
        }
      }
      msg += '\n';
    }
  }

  return msg;
}

// Check MILO book status specifically
function getMiloStatus() {
  const imagesDir = path.join(ONDE_ROOT, 'books/milo/images');
  let msg = '📚 <b>MILO AI - Stato Immagini</b>\n\n';

  if (!fs.existsSync(imagesDir)) {
    return msg + '❌ Cartella immagini non trovata';
  }

  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  const miloAiFiles = files.filter(f => f.startsWith('milo-ai'));
  const miloInternetFiles = files.filter(f => f.startsWith('milo-internet') || f.startsWith('milo-ch'));

  msg += `<b>MILO AI (8 cap):</b>\n`;
  msg += `  Cover: ${miloAiFiles.some(f => f.includes('cover')) ? '✅' : '❌'}\n`;
  for (let i = 1; i <= 8; i++) {
    const padded = i.toString().padStart(2, '0');
    const has = miloAiFiles.some(f => f.includes(`ch${padded}`) || f.includes(`ch${i}`));
    msg += `  Ch${i}: ${has ? '✅' : '❌'}\n`;
  }

  msg += `\n<b>MILO Internet (10 cap):</b>\n`;
  msg += `  Cover: ${miloInternetFiles.some(f => f.includes('cover')) ? '✅' : '❌'}\n`;
  for (let i = 1; i <= 10; i++) {
    const padded = i.toString().padStart(2, '0');
    const has = miloInternetFiles.some(f => f.includes(`ch${padded}`) || f.includes(`ch${i}`));
    msg += `  Ch${i}: ${has ? '✅' : '❌'}\n`;
  }

  msg += `\n📁 Totale file: ${files.length}`;
  return msg;
}

function handleSimple(text) {
  const lower = text.toLowerCase();

  if (lower === 'ping') return '🟢 Pong!';

  // Agent status
  if (lower.includes('agent') || lower.includes('agenti')) {
    return getAllAgentsStatus();
  }

  // MILO specific status
  if (lower.includes('milo')) {
    return getMiloStatus();
  }

  if (lower.includes('stato') || lower.includes('status')) {
    try {
      const imgs = execSync(`find ${ONDE_ROOT}/books -name "*.jpg" 2>/dev/null | wc -l`, {encoding: 'utf8'});
      const sessions = getRunningClaudeSessions();
      return `📚 Stato Onde:\n• ${imgs.trim()} immagini nei libri\n• ${sessions} sessioni Claude attive\n• Bot attivo\n\nUsa "agenti" per dettagli agenti\nUsa "milo" per stato MILO`;
    } catch(e) {
      return '📚 Bot attivo. Usa "help" per comandi.';
    }
  }
  if (lower === 'help') {
    return `🤖 Comandi:
• ping - test
• stato - dashboard generale
• agenti - stato agenti
• milo - stato libro MILO
• Qualsiasi domanda - chiedo a Claude`;
  }

  return `Ricevuto: "${text}"\n\nClaude non disponibile. Riprova dopo.`;
}

// Save message for Claude Code to pick up
function queueForClaude(chatId, text, user) {
  const queue = {
    timestamp: new Date().toISOString(),
    chatId: chatId,
    user: user,
    message: text,
    status: 'pending'
  };
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  console.log(`📝 Queued for Claude: ${text.substring(0, 50)}...`);
}

async function processMessage(chatId, text, user) {
  console.log(`📨 ${user}: ${text}`);

  const lower = text.toLowerCase().trim();

  // Quick commands
  if (lower === 'ping') {
    await sendTelegram(chatId, '🟢 Pong!');
    return;
  }

  if (lower === 'help' || lower === '/start') {
    const llmStatus = getLLMStatus();
    await sendTelegram(chatId, `🤖 <b>FRH-ONDE Bot</b>

LLM: ${llmStatus.provider} ${llmStatus.configured ? '✅' : '❌'}

Scrivi qualsiasi cosa e rispondo!

Comandi rapidi:
• ping - test
• stato - dashboard libri
• llm - quale AI sto usando
• Qualsiasi messaggio → ${llmStatus.provider}`);
    return;
  }

  if (lower === 'llm') {
    const llmStatus = getLLMStatus();
    await sendTelegram(chatId, `🤖 <b>LLM Status</b>

Provider: ${llmStatus.provider}
Configured: ${llmStatus.configured ? '✅' : '❌'}
Model: ${llmStatus.model}
Rate Limit: ${llmStatus.rateLimit}

Per cambiare:
• <code>./start-kimi.sh</code> (FREE)
• <code>./start-claude.sh</code> (paid)`);
    return;
  }

  // Queue for Claude and try to get response
  queueForClaude(chatId, text, user);

  await sendTelegram(chatId, '🧠 Processo con Claude...');

  try {
    const response = await askClaude(text);
    await sendTelegram(chatId, response);
  } catch (e) {
    await sendTelegram(chatId, `⚠️ Errore: ${e.message}\n\nMessaggio salvato in coda.`);
  }
}

async function poll() {
  const llmStatus = getLLMStatus();
  console.log('🤖 FRH-ONDE Bot attivo!');
  console.log(`📁 Working dir: ${ONDE_ROOT}`);
  console.log(`🧠 LLM: ${llmStatus.provider} (${llmStatus.configured ? 'configured' : 'NOT configured'})`);
  if (llmStatus.rateLimit) console.log(`⏱️  Rate limit: ${llmStatus.rateLimit}`);

  while (true) {
    try {
      const res = await api('getUpdates', { offset: lastUpdateId + 1, timeout: 30 });

      if (res.ok && res.result.length > 0) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg || !msg.text) continue;

          await processMessage(msg.chat.id, msg.text, msg.from?.first_name || 'User');
        }
      }
    } catch (e) {
      console.error('Poll error:', e.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

poll();
