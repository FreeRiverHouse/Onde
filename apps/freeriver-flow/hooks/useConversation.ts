/**
 * useConversation Hook
 *
 * Hook principale per gestire le conversazioni vocali con gli agenti Onde.
 *
 * Integra:
 * - Voice Recording (expo-av)
 * - Whisper API (speech-to-text)
 * - Claude API (AI conversation)
 * - TTS (text-to-speech via expo-speech o ElevenLabs)
 *
 * Stati: idle | listening | processing | speaking
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { getConfig, isElevenLabsAvailable } from '@/services/config';
import { WhisperService, initWhisper, getWhisper } from '@/services/whisper';
import { processVoiceCommand, type Message as ClaudeMessage } from '@/services/claude';
import { tts } from '@/services/tts';
import { agents, getAgentById, getAgentSystemPrompt, type Agent } from '@/data/agents';

// ============================================
// TYPES
// ============================================

export type ConversationStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
}

export interface UseConversationOptions {
  /** ID agente iniziale (default: editore-capo) */
  initialAgent?: string;
  /** Usa ElevenLabs per TTS se disponibile (default: true) */
  useElevenLabs?: boolean;
  /** Callback quando cambia lo status */
  onStatusChange?: (status: ConversationStatus) => void;
  /** Callback quando arriva un messaggio */
  onMessage?: (message: Message) => void;
  /** Callback su errore */
  onError?: (error: Error) => void;
}

export interface UseConversationReturn {
  // State
  messages: Message[];
  activeAgent: string;
  status: ConversationStatus;
  error: string | null;
  currentAgent: Agent | undefined;
  agents: Agent[];

  // Actions
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  cancelSpeaking: () => Promise<void>;
  clearMessages: () => void;
  setActiveAgent: (agentId: string, clearHistory?: boolean) => void;
}

// Re-export types for convenience
export type { Agent };

// Export agents list
export const DEFAULT_AGENTS = agents;

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useConversation(options: UseConversationOptions = {}): UseConversationReturn {
  const {
    initialAgent = 'editore-capo',
    useElevenLabs: preferElevenLabs = true,
    onStatusChange,
    onMessage,
    onError,
  } = options;

  // ----------------------------------------
  // State
  // ----------------------------------------
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeAgent, setActiveAgentState] = useState<string>(initialAgent);
  const [status, setStatusInternal] = useState<ConversationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Refs for audio recording
  const recordingRef = useRef<Audio.Recording | null>(null);
  const whisperRef = useRef<WhisperService | null>(null);

  // Get current agent
  const currentAgent = getAgentById(activeAgent);

  // ----------------------------------------
  // Status Management
  // ----------------------------------------
  const setStatus = useCallback((newStatus: ConversationStatus) => {
    setStatusInternal(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // ----------------------------------------
  // Initialize Services
  // ----------------------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const config = getConfig();

        // Initialize Whisper
        whisperRef.current = initWhisper(config.openaiApiKey);

        // Initialize TTS
        if (preferElevenLabs && isElevenLabsAvailable()) {
          tts.configure({
            defaultProvider: 'elevenlabs',
            elevenLabsApiKey: config.elevenLabsApiKey || undefined,
            defaultVoiceId: config.elevenLabsVoiceId || undefined,
            defaultLanguage: 'it-IT',
          });
        } else {
          tts.configure({
            defaultProvider: 'expo-speech',
            defaultLanguage: 'it-IT',
          });
        }

        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (err) {
        console.error('Error initializing conversation services:', err);
      }
    };

    init();

    // Cleanup
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      tts.stop().catch(() => {});
    };
  }, [preferElevenLabs]);

  // ----------------------------------------
  // Start Listening (Voice Recording)
  // ----------------------------------------
  const startListening = useCallback(async () => {
    try {
      setError(null);
      setStatus('listening');

      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Permesso microfono negato');
      }

      // Prepare recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante la registrazione';
      setError(message);
      setStatus('idle');
      onError?.(err instanceof Error ? err : new Error(message));
      console.error('startListening error:', err);
    }
  }, [setStatus, onError]);

  // ----------------------------------------
  // Stop Listening and Process
  // ----------------------------------------
  const stopListening = useCallback(async () => {
    try {
      if (!recordingRef.current) {
        setStatus('idle');
        return;
      }

      setStatus('processing');

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const audioUri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!audioUri) {
        throw new Error('Nessun audio registrato');
      }

      // Reset audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Get Whisper service
      const whisper = whisperRef.current || getWhisper();

      // Validate and transcribe
      const isValid = await whisper.validateAudioFile(audioUri);
      if (!isValid) {
        throw new Error('File audio non valido');
      }

      const { text: transcript } = await whisper.transcribe(audioUri);

      if (!transcript.trim()) {
        setStatus('idle');
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: transcript,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      onMessage?.(userMessage);

      // Build conversation history for Claude
      // Filter to current agent's conversation
      const conversationHistory: ClaudeMessage[] = messages
        .filter(m => m.agentId === activeAgent || m.agentId === undefined)
        .slice(-10) // Keep last 10 messages for context
        .map(m => ({ role: m.role, content: m.content }));

      // Get response from Claude
      const result = await processVoiceCommand(transcript, conversationHistory);

      if (!result.success) {
        throw new Error(result.response);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        agentId: activeAgent,
      };

      setMessages(prev => [...prev, assistantMessage]);
      onMessage?.(assistantMessage);

      // Speak the response
      setStatus('speaking');
      await tts.speak(result.response);

      setStatus('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante l\'elaborazione';
      setError(message);
      setStatus('idle');
      onError?.(err instanceof Error ? err : new Error(message));
      console.error('stopListening error:', err);
    }
  }, [messages, activeAgent, setStatus, onMessage, onError]);

  // ----------------------------------------
  // Send Text Message (Without Voice)
  // ----------------------------------------
  const sendMessage = useCallback(async (text: string) => {
    try {
      if (!text.trim()) return;

      setError(null);
      setStatus('processing');

      // Add user message
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      onMessage?.(userMessage);

      // Build conversation history for Claude
      const conversationHistory: ClaudeMessage[] = messages
        .filter(m => m.agentId === activeAgent || m.agentId === undefined)
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      // Get response from Claude
      const result = await processVoiceCommand(text, conversationHistory);

      if (!result.success) {
        throw new Error(result.response);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        agentId: activeAgent,
      };

      setMessages(prev => [...prev, assistantMessage]);
      onMessage?.(assistantMessage);

      // Speak the response
      setStatus('speaking');
      await tts.speak(result.response);

      setStatus('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante l\'invio';
      setError(message);
      setStatus('idle');
      onError?.(err instanceof Error ? err : new Error(message));
      console.error('sendMessage error:', err);
    }
  }, [messages, activeAgent, setStatus, onMessage, onError]);

  // ----------------------------------------
  // Cancel Speaking
  // ----------------------------------------
  const cancelSpeaking = useCallback(async () => {
    await tts.stop();
    setStatus('idle');
  }, [setStatus]);

  // ----------------------------------------
  // Clear Messages
  // ----------------------------------------
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // ----------------------------------------
  // Switch Agent
  // ----------------------------------------
  const setActiveAgent = useCallback((agentId: string, clearHistory: boolean = false) => {
    // Verify agent exists
    const agent = getAgentById(agentId);
    if (!agent) {
      console.warn(`Agent not found: ${agentId}`);
      return;
    }

    setActiveAgentState(agentId);
    if (clearHistory) {
      setMessages([]);
    }
  }, []);

  // ----------------------------------------
  // Return
  // ----------------------------------------
  return {
    // State
    messages,
    activeAgent,
    status,
    error,
    currentAgent,
    agents,

    // Actions
    startListening,
    stopListening,
    sendMessage,
    cancelSpeaking,
    clearMessages,
    setActiveAgent,
  };
}

export default useConversation;
