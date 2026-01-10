// Config
export {
  getConfig,
  isElevenLabsAvailable,
  resetConfig,
} from './config';

// TTS (Text-to-Speech)
export {
  tts,
  TTSService,
  ELEVENLABS_VOICES,
  ELEVENLABS_MODELS,
} from './tts';
export type {
  TTSProvider,
  TTSStatus,
  TTSOptions,
  TTSConfig,
} from './tts';

// Whisper (Speech-to-Text)
export {
  WhisperService,
  initWhisper,
  getWhisper,
  isWhisperInitialized,
  transcribeAudio,
  transcribeAudioWithKey,
} from './whisper';
export type {
  TranscriptionResult,
  WhisperConfig,
} from './whisper';

// Claude API
export {
  sendToClaudeAPI,
  streamFromClaudeAPI,
  processVoiceCommand,
  processVoiceCommandStreaming,
} from './claude';
export type {
  Message,
  ClaudeResponse,
  StreamCallbacks,
} from './claude';
