/**
 * Test script per bottoni approvazione Telegram
 * Invia un messaggio di test con bottoni inline
 */

import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const agentQueuePath = path.join(__dirname, '../agent-queue/src/index');
const agentQueue = require(agentQueuePath);

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

const bot = new Telegraf(TELEGRAM_TOKEN);

// Handle inline button callbacks
bot.on('callback_query', async (ctx) => {
  const data = (ctx.callbackQuery as any).data;
  if (!data) return;

  console.log('Callback received:', data);

  if (data.startsWith('approve_')) {
    const taskId = data.replace('approve_', '');
    const task = agentQueue.approveTask(taskId);

    if (task) {
      await ctx.answerCbQuery(`✅ ${task.agentName} sbloccato!`);
      await ctx.editMessageText(
        `✅ *${task.agentName}* sbloccato\n\n*Task:* ${task.task}\n\n_Riprende il lavoro..._`,
        { parse_mode: 'Markdown' }
      );
      console.log(`Task ${taskId} approved:`, task.agentName);
    } else {
      await ctx.answerCbQuery('❌ Task non trovato');
    }
  } else if (data.startsWith('talk_')) {
    const taskId = data.replace('talk_', '');
    const task = agentQueue.getTask(taskId);

    if (task) {
      await ctx.answerCbQuery('💬 Funzione parla...');
      await ctx.reply(
        `💬 *Messaggio per ${task.agentName}*\n\nScrivi il tuo messaggio.`,
        { parse_mode: 'Markdown' }
      );
    }
  }
});

// Send test approval message
async function sendTestApproval() {
  const blockedTasks = agentQueue.getBlockedTasks();

  if (blockedTasks.length === 0) {
    console.log('No blocked tasks. Creating one...');
    agentQueue.blockTask('2', 'Test blocco - approva da Telegram');
  }

  const task = agentQueue.getBlockedTasks()[0];
  if (!task) {
    console.log('No blocked task found');
    return;
  }

  console.log('Sending approval request for:', task.agentName);

  const message = `🔴 *${task.agentName}* bloccato

*Task:* ${task.task}
*Motivo:* ${task.blockedReason || 'Non specificato'}

_Tap per approvare o inviare messaggio_`;

  await bot.telegram.sendMessage(CHAT_ID, message, {
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

  console.log('Approval request sent! Check Telegram.');
}

console.log('🚀 Starting Telegram approval test...');
console.log(`   Chat ID: ${CHAT_ID}`);

bot.launch().then(async () => {
  console.log('✅ Bot connected');
  await sendTestApproval();
  console.log('   Waiting for button clicks... (Ctrl+C to stop)');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
