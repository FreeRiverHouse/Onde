import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

const SAFETY_RULES = [
  {
    icon: '🔒',
    rule: 'Keep your secrets private',
    question: 'Should you tell AI your home address?',
    options: ['Yes', 'No'],
    correct: 'No',
    explanation: 'Never share personal information like passwords, addresses, or phone numbers with AI!',
  },
  {
    icon: '✓',
    rule: 'Always check what AI says',
    question: 'Can AI make mistakes?',
    options: ['Yes', 'No'],
    correct: 'Yes',
    explanation: 'AI can make mistakes! Always verify important information with a trusted adult.',
  },
  {
    icon: '📚',
    rule: 'Use AI to learn more, not less',
    question: 'Should AI do all your homework for you?',
    options: ['Yes', 'No'],
    correct: 'No',
    explanation: 'Use AI to help you understand, but do your own thinking! Learning is what makes you smarter.',
  },
  {
    icon: '❤️',
    rule: 'Real friends matter most',
    question: 'Can AI replace your real friends and family?',
    options: ['Yes', 'No'],
    correct: 'No',
    explanation: 'AI can talk, but it can\'t truly understand or love you like real people can!',
  },
];

export default function SafetyQuiz({ onClose }) {
  const [currentRule, setCurrentRule] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const rule = SAFETY_RULES[currentRule];
  const isComplete = currentRule >= SAFETY_RULES.length;

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (answer === rule.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setCurrentRule(currentRule + 1);
  };

  return (
    <LinearGradient colors={[colors.golden.light, colors.sky.light]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Safety Rules</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {!isComplete ? (
        <ScrollView style={styles.gameArea} contentContainerStyle={styles.gameContent}>
          <View style={styles.ruleCard}>
            <Text style={styles.ruleIcon}>{rule.icon}</Text>
            <Text style={styles.ruleText}>{rule.rule}</Text>
          </View>

          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{rule.question}</Text>
          </View>

          {!showExplanation ? (
            <View style={styles.optionsContainer}>
              {rule.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleAnswer(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.explanationBox}>
              <Text style={[styles.resultText, selectedAnswer === rule.correct ? styles.correctText : styles.incorrectText]}>
                {selectedAnswer === rule.correct ? '✓ Correct!' : '✗ Not quite!'}
              </Text>
              <Text style={styles.explanationText}>{rule.explanation}</Text>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next Rule →</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.progressText}>Rule {currentRule + 1} of {SAFETY_RULES.length}</Text>
        </ScrollView>
      ) : (
        <View style={styles.completeArea}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Quiz Complete!</Text>
          <Text style={styles.scoreText}>You got {score} out of {SAFETY_RULES.length} correct!</Text>

          <View style={styles.rulesReview}>
            <Text style={styles.reviewTitle}>Remember the 4 Safety Rules:</Text>
            {SAFETY_RULES.map((r, index) => (
              <View key={index} style={styles.reviewRule}>
                <Text style={styles.reviewIcon}>{r.icon}</Text>
                <Text style={styles.reviewText}>{r.rule}</Text>
              </View>
            ))}
          </View>

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
  gameArea: { flex: 1 },
  gameContent: { padding: spacing.lg },
  ruleCard: { backgroundColor: colors.aiko.glow, padding: spacing.xl, borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.xl },
  ruleIcon: { fontSize: 60, marginBottom: spacing.md },
  ruleText: { ...typography.subtitle, fontSize: 22, color: colors.text.light, textAlign: 'center', fontWeight: '700' },
  questionBox: { backgroundColor: colors.background.white, padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.xl },
  questionText: { ...typography.body, fontSize: 18, textAlign: 'center' },
  optionsContainer: { gap: spacing.md, marginBottom: spacing.xl },
  optionButton: { backgroundColor: colors.background.white, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 2, borderColor: colors.aiko.glow },
  optionText: { ...typography.button, fontSize: 18, color: colors.text.primary, textAlign: 'center' },
  explanationBox: { backgroundColor: colors.background.white, padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.xl },
  resultText: { ...typography.subtitle, fontSize: 22, textAlign: 'center', marginBottom: spacing.md, fontWeight: '700' },
  correctText: { color: colors.interactive.success },
  incorrectText: { color: colors.interactive.error },
  explanationText: { ...typography.body, fontSize: 16, textAlign: 'center', marginBottom: spacing.lg },
  nextButton: { backgroundColor: colors.aiko.glow, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  nextButtonText: { ...typography.button, fontSize: 16, color: colors.text.light },
  progressText: { ...typography.caption, fontSize: 16, textAlign: 'center', color: colors.text.secondary },
  completeArea: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  completeEmoji: { fontSize: 80, marginBottom: spacing.md },
  completeTitle: { ...typography.title, fontSize: 28, marginBottom: spacing.md },
  scoreText: { ...typography.body, fontSize: 18, color: colors.text.secondary, marginBottom: spacing.xxl },
  rulesReview: { backgroundColor: colors.background.white, padding: spacing.lg, borderRadius: borderRadius.lg, width: '100%', marginBottom: spacing.xl },
  reviewTitle: { ...typography.subtitle, fontSize: 18, marginBottom: spacing.md, textAlign: 'center' },
  reviewRule: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  reviewIcon: { fontSize: 24, marginRight: spacing.md },
  reviewText: { ...typography.body, fontSize: 16, flex: 1 },
  continueButton: { width: '100%', height: 56, borderRadius: borderRadius.lg, overflow: 'hidden' },
  continueButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { ...typography.button, fontSize: 18, color: colors.text.light },
});
