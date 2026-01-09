import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// Gameplay steps per ricetta
const gameSteps: Record<string, {
  instruction: string;
  action: 'tap' | 'drag' | 'swipe' | 'wait';
  emoji: string;
  duration?: number;
}[]> = {
  pizza: [
    { instruction: 'Tocca per aggiungere la farina!', action: 'tap', emoji: '🌾' },
    { instruction: 'Tocca per aggiungere l\'acqua!', action: 'tap', emoji: '💧' },
    { instruction: 'Scorri per mescolare l\'impasto!', action: 'swipe', emoji: '🥣' },
    { instruction: 'Tocca per stendere l\'impasto!', action: 'tap', emoji: '🍕' },
    { instruction: 'Aggiungi la salsa!', action: 'tap', emoji: '🍅' },
    { instruction: 'Metti la mozzarella!', action: 'tap', emoji: '🧀' },
    { instruction: 'Aspetta che cuocia...', action: 'wait', emoji: '🔥', duration: 3000 },
    { instruction: 'Pizza pronta!', action: 'tap', emoji: '🍕' },
  ],
  biscotti: [
    { instruction: 'Tocca per aggiungere la farina!', action: 'tap', emoji: '🌾' },
    { instruction: 'Aggiungi il burro!', action: 'tap', emoji: '🧈' },
    { instruction: 'Aggiungi lo zucchero!', action: 'tap', emoji: '🍬' },
    { instruction: 'Scorri per mescolare!', action: 'swipe', emoji: '🥣' },
    { instruction: 'Scegli la formina!', action: 'tap', emoji: '⭐' },
    { instruction: 'Aggiungi cioccolato!', action: 'tap', emoji: '🍫' },
    { instruction: 'Aspetta che cuociano...', action: 'wait', emoji: '🔥', duration: 3000 },
    { instruction: 'Biscotti pronti!', action: 'tap', emoji: '🍪' },
  ],
};

export default function PlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const steps = gameSteps[id || ''] || gameSteps.pizza;

  const [currentStep, setCurrentStep] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [stars, setStars] = useState(3);

  const scaleAnim = useState(new Animated.Value(1))[0];

  const step = steps[currentStep];

  useEffect(() => {
    // Animazione pulsante per l'emoji
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [currentStep]);

  useEffect(() => {
    // Gestione wait steps
    if (step?.action === 'wait' && step.duration) {
      setIsWaiting(true);
      setCountdown(step.duration / 1000);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsWaiting(false);
            nextStep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleAction = async () => {
    if (isWaiting) return;

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    nextStep();
  };

  const handleFinish = () => {
    router.replace('/');
  };

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedTitle}>Complimenti!</Text>
          <Text style={styles.completedSubtitle}>
            Hai preparato {id === 'pizza' ? 'la pizza' : 'i biscotti'}!
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3].map((i) => (
              <Text key={i} style={styles.starBig}>
                {i <= stars ? '⭐' : '☆'}
              </Text>
            ))}
          </View>

          <Pressable style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Torna al Menu</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / steps.length) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} / {steps.length}
        </Text>
      </View>

      {/* Main game area */}
      <Pressable
        style={styles.gameArea}
        onPress={handleAction}
        disabled={isWaiting}
      >
        <Animated.Text
          style={[
            styles.mainEmoji,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {step.emoji}
        </Animated.Text>

        <Text style={styles.instruction}>
          {step.instruction}
        </Text>

        {isWaiting && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        {!isWaiting && (
          <Text style={styles.tapHint}>
            {step.action === 'tap' && '👆 Tocca!'}
            {step.action === 'swipe' && '👆 Scorri!'}
            {step.action === 'drag' && '👆 Trascina!'}
          </Text>
        )}
      </Pressable>

      {/* Exit button */}
      <Pressable style={styles.exitButton} onPress={handleFinish}>
        <Text style={styles.exitButtonText}>✕</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  progressContainer: {
    padding: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 6,
  },
  progressText: {
    color: 'white',
    marginTop: 8,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  mainEmoji: {
    fontSize: 120,
    marginBottom: 32,
  },
  instruction: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  tapHint: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  countdownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  exitButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFD93D',
  },
  completedEmoji: {
    fontSize: 100,
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 8,
  },
  starBig: {
    fontSize: 48,
  },
  finishButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
