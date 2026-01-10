import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { getConfig, isElevenLabsAvailable } from '@/services/config';

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

export interface Agent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  voiceId?: string; // ElevenLabs voice ID
}

// Default agents available in the app
export const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'editore-capo',
    name: 'Editore Capo',
    role: 'Coordina la produzione editoriale',
    systemPrompt: `Sei l'Editore Capo di Onde, una casa editrice italiana.
Coordini la produzione di libri per bambini.
Rispondi in modo professionale ma caloroso, in italiano.
Sei esperto di editoria, illustrazioni, e storytelling per bambini.`,
  },
  {
    id: 'gianni-parola',
    name: 'Gianni Parola',
    role: 'Scrittore',
    systemPrompt: `Sei Gianni Parola, lo scrittore di Onde.
Scrivi storie per bambini con uno stile elegante e poetico.
Ami le filastrocche, le rime, e le storie con una morale.
Rispondi sempre in italiano con un tono creativo e ispirato.`,
  },
  {
    id: 'pina-pennello',
    name: 'Pina Pennello',
    role: 'Illustratrice',
    systemPrompt: `Sei Pina Pennello, l'illustratrice di Onde.
Crei illustrazioni in stile acquarello europeo, ispirate a Beatrix Potter e Luzzati.
Sei appassionata di arte, colori, e composizione visiva.
Rispondi in italiano con entusiasmo artistico.`,
  },
  {
    id: 'pr-agent',
    name: 'PR Agent',
    role: 'Marketing e comunicazione',
    systemPrompt: `Sei il PR Agent di Onde.
Ti occupi di social media, marketing, e comunicazione.
Conosci le best practice per X/Twitter, Instagram, e TikTok.
Rispondi in italiano con un tono professionale e strategico.`,
  },
];

// ============================================
// WHISPER SERVICE (Speech-to-Text)
// ============================================

async function transcribeAudio(audioUri: string): Promise<string> {
  const config = getConfig();

  // Read the audio file
  const response = await fetch(audioUri);
  const audioBlob = await response.blob();

  // Create form data for OpenAI Whisper API
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);
  formData.append('model', 'whisper-1');
  formData.append('language', 'it'); // Italian

  const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openaiApiKey}`,
    },
    body: formData,
  });

  if (!whisperResponse.ok) {
    const error = await whisperResponse.text();
    throw new Error(`Whisper API error: ${error}`);
  }

  const result = await whisperResponse.json();
  return result.text;
}

// ============================================
// CLAUDE SERVICE (AI Conversation)
// ============================================

async function sendToClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
): Promise<string> {
  const config = getConfig();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const result = await response.json();
  return result.content[0].text;
}

// ============================================
// TTS SERVICE (Text-to-Speech)
// ============================================

async function speakText(text: string, voiceId?: string): Promise<void> {
  const config = getConfig();

  // Use ElevenLabs if available
  if (isElevenLabsAvailable() && config.elevenLabsApiKey) {
    return speakWithElevenLabs(text, voiceId || config.elevenLabsVoiceId || undefined);
  }

  // Fallback to device TTS
  return speakWithDeviceTTS(text);
}

async function speakWithElevenLabs(text: string, voiceId?: string): Promise<void> {
  const config = getConfig();

  // Default Italian voice if not specified
  const voice = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Sarah - good for Italian

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': config.elevenLabsApiKey!,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    console.warn('ElevenLabs API error, falling back to device TTS');
    return speakWithDeviceTTS(text);
  }

  // Get audio data and play it
  const audioBlob = await response.blob();
  const audioUri = URL.createObjectURL(audioBlob);

  const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
  await sound.playAsync();

  // Wait for playback to complete
  return new Promise((resolve) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        resolve();
      }
    });
  });
}

async function speakWithDeviceTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: 'it-IT',
      rate: 0.9,
      onDone: () => resolve(),
      onError: (error) => reject(error),
    });
  });
}

async function stopSpeaking(): Promise<void> {
  // Stop ElevenLabs playback would require tracking the sound object
  // For now, just stop device TTS
  await Speech.stop();
}

// ============================================
// MAIN HOOK
// ============================================

export function useConversation() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeAgent, setActiveAgent] = useState<string>('editore-capo');
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Refs for audio recording
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Get current agent
  const currentAgent = DEFAULT_AGENTS.find(a => a.id === activeAgent) || DEFAULT_AGENTS[0];

  // Initialize audio on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      // Cleanup
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // ============================================
  // Start listening (voice recording)
  // ============================================
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
      console.error('startListening error:', err);
    }
  }, []);

  // ============================================
  // Stop listening and process audio
  // ============================================
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

      // Transcribe with Whisper
      const transcript = await transcribeAudio(audioUri);

      if (!transcript.trim()) {
        setStatus('idle');
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: transcript,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Build conversation history for Claude
      const conversationHistory = messages
        .filter(m => m.agentId === activeAgent || m.agentId === undefined)
        .slice(-10) // Keep last 10 messages for context
        .map(m => ({ role: m.role, content: m.content }));

      conversationHistory.push({ role: 'user', content: transcript });

      // Get response from Claude
      const response = await sendToClaude(
        conversationHistory,
        currentAgent.systemPrompt
      );

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        agentId: activeAgent,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response
      setStatus('speaking');
      await speakText(response, currentAgent.voiceId);

      setStatus('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante l\'elaborazione';
      setError(message);
      setStatus('idle');
      console.error('stopListening error:', err);
    }
  }, [messages, activeAgent, currentAgent]);

  // ============================================
  // Send text message directly (without voice)
  // ============================================
  const sendMessage = useCallback(async (text: string) => {
    try {
      if (!text.trim()) return;

      setError(null);
      setStatus('processing');

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Build conversation history for Claude
      const conversationHistory = messages
        .filter(m => m.agentId === activeAgent || m.agentId === undefined)
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      conversationHistory.push({ role: 'user', content: text });

      // Get response from Claude
      const response = await sendToClaude(
        conversationHistory,
        currentAgent.systemPrompt
      );

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        agentId: activeAgent,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response
      setStatus('speaking');
      await speakText(response, currentAgent.voiceId);

      setStatus('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante l\'invio';
      setError(message);
      setStatus('idle');
      console.error('sendMessage error:', err);
    }
  }, [messages, activeAgent, currentAgent]);

  // ============================================
  // Stop speaking
  // ============================================
  const cancelSpeaking = useCallback(async () => {
    await stopSpeaking();
    setStatus('idle');
  }, []);

  // ============================================
  // Clear conversation history
  // ============================================
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // ============================================
  // Switch agent and optionally clear history
  // ============================================
  const switchAgent = useCallback((agentId: string, clearHistory: boolean = false) => {
    setActiveAgent(agentId);
    if (clearHistory) {
      setMessages([]);
    }
  }, []);

  return {
    // State
    messages,
    activeAgent,
    status,
    error,
    currentAgent,
    agents: DEFAULT_AGENTS,

    // Actions
    startListening,
    stopListening,
    sendMessage,
    cancelSpeaking,
    clearMessages,
    setActiveAgent: switchAgent,
  };
}

export default useConversation;
