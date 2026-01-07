import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

const EMOTIONS = [
  { emoji: '😊', name: 'Happy', description: 'Feeling joy and delight', aikoThought: 'I see a smile and bright eyes. This looks like happiness!' },
  { emoji: '😢', name: 'Sad', description: 'Feeling down or blue', aikoThought: 'I see tears and a frown. This appears to be sadness.' },
  { emoji: '😠', name: 'Angry', description: 'Feeling frustrated or mad', aikoThought: 'I notice furrowed brows and a frown. This seems like anger.' },
  { emoji: '😨', name: 'Scared', description: 'Feeling frightened', aikoThought: 'I see wide eyes and an open mouth. This looks like fear.' },
];

export default function EmotionsGame({ onClose }) {
  const [currentEmotion, setCurrentEmotion] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const emotion = EMOTIONS[currentEmotion];
  const isComplete = currentEmotion >= EMOTIONS.length;

  const handleNext = () => {
    setShowExplanation(false);
    setCurrentEmotion(currentEmotion + 1);
  };

  return (
    <LinearGradient colors={[colors.golden.light, colors.sky.light]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Understanding Emotions</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {!isComplete ? (
        <View style={styles.gameArea}>
          <Text style={styles.infoText}>
            AIKO can see emotions but can't feel them. Help AIKO understand what each emotion means!
          </Text>

          <View style={styles.emotionDisplay}>
            <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
            <Text style={styles.emotionName}>{emotion.name}</Text>
            <Text style={styles.emotionDescription}>{emotion.description}</Text>
          </View>

          {!showExplanation ? (
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={() => {
                setShowExplanation(true);
                setScore(score + 1);
              }}
            >
              <LinearGradient colors={[colors.aiko.glow, colors.aiko.eye]} style={styles.analyzeButtonGradient}>
                <Text style={styles.analyzeButtonText}>Let AIKO Analyze</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.aikoThoughtBox}>
              <Text style={styles.aikoLabel}>AIKO's Analysis:</Text>
              <Text style={styles.aikoThought}>{emotion.aikoThought}</Text>
              <Text style={styles.reminderText}>
                But remember: AIKO can't actually FEEL {emotion.name.toLowerCase()}. Only you can!
              </Text>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.progressText}>{currentEmotion + 1}/{EMOTIONS.length}</Text>
        </View>
      ) : (
        <View style={styles.completeArea}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeText}>
            Great job! AIKO now understands how to recognize emotions, even though AIKO can't feel them.
          </Text>
          <Text style={styles.reminderBox}>
            Remember: Being able to FEEL emotions is what makes you special! AIKO can only recognize patterns.
          </Text>
          <TouchableOpacity style={styles.continueButton} onPress={onClose}>
            <LinearGradient colors={[colors.interactive.success, '#4CAF50']} style={styles.continueButtonGradient}>
              <Text style={styles.continueButtonText}>Continue →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { ...typography.title, fontSize: 24, color: colors.text.primary },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background.white, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { fontSize: 24, color: colors.text.primary },
  gameArea: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  infoText: { ...typography.body, fontSize: 16, textAlign: 'center', marginBottom: spacing.xl, backgroundColor: colors.background.white, padding: spacing.md, borderRadius: borderRadius.lg },
  emotionDisplay: { backgroundColor: colors.background.white, padding: spacing.xxl, borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.xl, width: '100%' },
  emotionEmoji: { fontSize: 120, marginBottom: spacing.md },
  emotionName: { ...typography.title, fontSize: 32, marginBottom: spacing.sm },
  emotionDescription: { ...typography.body, fontSize: 16, color: colors.text.secondary, textAlign: 'center' },
  analyzeButton: { width: '100%', height: 56, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.md },
  analyzeButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  analyzeButtonText: { ...typography.button, fontSize: 18, color: colors.text.light },
  aikoThoughtBox: { backgroundColor: colors.sky.light, padding: spacing.lg, borderRadius: borderRadius.lg, width: '100%' },
  aikoLabel: { ...typography.caption, fontSize: 14, fontWeight: '700', color: colors.aiko.eye, marginBottom: spacing.sm },
  aikoThought: { ...typography.body, fontSize: 16, marginBottom: spacing.md },
  reminderText: { ...typography.caption, fontSize: 14, fontStyle: 'italic', color: colors.text.secondary, marginBottom: spacing.md },
  nextButton: { backgroundColor: colors.background.white, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  nextButtonText: { ...typography.button, fontSize: 16, color: colors.text.primary },
  progressText: { ...typography.caption, fontSize: 16, color: colors.text.secondary, marginTop: spacing.lg },
  completeArea: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  completeEmoji: { fontSize: 80, marginBottom: spacing.lg },
  completeText: { ...typography.body, fontSize: 18, textAlign: 'center', marginBottom: spacing.xl },
  reminderBox: { ...typography.body, fontSize: 16, backgroundColor: colors.golden.warm, padding: spacing.lg, borderRadius: borderRadius.lg, textAlign: 'center', marginBottom: spacing.xl },
  continueButton: { width: '100%', height: 56, borderRadius: borderRadius.lg, overflow: 'hidden' },
  continueButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { ...typography.button, fontSize: 18, color: colors.text.light },
});
