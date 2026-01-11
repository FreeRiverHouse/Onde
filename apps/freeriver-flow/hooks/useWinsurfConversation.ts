/**
 * FreeRiver Flow - Winsurf Connection Service
 * 
 * Si connette a Winsurf per speech-to-text, poi processa con Claude Code/Windsor
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { winsurfConnection, type ConnectionCallbacks, type ConnectionStatus } from '@/services/winsurf-connection';
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

export interface UseWinsurfConversationOptions {
  /** URL del server Winsurf (default: ws://localhost:3847) */
  winsurfUrl?: string;
  /** API Key Winsurf */
  winsurfApiKey?: string;
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

export interface UseWinsurfConversationReturn {
  status: ConversationStatus;
  messages: Message[];
  isConnected: boolean;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  currentAgent: Agent;
  switchAgent: (agentId: string) => void;
}

// ============================================
// HOOK PRINCIPALE
// ============================================

export function useWinsurfConversation(options: UseWinsurfConversationOptions = {}): UseWinsurfConversationReturn {
  const {
    winsurfUrl = 'ws://localhost:8765',
    winsurfApiKey = process.env.EXPO_PUBLIC_WINSURF_API_KEY || '',
    initialAgent = 'editore-capo',
    onStatusChange,
    onMessage,
    onError,
    onConnected,
    onDisconnected,
  } = options;

  // Stato
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [activeAgent, setActiveAgent] = useState(initialAgent);

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
  const setStatusInternal = useCallback((newStatus: ConversationStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // ----------------------------------------
  // Connect to Winsurf Server
  // ----------------------------------------
  const connect = useCallback(async () => {
    try {
      setStatusInternal('connecting');
      setError(null);

      const callbacks: ConnectionCallbacks = {
        onConnected: () => {
          console.log('[useWinsurfConversation] Connected to Winsurf server');
          setConnectionStatus('connected');
          setStatusInternal('idle');
          onConnected?.();
        },
        onDisconnected: () => {
          console.log('[useWinsurfConversation] Disconnected from Winsurf server');
          setConnectionStatus('disconnected');
          setStatusInternal('idle');
          onDisconnected?.();
        },
        onError: (errorMsg) => {
          console.error('[useWinsurfConversation] Error:', errorMsg);
          setError(errorMsg);
          setConnectionStatus('error');
          onError?.(new Error(errorMsg));
        },
        onTranscription: (text) => {
          console.log('[useWinsurfConversation] Transcription:', text);
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
          console.log('[useWinsurfConversation] Response:', text.substring(0, 100));
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
          console.log('[useWinsurfConversation] TTS received, format:', format);
          setStatusInternal('speaking');
          try {
            await playAudioBase64(audioBase64, format);
          } catch (err) {
            console.error('[useWinsurfConversation] TTS playback error:', err);
          }
          setStatusInternal('idle');
        },
        onStatus: (serverStatus, message) => {
          console.log('[useWinsurfConversation] Server status:', serverStatus, message);
          if (serverStatus === 'processing') {
            setStatusInternal('processing');
          }
        },
      };

      await winsurfConnection.connect(winsurfUrl, winsurfApiKey, callbacks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore connessione Winsurf';
      setError(message);
      setStatusInternal('idle');
      setConnectionStatus('error');
      onError?.(err instanceof Error ? err : new Error(message));
    }
  }, [winsurfUrl, winsurfApiKey, activeAgent, setStatusInternal, onConnected, onDisconnected, onError, onMessage]);

  // ----------------------------------------
  // Disconnect
  // ----------------------------------------
  const disconnect = useCallback(() => {
    winsurfConnection.disconnect();
    setConnectionStatus('disconnected');
    setStatusInternal('idle');
  }, [setStatusInternal]);

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
      setError('Non connesso al server Winsurf');
      return;
    }

    try {
      setError(null);
      setStatusInternal('listening');

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

      // Start recording with settings optimized for Winsurf
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
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      recordingRef.current = recording;

      // Start streaming to Winsurf
      await winsurfConnection.startStreaming(recording);

      console.log('[useWinsurfConversation] Recording started');

    } catch (err) {
      console.error('[useWinsurfConversation] Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Errore registrazione');
      setStatusInternal('idle');
      onError?.(err instanceof Error ? err : new Error('Errore registrazione'));
    }
  }, [isConnected, setStatusInternal, onError]);

  // ----------------------------------------
  // Stop Listening
  // ----------------------------------------
  const stopListening = useCallback(async () => {
    if (!recordingRef.current) {
      console.log('[useWinsurfConversation] No recording in progress');
      return;
    }

    try {
      setStatusInternal('processing');

      // Stop recording and get transcription
      const transcription = await winsurfConnection.stopStreaming();
      
      console.log('[useWinsurfConversation] Transcription:', transcription);

      // Process with Claude Code/Windsor
      processWithClaudeCode(transcription);

    } catch (err) {
      console.error('[useWinsurfConversation] Error stopping recording:', err);
      setError(err instanceof Error ? err.message : 'Errore registrazione');
      setStatusInternal('idle');
      onError?.(err instanceof Error ? err : new Error('Errore registrazione'));
    }
  }, [setStatusInternal, onError]);

  // ----------------------------------------
  // Process with Claude Code/Windsor
  // ----------------------------------------
  const processWithClaudeCode = useCallback(async (text: string) => {
    try {
      console.log(`🤖 Processing with Claude Code/Windsor: "${text}"`);
      
      // Simulate Claude Code/Windsor processing
      // In real implementation, this would call Claude Code API or Windsor CLI
      const response = "Sono Claude Code/Windsor che gira sul tuo Mac! Posso aiutarti a scrivere codice, debuggare, e gestire il tuo ambiente di sviluppo. Che progetto vuoi lavorare oggi?";
      
      // Send streaming response
      onStream?.(response);

      // Send final response
      setTimeout(() => {
        onResponse?.(response, []);
        
        // Generate TTS (simulated)
        generateTTS(response);
      }, 500);

    } catch (error) {
      console.error(`❌ Error processing with Claude Code/Windsor:`, error);
      setError('Errore elaborazione con Claude Code/Windsor');
    }
  }, [onStream, onResponse]);

  // ----------------------------------------
  // Generate TTS
  // ----------------------------------------
  const generateTTS = useCallback(async (text: string) => {
    try {
      console.log(`🔊 Generating TTS for: "${text.substring(0, 50)}..."`);
      
      // Simulate TTS generation
      // In real implementation, this would use a TTS service
      const audioData = Buffer.from('simulated audio data');
      const audioBase64 = audioData.toString('base64');
      
      onTTS?.(audioBase64, 'wav');

      // Update status back to idle
      setStatusInternal('idle');

    } catch (error) {
      console.error(`❌ Error generating TTS:`, error);
      setStatusInternal('idle');
    }
  }, [onTTS, setStatusInternal]);

  // ----------------------------------------
  // Switch Agent
  // ----------------------------------------
  const switchAgent = useCallback((agentId: string) => {
    setActiveAgent(agentId);
    console.log(`[useWinsurfConversation] Switched to agent: ${agentId}`);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    messages,
    isConnected,
    error,
    startListening,
    stopListening,
    connect,
    disconnect,
    currentAgent,
    switchAgent,
  };
}

// Export default agent
export { DEFAULT_AGENTS } from '@/data/agents';
