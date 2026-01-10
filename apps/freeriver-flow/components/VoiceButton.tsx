import { useRef, useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Audio } from 'expo-av';

interface VoiceButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onEnd: (audioUri: string) => void;
}

export function VoiceButton({ isRecording, onStart, onEnd }: VoiceButtonProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [pulseAnim, glowAnim]);

  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [pulseAnim, glowAnim]);

  const handlePressIn = useCallback(async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Audio permission not granted');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      startPulseAnimation();
      onStart();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }, [onStart, startPulseAnimation]);

  const handlePressOut = useCallback(async () => {
    stopPulseAnimation();

    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        onEnd(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }, [recording, onEnd, stopPulseAnimation]);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.5)'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: glowColor,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonRecording]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.innerCircle,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={[styles.mic, isRecording && styles.micRecording]} />
        </Animated.View>
      </TouchableOpacity>
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
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  buttonRecording: {
    backgroundColor: '#1e3a5f',
    borderColor: '#60a5fa',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mic: {
    width: 20,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  micRecording: {
    backgroundColor: '#ef4444',
  },
});
