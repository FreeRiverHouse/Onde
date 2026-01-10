// Main conversation hook
export { useConversation, DEFAULT_AGENTS } from './useConversation';
export type {
  ConversationStatus,
  Message,
  Agent,
  UseConversationOptions,
  UseConversationReturn,
} from './useConversation';

// TTS hook
export { useTTS, useExpoSpeech, useElevenLabs } from './useTTS';
export type {
  UseTTSOptions,
  UseTTSReturn,
  QueueItem,
} from './useTTS';
