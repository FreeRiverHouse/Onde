import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

const ABILITIES = [
  { icon: '❓', title: 'Answer Questions', demo: 'What is 2+2?', aikoAnswer: 'The answer is 4!' },
  { icon: '🌍', title: 'Translate Languages', demo: 'Hello → Spanish', aikoAnswer: '¡Hola!' },
  { icon: '📚', title: 'Help with Homework', demo: 'Explain photosynthesis', aikoAnswer: 'Plants use sunlight to make food from water and air!' },
  { icon: '📷', title: 'Recognize Images', demo: 'What\'s in this photo?', aikoAnswer: 'I can see a cat sitting on a windowsill!' },
  { icon: '📖', title: 'Tell Stories', demo: 'Tell me a story', aikoAnswer: 'Once upon a time, a curious robot named AIKO...' },
];

export default function AbilitiesShowcase({ onClose }) {
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [exploredCount, setExploredCount] = useState(0);
  const [explored, setExplored] = useState(new Set());

  const handleExplore = (ability, index) => {
    setSelectedAbility(ability);
    if (!explored.has(index)) {
      setExplored(new Set([...explored, index]));
      setExploredCount(exploredCount + 1);
    }
  };

  const isComplete = exploredCount === ABILITIES.length;

  return (
    <LinearGradient colors={[colors.golden.light, colors.sky.light]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AIKO's Abilities</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Tap each ability to see what AIKO can do!</Text>
        <Text style={styles.progressText}>{exploredCount}/{ABILITIES.length} explored</Text>
      </View>

      <ScrollView style={styles.abilitiesList} contentContainerStyle={styles.abilitiesContent}>
        {ABILITIES.map((ability, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.abilityCard, explored.has(index) && styles.abilityCardExplored]}
            onPress={() => handleExplore(ability, index)}
          >
            <Text style={styles.abilityIcon}>{ability.icon}</Text>
            <Text style={styles.abilityTitle}>{ability.title}</Text>
            {explored.has(index) && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedAbility && (
        <View style={styles.demoArea}>
          <Text style={styles.demoLabel}>Demo:</Text>
          <Text style={styles.demoQuestion}>{selectedAbility.demo}</Text>
          <View style={styles.aikoResponseBox}>
            <Text style={styles.aikoLabel}>AIKO:</Text>
            <Text style={styles.aikoResponse}>{selectedAbility.aikoAnswer}</Text>
          </View>
        </View>
      )}

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
  infoBox: { backgroundColor: colors.background.white, margin: spacing.lg, padding: spacing.md, borderRadius: borderRadius.lg },
  infoText: { ...typography.body, fontSize: 16, textAlign: 'center', marginBottom: spacing.xs },
  progressText: { ...typography.caption, fontSize: 14, textAlign: 'center', color: colors.aiko.eye, fontWeight: '700' },
  abilitiesList: { flex: 1 },
  abilitiesContent: { padding: spacing.lg, paddingTop: 0 },
  abilityCard: { backgroundColor: colors.background.white, padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  abilityCardExplored: { borderColor: colors.interactive.success },
  abilityIcon: { fontSize: 32, marginRight: spacing.md },
  abilityTitle: { ...typography.subtitle, fontSize: 18, flex: 1 },
  checkmark: { fontSize: 24, color: colors.interactive.success },
  demoArea: { backgroundColor: colors.sky.light, padding: spacing.lg, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg },
  demoLabel: { ...typography.caption, fontSize: 12, color: colors.text.secondary, marginBottom: spacing.xs },
  demoQuestion: { ...typography.body, fontSize: 16, marginBottom: spacing.md, fontStyle: 'italic' },
  aikoResponseBox: { backgroundColor: colors.background.white, padding: spacing.md, borderRadius: borderRadius.md },
  aikoLabel: { ...typography.caption, fontSize: 12, fontWeight: '700', color: colors.aiko.eye, marginBottom: spacing.xs },
  aikoResponse: { ...typography.body, fontSize: 16 },
  continueButton: { margin: spacing.lg, marginBottom: spacing.xl, height: 56, borderRadius: borderRadius.lg, overflow: 'hidden' },
  continueButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { ...typography.button, fontSize: 18, color: colors.text.light },
});
