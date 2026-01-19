/**
 * Conversation State Machine for Interactive Command Center
 * Manages user conversation flows for posting, book creation, app creation, etc.
 */

export type FlowType =
  | 'idle'
  | 'posting'
  | 'new_book'
  | 'new_app'
  | 'editing'
  | 'quick_post';

export type AccountType = 'onde' | 'frh' | 'magmatic';
export type CollanaType = 'poetry' | 'tech' | 'spirituality' | 'arte';
export type AppType = 'game' | 'educational' | 'utility';

export interface ConversationState {
  userId: number;
  flow: FlowType;
  step: number;
  data: Record<string, any>;
  expiresAt: Date;
  // Flow-specific data
  account?: AccountType;
  mediaPath?: string;
  mediaType?: 'image' | 'video';
  text?: string;
}

// In-memory storage for conversation states
const conversations: Map<number, ConversationState> = new Map();

// State expiration time (15 minutes)
const STATE_EXPIRATION_MS = 15 * 60 * 1000;

/**
 * Get conversation state for a user
 */
export function getConversationState(userId: number): ConversationState | null {
  const state = conversations.get(userId);

  if (!state) return null;

  // Check if expired
  if (new Date() > state.expiresAt) {
    conversations.delete(userId);
    return null;
  }

  return state;
}

/**
 * Create or update conversation state
 */
export function setConversationState(
  userId: number,
  flow: FlowType,
  step: number = 0,
  data: Record<string, any> = {}
): ConversationState {
  const existingState = conversations.get(userId);

  const state: ConversationState = {
    userId,
    flow,
    step,
    data: { ...existingState?.data, ...data },
    expiresAt: new Date(Date.now() + STATE_EXPIRATION_MS),
    account: data.account || existingState?.account,
    mediaPath: data.mediaPath || existingState?.mediaPath,
    mediaType: data.mediaType || existingState?.mediaType,
    text: data.text || existingState?.text,
  };

  conversations.set(userId, state);
  return state;
}

/**
 * Update step in current flow
 */
export function advanceStep(userId: number, additionalData?: Record<string, any>): ConversationState | null {
  const state = getConversationState(userId);
  if (!state) return null;

  return setConversationState(userId, state.flow, state.step + 1, additionalData);
}

/**
 * Clear conversation state (reset to idle)
 */
export function clearConversationState(userId: number): void {
  conversations.delete(userId);
}

/**
 * Check if user is in a specific flow
 */
export function isInFlow(userId: number, flow?: FlowType): boolean {
  const state = getConversationState(userId);
  if (!state) return false;

  if (flow) {
    return state.flow === flow;
  }

  return state.flow !== 'idle';
}

/**
 * Get all active conversations (for debugging)
 */
export function getActiveConversations(): Map<number, ConversationState> {
  // Clean expired states first
  const now = new Date();
  for (const [userId, state] of conversations) {
    if (now > state.expiresAt) {
      conversations.delete(userId);
    }
  }
  return conversations;
}

// ============================================================================
// FLOW DEFINITIONS
// ============================================================================

export interface FlowStep {
  message: string;
  buttons?: { label: string; callback: string }[][];
  expectsInput?: 'text' | 'media' | 'any';
}

export const POSTING_FLOW: FlowStep[] = [
  {
    message: '📤 *NUOVO POST*\n\nScegli l\'account:',
    buttons: [
      [
        { label: '🌊 Onde', callback: 'flow_post_onde' },
        { label: '🏠 FRH', callback: 'flow_post_frh' },
        { label: '🎨 Magmatic', callback: 'flow_post_magmatic' },
      ],
      [{ label: '❌ Annulla', callback: 'flow_cancel' }],
    ],
  },
  {
    message: '📝 Scrivi il testo del post oppure manda una foto/video:',
    expectsInput: 'any',
  },
  {
    message: '👁️ *PREVIEW*\n\n{preview}\n\n✅ Pronto per pubblicare?',
    buttons: [
      [
        { label: '📤 Pubblica', callback: 'flow_post_confirm' },
        { label: '✏️ Modifica', callback: 'flow_post_edit' },
      ],
      [{ label: '❌ Annulla', callback: 'flow_cancel' }],
    ],
  },
];

export const NEW_BOOK_FLOW: FlowStep[] = [
  {
    message: '📚 *NUOVO LIBRO*\n\nScegli la collana:',
    buttons: [
      [
        { label: '📜 Poetry', callback: 'flow_book_poetry' },
        { label: '💻 Tech', callback: 'flow_book_tech' },
      ],
      [
        { label: '🙏 Spiritualità', callback: 'flow_book_spirituality' },
        { label: '🎨 Arte', callback: 'flow_book_arte' },
      ],
      [{ label: '❌ Annulla', callback: 'flow_cancel' }],
    ],
  },
  {
    message: '📖 Inserisci il titolo del libro:',
    expectsInput: 'text',
  },
  {
    message: '🎨 Scegli lo stile illustrativo:',
    buttons: [
      [
        { label: '🖼️ Acquarello Onde', callback: 'flow_book_style_watercolor' },
        { label: '🎪 Scarry-Seuss', callback: 'flow_book_style_whimsical' },
      ],
      [
        { label: '📻 Vintage \'50', callback: 'flow_book_style_vintage' },
        { label: '🔲 Flat Modern', callback: 'flow_book_style_flat' },
      ],
      [{ label: '❌ Annulla', callback: 'flow_cancel' }],
    ],
  },
  {
    message: '📚 *CONFERMA CREAZIONE*\n\n' +
      '📖 Titolo: *{title}*\n' +
      '📁 Collana: *{collana}*\n' +
      '🎨 Stile: *{style}*\n\n' +
      'Vuoi creare questo libro?',
    buttons: [
      [
        { label: '✅ Crea', callback: 'flow_book_confirm' },
        { label: '❌ Annulla', callback: 'flow_cancel' },
      ],
    ],
  },
];

export const NEW_APP_FLOW: FlowStep[] = [
  {
    message: '📱 *NUOVA APP*\n\nInserisci il nome dell\'app:',
    expectsInput: 'text',
  },
  {
    message: '🎯 Scegli il tipo:',
    buttons: [
      [
        { label: '🎮 Game', callback: 'flow_app_game' },
        { label: '📚 Educational', callback: 'flow_app_educational' },
      ],
      [
        { label: '🔧 Utility', callback: 'flow_app_utility' },
      ],
      [{ label: '❌ Annulla', callback: 'flow_cancel' }],
    ],
  },
  {
    message: '📱 *CONFERMA CREAZIONE*\n\n' +
      '📛 Nome: *{name}*\n' +
      '🎯 Tipo: *{type}*\n\n' +
      'Vuoi creare questa app con Vite + React?',
    buttons: [
      [
        { label: '✅ Crea', callback: 'flow_app_confirm' },
        { label: '❌ Annulla', callback: 'flow_cancel' },
      ],
    ],
  },
];
