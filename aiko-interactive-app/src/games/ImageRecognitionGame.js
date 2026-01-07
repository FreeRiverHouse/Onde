import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

const OBJECTS = [
  { emoji: '🐱', name: 'Cat', distractors: ['Dog', 'Bird', 'Fish'] },
  { emoji: '🚗', name: 'Car', distractors: ['Bike', 'Bus', 'Plane'] },
  { emoji: '🌳', name: 'Tree', distractors: ['Flower', 'Grass', 'Bush'] },
  { emoji: '🏠', name: 'House', distractors: ['Castle', 'Tent', 'Cave'] },
];

export default function ImageRecognitionGame({ onClose }) {
  const [currentObject, setCurrentObject] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('What is this object?');

  const object = OBJECTS[currentObject];
  const options = [object.name, ...object.distractors].sort(() => Math.random() - 0.5);

  const handleAnswer = (selected) => {
    if (selected === object.name) {
      setMessage('✓ Correct! AIKO learned!');
      setScore(score + 1);

      setTimeout(() => {
        if (currentObject < OBJECTS.length - 1) {
          setCurrentObject(currentObject + 1);
          setMessage('What is this object?');
        } else {
          setMessage('🎉 Perfect! AIKO can now recognize all these objects!');
        }
      }, 1500);
    } else {
      setMessage(`Not quite! This is a ${object.name}. Try to remember!`);
      setTimeout(() => setMessage('What is this object?'), 2000);
    }
  };

  const isComplete = score === OBJECTS.length;

  return (
    <LinearGradient colors={[colors.golden.light, colors.sky.light]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Image Recognition</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.messageText}>{message}</Text>

        <View style={styles.imageContainer}>
          <Text style={styles.emoji}>{object.emoji}</Text>
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

        <Text style={styles.scoreText}>Objects Learned: {score}/{OBJECTS.length}</Text>
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
  imageContainer: { width: 180, height: 180, backgroundColor: colors.background.white, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl, borderWidth: 3, borderColor: colors.aiko.glow },
  emoji: { fontSize: 120 },
  optionsContainer: { width: '100%', gap: spacing.md },
  optionButton: { backgroundColor: colors.background.white, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 2, borderColor: colors.aiko.glow },
  optionText: { ...typography.button, fontSize: 18, color: colors.text.primary, textAlign: 'center' },
  scoreText: { ...typography.subtitle, fontSize: 18, marginTop: spacing.xl, color: colors.text.secondary },
  continueButton: { margin: spacing.lg, marginBottom: spacing.xl, height: 56, borderRadius: borderRadius.lg, overflow: 'hidden' },
  continueButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { ...typography.button, fontSize: 18, color: colors.text.light },
});
