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

bot.command('start', (ctx) => {
  ctx.reply(`Ciao! Sono Onde PR.

Mandami un messaggio o una foto e ti aiuto a postare su X.

Comandi:
/frh [testo] - Posta su @FreeRiverHouse
/onde [testo] - Posta su @Onde_FRH
/magmatic [testo] - Posta su @magmatic__
/draft - Vedi la bozza corrente
/clear - Cancella la bozza
/post frh|onde|magmatic - Posta la bozza

Oppure mandami testo/foto e poi dimmi dove postare!`);
});

bot.command('help', (ctx) => {
  ctx.reply(`*ONDE PR BOT*

📤 *Posting*
/frh [testo] - @FreeRiverHouse
/onde [testo] - @Onde\\_FRH
/magmatic [testo] - @magmatic\\_\\_
/draft - Mostra bozza
/clear - Cancella bozza
/post frh|onde|magmatic - Pubblica

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

💡 *Flusso:*
1. Manda testo/foto/video
2. /ai → Proposte
3. /use 1 → Seleziona
4. /post frh|onde|magmatic → Pubblica`, { parse_mode: 'Markdown' });
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

// Handle photos -> add to draft
bot.on(message('photo'), async (ctx) => {
  const userId = ctx.from.id;
  const photo = ctx.message.photo[ctx.message.photo.length - 1]; // highest resolution
  const caption = ctx.message.caption || '';

  try {
    // Get file info
    const file = await ctx.telegram.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;

    // Download to temp
    const localPath = path.join(tempDir, `${userId}_${Date.now()}.jpg`);
    await downloadFile(fileUrl, localPath);

    // Update draft
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
    ctx.reply(`📷 Foto aggiunta! (${draft.mediaFiles.length} media)\n\n${draft.text ? `Testo: "${draft.text}"` : 'Nessun testo - manda un messaggio'}\n\n🤖 /ai → PR Agent analizza\n📤 /post frh|onde → Pubblica`);

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
    ctx.reply(`🎬 Video aggiunto! (${draft.mediaFiles.length} media)\n\n${draft.text ? `Testo: "${draft.text}"` : 'Nessun testo - manda un messaggio o descrivi il video'}\n\n🤖 /ai → PR Agent analizza e crea post\n📤 /post frh|onde → Pubblica\n\n💡 Descrivi cosa mostra il video per un'analisi migliore!`);

  } catch (error: any) {
    ctx.reply(`❌ Errore: ${error.message}`);
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

// Send approval request with inline buttons
async function sendApprovalRequest(task: agentQueue.AgentTask) {
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

// Handle inline button callbacks
bot.on('callback_query', async (ctx) => {
  const data = (ctx.callbackQuery as any).data;
  if (!data) return;

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
  } else if (data.startsWith('talk_')) {
    const taskId = data.replace('talk_', '');
    const task = agentQueue.getTask(taskId);

    if (task) {
      // Store pending talk task
      pendingTalkTasks.set(ctx.from!.id, taskId);
      await ctx.answerCbQuery('💬 Scrivi il messaggio...');
      await ctx.reply(
        `💬 *Messaggio per ${task.agentName}*\n\nScrivi il tuo messaggio e lo invierò all'agente.`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await ctx.answerCbQuery('❌ Task non trovato');
    }
  }
});

// Store pending talk tasks
const pendingTalkTasks: Map<number, string> = new Map();

// Command: /agents - List all agents and their status
bot.command('agents', async (ctx) => {
  const tasks = agentQueue.getAllTasks();

  let msg = '🤖 *STATO AGENTI*\n\n';

  const byStatus = {
    blocked: tasks.filter(t => t.status === 'blocked'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    todo: tasks.filter(t => t.status === 'todo'),
    done: tasks.filter(t => t.status === 'done'),
  };

  if (byStatus.blocked.length > 0) {
    msg += '🔴 *BLOCCATI*\n';
    byStatus.blocked.forEach(t => {
      msg += `• ${t.agentName}: ${t.task}\n  _${t.blockedReason}_\n`;
    });
    msg += '\n';
  }

  if (byStatus.in_progress.length > 0) {
    msg += '🔵 *IN CORSO*\n';
    byStatus.in_progress.forEach(t => {
      msg += `• ${t.agentName}: ${t.task}\n`;
    });
    msg += '\n';
  }

  if (byStatus.todo.length > 0) {
    msg += '⚪ *DA FARE*\n';
    byStatus.todo.forEach(t => {
      msg += `• ${t.agentName}: ${t.task}\n`;
    });
    msg += '\n';
  }

  if (byStatus.done.length > 0) {
    msg += '✅ *COMPLETATI*\n';
    byStatus.done.forEach(t => {
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
  await sendApprovalRequest(task);
});

// Register callback for when tasks get blocked
agentQueue.onTaskBlocked(async (task) => {
  await sendApprovalRequest(task);
});

// === Start Bot ===
console.log('🚀 Onde PR Bot starting...');
console.log(`   Bot: @OndePR_bot`);

bot.launch().then(() => {
  console.log('✅ Onde PR Bot is running!');
  console.log('   Send /start to begin');
  console.log('   Agent approval system: ACTIVE');
  console.log('   Content scheduler: ACTIVE');

  // Schedule daily reports
  scheduleDailyReport();

  // Start content scheduler (3x daily posting)
  initializeContentQueue();
  startScheduler();

  // Schedule content preview at 16:20 daily
  scheduleContentPreview();
});

// Graceful shutdown
process.once('SIGINT', () => {
  stopScheduler();
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  stopScheduler();
  bot.stop('SIGTERM');
});
