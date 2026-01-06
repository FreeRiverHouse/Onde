import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import {
  generateDailyReport,
  formatReportMessage,
  getWeeklyTrend,
} from './analytics';
import { prAgent, ContentAnalysis } from './pr-agent';

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

💡 *Flusso:*
1. Manda testo/foto/video
2. /ai → Proposte
3. /use 1 → Seleziona
4. /post frh|onde|magmatic → Pubblica`, { parse_mode: 'Markdown' });
});

bot.command('chatid', (ctx) => {
  ctx.reply(`Chat ID: ${ctx.chat.id}`);
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

// === Message Handlers ===

// Handle text messages -> create/update draft
bot.on(message('text'), (ctx) => {
  // Skip commands
  if (ctx.message.text.startsWith('/')) return;

  const userId = ctx.from.id;
  const existingDraft = drafts.get(userId);

  drafts.set(userId, {
    text: ctx.message.text,
    mediaFiles: existingDraft?.mediaFiles || [],
    mediaTypes: existingDraft?.mediaTypes || [],
  });

  const mediaCount = existingDraft?.mediaFiles?.length || 0;
  const mediaInfo = mediaCount > 0 ? `\n📎 + ${mediaCount} media allegati` : '';

  ctx.reply(`📝 Bozza salvata:\n\n"${ctx.message.text}"${mediaInfo}\n\n🤖 /ai → Fai analizzare dal PR Agent\n📤 /post frh|onde → Pubblica`);
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

// === Start Bot ===
console.log('🚀 Onde PR Bot starting...');
console.log(`   Bot: @OndePR_bot`);

bot.launch().then(() => {
  console.log('✅ Onde PR Bot is running!');
  console.log('   Send /start to begin');

  // Schedule daily reports
  scheduleDailyReport();
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
