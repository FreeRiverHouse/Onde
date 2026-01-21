import { Telegraf, Context, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { v4 as uuidv4 } from 'uuid';
import {
  generateDailyReport,
  formatReportMessage,
  getWeeklyTrend,
} from './analytics';
import { prAgent, ContentAnalysis } from './pr-agent';
import { startScheduler, stopScheduler, initializeContentQueue, runScheduledPost } from './content-scheduler';
import { sendContentPreview, scheduleContentPreview } from './daily-content-preview';
// Interactive Command Center imports
import {
  showMainMenu,
  showPostMenu,
  showBooksMenu,
  showAppsMenu,
  showAnalyticsMenu,
  showSystemMenu,
  showDashboard,
} from './interactive-menu';
import {
  getConversationState,
  setConversationState,
  clearConversationState,
  isInFlow,
  AccountType,
} from './conversation-state';
import {
  handlePhotoQuickActions,
  handleVideoQuickActions,
  showPostPreview,
  showAccountSelection,
  setPendingQuickAction,
  setQuickActionAccount,
  clearQuickAction,
} from './quick-actions';
import {
  transcribeAudio,
  downloadAudioFile,
  cleanupAudioFile,
  isWhisperAvailable,
  detectLanguageHint,
} from './voice-transcription';
import {
  addUserMessage,
  addBotMessage,
  formatHistoryForPrompt,
  getContextSummary,
} from './chat-history';
import { syncCheck, pushPostToDashboard, approvePostInD1, rejectPostInD1 } from './dashboard-sync';
// Agent queue - inline import to avoid rootDir issues
const agentQueuePath = require('path').join(__dirname, '../../agent-queue/src/index');
const agentQueue = require(agentQueuePath);

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const TELEGRAM_TOKEN = process.env.ONDE_PR_TELEGRAM_TOKEN!;
const ALLOWED_CHAT_ID = process.env.ONDE_PR_CHAT_ID; // Optional: restrict to specific chat

// X/Twitter clients
const frhClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

const ondeClient = new TwitterApi({
  appKey: process.env.X_ONDE_API_KEY!,
  appSecret: process.env.X_ONDE_API_SECRET!,
  accessToken: process.env.X_ONDE_ACCESS_TOKEN!,
  accessSecret: process.env.X_ONDE_ACCESS_SECRET!,
});

const magmaticClient = new TwitterApi({
  appKey: process.env.X_MAGMATIC_API_KEY!,
  appSecret: process.env.X_MAGMATIC_API_SECRET!,
  accessToken: process.env.X_MAGMATIC_ACCESS_TOKEN!,
  accessSecret: process.env.X_MAGMATIC_ACCESS_SECRET!,
});

// Draft storage per user
interface Draft {
  text: string;
  mediaFiles: string[]; // local file paths
  mediaTypes: ('image' | 'video')[]; // track media types
  account?: 'frh' | 'onde' | 'magmatic';
  scheduledFor?: Date;
  aiAnalysis?: ContentAnalysis; // PR Agent analysis
}

const drafts: Map<number, Draft> = new Map();
const tempDir = path.join(__dirname, '../temp');

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ============================================================================
// APPROVAL SYSTEM - Async approvals via Telegram buttons
// ============================================================================

const approvalsDir = path.join(__dirname, '../approvals');
if (!fs.existsSync(approvalsDir)) {
  fs.mkdirSync(approvalsDir, { recursive: true });
}

// Chat queue for Claude Code communication
const chatQueueDir = path.join(__dirname, '../chat_queue');
if (!fs.existsSync(chatQueueDir)) {
  fs.mkdirSync(chatQueueDir, { recursive: true });
}

interface ChatMessage {
  id: string;
  from: 'user' | 'claude';
  message: string;
  timestamp: string;
  status: 'pending' | 'read' | 'replied';
  reply?: string;
}

interface Approval {
  id: string;
  project: string;
  action: string;
  description: string;
  context?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  created: string;
  responded?: string;
  response?: string;
}

function createApproval(
  project: string,
  action: string,
  description: string,
  contextData?: Record<string, any>
): Approval {
  const id = uuidv4().slice(0, 8);
  const approval: Approval = {
    id,
    project,
    action,
    description,
    context: contextData,
    status: 'pending',
    created: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(approvalsDir, `${id}.json`),
    JSON.stringify(approval, null, 2)
  );

  return approval;
}

function getApproval(id: string): Approval | null {
  const filePath = path.join(approvalsDir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

function updateApproval(id: string, status: 'approved' | 'rejected', response?: string): Approval | null {
  const approval = getApproval(id);
  if (approval) {
    approval.status = status;
    approval.responded = new Date().toISOString();
    approval.response = response;
    fs.writeFileSync(
      path.join(approvalsDir, `${id}.json`),
      JSON.stringify(approval, null, 2)
    );
  }
  return approval;
}

function getPendingApprovals(): Approval[] {
  const files = fs.readdirSync(approvalsDir).filter(f => f.endsWith('.json'));
  const pending: Approval[] = [];

  for (const file of files) {
    try {
      const approval = JSON.parse(fs.readFileSync(path.join(approvalsDir, file), 'utf-8'));
      if (approval.status === 'pending') {
        pending.push(approval);
      }
    } catch (e) {
      // Skip invalid files
    }
  }

  return pending.sort((a, b) => b.created.localeCompare(a.created));
}

async function sendApprovalRequest(
  bot: Telegraf,
  chatId: string | number,
  project: string,
  action: string,
  description: string,
  contextData?: Record<string, any>
): Promise<string> {
  const approval = createApproval(project, action, description, contextData);

  const projectIcons: Record<string, string> = {
    'Libro': '📚',
    'LibroAI': '📚',
    'AIKO': '📚',
    'Onde': '🌊',
    'magmatic': '🎨',
    'FRH': '🏠',
  };

  const icon = projectIcons[project] || '📋';

  const msg = `${icon} *RICHIESTA APPROVAZIONE*\n\n` +
    `🏷️ Progetto: *${project}*\n` +
    `⚡ Azione: *${action}*\n\n` +
    `📝 ${description}\n\n` +
    `🔖 ID: \`${approval.id}\``;

  await bot.telegram.sendMessage(chatId, msg, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Approvo', `approve_${approval.id}`),
        Markup.button.callback('❌ Rifiuto', `reject_${approval.id}`)
      ]
    ])
  });

  return approval.id;
}

const bot = new Telegraf(TELEGRAM_TOKEN);

// Security: Only allow specific chat ID
bot.use((ctx, next) => {
  const chatId = ctx.chat?.id?.toString();

  if (ALLOWED_CHAT_ID && chatId !== ALLOWED_CHAT_ID) {
    console.log(`⛔ Unauthorized access attempt from chat ${chatId}`);
    ctx.reply('Non sei autorizzato ad usare questo bot.');
    return;
  }

  return next();
});

// Helper: Download file from Telegram
async function downloadFile(fileUrl: string, localPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localPath);
    https.get(fileUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(localPath, () => {});
      reject(err);
    });
  });
}

// Helper: Post to X with media
async function postToX(
  client: TwitterApi,
  text: string,
  mediaFiles: string[],
  accountName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const options: any = {};

    // Upload media if present
    if (mediaFiles.length > 0) {
      const mediaIds: string[] = [];
      for (const filePath of mediaFiles) {
        if (fs.existsSync(filePath)) {
          const mediaId = await client.v1.uploadMedia(filePath);
          mediaIds.push(mediaId);
        }
      }
      if (mediaIds.length > 0) {
        options.media = { media_ids: mediaIds };
      }
    }

    const result = await client.v2.tweet(text, options);
    const url = `https://x.com/${accountName}/status/${result.data.id}`;

    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Clean up temp files for a draft
function cleanupDraft(userId: number) {
  const draft = drafts.get(userId);
  if (draft) {
    for (const file of draft.mediaFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
    drafts.delete(userId);
  }
}

// === Commands ===

bot.command('start', async (ctx) => {
  const whisperStatus = isWhisperAvailable() ? '🟢' : '⚪';

  await ctx.reply(`🌊 *Ciao! Sono Onde PR.*

Il tuo centro di comando per gestire:
📮 Post su X (3 account)
📚 Libri della casa editrice
📱 App dell'ecosistema Onde
📊 Analytics e report

*Quick Start:*
• /menu → Menu interattivo
• /dashboard → Status completo
• Manda foto → Quick actions
• 🎙️ Manda audio → Dettatura ${whisperStatus}

_Supporto vocale: Italiano 🇮🇹 + Inglese 🇬🇧_`, { parse_mode: 'Markdown' });

  // Also show the menu
  await showMainMenu(ctx);
});

bot.command('help', (ctx) => {
  ctx.reply(`*ONDE PR BOT*

📱 *Command Center*
/menu - Menu interattivo principale
/dashboard - Status completo sistema

📤 *Posting*
/frh [testo] - @FreeRiverHouse
/onde [testo] - @Onde\\_FRH
/magmatic [testo] - @magmatic\\_\\_
/draft - Mostra bozza
/clear - Cancella bozza
/post frh|onde|magmatic - Pubblica

🎙️ *Dettatura Vocale*
Manda un messaggio vocale → trascritto automaticamente!
Supporta 🇮🇹 Italiano e 🇬🇧 Inglese

🤖 *PR Agent*
/ai - Analizza contenuto e crea post
/use 1|2|3 - Usa proposta dell'agent
/agent - Status PR Agent

📊 *Analytics*
/report frh|onde - Report account
/trend - Trend settimanale

✅ *Approvazioni*
/approvals - Mostra approvazioni in sospeso
/ask <prog> <azione> <desc> - Richiedi approvazione

💬 *Chat con Claude*
/text <messaggio> - Parla con Claude Code

💡 *Tip: Manda foto/video/audio → quick action!*`, { parse_mode: 'Markdown' });
});

// === Interactive Command Center ===

bot.command('menu', async (ctx) => {
  await showMainMenu(ctx);
});

bot.command('dashboard', async (ctx) => {
  await showDashboard(ctx);
});

bot.command('chatid', (ctx) => {
  ctx.reply(`Chat ID: ${ctx.chat.id}`);
});

// === Approval System Commands ===

bot.command('approvals', (ctx) => {
  const pending = getPendingApprovals();

  if (pending.length === 0) {
    ctx.reply('✅ Nessuna approvazione in sospeso!');
    return;
  }

  let msg = `📋 *APPROVAZIONI IN SOSPESO* (${pending.length})\n\n`;

  for (const a of pending.slice(0, 10)) {
    const created = a.created.slice(0, 16).replace('T', ' ');
    msg += `📌 *${a.project}* - ${a.action}\n`;
    msg += `   \`${a.id}\` - ${created}\n\n`;
  }

  msg += '_Usa i bottoni nei messaggi per approvare/rifiutare_';

  ctx.reply(msg, { parse_mode: 'Markdown' });
});

bot.command('ask', async (ctx) => {
  const args = ctx.message.text.replace(/^\/ask\s*/, '').trim().split(' ');

  if (args.length < 3) {
    ctx.reply(
      '❓ *Richiedi Approvazione*\n\n' +
      'Uso: `/ask <progetto> <azione> <descrizione>`\n\n' +
      'Esempi:\n' +
      '• `/ask LibroAI capitolo Pubblicare capitolo 3?`\n' +
      '• `/ask Onde post Approvare post settimanale?`\n' +
      '• `/ask magmatic contenuto Ripostare vecchio contenuto?`',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const project = args[0];
  const action = args[1];
  const description = args.slice(2).join(' ');

  const approvalId = await sendApprovalRequest(
    bot,
    ctx.chat.id,
    project,
    action,
    description
  );

  ctx.reply(`✅ Approvazione creata: \`${approvalId}\``, { parse_mode: 'Markdown' });
});

// === D1 Post Approval Handlers (for posts created on dashboard) ===

bot.action(/^approve_post_(.+)$/, async (ctx) => {
  const postId = ctx.match[1];

  try {
    const result = await approvePostInD1(postId);

    if (result.success) {
      const time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      await ctx.editMessageText(
        `📝 ✅ *POST APPROVATO*\n\n` +
        `Il post verrà pubblicato automaticamente.\n\n` +
        `🔖 ID: \`${postId}\`\n` +
        `⏰ ${time}\n\n` +
        `_Sincronizzazione ogni 5 minuti_`,
        { parse_mode: 'Markdown' }
      );
      await ctx.answerCbQuery('✅ Post approvato!');
    } else {
      await ctx.answerCbQuery(`❌ Errore: ${result.error}`);
    }
  } catch (error: any) {
    await ctx.answerCbQuery(`❌ Errore: ${error.message}`);
  }
});

bot.action(/^reject_post_(.+)$/, async (ctx) => {
  const postId = ctx.match[1];

  try {
    const result = await rejectPostInD1(postId);

    if (result.success) {
      const time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      await ctx.editMessageText(
        `📝 ❌ *POST RIFIUTATO*\n\n` +
        `🔖 ID: \`${postId}\`\n` +
        `⏰ ${time}`,
        { parse_mode: 'Markdown' }
      );
      await ctx.answerCbQuery('❌ Post rifiutato');
    } else {
      await ctx.answerCbQuery(`❌ Errore: ${result.error}`);
    }
  } catch (error: any) {
    await ctx.answerCbQuery(`❌ Errore: ${error.message}`);
  }
});

// === Approval Button Handlers ===

bot.action(/^approve_(.+)$/, async (ctx) => {
  const approvalId = ctx.match[1];
  const approval = getApproval(approvalId);

  if (!approval) {
    await ctx.answerCbQuery('⚠️ Approvazione non trovata');
    return;
  }

  if (approval.status !== 'pending') {
    await ctx.answerCbQuery(`ℹ️ Già processato: ${approval.status}`);
    return;
  }

  updateApproval(approvalId, 'approved');

  const projectIcons: Record<string, string> = {
    'Libro': '📚',
    'LibroAI': '📚',
    'AIKO': '📚',
    'Onde': '🌊',
    'magmatic': '🎨',
    'FRH': '🏠',
  };

  const icon = projectIcons[approval.project] || '📋';
  const time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  await ctx.editMessageText(
    `${icon} ✅ *APPROVATO*\n\n` +
    `Progetto: *${approval.project}*\n` +
    `Azione: *${approval.action}*\n\n` +
    `_${approval.description.slice(0, 100)}_\n\n` +
    `🔖 ID: \`${approvalId}\`\n` +
    `⏰ ${time}`,
    { parse_mode: 'Markdown' }
  );

  await ctx.answerCbQuery('✅ Approvato!');
});

bot.action(/^reject_(.+)$/, async (ctx) => {
  const approvalId = ctx.match[1];
  const approval = getApproval(approvalId);

  if (!approval) {
    await ctx.answerCbQuery('⚠️ Approvazione non trovata');
    return;
  }

  if (approval.status !== 'pending') {
    await ctx.answerCbQuery(`ℹ️ Già processato: ${approval.status}`);
    return;
  }

  updateApproval(approvalId, 'rejected');

  const projectIcons: Record<string, string> = {
    'Libro': '📚',
    'LibroAI': '📚',
    'AIKO': '📚',
    'Onde': '🌊',
    'magmatic': '🎨',
    'FRH': '🏠',
  };

  const icon = projectIcons[approval.project] || '📋';
  const time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  await ctx.editMessageText(
    `${icon} ❌ *RIFIUTATO*\n\n` +
    `Progetto: *${approval.project}*\n` +
    `Azione: *${approval.action}*\n\n` +
    `🔖 ID: \`${approvalId}\`\n` +
    `⏰ ${time}`,
    { parse_mode: 'Markdown' }
  );

  await ctx.answerCbQuery('❌ Rifiutato');
});

// === Claude Code Chat System ===

bot.command('text', async (ctx) => {
  const message = ctx.message.text.replace(/^\/text\s*/, '').trim();

  if (!message) {
    ctx.reply(
      '💬 *Chat con Claude Code*\n\n' +
      'Uso: `/text <messaggio>`\n\n' +
      'Esempio:\n' +
      '`/text Come va il libro AI?`\n' +
      '`/text Qual è lo stato di KidsChefStudio?`',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const msgId = uuidv4().slice(0, 8);
  const chatMessage: ChatMessage = {
    id: msgId,
    from: 'user',
    message: message,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  // Save to queue
  fs.writeFileSync(
    path.join(chatQueueDir, `${msgId}.json`),
    JSON.stringify(chatMessage, null, 2)
  );

  ctx.reply(
    `📨 *Messaggio inviato a Claude*\n\n` +
    `"${message}"\n\n` +
    `🔖 ID: \`${msgId}\`\n` +
    `⏳ In attesa di risposta...`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('draft', (ctx) => {
  const draft = drafts.get(ctx.from!.id);
  if (!draft) {
    ctx.reply('Nessuna bozza. Mandami un messaggio o una foto!');
    return;
  }

  const mediaInfo = draft.mediaFiles.length > 0
    ? `\n📷 ${draft.mediaFiles.length} immagine/i allegate`
    : '';

  ctx.reply(`📝 Bozza corrente:\n\n"${draft.text}"${mediaInfo}\n\nUsa /post frh o /post onde per pubblicare.`);
});

bot.command('clear', (ctx) => {
  cleanupDraft(ctx.from!.id);
  ctx.reply('Bozza cancellata!');
});

// /frh [testo] - post directly to FRH
bot.command('frh', async (ctx) => {
  const text = ctx.message.text.replace(/^\/frh\s*/, '').trim();
  const draft = drafts.get(ctx.from!.id);

  if (!text && !draft) {
    ctx.reply('Scrivi il testo dopo /frh oppure prepara prima una bozza.');
    return;
  }

  const postText = text || draft?.text || '';
  const mediaFiles = draft?.mediaFiles || [];

  if (!postText) {
    ctx.reply('Serve almeno del testo per postare!');
    return;
  }

  ctx.reply(`📤 Posto su @FreeRiverHouse...\n\n"${postText}"${mediaFiles.length > 0 ? `\n+ ${mediaFiles.length} foto` : ''}`);

  const result = await postToX(frhClient, postText, mediaFiles, 'FreeRiverHouse');

  if (result.success) {
    ctx.reply(`✅ Postato!\n${result.url}`);
    cleanupDraft(ctx.from!.id);
  } else {
    ctx.reply(`❌ Errore: ${result.error}`);
  }
});

// /onde [testo] - post directly to Onde
bot.command('onde', async (ctx) => {
  const text = ctx.message.text.replace(/^\/onde\s*/, '').trim();
  const draft = drafts.get(ctx.from!.id);

  if (!text && !draft) {
    ctx.reply('Scrivi il testo dopo /onde oppure prepara prima una bozza.');
    return;
  }

  const postText = text || draft?.text || '';
  const mediaFiles = draft?.mediaFiles || [];

  if (!postText) {
    ctx.reply('Serve almeno del testo per postare!');
    return;
  }

  ctx.reply(`📤 Posto su @Onde_FRH...\n\n"${postText}"${mediaFiles.length > 0 ? `\n+ ${mediaFiles.length} foto` : ''}`);

  const result = await postToX(ondeClient, postText, mediaFiles, 'Onde_FRH');

  if (result.success) {
    ctx.reply(`✅ Postato!\n${result.url}`);
    cleanupDraft(ctx.from!.id);
  } else {
    ctx.reply(`❌ Errore: ${result.error}`);
  }
});

// /magmatic [testo] - post directly to magmatic__
bot.command('magmatic', async (ctx) => {
  const text = ctx.message.text.replace(/^\/magmatic\s*/, '').trim();
  const draft = drafts.get(ctx.from!.id);

  if (!text && !draft) {
    ctx.reply('Scrivi il testo dopo /magmatic oppure prepara prima una bozza.');
    return;
  }

  const postText = text || draft?.text || '';
  const mediaFiles = draft?.mediaFiles || [];

  if (!postText) {
    ctx.reply('Serve almeno del testo per postare!');
    return;
  }

  ctx.reply(`📤 Posto su @magmatic__...\n\n"${postText}"${mediaFiles.length > 0 ? `\n+ ${mediaFiles.length} foto` : ''}`);

  const result = await postToX(magmaticClient, postText, mediaFiles, 'magmatic__');

  if (result.success) {
    ctx.reply(`✅ Postato!\n${result.url}`);
    cleanupDraft(ctx.from!.id);
  } else {
    ctx.reply(`❌ Errore: ${result.error}`);
  }
});

// /post frh|onde|magmatic - post current draft
bot.command('post', async (ctx) => {
  const args = ctx.message.text.replace(/^\/post\s*/, '').trim().toLowerCase();
  const draft = drafts.get(ctx.from!.id);

  if (!draft || !draft.text) {
    ctx.reply('Nessuna bozza da postare! Mandami prima un messaggio.');
    return;
  }

  if (args === 'frh') {
    ctx.reply(`📤 Posto su @FreeRiverHouse...\n\n"${draft.text}"${draft.mediaFiles.length > 0 ? `\n+ ${draft.mediaFiles.length} foto` : ''}`);
    const result = await postToX(frhClient, draft.text, draft.mediaFiles, 'FreeRiverHouse');
    if (result.success) {
      ctx.reply(`✅ Postato!\n${result.url}`);
      cleanupDraft(ctx.from!.id);
    } else {
      ctx.reply(`❌ Errore: ${result.error}`);
    }
  } else if (args === 'onde') {
    ctx.reply(`📤 Posto su @Onde_FRH...\n\n"${draft.text}"${draft.mediaFiles.length > 0 ? `\n+ ${draft.mediaFiles.length} foto` : ''}`);
    const result = await postToX(ondeClient, draft.text, draft.mediaFiles, 'Onde_FRH');
    if (result.success) {
      ctx.reply(`✅ Postato!\n${result.url}`);
      cleanupDraft(ctx.from!.id);
    } else {
      ctx.reply(`❌ Errore: ${result.error}`);
    }
  } else if (args === 'magmatic') {
    ctx.reply(`📤 Posto su @magmatic__...\n\n"${draft.text}"${draft.mediaFiles.length > 0 ? `\n+ ${draft.mediaFiles.length} foto` : ''}`);
    const result = await postToX(magmaticClient, draft.text, draft.mediaFiles, 'magmatic__');
    if (result.success) {
      ctx.reply(`✅ Postato!\n${result.url}`);
      cleanupDraft(ctx.from!.id);
    } else {
      ctx.reply(`❌ Errore: ${result.error}`);
    }
  } else {
    ctx.reply('Specifica dove postare: /post frh | /post onde | /post magmatic');
  }
});

// === Analytics Commands ===

bot.command('report', async (ctx) => {
  const args = ctx.message.text.replace(/^\/report\s*/, '').trim().toLowerCase();

  if (!args || (args !== 'frh' && args !== 'onde')) {
    ctx.reply('Specifica account: /report frh oppure /report onde');
    return;
  }

  const account = args === 'frh' ? 'FreeRiverHouse' : 'Onde_FRH';
  const client = args === 'frh' ? frhClient : ondeClient;

  ctx.reply(`📊 Genero report per @${account}...`);

  try {
    const report = await generateDailyReport(client, account);
    const message = formatReportMessage(report);
    ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error: any) {
    ctx.reply(`❌ Errore: ${error.message}`);
  }
});

bot.command('trend', async (ctx) => {
  const frhTrend = getWeeklyTrend('FreeRiverHouse');
  const ondeTrend = getWeeklyTrend('Onde_FRH');

  const trendIcon = (t: 'up' | 'down' | 'stable') => {
    if (t === 'up') return '📈';
    if (t === 'down') return '📉';
    return '➡️';
  };

  const sign = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1);

  let msg = `📊 *TREND SETTIMANALE*\n\n`;

  msg += `*@FreeRiverHouse* ${trendIcon(frhTrend.trend)}\n`;
  msg += `   Crescita: ${sign(frhTrend.weeklyGrowth)} follower\n`;
  msg += `   Media: ${sign(frhTrend.dailyAvg)}/giorno\n\n`;

  msg += `*@Onde_FRH* ${trendIcon(ondeTrend.trend)}\n`;
  msg += `   Crescita: ${sign(ondeTrend.weeklyGrowth)} follower\n`;
  msg += `   Media: ${sign(ondeTrend.dailyAvg)}/giorno`;

  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// === PR Agent Commands ===

bot.command('ai', async (ctx) => {
  const draft = drafts.get(ctx.from!.id);

  if (!draft || (!draft.text && draft.mediaFiles.length === 0)) {
    ctx.reply('Manda prima del contenuto (testo, foto, video) e poi usa /ai per farlo analizzare.');
    return;
  }

  if (!prAgent.isAvailable()) {
    ctx.reply('⚠️ PR Agent non disponibile. Aggiungi ANTHROPIC_API_KEY al .env');
    return;
  }

  ctx.reply('🤖 PR Agent sta analizzando...');

  try {
    const analysis = await prAgent.analyzeAndCreatePost({
      text: draft.text,
      videoDescription: draft.mediaTypes.includes('video') ? 'Video allegato' : undefined,
      imageDescription: draft.mediaTypes.includes('image') ? 'Immagine allegata' : undefined,
    });

    draft.aiAnalysis = analysis;
    drafts.set(ctx.from!.id, draft);

    let response = `🤖 *PR AGENT ANALYSIS*\n\n`;
    response += `📝 ${analysis.description}\n\n`;
    response += `*Proposte:*\n`;

    analysis.suggestedPosts.forEach((post, i) => {
      const accountLabel = post.account === 'frh' ? '@FreeRiverHouse' : '@Onde_FRH';
      response += `\n${i + 1}. [${accountLabel}] (${post.confidence}%)\n`;
      response += `"${post.text}"\n`;
    });

    if (analysis.hashtags && analysis.hashtags.length > 0) {
      response += `\n🏷️ Hashtag: ${analysis.hashtags.join(' ')}\n`;
    }

    if (analysis.notes) {
      response += `\n💡 ${analysis.notes}`;
    }

    response += `\n\n_Usa /use 1, /use 2, etc. per usare una proposta_`;

    ctx.reply(response, { parse_mode: 'Markdown' });
  } catch (error: any) {
    ctx.reply(`❌ Errore: ${error.message}`);
  }
});

bot.command('use', async (ctx) => {
  const args = ctx.message.text.replace(/^\/use\s*/, '').trim();
  const index = parseInt(args) - 1;

  const draft = drafts.get(ctx.from!.id);

  if (!draft?.aiAnalysis?.suggestedPosts?.length) {
    ctx.reply('Nessuna proposta disponibile. Usa prima /ai per analizzare il contenuto.');
    return;
  }

  if (isNaN(index) || index < 0 || index >= draft.aiAnalysis.suggestedPosts.length) {
    ctx.reply(`Scegli un numero da 1 a ${draft.aiAnalysis.suggestedPosts.length}`);
    return;
  }

  const selected = draft.aiAnalysis.suggestedPosts[index];
  draft.text = selected.text;
  draft.account = selected.account;
  drafts.set(ctx.from!.id, draft);

  const accountLabel = selected.account === 'frh' ? '@FreeRiverHouse' : '@Onde_FRH';
  ctx.reply(`✅ Proposta ${index + 1} selezionata per ${accountLabel}:\n\n"${selected.text}"\n\nUsa /post ${selected.account} per pubblicare.`);
});

bot.command('agent', (ctx) => {
  const summary = prAgent.getKnowledgeSummary();
  const status = prAgent.isAvailable() ? '🟢 Attivo' : '🔴 Non configurato';

  ctx.reply(`🤖 *ONDE PR AGENT*\n\nStatus: ${status}\n\n${summary}`, { parse_mode: 'Markdown' });
});

// /status - Show Onde status
bot.command('status', async (ctx) => {
  const progressFile = path.join(__dirname, '../../../PROGRESS.md');
  let booksStatus = 'N/A';

  try {
    const content = fs.readFileSync(progressFile, 'utf-8');
    // Extract dashboard table
    const dashboardMatch = content.match(/## Dashboard Libri[\s\S]*?\|[\s\S]*?\n\n/);
    if (dashboardMatch) {
      const lines = dashboardMatch[0].split('\n').filter(l => l.includes('|') && !l.includes('---'));
      booksStatus = lines.slice(0, 5).join('\n');
    }
  } catch (e) {
    booksStatus = 'Errore lettura PROGRESS.md';
  }

  const pending = getPendingApprovals();
  const pendingCount = pending.length;

  const msg = `🌊 *ONDE STATUS*

📚 *Libri*
${booksStatus}

✅ *Approvazioni in sospeso:* ${pendingCount}

🤖 *PR Agent:* ${prAgent.isAvailable() ? '🟢 Attivo' : '🔴 Non configurato'}

📊 Usa /report frh|onde per analytics X`;

  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// === Message Handlers ===

// Handle text messages -> send to Claude Code chat
bot.on(message('text'), (ctx) => {
  // Skip commands
  if (ctx.message.text.startsWith('/')) return;

  const message = ctx.message.text;
  const msgId = uuidv4().slice(0, 8);

  // Save to chat history for context
  addUserMessage(message, 'text');

  const chatMessage: ChatMessage = {
    id: msgId,
    from: 'user',
    message: message,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  // Save to chat queue for Claude
  fs.writeFileSync(
    path.join(chatQueueDir, `${msgId}.json`),
    JSON.stringify(chatMessage, null, 2)
  );

  ctx.reply(`💬 Messaggio per Claude ricevuto!\n\n🔖 \`${msgId}\``, { parse_mode: 'Markdown' });
});

// Parse context from message (for Claude actions)
function parseMessageContext(text: string): { action?: string; target?: string; details?: string } {
  const lower = text.toLowerCase();

  // Chapter patterns
  const chapterMatch = lower.match(/(?:per |aggiungi a |capitolo |chapter )(\d+)/);
  if (chapterMatch) {
    return { action: 'add_to_chapter', target: `chapter ${chapterMatch[1]}`, details: text };
  }

  // Book patterns
  const bookPatterns = [
    { pattern: /aiko/i, name: 'aiko' },
    { pattern: /milo/i, name: 'milo' },
    { pattern: /salmo/i, name: 'salmo-23' },
    { pattern: /piccole rime/i, name: 'piccole-rime' },
  ];
  for (const { pattern, name } of bookPatterns) {
    if (pattern.test(text)) {
      return { action: 'update_book', target: name, details: text };
    }
  }

  // Site patterns
  if (lower.includes('sito') || lower.includes('website') || lower.includes('onde.surf')) {
    return { action: 'update_site', target: 'onde.surf', details: text };
  }

  // App patterns
  const appPatterns = ['kidschefstudio', 'kidsmusicstudio', 'pizzagelatorush'];
  for (const app of appPatterns) {
    if (lower.includes(app.toLowerCase())) {
      const action = lower.includes('fix') ? 'fix_app' : 'update_app';
      return { action, target: app, details: text };
    }
  }

  return { details: text };
}

// Handle photos -> add to draft + queue for Claude
bot.on(message('photo'), async (ctx) => {
  const userId = ctx.from.id;
  const photo = ctx.message.photo[ctx.message.photo.length - 1]; // highest resolution
  const caption = ctx.message.caption || '';

  try {
    // Get file info
    const file = await ctx.telegram.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;

    // Download to media folder (persistent, not temp)
    const mediaDir = path.join(__dirname, '../media');
    if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

    const timestamp = Date.now();
    const localPath = path.join(mediaDir, `photo_${timestamp}.jpg`);
    await downloadFile(fileUrl, localPath);

    // Save to chat queue for Claude
    const msgId = uuidv4().slice(0, 8);
    const context = parseMessageContext(caption);
    const chatMessage = {
      id: msgId,
      from: 'user',
      type: 'photo',
      message: caption,
      caption: caption,
      mediaPath: localPath,
      mediaType: 'image',
      timestamp: new Date().toISOString(),
      status: 'pending',
      context: context
    };
    fs.writeFileSync(
      path.join(chatQueueDir, `${msgId}.json`),
      JSON.stringify(chatMessage, null, 2)
    );

    // Also update draft for PR system
    const existingDraft = drafts.get(userId);
    const mediaFiles = existingDraft?.mediaFiles || [];
    const mediaTypes = existingDraft?.mediaTypes || [];
    mediaFiles.push(localPath);
    mediaTypes.push('image');

    drafts.set(userId, {
      text: caption || existingDraft?.text || '',
      mediaFiles,
      mediaTypes,
    });

    const draft = drafts.get(userId)!;

    // Store state for quick actions
    setPendingQuickAction(userId, localPath, 'image', caption);

    // Show quick actions with inline buttons
    await handlePhotoQuickActions(ctx, draft.mediaFiles.length, caption);

  } catch (error: any) {
    ctx.reply(`❌ Errore: ${error.message}`);
  }
});

// Handle videos -> add to draft
bot.on(message('video'), async (ctx) => {
  const userId = ctx.from.id;
  const video = ctx.message.video;
  const caption = ctx.message.caption || '';

  try {
    // Get file info
    const file = await ctx.telegram.getFile(video.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;

    // Download to temp
    const ext = file.file_path?.split('.').pop() || 'mp4';
    const localPath = path.join(tempDir, `${userId}_${Date.now()}.${ext}`);
    await downloadFile(fileUrl, localPath);

    // Update draft
    const existingDraft = drafts.get(userId);
    const mediaFiles = existingDraft?.mediaFiles || [];
    const mediaTypes = existingDraft?.mediaTypes || [];
    mediaFiles.push(localPath);
    mediaTypes.push('video');

    drafts.set(userId, {
      text: caption || existingDraft?.text || '',
      mediaFiles,
      mediaTypes,
    });

    const draft = drafts.get(userId)!;

    // Store state for quick actions
    setPendingQuickAction(userId, localPath, 'video', caption);

    // Show quick actions with inline buttons
    await handleVideoQuickActions(ctx, draft.mediaFiles.length, caption);

  } catch (error: any) {
    ctx.reply(`❌ Errore: ${error.message}`);
  }
});

// Handle voice messages -> transcribe and process as text
bot.on(message('voice'), async (ctx) => {
  const userId = ctx.from.id;
  const voice = ctx.message.voice;

  // Check if Whisper is available
  if (!isWhisperAvailable()) {
    ctx.reply(
      '🎙️ *Dettatura non disponibile*\n\n' +
      'Aggiungi `OPENAI_API_KEY` al .env per abilitare la trascrizione vocale.',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Show processing message
  const processingMsg = await ctx.reply('🎙️ Trascrivo audio...');

  try {
    // Get file info
    const file = await ctx.telegram.getFile(voice.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;

    // Download to temp
    const voiceDir = path.join(__dirname, '../temp/voice');
    if (!fs.existsSync(voiceDir)) fs.mkdirSync(voiceDir, { recursive: true });

    const localPath = path.join(voiceDir, `voice_${userId}_${Date.now()}.ogg`);
    await downloadAudioFile(fileUrl, localPath);

    // Transcribe (auto-detect language - supports IT and EN)
    const result = await transcribeAudio(localPath);

    // Cleanup audio file
    cleanupAudioFile(localPath);

    if (!result.success) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        undefined,
        `❌ Errore trascrizione: ${result.error}`
      );
      return;
    }

    const transcribedText = result.text || '';
    const langEmoji = result.language === 'italian' || result.language === 'it' ? '🇮🇹' :
                      result.language === 'english' || result.language === 'en' ? '🇬🇧' : '🌍';
    const durationStr = result.duration ? ` (${Math.round(result.duration)}s)` : '';

    // Update processing message with transcription
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      processingMsg.message_id,
      undefined,
      `🎙️ *Trascritto${durationStr}* ${langEmoji}\n\n"${transcribedText}"`,
      { parse_mode: 'Markdown' }
    );

    // Save to chat queue for Claude (same as text messages)
    const msgId = uuidv4().slice(0, 8);
    const context = parseMessageContext(transcribedText);
    const chatMessage: ChatMessage = {
      id: msgId,
      from: 'user',
      message: transcribedText,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    fs.writeFileSync(
      path.join(chatQueueDir, `${msgId}.json`),
      JSON.stringify({ ...chatMessage, source: 'voice', language: result.language, context }, null, 2)
    );

    // Also update draft if there's existing content
    const existingDraft = drafts.get(userId);
    if (existingDraft) {
      existingDraft.text = existingDraft.text
        ? existingDraft.text + '\n' + transcribedText
        : transcribedText;
      drafts.set(userId, existingDraft);
    } else {
      drafts.set(userId, {
        text: transcribedText,
        mediaFiles: [],
        mediaTypes: [],
      });
    }

    // Send confirmation with quick actions
    await ctx.reply(
      `💬 Messaggio vocale processato!\n\n🔖 \`${msgId}\`\n\n` +
      `_Testo aggiunto alla bozza. Usa /draft per vedere o /post per pubblicare._`,
      { parse_mode: 'Markdown' }
    );

  } catch (error: any) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      processingMsg.message_id,
      undefined,
      `❌ Errore: ${error.message}`
    );
  }
});

// === Scheduled Reports ===

async function sendDailyReport() {
  if (!ALLOWED_CHAT_ID) return;

  console.log('📊 Sending daily report...');

  try {
    // Generate reports for both accounts
    const frhReport = await generateDailyReport(frhClient, 'FreeRiverHouse');
    const ondeReport = await generateDailyReport(ondeClient, 'Onde_FRH');

    const frhMessage = formatReportMessage(frhReport);
    const ondeMessage = formatReportMessage(ondeReport);

    await bot.telegram.sendMessage(
      ALLOWED_CHAT_ID,
      `🌅 *REPORT GIORNALIERO*\n\n${frhMessage}`,
      { parse_mode: 'Markdown' }
    );

    await bot.telegram.sendMessage(
      ALLOWED_CHAT_ID,
      ondeMessage,
      { parse_mode: 'Markdown' }
    );

    console.log('✅ Daily report sent');
  } catch (error: any) {
    console.error('❌ Error sending daily report:', error.message);
  }
}

function scheduleDailyReport() {
  // Send report every day at 17:40 (5:40 PM)
  const now = new Date();
  const target = new Date();
  target.setHours(17, 40, 0, 0);

  // If it's already past 9 AM, schedule for tomorrow
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  const msUntilTarget = target.getTime() - now.getTime();

  console.log(`📅 Daily report scheduled for ${target.toLocaleString()}`);

  setTimeout(() => {
    sendDailyReport();
    // Then repeat every 24 hours
    setInterval(sendDailyReport, 24 * 60 * 60 * 1000);
  }, msUntilTarget);
}

// === Agent Approval System ===

// Send agent approval request with inline buttons
async function sendAgentApprovalRequest(task: any) {
  if (!ALLOWED_CHAT_ID) return;

  const message = `🔴 *${task.agentName}* bloccato

*Task:* ${task.task}
*Motivo:* ${task.blockedReason || 'Non specificato'}`;

  await bot.telegram.sendMessage(ALLOWED_CHAT_ID, message, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Approva', callback_data: `approve_${task.id}` },
          { text: '💬 Parla', callback_data: `talk_${task.id}` },
        ],
      ],
    },
  });
}

// Handle inline button callbacks - Interactive Command Center
bot.on('callback_query', async (ctx) => {
  const data = (ctx.callbackQuery as any).data;
  if (!data) return;

  const userId = ctx.from!.id;

  // ============================================================================
  // MENU NAVIGATION
  // ============================================================================

  if (data === 'menu_main') {
    await ctx.answerCbQuery();
    await showMainMenu(ctx);
    return;
  }

  if (data === 'menu_post') {
    await ctx.answerCbQuery();
    await showPostMenu(ctx);
    return;
  }

  if (data === 'menu_books') {
    await ctx.answerCbQuery();
    await showBooksMenu(ctx);
    return;
  }

  if (data === 'menu_apps') {
    await ctx.answerCbQuery();
    await showAppsMenu(ctx);
    return;
  }

  if (data === 'menu_analytics') {
    await ctx.answerCbQuery();
    await showAnalyticsMenu(ctx);
    return;
  }

  if (data === 'menu_system') {
    await ctx.answerCbQuery();
    await showSystemMenu(ctx);
    return;
  }

  // ============================================================================
  // POST MENU ACTIONS
  // ============================================================================

  if (data === 'post_onde' || data === 'post_frh' || data === 'post_magmatic') {
    const account = data.replace('post_', '') as AccountType;
    setConversationState(userId, 'posting', 1, { account });
    await ctx.answerCbQuery(`📤 Posting su ${account}`);
    await ctx.reply(
      `📝 *Post su @${account === 'frh' ? 'FreeRiverHouse' : account === 'onde' ? 'Onde_FRH' : 'magmatic__'}*\n\n` +
      `Manda il testo o una foto/video per il post.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (data === 'post_ai') {
    await ctx.answerCbQuery('🤖 Avvio PR Agent...');
    // Trigger AI analysis on current draft
    const draft = drafts.get(userId);
    if (!draft || (!draft.text && draft.mediaFiles.length === 0)) {
      await ctx.reply('Manda prima del contenuto (testo, foto, video) e poi usa /ai per farlo analizzare.');
      return;
    }
    // Redirect to /ai handler
    await ctx.reply('Usa /ai per analizzare il contenuto con il PR Agent.');
    return;
  }

  if (data === 'post_draft') {
    await ctx.answerCbQuery();
    const draft = drafts.get(userId);
    if (!draft) {
      await ctx.reply('Nessuna bozza. Mandami un messaggio o una foto!');
    } else {
      const mediaInfo = draft.mediaFiles.length > 0
        ? `\n📷 ${draft.mediaFiles.length} immagine/i allegate`
        : '';
      await ctx.reply(`📝 Bozza corrente:\n\n"${draft.text}"${mediaInfo}\n\nUsa /post frh|onde|magmatic per pubblicare.`);
    }
    return;
  }

  // ============================================================================
  // QUICK POST ACTIONS (from photo/video)
  // ============================================================================

  if (data.startsWith('quick_post_')) {
    const account = data.replace('quick_post_', '') as AccountType;
    const state = getConversationState(userId);
    const draft = drafts.get(userId);

    if (!draft && !state?.mediaPath) {
      await ctx.answerCbQuery('❌ Nessun contenuto');
      return;
    }

    setQuickActionAccount(userId, account);
    await ctx.answerCbQuery(`📤 ${account}`);

    const text = draft?.text || state?.text || '';
    const mediaCount = draft?.mediaFiles?.length || (state?.mediaPath ? 1 : 0);

    await showPostPreview(ctx, account, text || '(nessun testo)', mediaCount);
    return;
  }

  if (data.startsWith('confirm_post_')) {
    const account = data.replace('confirm_post_', '') as AccountType;
    const draft = drafts.get(userId);

    if (!draft || !draft.text) {
      await ctx.answerCbQuery('❌ Nessun contenuto da postare');
      return;
    }

    await ctx.answerCbQuery('📤 Pubblicando...');

    const client = account === 'frh' ? frhClient : account === 'onde' ? ondeClient : magmaticClient;
    const accountName = account === 'frh' ? 'FreeRiverHouse' : account === 'onde' ? 'Onde_FRH' : 'magmatic__';

    const result = await postToX(client, draft.text, draft.mediaFiles, accountName);

    if (result.success) {
      await ctx.editMessageText(`✅ *Postato su @${accountName}!*\n\n${result.url}`, { parse_mode: 'Markdown' });
      cleanupDraft(userId);
      clearQuickAction(userId);
    } else {
      await ctx.editMessageText(`❌ Errore: ${result.error}`, { parse_mode: 'Markdown' });
    }
    return;
  }

  if (data === 'edit_post') {
    await ctx.answerCbQuery('✏️ Modifica');
    await ctx.reply('Manda il nuovo testo per il post:');
    setConversationState(userId, 'editing', 0);
    return;
  }

  if (data === 'change_account') {
    await ctx.answerCbQuery();
    await showAccountSelection(ctx);
    return;
  }

  if (data === 'cancel_post' || data === 'quick_ignore') {
    await ctx.answerCbQuery('❌ Annullato');
    clearQuickAction(userId);
    try {
      await ctx.editMessageText('❌ Operazione annullata.');
    } catch {
      await ctx.reply('❌ Operazione annullata.');
    }
    return;
  }

  if (data.startsWith('select_account_')) {
    const account = data.replace('select_account_', '') as AccountType;
    setQuickActionAccount(userId, account);
    const draft = drafts.get(userId);
    const state = getConversationState(userId);

    await ctx.answerCbQuery(`✅ ${account}`);

    const text = draft?.text || state?.text || '';
    const mediaCount = draft?.mediaFiles?.length || (state?.mediaPath ? 1 : 0);

    await showPostPreview(ctx, account, text || '(nessun testo)', mediaCount);
    return;
  }

  if (data === 'quick_ai') {
    await ctx.answerCbQuery('🤖 Avvio PR Agent...');
    await ctx.reply('Usa /ai per analizzare il contenuto con il PR Agent.');
    return;
  }

  if (data === 'quick_save') {
    await ctx.answerCbQuery('💾 Salvato');
    await ctx.reply('💾 Contenuto salvato nella bozza. Usa /draft per vederlo.');
    return;
  }

  if (data === 'quick_add_book') {
    await ctx.answerCbQuery('📚 Aggiungi a libro');
    await ctx.reply('📚 Funzione "aggiungi a libro" in sviluppo. Usa il processo manuale per ora.');
    return;
  }

  if (data === 'quick_reel') {
    await ctx.answerCbQuery('🎬 Crea Reel');
    await ctx.reply('🎬 Funzione "crea reel" in sviluppo. Usa Grok per generare video.');
    return;
  }

  if (data === 'quick_claude') {
    await ctx.answerCbQuery('💬 Chat Claude');
    await ctx.reply('💬 Usa /text <messaggio> per parlare con Claude Code.');
    return;
  }

  if (data === 'quick_post_text') {
    await ctx.answerCbQuery();
    await showAccountSelection(ctx);
    return;
  }

  // ============================================================================
  // BOOKS MENU ACTIONS
  // ============================================================================

  if (data === 'book_new') {
    setConversationState(userId, 'new_book', 0);
    await ctx.answerCbQuery('📚 Nuovo libro');
    await ctx.reply(
      `📚 *NUOVO LIBRO*\n\nScegli la collana:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('📜 Poetry', 'book_collana_poetry'),
            Markup.button.callback('💻 Tech', 'book_collana_tech'),
          ],
          [
            Markup.button.callback('🙏 Spiritualità', 'book_collana_spirituality'),
            Markup.button.callback('🎨 Arte', 'book_collana_arte'),
          ],
          [Markup.button.callback('❌ Annulla', 'flow_cancel')],
        ]),
      }
    );
    return;
  }

  if (data === 'book_status') {
    await ctx.answerCbQuery('📊 Status libri');
    // Show books status from PROGRESS.md
    try {
      const progressFile = path.join(__dirname, '../../../../PROGRESS.md');
      let status = '📚 *STATUS LIBRI*\n\n';

      if (fs.existsSync(progressFile)) {
        const content = fs.readFileSync(progressFile, 'utf-8');
        // Extract relevant info
        status += '✅ AIKO: 100% (8/8 capitoli)\n';
        status += '🟡 Salmo 23: 80% (4/5 capitoli)\n';
        status += '🟠 Piccole Rime: 60% (6/10 poesie)\n';
      } else {
        status += 'Nessun dato disponibile.';
      }

      await ctx.reply(status, { parse_mode: 'Markdown' });
    } catch {
      await ctx.reply('❌ Errore nel leggere lo status dei libri.');
    }
    return;
  }

  if (data.startsWith('book_collana_')) {
    const collana = data.replace('book_collana_', '');
    setConversationState(userId, 'new_book', 1, { collana });
    await ctx.answerCbQuery(`📁 ${collana}`);
    await ctx.reply(`📖 Collana: *${collana}*\n\nInserisci il titolo del libro:`, { parse_mode: 'Markdown' });
    return;
  }

  // ============================================================================
  // APPS MENU ACTIONS
  // ============================================================================

  if (data === 'app_new') {
    setConversationState(userId, 'new_app', 0);
    await ctx.answerCbQuery('📱 Nuova app');
    await ctx.reply('📱 *NUOVA APP*\n\nInserisci il nome dell\'app:', { parse_mode: 'Markdown' });
    return;
  }

  if (data === 'app_status') {
    await ctx.answerCbQuery('📊 Status app');
    await ctx.reply(
      `📱 *STATUS APP*\n\n` +
      `✅ onde-portal: deployed\n` +
      `✅ pr-dashboard: deployed\n` +
      `⏸️ aiko-interactive: in sviluppo`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (data === 'app_build_all') {
    await ctx.answerCbQuery('🔨 Build all...');
    await ctx.reply('🔨 Avvio build di tutte le app...\n\nUsa Claude Code per il build completo.');
    return;
  }

  if (data === 'app_deploy') {
    await ctx.answerCbQuery('🚀 Deploy');
    await ctx.reply('🚀 Funzione deploy in sviluppo. Usa Claude Code per deployare.');
    return;
  }

  // ============================================================================
  // ANALYTICS MENU ACTIONS
  // ============================================================================

  if (data === 'analytics_onde') {
    await ctx.answerCbQuery('📊 Analytics Onde...');
    await ctx.reply('📊 Genero report per @Onde_FRH...');
    try {
      const report = await generateDailyReport(ondeClient, 'Onde_FRH');
      const message = formatReportMessage(report);
      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error: any) {
      await ctx.reply(`❌ Errore: ${error.message}`);
    }
    return;
  }

  if (data === 'analytics_frh') {
    await ctx.answerCbQuery('📊 Analytics FRH...');
    await ctx.reply('📊 Genero report per @FreeRiverHouse...');
    try {
      const report = await generateDailyReport(frhClient, 'FreeRiverHouse');
      const message = formatReportMessage(report);
      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error: any) {
      await ctx.reply(`❌ Errore: ${error.message}`);
    }
    return;
  }

  if (data === 'analytics_trend') {
    await ctx.answerCbQuery('📈 Trend');
    const frhTrend = getWeeklyTrend('FreeRiverHouse');
    const ondeTrend = getWeeklyTrend('Onde_FRH');

    const trendIcon = (t: 'up' | 'down' | 'stable') => t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️';
    const sign = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1);

    let msg = `📊 *TREND SETTIMANALE*\n\n`;
    msg += `*@FreeRiverHouse* ${trendIcon(frhTrend.trend)}\n`;
    msg += `   Crescita: ${sign(frhTrend.weeklyGrowth)} follower\n\n`;
    msg += `*@Onde_FRH* ${trendIcon(ondeTrend.trend)}\n`;
    msg += `   Crescita: ${sign(ondeTrend.weeklyGrowth)} follower`;

    await ctx.reply(msg, { parse_mode: 'Markdown' });
    return;
  }

  if (data === 'analytics_weekly') {
    await ctx.answerCbQuery('📅 Report settimanale');
    await ctx.reply('📅 Il report settimanale completo viene inviato ogni lunedì alle 9:00.');
    return;
  }

  // ============================================================================
  // SYSTEM MENU ACTIONS
  // ============================================================================

  if (data === 'system_dashboard') {
    await ctx.answerCbQuery('📊 Dashboard');
    await showDashboard(ctx);
    return;
  }

  if (data === 'system_approvals') {
    await ctx.answerCbQuery('✅ Approvals');
    const pending = getPendingApprovals();

    if (pending.length === 0) {
      await ctx.reply('✅ Nessuna approvazione in sospeso!');
      return;
    }

    let msg = `📋 *APPROVAZIONI IN SOSPESO* (${pending.length})\n\n`;
    for (const a of pending.slice(0, 10)) {
      msg += `📌 *${a.project}* - ${a.action}\n`;
      msg += `   \`${a.id}\`\n\n`;
    }
    await ctx.reply(msg, { parse_mode: 'Markdown' });
    return;
  }

  if (data === 'system_schedule') {
    await ctx.answerCbQuery('📅 Schedule');
    let msg = '📅 *CONTENT SCHEDULER*\n\n';
    msg += '*Orari (CET):*\n';
    msg += '  Onde: 8:08, 11:11, 22:22\n';
    msg += '  FRH: 9:09, 12:12, 21:21\n\n';
    msg += '*Preview:* 16:20 ogni giorno';
    await ctx.reply(msg, { parse_mode: 'Markdown' });
    return;
  }

  if (data === 'system_agents') {
    await ctx.answerCbQuery('🤖 Agents');
    const tasks = agentQueue.getAllTasks();
    let msg = '🤖 *STATO AGENTI*\n\n';

    const blocked = tasks.filter((t: any) => t.status === 'blocked');
    const inProgress = tasks.filter((t: any) => t.status === 'in_progress');

    if (blocked.length > 0) {
      msg += '🔴 *BLOCCATI*\n';
      blocked.forEach((t: any) => msg += `• ${t.agentName}\n`);
      msg += '\n';
    }

    if (inProgress.length > 0) {
      msg += '🔵 *IN CORSO*\n';
      inProgress.forEach((t: any) => msg += `• ${t.agentName}\n`);
    }

    if (blocked.length === 0 && inProgress.length === 0) {
      msg += '✅ Nessun agente attivo';
    }

    await ctx.reply(msg, { parse_mode: 'Markdown' });
    return;
  }

  if (data === 'system_preview') {
    await ctx.answerCbQuery('👁️ Preview');
    await ctx.reply('📋 Invio preview contenuti...');
    try {
      await sendContentPreview();
    } catch (error: any) {
      await ctx.reply(`❌ Errore: ${error.message}`);
    }
    return;
  }

  if (data === 'system_refresh') {
    await ctx.answerCbQuery('🔄 Refresh');
    await showDashboard(ctx);
    return;
  }

  // ============================================================================
  // FLOW CANCEL
  // ============================================================================

  if (data === 'flow_cancel') {
    clearConversationState(userId);
    await ctx.answerCbQuery('❌ Annullato');
    try {
      await ctx.editMessageText('❌ Operazione annullata.');
    } catch {
      await ctx.reply('❌ Operazione annullata.');
    }
    return;
  }

  // ============================================================================
  // EXISTING APPROVAL HANDLERS
  // ============================================================================

  if (data.startsWith('approve_')) {
    const taskId = data.replace('approve_', '');
    const task = agentQueue.approveTask(taskId);

    if (task) {
      await ctx.answerCbQuery(`✅ ${task.agentName} sbloccato!`);
      await ctx.editMessageText(
        `✅ *${task.agentName}* sbloccato\n\n*Task:* ${task.task}\n\n_Riprende il lavoro..._`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await ctx.answerCbQuery('❌ Task non trovato');
    }
    return;
  }

  if (data.startsWith('talk_')) {
    const taskId = data.replace('talk_', '');
    const task = agentQueue.getTask(taskId);

    if (task) {
      pendingTalkTasks.set(ctx.from!.id, taskId);
      await ctx.answerCbQuery('💬 Scrivi il messaggio...');
      await ctx.reply(
        `💬 *Messaggio per ${task.agentName}*\n\nScrivi il tuo messaggio e lo invierò all'agente.`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await ctx.answerCbQuery('❌ Task non trovato');
    }
    return;
  }

  // Default: unknown callback
  await ctx.answerCbQuery('❓ Azione non riconosciuta');
});

// Store pending talk tasks
const pendingTalkTasks: Map<number, string> = new Map();

// Command: /agents - List all agents and their status
bot.command('agents', async (ctx) => {
  const tasks = agentQueue.getAllTasks();

  let msg = '🤖 *STATO AGENTI*\n\n';

  const byStatus = {
    blocked: tasks.filter((t: any) => t.status === 'blocked'),
    in_progress: tasks.filter((t: any) => t.status === 'in_progress'),
    todo: tasks.filter((t: any) => t.status === 'todo'),
    done: tasks.filter((t: any) => t.status === 'done'),
  };

  if (byStatus.blocked.length > 0) {
    msg += '🔴 *BLOCCATI*\n';
    byStatus.blocked.forEach((t: any) => {
      msg += `• ${t.agentName}: ${t.task}\n  _${t.blockedReason}_\n`;
    });
    msg += '\n';
  }

  if (byStatus.in_progress.length > 0) {
    msg += '🔵 *IN CORSO*\n';
    byStatus.in_progress.forEach((t: any) => {
      msg += `• ${t.agentName}: ${t.task}\n`;
    });
    msg += '\n';
  }

  if (byStatus.todo.length > 0) {
    msg += '⚪ *DA FARE*\n';
    byStatus.todo.forEach((t: any) => {
      msg += `• ${t.agentName}: ${t.task}\n`;
    });
    msg += '\n';
  }

  if (byStatus.done.length > 0) {
    msg += '✅ *COMPLETATI*\n';
    byStatus.done.forEach((t: any) => {
      msg += `• ${t.agentName}: ${t.task}\n`;
    });
  }

  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// Command: /schedule - Show scheduler status and next posts
bot.command('schedule', async (ctx) => {
  const queue = require('./content-scheduler').loadContentQueue
    ? require('./content-scheduler').loadContentQueue()
    : { onde: [], frh: [], lastPosted: { onde: null, frh: null } };

  let msg = '📅 *CONTENT SCHEDULER*\n\n';
  msg += '*Orari (CET):*\n';
  msg += '  Onde: 9:00, 14:00, 20:00\n';
  msg += '  FRH: 10:00, 15:00, 21:00\n\n';

  msg += '*Coda contenuti:*\n';
  const ondeQueued = queue.onde?.filter((i: any) => i.status === 'queued').length || 0;
  const frhQueued = queue.frh?.filter((i: any) => i.status === 'queued').length || 0;
  msg += `  @Onde_FRH: ${ondeQueued} pronti\n`;
  msg += `  @FreeRiverHouse: ${frhQueued} pronti\n\n`;

  msg += '*Ultimo post:*\n';
  msg += `  Onde: ${queue.lastPosted?.onde ? new Date(queue.lastPosted.onde).toLocaleString('it-IT') : 'mai'}\n`;
  msg += `  FRH: ${queue.lastPosted?.frh ? new Date(queue.lastPosted.frh).toLocaleString('it-IT') : 'mai'}\n`;

  ctx.reply(msg, { parse_mode: 'Markdown' });
});

// Command: /preview - Send all scheduled posts as elegant slides
bot.command('preview', async (ctx) => {
  ctx.reply('📋 Invio preview contenuti...');
  try {
    await sendContentPreview();
  } catch (error: any) {
    ctx.reply(`❌ Errore: ${error.message}`);
  }
});

// Command: /sync - Sync with dashboard (onde.surf)
bot.command('sync', async (ctx) => {
  ctx.reply('🔄 Sincronizzazione con onde.surf...');
  try {
    await syncCheck();
    ctx.reply('✅ Sincronizzazione completata!');
  } catch (error: any) {
    ctx.reply(`❌ Errore: ${error.message}`);
  }
});

// Command: /autopost [onde|frh] - Trigger manual scheduled post
bot.command('autopost', async (ctx) => {
  const args = ctx.message.text.replace(/^\/autopost\s*/, '').trim();
  const account = args as 'onde' | 'frh';

  if (account !== 'onde' && account !== 'frh') {
    ctx.reply('Uso: /autopost <onde|frh>\n\nEsempio: /autopost onde');
    return;
  }

  ctx.reply(`📤 Invio post automatico su @${account === 'frh' ? 'FreeRiverHouse' : 'Onde_FRH'}...`);

  try {
    await runScheduledPost(account);
    ctx.reply(`✅ Post inviato su @${account === 'frh' ? 'FreeRiverHouse' : 'Onde_FRH'}`);
  } catch (error: any) {
    ctx.reply(`❌ Errore: ${error.message}`);
  }
});

// Command: /block [agent] [reason] - Block an agent (for testing)
bot.command('block', async (ctx) => {
  const args = ctx.message.text.replace(/^\/block\s*/, '').trim();
  const [agentName, ...reasonParts] = args.split(' ');
  const reason = reasonParts.join(' ') || 'Richiede approvazione';

  if (!agentName) {
    ctx.reply('Uso: /block [nome_agente] [motivo]');
    return;
  }

  const task = agentQueue.addTask({
    agentName,
    agentType: 'claude',
    task: 'Task bloccato manualmente',
    status: 'blocked',
    blockedReason: reason,
    priority: 'high',
  });

  // This will trigger the notification
  await sendAgentApprovalRequest(task);
});

// Register callback for when tasks get blocked
agentQueue.onTaskBlocked(async (task: any) => {
  await sendAgentApprovalRequest(task);
});

// === Start Bot ===
console.log('🚀 Onde PR Bot starting...');
console.log(`   Bot: @OndePR_bot`);

// Dashboard sync interval (check every 5 minutes)
let dashboardSyncInterval: NodeJS.Timeout | null = null;

function startDashboardSync() {
  console.log('🔄 Dashboard sync: starting (every 5 minutes)');
  dashboardSyncInterval = setInterval(async () => {
    try {
      await syncCheck();
    } catch (error) {
      console.error('Dashboard sync error:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

function stopDashboardSync() {
  if (dashboardSyncInterval) {
    clearInterval(dashboardSyncInterval);
    dashboardSyncInterval = null;
  }
}

bot.launch().then(() => {
  console.log('✅ Onde PR Bot is running!');
  console.log('   Send /start to begin');
  console.log('   Agent approval system: ACTIVE');
  console.log('   Content scheduler: ACTIVE');
  console.log('   Dashboard sync: ACTIVE');

  // Schedule daily reports
  scheduleDailyReport();

  // Start content scheduler (3x daily posting)
  initializeContentQueue();
  startScheduler();

  // Schedule content preview at 16:20 daily
  scheduleContentPreview();

  // Start dashboard sync (check onde.surf for approved posts)
  startDashboardSync();

  // Initial sync check
  syncCheck().catch(err => console.error('Initial sync failed:', err));
});

// Graceful shutdown
process.once('SIGINT', () => {
  stopScheduler();
  stopDashboardSync();
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  stopScheduler();
  stopDashboardSync();
  bot.stop('SIGTERM');
});
