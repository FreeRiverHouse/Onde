/**
 * Chat History Manager - Persistent chat history for Telegram bot
 *
 * Saves conversation history to file so Claude can see context from previous messages.
 * This enables Claude to remember what was discussed even across sessions.
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '../data');
const HISTORY_FILE = path.join(DATA_DIR, 'chat-history.json');

// Max messages to keep in history
const MAX_HISTORY = 30;

export interface ChatHistoryMessage {
  timestamp: string;
  from: 'user' | 'bot';
  text: string;
  type?: 'text' | 'photo' | 'voice' | 'video';
}

interface ChatHistoryData {
  messages: ChatHistoryMessage[];
  context: {
    currentBook?: string;
    lastChapter?: number;
    lastTopic?: string;
    lastActivity?: string;
  };
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Load chat history from file
 */
export function loadChatHistory(): ChatHistoryData {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading chat history:', e);
  }

  return {
    messages: [],
    context: {}
  };
}

/**
 * Save chat history to file
 */
function saveChatHistory(data: ChatHistoryData): void {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
}

/**
 * Add a user message to history
 */
export function addUserMessage(text: string, type: 'text' | 'photo' | 'voice' | 'video' = 'text'): void {
  const data = loadChatHistory();

  const message: ChatHistoryMessage = {
    timestamp: new Date().toISOString(),
    from: 'user',
    text: text.slice(0, 500), // Truncate long messages
    type
  };

  data.messages.push(message);

  // Keep only last MAX_HISTORY messages
  if (data.messages.length > MAX_HISTORY) {
    data.messages = data.messages.slice(-MAX_HISTORY);
  }

  // Update context based on message content
  updateContextFromMessage(data, text);

  saveChatHistory(data);
}

/**
 * Add a bot response to history
 */
export function addBotMessage(text: string): void {
  const data = loadChatHistory();

  const message: ChatHistoryMessage = {
    timestamp: new Date().toISOString(),
    from: 'bot',
    text: text.slice(0, 500), // Truncate long messages
    type: 'text'
  };

  data.messages.push(message);

  // Keep only last MAX_HISTORY messages
  if (data.messages.length > MAX_HISTORY) {
    data.messages = data.messages.slice(-MAX_HISTORY);
  }

  saveChatHistory(data);
}

/**
 * Update context based on message content
 */
function updateContextFromMessage(data: ChatHistoryData, text: string): void {
  const lower = text.toLowerCase();

  // Detect book references
  const bookPatterns = [
    { pattern: /milo/i, name: 'milo' },
    { pattern: /aiko/i, name: 'aiko' },
    { pattern: /salmo/i, name: 'salmo-23' },
    { pattern: /piccole rime/i, name: 'piccole-rime' },
    { pattern: /emilio/i, name: 'emilio' },
  ];

  for (const { pattern, name } of bookPatterns) {
    if (pattern.test(text)) {
      data.context.currentBook = name;
      break;
    }
  }

  // Detect chapter references
  const chapterMatch = lower.match(/(?:capitolo|chapter|ch\.?)\s*(\d+)/i);
  if (chapterMatch) {
    data.context.lastChapter = parseInt(chapterMatch[1]);
  }

  // Detect topics
  const topics = [
    { patterns: ['muladhara', 'chakra', 'root chakra'], topic: 'muladhara-chakra' },
    { patterns: ['meditazione', 'meditation'], topic: 'meditation' },
    { patterns: ['video', 'reel', 'tiktok'], topic: 'video-generation' },
    { patterns: ['post', 'social', 'twitter', 'x.com'], topic: 'social-posting' },
    { patterns: ['immagine', 'image', 'illustrazione', 'grok'], topic: 'image-generation' },
    { patterns: ['corde', 'genera immagini'], topic: 'corde-app' },
  ];

  for (const { patterns, topic } of topics) {
    if (patterns.some(p => lower.includes(p))) {
      data.context.lastTopic = topic;
      break;
    }
  }

  data.context.lastActivity = new Date().toISOString();
}

/**
 * Set context manually
 */
export function setContext(key: keyof ChatHistoryData['context'], value: any): void {
  const data = loadChatHistory();
  data.context[key] = value;
  saveChatHistory(data);
}

/**
 * Get current context
 */
export function getContext(): ChatHistoryData['context'] {
  return loadChatHistory().context;
}

/**
 * Format chat history for Claude's system prompt
 * Returns last N messages formatted nicely
 */
export function formatHistoryForPrompt(maxMessages: number = 30): string {
  const data = loadChatHistory();
  const messages = data.messages.slice(-maxMessages);

  if (messages.length === 0) {
    return 'Nessuna conversazione recente.';
  }

  const lines = messages.map(msg => {
    const time = new Date(msg.timestamp).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const from = msg.from === 'user' ? 'Mattia' : 'Bot';
    const text = msg.text.slice(0, 200) + (msg.text.length > 200 ? '...' : '');
    return `[${time}] ${from}: ${text}`;
  });

  return lines.join('\n');
}

/**
 * Get context summary for Claude
 */
export function getContextSummary(): string {
  const ctx = getContext();
  const parts: string[] = [];

  if (ctx.currentBook) {
    parts.push(`Libro corrente: ${ctx.currentBook}`);
  }
  if (ctx.lastChapter) {
    parts.push(`Ultimo capitolo: ${ctx.lastChapter}`);
  }
  if (ctx.lastTopic) {
    parts.push(`Ultimo argomento: ${ctx.lastTopic}`);
  }

  return parts.length > 0 ? parts.join('\n') : 'Nessun contesto salvato.';
}

/**
 * Clear history (for debugging/reset)
 */
export function clearHistory(): void {
  const data: ChatHistoryData = {
    messages: [],
    context: {}
  };
  saveChatHistory(data);
}
