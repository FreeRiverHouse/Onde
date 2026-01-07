import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

const { width, height } = Dimensions.get('window');

export default function DiscoveryGame({ chapter, onClose }) {
  const [taps, setTaps] = useState(0);
  const [aikoBlink, setAikoBlink] = useState(false);
  const [message, setMessage] = useState('Tap on AIKO to wake him up!');

  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleTap = () => {
    const newTaps = taps + 1;
    setTaps(newTaps);

    // Bounce animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Blink
    setAikoBlink(true);
    setTimeout(() => setAikoBlink(false), 200);

    // Messages based on taps
    if (newTaps === 1) {
      setMessage("Keep tapping! AIKO is waking up...");
    } else if (newTaps === 3) {
      setMessage("AIKO's eyes are glowing!");
    } else if (newTaps === 5) {
      setMessage("\"Hello! I'm AIKO!\" 🤖");
    } else if (newTaps >= 7) {
      setMessage("You've awakened AIKO! Great job! 🎉");
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.9],
  });

  return (
    <LinearGradient
      colors={[colors.golden.light, colors.sky.light]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chapter 1: Discovery</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        {/* AIKO Robot */}
        <TouchableOpacity onPress={handleTap} activeOpacity={0.9}>
          <Animated.View
            style={[
              styles.aikoContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Robot body */}
            <View style={styles.aikoBody}>
              {/* Glow effect */}
              <Animated.View
                style={[
                  styles.aikoGlow,
                  {
                    opacity: taps >= 3 ? glowOpacity : 0,
                  },
                ]}
              />

              {/* Eyes */}
              <View style={styles.aikoEyes}>
                <View style={[styles.aikoEye, aikoBlink && styles.aikoEyeBlink]} />
                <View style={[styles.aikoEye, aikoBlink && styles.aikoEyeBlink]} />
              </View>

              {/* Smile */}
              {taps >= 5 && (
                <View style={styles.aikoSmile} />
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {/* Tap counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>Taps: {taps}</Text>
          {taps >= 7 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Complete!</Text>
            </View>
          )}
        </View>
      </View>

      {taps >= 7 && (
        <TouchableOpacity style={styles.continueButton} onPress={onClose}>
          <LinearGradient
            colors={[colors.interactive.success, '#4CAF50']}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 24,
    color: colors.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  aikoContainer: {
    marginBottom: spacing.xxl,
  },
  aikoBody: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.aiko.metal,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#90A4AE',
  },
  aikoGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.aiko.glow,
  },
  aikoEyes: {
    flexDirection: 'row',
    gap: 30,
  },
  aikoEye: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.aiko.eye,
  },
  aikoEyeBlink: {
    height: 4,
    borderRadius: 2,
  },
  aikoSmile: {
    width: 50,
    height: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    borderWidth: 3,
    borderTopWidth: 0,
    borderColor: colors.text.primary,
    marginTop: spacing.md,
  },
  messageContainer: {
    backgroundColor: colors.background.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    width: '100%',
  },
  messageText: {
    ...typography.body,
    fontSize: 18,
    textAlign: 'center',
    color: colors.text.primary,
  },
  counterContainer: {
    alignItems: 'center',
  },
  counterText: {
    ...typography.subtitle,
    fontSize: 20,
    color: colors.text.secondary,
  },
  badge: {
    backgroundColor: colors.interactive.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  badgeText: {
    ...typography.button,
    fontSize: 16,
    color: colors.text.light,
  },
  continueButton: {
    margin: spacing.lg,
    marginBottom: spacing.xl,
    height: 56,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    ...typography.button,
    fontSize: 18,
    color: colors.text.light,
  },
});
