/**
 * Quick Actions for Media Handling
 * When users send photos/videos without being in a flow, show quick action buttons
 */

import { Markup, Context } from 'telegraf';
import {
  setConversationState,
  getConversationState,
  clearConversationState,
  AccountType,
} from './conversation-state';

// ============================================================================
// QUICK ACTION KEYBOARDS
// ============================================================================

/**
 * Quick actions for received photo
 */
export function getPhotoQuickActionsKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📤 Onde', 'quick_post_onde'),
      Markup.button.callback('📤 FRH', 'quick_post_frh'),
      Markup.button.callback('📤 Magmatic', 'quick_post_magmatic'),
    ],
    [
      Markup.button.callback('🤖 Chiedi a AI', 'quick_ai'),
      Markup.button.callback('📚 Aggiungi a libro', 'quick_add_book'),
    ],
    [
      Markup.button.callback('💾 Salva per dopo', 'quick_save'),
      Markup.button.callback('❌ Ignora', 'quick_ignore'),
    ],
  ]);
}

/**
 * Quick actions for received video
 */
export function getVideoQuickActionsKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📤 Onde', 'quick_post_onde'),
      Markup.button.callback('📤 FRH', 'quick_post_frh'),
      Markup.button.callback('📤 Magmatic', 'quick_post_magmatic'),
    ],
    [
      Markup.button.callback('🤖 Chiedi a AI', 'quick_ai'),
      Markup.button.callback('🎬 Crea Reel', 'quick_reel'),
    ],
    [
      Markup.button.callback('💾 Salva per dopo', 'quick_save'),
      Markup.button.callback('❌ Ignora', 'quick_ignore'),
    ],
  ]);
}

/**
 * Quick actions for received text (when not in flow)
 */
export function getTextQuickActionsKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📤 Posta', 'quick_post_text'),
      Markup.button.callback('🤖 Chiedi a AI', 'quick_ai'),
    ],
    [
      Markup.button.callback('💬 Chat Claude', 'quick_claude'),
      Markup.button.callback('📋 Menu', 'menu_main'),
    ],
  ]);
}

/**
 * Post preview keyboard
 */
export function getPostPreviewKeyboard(account: AccountType) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📤 Pubblica', `confirm_post_${account}`),
      Markup.button.callback('✏️ Modifica', 'edit_post'),
    ],
    [
      Markup.button.callback('🔄 Cambia account', 'change_account'),
      Markup.button.callback('❌ Annulla', 'cancel_post'),
    ],
  ]);
}

/**
 * Account selection keyboard for quick post
 */
export function getAccountSelectionKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🌊 Onde', 'select_account_onde'),
      Markup.button.callback('🏠 FRH', 'select_account_frh'),
      Markup.button.callback('🎨 Magmatic', 'select_account_magmatic'),
    ],
    [Markup.button.callback('❌ Annulla', 'cancel_post')],
  ]);
}

// ============================================================================
// QUICK ACTION MESSAGES
// ============================================================================

export function getPhotoReceivedMessage(mediaCount: number, caption?: string): string {
  let msg = `📷 *Foto ricevuta!* (${mediaCount} media)\n`;

  if (caption) {
    msg += `\n📝 Caption: "${caption.substring(0, 100)}${caption.length > 100 ? '...' : ''}"\n`;
  }

  msg += `\nCosa vuoi fare?`;
  return msg;
}

export function getVideoReceivedMessage(mediaCount: number, caption?: string): string {
  let msg = `🎬 *Video ricevuto!* (${mediaCount} media)\n`;

  if (caption) {
    msg += `\n📝 Caption: "${caption.substring(0, 100)}${caption.length > 100 ? '...' : ''}"\n`;
  }

  msg += `\nCosa vuoi fare?`;
  return msg;
}

export function getTextReceivedMessage(text: string): string {
  const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
  return `💬 *Messaggio ricevuto*\n\n"${preview}"\n\nCosa vuoi fare?`;
}

export function getPostPreviewMessage(
  account: AccountType,
  text: string,
  mediaCount: number
): string {
  const accountLabels: Record<AccountType, string> = {
    onde: '@Onde_FRH 🌊',
    frh: '@FreeRiverHouse 🏠',
    magmatic: '@magmatic__ 🎨',
  };

  let msg = `👁️ *PREVIEW POST*\n\n`;
  msg += `📍 Account: ${accountLabels[account]}\n\n`;
  msg += `📝 Testo:\n"${text}"\n`;

  if (mediaCount > 0) {
    msg += `\n📎 Media: ${mediaCount} allegato/i`;
  }

  msg += `\n\n✅ Pronto per pubblicare?`;
  return msg;
}

// ============================================================================
// STATE MANAGEMENT FOR QUICK ACTIONS
// ============================================================================

/**
 * Store pending quick action state
 */
export function setPendingQuickAction(
  userId: number,
  mediaPath?: string,
  mediaType?: 'image' | 'video',
  text?: string
) {
  setConversationState(userId, 'quick_post', 0, {
    mediaPath,
    mediaType,
    text,
  });
}

/**
 * Get pending quick action state
 */
export function getPendingQuickAction(userId: number) {
  return getConversationState(userId);
}

/**
 * Set account for pending quick action
 */
export function setQuickActionAccount(userId: number, account: AccountType) {
  const state = getConversationState(userId);
  if (state) {
    setConversationState(userId, 'quick_post', 1, {
      ...state.data,
      account,
    });
  }
}

/**
 * Clear pending quick action
 */
export function clearQuickAction(userId: number) {
  clearConversationState(userId);
}

// ============================================================================
// QUICK ACTION HANDLERS (to be called from index.ts)
// ============================================================================

export interface QuickActionContext {
  userId: number;
  mediaPath?: string;
  mediaType?: 'image' | 'video';
  text?: string;
  caption?: string;
}

/**
 * Handle photo received - show quick actions
 */
export async function handlePhotoQuickActions(
  ctx: Context,
  mediaCount: number,
  caption?: string
) {
  const message = getPhotoReceivedMessage(mediaCount, caption);
  const keyboard = getPhotoQuickActionsKeyboard();

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    ...keyboard,
  });
}

/**
 * Handle video received - show quick actions
 */
export async function handleVideoQuickActions(
  ctx: Context,
  mediaCount: number,
  caption?: string
) {
  const message = getVideoReceivedMessage(mediaCount, caption);
  const keyboard = getVideoQuickActionsKeyboard();

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    ...keyboard,
  });
}

/**
 * Handle text received when not in flow - show quick actions
 */
export async function handleTextQuickActions(ctx: Context, text: string) {
  const message = getTextReceivedMessage(text);
  const keyboard = getTextQuickActionsKeyboard();

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    ...keyboard,
  });
}

/**
 * Show post preview
 */
export async function showPostPreview(
  ctx: Context,
  account: AccountType,
  text: string,
  mediaCount: number
) {
  const message = getPostPreviewMessage(account, text, mediaCount);
  const keyboard = getPostPreviewKeyboard(account);

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    ...keyboard,
  });
}

/**
 * Show account selection
 */
export async function showAccountSelection(ctx: Context) {
  const keyboard = getAccountSelectionKeyboard();

  await ctx.reply('📍 Seleziona l\'account per il post:', {
    parse_mode: 'Markdown',
    ...keyboard,
  });
}
