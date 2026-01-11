/**
 * FreeRiver Flow Lite - Ultra-minimal voice control for Claude Code
 *
 * One button. Voice in. Claude responds. That's it.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { macConnection, type ConnectionStatus as ConnStatus } from '@/services/connection';
import { CONFIG } from '@/services/config';

// ============================================
// TYPES
// ============================================

type AppStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking';

// ============================================
// COLORS (Onde palette, simplified)
// ============================================

const COLORS = {
  bg: '#0F1C2E',
  surface: '#1A2B40',
  accent: '#F4D03F', // Gold
  accentDim: '#B8960A',
  text: '#FFFFFF',
  textMuted: '#94A3B8',
  success: '#10B981',
  error: '#EF4444',
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function FlowScreen() {
  // State
  const [status, setStatus] = useState<AppStatus>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // ----------------------------------------
  // Connect to Mac server on mount
  // ----------------------------------------
  useEffect(() => {
    connectToServer();

    return () => {
      macConnection.disconnect();
      cleanupAudio();
    };
  }, []);

  // ----------------------------------------
  // Pulse animation when active
  // ----------------------------------------
  useEffect(() => {
    if (status === 'listening' || status === 'processing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  // ----------------------------------------
  // Glow animation when connected
  // ----------------------------------------
  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isConnected ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isConnected]);

  // ----------------------------------------
  // Server connection
  // ----------------------------------------
  const connectToServer = async () => {
    setStatus('connecting');
    setError(null);

    try {
      await macConnection.connect(CONFIG.serverUrl, {
        onConnected: () => {
          console.log('[Flow] Connected to Mac');
          setIsConnected(true);
          setStatus('idle');
        },
        onDisconnected: () => {
          console.log('[Flow] Disconnected');
          setIsConnected(false);
          setStatus('idle');
        },
        onError: (msg) => {
          console.error('[Flow] Error:', msg);
          setError(msg);
        },
        onTranscription: (text) => {
          console.log('[Flow] Transcription:', text);
          setLastMessage(`Tu: ${text}`);
        },
        onResponse: (text) => {
          console.log('[Flow] Response:', text.substring(0, 100));
          setLastMessage(text);
          setStatus('idle');
        },
        onTTS: async (base64, format) => {
          console.log('[Flow] Playing TTS');
          setStatus('speaking');
          await playAudio(base64, format);
          setStatus('idle');
        },
        onStatus: (serverStatus) => {
          if (serverStatus === 'processing') {
            setStatus('processing');
          }
        },
      });
    } catch (err) {
      console.error('[Flow] Connection failed:', err);
      setError('Connessione fallita');
      setStatus('idle');
    }
  };

  // ----------------------------------------
  // Audio playback
  // ----------------------------------------
  const playAudio = async (base64: string, format: string) => {
    try {
      // Stop existing
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Save to temp file
      const ext = format === 'mp3' ? 'mp3' : 'wav';
      const uri = `${FileSystem.cacheDirectory}tts_${Date.now()}.${ext}`;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Play
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      await sound.playAsync();

      // Wait for finish
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
      console.error('[Flow] Playback error:', err);
    }
  };

  // ----------------------------------------
  // Voice recording
  // ----------------------------------------
  const startRecording = async () => {
    if (!isConnected) {
      setError('Non connesso al Mac');
      return;
    }

    try {
      setError(null);
      setStatus('listening');

      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Permesso microfono negato');
        setStatus('idle');
        return;
      }

      // Configure audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
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
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      recordingRef.current = recording;
      console.log('[Flow] Recording started');
    } catch (err) {
      console.error('[Flow] Recording error:', err);
      setError('Errore registrazione');
      setStatus('idle');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) {
      setStatus('idle');
      return;
    }

    try {
      setStatus('processing');

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        setError('Nessun audio');
        setStatus('idle');
        return;
      }

      console.log('[Flow] Recording stopped, sending...');

      // Read and send
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      macConnection.sendAudio(base64);
    } catch (err) {
      console.error('[Flow] Stop error:', err);
      setError('Errore invio');
      setStatus('idle');
    }
  };

  // ----------------------------------------
  // Cleanup
  // ----------------------------------------
  const cleanupAudio = async () => {
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync().catch(() => {});
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => {});
    }
  };

  // ----------------------------------------
  // Cancel speaking
  // ----------------------------------------
  const cancelSpeaking = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setStatus('idle');
  };

  // ----------------------------------------
  // UI helpers
  // ----------------------------------------
  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connessione...';
      case 'listening':
        return 'Sto ascoltando...';
      case 'processing':
        return 'Claude sta pensando...';
      case 'speaking':
        return 'Tap per interrompere';
      default:
        return isConnected ? 'Tieni premuto per parlare' : 'Disconnesso';
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'listening':
        return COLORS.accent;
      case 'processing':
        return COLORS.accentDim;
      case 'speaking':
        return COLORS.success;
      default:
        return isConnected ? COLORS.surface : COLORS.error;
    }
  };

  const isActive = status === 'listening' || status === 'processing';

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      {/* Connection status */}
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: isConnected ? COLORS.success : COLORS.error }]} />
        <Text style={styles.headerText}>
          {isConnected ? 'Connesso al Mac' : 'Disconnesso'}
        </Text>
      </View>

      {/* Last message */}
      <View style={styles.messageContainer}>
        {lastMessage ? (
          <Text style={styles.message} numberOfLines={8}>
            {lastMessage}
          </Text>
        ) : (
          <Text style={styles.messagePlaceholder}>
            Le risposte di Claude appariranno qui
          </Text>
        )}
      </View>

      {/* Status text */}
      <Text style={styles.statusText}>{getStatusText()}</Text>

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Big button */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Pressable
          style={[
            styles.button,
            { backgroundColor: getButtonColor() },
            isActive && styles.buttonActive,
          ]}
          onPressIn={status === 'idle' ? startRecording : undefined}
          onPressOut={status === 'listening' ? stopRecording : undefined}
          onPress={status === 'speaking' ? cancelSpeaking : undefined}
          disabled={status === 'connecting' || status === 'processing'}
        >
          <Text style={styles.buttonIcon}>
            {status === 'listening' ? '🎤' : status === 'speaking' ? '🔊' : '💬'}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Branding */}
      <Text style={styles.branding}>Flow</Text>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: '100%',
  },
  message: {
    color: COLORS.text,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  messagePlaceholder: {
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginBottom: 30,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 10,
  },
  buttonWrapper: {
    marginBottom: 40,
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  buttonActive: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accent,
        shadowOpacity: 0.5,
        shadowRadius: 30,
      },
    }),
  },
  buttonIcon: {
    fontSize: 60,
  },
  branding: {
    color: COLORS.textMuted,
    fontSize: 12,
    opacity: 0.5,
    letterSpacing: 2,
  },
});
