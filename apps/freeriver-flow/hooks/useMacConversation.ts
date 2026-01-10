/**
 * useMacConversation Hook
 *
 * Hook per conversazioni vocali che usa il Mac server invece di API cloud.
 * Il Mac fa tutto: Whisper STT, Claude Code, TTS.
 *
 * Flusso:
 * 1. App registra audio
 * 2. Manda audio via WebSocket al Mac
 * 3. Mac trascrive con Whisper
 * 4. Mac processa con Claude Code
 * 5. Mac genera TTS e lo manda all'app
 * 6. App riproduce audio
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { macConnection, type ConnectionCallbacks, type ConnectionStatus } from '@/services/mac-connection';
import { agents, getAgentById, type Agent } from '@/data/agents';

// ============================================
// TYPES
// ============================================

export type ConversationStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
}

export interface UseMacConversationOptions {
  /** URL del server Mac (default: ws://localhost:3847) */
  serverUrl?: string;
  /** ID agente iniziale (default: editore-capo) */
  initialAgent?: string;
  /** Callback quando cambia lo status */
  onStatusChange?: (status: ConversationStatus) => void;
  /** Callback quando arriva un messaggio */
  onMessage?: (message: Message) => void;
  /** Callback su errore */
  onError?: (error: Error) => void;
  /** Callback connessione stabilita */
  onConnected?: () => void;
  /** Callback disconnessione */
  onDisconnected?: () => void;
}

export interface UseMacConversationReturn {
  // State
  messages: Message[];
  activeAgent: string;
  status: ConversationStatus;
  error: string | null;
  currentAgent: Agent | undefined;
  agents: Agent[];
  isConnected: boolean;
  connectionStatus: ConnectionStatus;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  sendText: (text: string) => void;
  cancelSpeaking: () => Promise<void>;
  clearMessages: () => void;
  setActiveAgent: (agentId: string, clearHistory?: boolean) => void;
}

// Re-export types
export type { Agent };
export const DEFAULT_AGENTS = agents;

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useMacConversation(options: UseMacConversationOptions = {}): UseMacConversationReturn {
  const {
    serverUrl = 'ws://localhost:3847',
    initialAgent = 'editore-capo',
    onStatusChange,
    onMessage,
    onError,
    onConnected,
    onDisconnected,
  } = options;

  // ----------------------------------------
  // State
  // ----------------------------------------
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeAgent, setActiveAgentState] = useState<string>(initialAgent);
  const [status, setStatusInternal] = useState<ConversationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const streamingResponseRef = useRef<string>('');

  // Get current agent
  const currentAgent = getAgentById(activeAgent);
  const isConnected = connectionStatus === 'connected';

  // ----------------------------------------
  // Status Management
  // ----------------------------------------
  const setStatus = useCallback((newStatus: ConversationStatus) => {
    setStatusInternal(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // ----------------------------------------
  // Connect to Mac Server
  // ----------------------------------------
  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);

      const callbacks: ConnectionCallbacks = {
        onConnected: () => {
          console.log('[useMacConversation] Connected to Mac server');
          setConnectionStatus('connected');
          setStatus('idle');
          onConnected?.();
        },
        onDisconnected: () => {
          console.log('[useMacConversation] Disconnected from Mac server');
          setConnectionStatus('disconnected');
          setStatus('idle');
          onDisconnected?.();
        },
        onError: (errorMsg) => {
          console.error('[useMacConversation] Error:', errorMsg);
          setError(errorMsg);
          setConnectionStatus('error');
          onError?.(new Error(errorMsg));
        },
        onTranscription: (text) => {
          console.log('[useMacConversation] Transcription:', text);
          // Add user message
          const userMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, userMessage]);
          onMessage?.(userMessage);
        },
        onStream: (text) => {
          // Accumulate streaming response
          streamingResponseRef.current += text;
        },
        onResponse: (text, actions) => {
          console.log('[useMacConversation] Response:', text.substring(0, 100));
          // Add assistant message
          const assistantMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: text,
            timestamp: new Date(),
            agentId: activeAgent,
          };
          setMessages(prev => [...prev, assistantMessage]);
          onMessage?.(assistantMessage);
          streamingResponseRef.current = '';
        },
        onTTS: async (audioBase64, format) => {
          console.log('[useMacConversation] TTS received, format:', format);
          setStatus('speaking');
          try {
            await playAudioBase64(audioBase64, format);
          } catch (err) {
            console.error('[useMacConversation] TTS playback error:', err);
          }
          setStatus('idle');
        },
        onStatus: (serverStatus, message) => {
          console.log('[useMacConversation] Server status:', serverStatus, message);
          if (serverStatus === 'processing') {
            setStatus('processing');
          }
        },
      };

      await macConnection.connect(serverUrl, callbacks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore connessione';
      setError(message);
      setStatus('idle');
      setConnectionStatus('error');
      onError?.(err instanceof Error ? err : new Error(message));
    }
  }, [serverUrl, activeAgent, setStatus, onConnected, onDisconnected, onError, onMessage]);

  // ----------------------------------------
  // Disconnect
  // ----------------------------------------
  const disconnect = useCallback(() => {
    macConnection.disconnect();
    setConnectionStatus('disconnected');
    setStatus('idle');
  }, [setStatus]);

  // ----------------------------------------
  // Play Audio from Base64
  // ----------------------------------------
  const playAudioBase64 = async (base64Data: string, format: string) => {
    try {
      // Stop any existing playback
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Save to temp file
      const ext = format === 'mp3' ? 'mp3' : 'wav';
      const fileUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.${ext}`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Configure audio for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Play
      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      soundRef.current = sound;

      await sound.playAsync();

      // Wait for playback to finish
      return new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            soundRef.current = null;
            resolve();
          }
        });
      });
    } catch (err) {
      console.error('[playAudioBase64] Error:', err);
      throw err;
    }
  };

  // ----------------------------------------
  // Start Listening (Voice Recording)
  // ----------------------------------------
  const startListening = useCallback(async () => {
    if (!isConnected) {
      setError('Non connesso al server Mac');
      return;
    }

    try {
      setError(null);
      setStatus('listening');

      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Permesso microfono negato');
      }

      // Configure for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording with settings optimized for Whisper
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      recordingRef.current = recording;
      console.log('[useMacConversation] Recording started');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore registrazione';
      setError(message);
      setStatus('idle');
      onError?.(err instanceof Error ? err : new Error(message));
      console.error('[useMacConversation] startListening error:', err);
    }
  }, [isConnected, setStatus, onError]);

  // ----------------------------------------
  // Stop Listening and Send Audio
  // ----------------------------------------
  const stopListening = useCallback(async () => {
    if (!recordingRef.current) {
      setStatus('idle');
      return;
    }

    try {
      setStatus('processing');

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const audioUri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!audioUri) {
        throw new Error('Nessun audio registrato');
      }

      console.log('[useMacConversation] Recording stopped, URI:', audioUri);

      // Read audio file and convert to base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('[useMacConversation] Audio size:', Math.round(audioBase64.length / 1024), 'KB');

      // Send to Mac server
      macConnection.sendAudio(audioBase64);

      // Status will be updated by server callbacks
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore elaborazione';
      setError(message);
      setStatus('idle');
      onError?.(err instanceof Error ? err : new Error(message));
      console.error('[useMacConversation] stopListening error:', err);
    }
  }, [setStatus, onError]);

  // ----------------------------------------
  // Send Text Message
  // ----------------------------------------
  const sendText = useCallback((text: string) => {
    if (!isConnected || !text.trim()) return;

    // Add user message immediately
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    onMessage?.(userMessage);

    setStatus('processing');
    macConnection.sendText(text);
  }, [isConnected, setStatus, onMessage]);

  // ----------------------------------------
  // Cancel Speaking
  // ----------------------------------------
  const cancelSpeaking = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
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
    const agent = getAgentById(agentId);
    if (!agent) {
      console.warn(`[useMacConversation] Agent not found: ${agentId}`);
      return;
    }

    setActiveAgentState(agentId);
    if (clearHistory) {
      setMessages([]);
    }

    // Notify server of agent change
    if (isConnected) {
      macConnection.selectAgent(agentId);
    }
  }, [isConnected]);

  // ----------------------------------------
  // Auto-connect on mount
  // ----------------------------------------
  useEffect(() => {
    connect();

    return () => {
      // Cleanup
      disconnect();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    isConnected,
    connectionStatus,

    // Actions
    connect,
    disconnect,
    startListening,
    stopListening,
    sendText,
    cancelSpeaking,
    clearMessages,
    setActiveAgent,
  };
}

export default useMacConversation;
