import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

const FUTURE_SCENARIOS = [
  {
    scenario: 'AI in Healthcare',
    options: [
      { text: 'Help doctors find diseases early', good: true, result: 'Great choice! AI can help save lives by detecting problems early.' },
      { text: 'Replace all doctors', good: false, result: 'Not quite! Humans and AI work best as a team. Doctors make the final decisions.' },
    ],
  },
  {
    scenario: 'AI in Education',
    options: [
      { text: 'Help students learn at their own pace', good: true, result: 'Perfect! AI can personalize learning for each student.' },
      { text: 'Replace teachers completely', good: false, result: 'Not the best idea! Teachers do much more than teach facts - they inspire and care.' },
    ],
  },
  {
    scenario: 'AI in the Environment',
    options: [
      { text: 'Help track and reduce pollution', good: true, result: 'Excellent! AI can help us protect our planet.' },
      { text: 'Ignore environmental problems', good: false, result: 'We need to use AI for good! Protecting Earth is important.' },
    ],
  },
];

export default function FutureBuilder({ onClose }) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [goodChoices, setGoodChoices] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const scenario = FUTURE_SCENARIOS[currentScenario];
  const isComplete = currentScenario >= FUTURE_SCENARIOS.length;

  const handleChoice = (option) => {
    setSelectedOption(option);
    if (option.good) {
      setGoodChoices(goodChoices + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setCurrentScenario(currentScenario + 1);
  };

  return (
    <LinearGradient colors={[colors.golden.sunset, colors.sky.light, colors.golden.light]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Building the Future</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {!isComplete ? (
        <ScrollView style={styles.gameArea} contentContainerStyle={styles.gameContent}>
          <View style={styles.introBox}>
            <Text style={styles.introText}>
              You get to decide how we use AI in the future! Choose wisely.
            </Text>
          </View>

          <View style={styles.scenarioBox}>
            <Text style={styles.scenarioTitle}>{scenario.scenario}</Text>
            <Text style={styles.scenarioQuestion}>How should we use AI?</Text>
          </View>

          {!selectedOption ? (
            <View style={styles.optionsContainer}>
              {scenario.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleChoice(option)}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.resultBox}>
              <Text style={[styles.resultEmoji, selectedOption.good ? styles.goodChoice : styles.badChoice]}>
                {selectedOption.good ? '✓' : '✗'}
              </Text>
              <Text style={styles.resultText}>{selectedOption.result}</Text>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next Scenario →</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.progressText}>Scenario {currentScenario + 1} of {FUTURE_SCENARIOS.length}</Text>
        </ScrollView>
      ) : (
        <View style={styles.completeArea}>
          <Text style={styles.sunsetEmoji}>🌅</Text>
          <Text style={styles.completeTitle}>The Future Looks Bright!</Text>
          <Text style={styles.completeText}>
            You made {goodChoices} great choices about using AI for good!
          </Text>

          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>Remember:</Text>
            <Text style={styles.messageText}>
              • AI is a tool that helps humans{'\n'}
              • You decide what problems to solve{'\n'}
              • Use AI to make the world better{'\n'}
              • Humans and AI work best together
            </Text>
          </View>

          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>
              "You dream. I calculate.{'\n'}
              You feel. I process.{'\n'}
              You decide. I help.{'\n'}
              Together, we can do amazing things."
            </Text>
            <Text style={styles.quoteAuthor}>- AIKO</Text>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={onClose}>
            <LinearGradient colors={[colors.interactive.success, '#4CAF50']} style={styles.continueButtonGradient}>
              <Text style={styles.continueButtonText}>Finish Story →</Text>
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
  introBox: { backgroundColor: colors.background.white, padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.xl },
  introText: { ...typography.body, fontSize: 16, textAlign: 'center', fontStyle: 'italic' },
  scenarioBox: { backgroundColor: colors.golden.warm, padding: spacing.xl, borderRadius: borderRadius.lg, marginBottom: spacing.xl },
  scenarioTitle: { ...typography.title, fontSize: 26, textAlign: 'center', marginBottom: spacing.md },
  scenarioQuestion: { ...typography.subtitle, fontSize: 18, textAlign: 'center', color: colors.text.secondary },
  optionsContainer: { gap: spacing.md, marginBottom: spacing.xl },
  optionButton: { backgroundColor: colors.background.white, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 3, borderColor: colors.aiko.glow },
  optionText: { ...typography.body, fontSize: 17, textAlign: 'center' },
  resultBox: { backgroundColor: colors.background.white, padding: spacing.xl, borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.xl },
  resultEmoji: { fontSize: 60, marginBottom: spacing.md },
  goodChoice: { color: colors.interactive.success },
  badChoice: { color: colors.interactive.warning },
  resultText: { ...typography.body, fontSize: 17, textAlign: 'center', marginBottom: spacing.lg },
  nextButton: { backgroundColor: colors.aiko.glow, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.full },
  nextButtonText: { ...typography.button, fontSize: 16, color: colors.text.light },
  progressText: { ...typography.caption, fontSize: 16, textAlign: 'center', color: colors.text.secondary },
  completeArea: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  sunsetEmoji: { fontSize: 80, marginBottom: spacing.md },
  completeTitle: { ...typography.title, fontSize: 28, textAlign: 'center', marginBottom: spacing.md },
  completeText: { ...typography.body, fontSize: 18, textAlign: 'center', marginBottom: spacing.xxl },
  messageBox: { backgroundColor: colors.background.white, padding: spacing.lg, borderRadius: borderRadius.lg, width: '100%', marginBottom: spacing.xl },
  messageTitle: { ...typography.subtitle, fontSize: 18, marginBottom: spacing.md, textAlign: 'center' },
  messageText: { ...typography.body, fontSize: 16, lineHeight: 24 },
  quoteBox: { backgroundColor: colors.golden.warm, padding: spacing.xl, borderRadius: borderRadius.lg, width: '100%', marginBottom: spacing.xl },
  quoteText: { ...typography.body, fontSize: 17, fontStyle: 'italic', textAlign: 'center', lineHeight: 26, marginBottom: spacing.md },
  quoteAuthor: { ...typography.caption, fontSize: 14, textAlign: 'right', color: colors.text.secondary, fontWeight: '700' },
  continueButton: { width: '100%', height: 56, borderRadius: borderRadius.lg, overflow: 'hidden' },
  continueButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { ...typography.button, fontSize: 18, color: colors.text.light },
});
