import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

const { width } = Dimensions.get('window');

const PATTERNS = [
  { sequence: ['🔵', '🔴', '🔵', '🔴'], answer: '🔵' },
  { sequence: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙' },
  { sequence: ['🍎', '🍊', '🍎', '🍊'], answer: '🍎' },
  { sequence: ['1', '2', '1', '2'], answer: '1' },
];

export default function PatternMatchingGame({ onClose }) {
  const [currentPattern, setCurrentPattern] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Help AIKO find the next item in the pattern!');

  const pattern = PATTERNS[currentPattern];
  const options = [pattern.answer, ...['🟢', '🟡', '🟣'].filter(o => o !== pattern.answer)].sort();

  const handleAnswer = (selected) => {
    if (selected === pattern.answer) {
      setMessage('✓ Correct! AIKO learned the pattern!');
      setScore(score + 1);

      setTimeout(() => {
        if (currentPattern < PATTERNS.length - 1) {
          setCurrentPattern(currentPattern + 1);
          setMessage('Help AIKO find the next item in the pattern!');
        } else {
          setMessage('🎉 All patterns matched! You taught AIKO well!');
        }
      }, 1500);
    } else {
      setMessage('Try again! Look at the pattern carefully.');
      setTimeout(() => setMessage('Help AIKO find the next item in the pattern!'), 1500);
    }
  };

  const isComplete = score === PATTERNS.length;

  return (
    <LinearGradient colors={[colors.golden.light, colors.sky.light]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pattern Matching</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.messageText}>{message}</Text>

        <View style={styles.patternContainer}>
          {pattern.sequence.map((item, index) => (
            <View key={index} style={styles.patternBox}>
              <Text style={styles.patternItem}>{item}</Text>
            </View>
          ))}
          <View style={[styles.patternBox, styles.emptyBox]}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </View>

        {!isComplete && (
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.scoreText}>Score: {score}/{PATTERNS.length}</Text>
      </View>

      {isComplete && (
        <TouchableOpacity style={styles.continueButton} onPress={onClose}>
          <LinearGradient colors={[colors.interactive.success, '#4CAF50']} style={styles.continueButtonGradient}>
            <Text style={styles.continueButtonText}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  messageText: { ...typography.body, fontSize: 18, textAlign: 'center', marginBottom: spacing.xl },
  patternContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: spacing.xxl },
  patternBox: { width: 60, height: 60, backgroundColor: colors.background.white, borderRadius: borderRadius.md, margin: spacing.xs, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { borderWidth: 2, borderColor: colors.aiko.glow, borderStyle: 'dashed' },
  patternItem: { fontSize: 32 },
  questionMark: { fontSize: 32, color: colors.text.secondary },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  optionButton: { width: 70, height: 70, backgroundColor: colors.background.white, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.aiko.glow },
  optionText: { fontSize: 36 },
  scoreText: { ...typography.subtitle, fontSize: 20, marginTop: spacing.xl, color: colors.text.secondary },
  continueButton: { margin: spacing.lg, marginBottom: spacing.xl, height: 56, borderRadius: borderRadius.lg, overflow: 'hidden' },
  continueButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { ...typography.button, fontSize: 18, color: colors.text.light },
});
