import { useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform, Vibration } from 'react-native';

// Sound types
type SoundType = 'tap' | 'match' | 'win' | 'error' | 'flip';

// We'll use simple system sounds and haptic feedback
// For a production app, you'd load custom sound files

export function useSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Configure audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
    });

    return () => {
      // Cleanup
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playHaptic = useCallback((type: SoundType) => {
    // Haptic feedback patterns
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      switch (type) {
        case 'tap':
          Vibration.vibrate(10);
          break;
        case 'match':
          Vibration.vibrate([0, 50, 50, 50]);
          break;
        case 'win':
          Vibration.vibrate([0, 100, 100, 100, 100, 100]);
          break;
        case 'error':
          Vibration.vibrate([0, 30, 30, 30]);
          break;
        case 'flip':
          Vibration.vibrate(5);
          break;
      }
    }
  }, []);

  const playSound = useCallback(async (type: SoundType) => {
    // Play haptic feedback
    playHaptic(type);

    // For now, we just use haptic feedback
    // In a full implementation, you'd load and play sound files:
    //
    // const { sound } = await Audio.Sound.createAsync(
    //   require('../assets/sounds/tap.mp3')
    // );
    // soundRef.current = sound;
    // await sound.playAsync();
  }, [playHaptic]);

  return { playSound, playHaptic };
}

export default useSound;
