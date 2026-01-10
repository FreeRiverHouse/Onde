/**
 * VoiceButton Component
 *
 * Bottone grande "Hold to Talk" per registrazione vocale con expo-av.
 *
 * Funzionalita':
 * 1. Usa expo-av per registrare audio
 * 2. Quando premi, inizia a registrare
 * 3. Quando rilasci, ferma e ritorna l'audio
 * 4. Mostra stato: idle, recording, processing
 */

import { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';

export type VoiceButtonStatus = 'idle' | 'recording' | 'processing';

interface VoiceButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onEnd: (audioUri: string) => void;
  onError?: (error: Error) => void;
}

export function VoiceButton({ isRecording, onStart, onEnd, onError }: VoiceButtonProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState<VoiceButtonStatus>('idle');
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const startPulseAnimation = useCallback(() => {
    pulseAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimRef.current.start();

    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [pulseAnim, glowAnim]);

  const stopPulseAnimation = useCallback(() => {
    if (pulseAnimRef.current) {
      pulseAnimRef.current.stop();
      pulseAnimRef.current = null;
    }
    pulseAnim.setValue(1);

    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [pulseAnim, glowAnim]);

  const handlePressIn = useCallback(async () => {
    try {
      // Request permissions if not already granted
      if (permissionGranted !== true) {
        const { status: permStatus } = await Audio.requestPermissionsAsync();
        if (permStatus !== 'granted') {
          console.error('[VoiceButton] Audio permission not granted');
          setPermissionGranted(false);
          onError?.(new Error('Permesso microfono negato'));
          return;
        }
        setPermissionGranted(true);
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording with settings optimized for speech-to-text
      const { recording: newRecording } = await Audio.Recording.createAsync({
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

      setRecording(newRecording);
      setStatus('recording');
      startPulseAnimation();
      onStart();

      console.log('[VoiceButton] Recording started');
    } catch (err) {
      console.error('[VoiceButton] Failed to start recording:', err);
      setStatus('idle');
      onError?.(err instanceof Error ? err : new Error('Errore avvio registrazione'));
    }
  }, [permissionGranted, onStart, onError, startPulseAnimation]);

  const handlePressOut = useCallback(async () => {
    if (!recording) {
      return;
    }

    try {
      setStatus('processing');
      stopPulseAnimation();

      // Stop and unload recording
      await recording.stopAndUnloadAsync();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        console.log('[VoiceButton] Recording saved:', uri);
        onEnd(uri);
      } else {
        throw new Error('Nessun file audio generato');
      }

      setStatus('idle');
    } catch (err) {
      console.error('[VoiceButton] Failed to stop recording:', err);
      setStatus('idle');
      setRecording(null);
      onError?.(err instanceof Error ? err : new Error('Errore stop registrazione'));
    }
  }, [recording, onEnd, onError, stopPulseAnimation]);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.6)'],
  });

  // Get button text based on status
  const getButtonText = (): string => {
    switch (status) {
      case 'recording':
        return 'Sto ascoltando...';
      case 'processing':
        return 'Elaboro...';
      default:
        return 'Tieni premuto\nper parlare';
    }
  };

  // Get icon based on status
  const getIcon = (): string => {
    switch (status) {
      case 'recording':
        return '';
      case 'processing':
        return '';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: glowColor,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Main button */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={status === 'processing'}
        style={({ pressed }) => [
          styles.button,
          isRecording && styles.buttonRecording,
          status === 'processing' && styles.buttonProcessing,
          pressed && status === 'idle' && styles.buttonPressed,
        ]}
      >
        <Animated.View
          style={[
            styles.innerCircle,
            isRecording && styles.innerCircleRecording,
            status === 'processing' && styles.innerCircleProcessing,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text style={styles.buttonText}>{getButtonText()}</Text>
        </Animated.View>
      </Pressable>

      {/* Permission warning */}
      {permissionGranted === false && (
        <Text style={styles.permissionWarning}>
          Microfono non disponibile
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#3b82f6',
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonPressed: {
    backgroundColor: '#334155',
    borderColor: '#60a5fa',
    transform: [{ scale: 0.95 }],
  },
  buttonRecording: {
    backgroundColor: '#dc2626',
    borderColor: '#ef4444',
  },
  buttonProcessing: {
    backgroundColor: '#1e3a5f',
    borderColor: '#60a5fa',
    opacity: 0.8,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  innerCircleRecording: {
    backgroundColor: '#ef4444',
  },
  innerCircleProcessing: {
    backgroundColor: '#60a5fa',
  },
  icon: {
    fontSize: 28,
    marginBottom: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  permissionWarning: {
    marginTop: 16,
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
  },
});
