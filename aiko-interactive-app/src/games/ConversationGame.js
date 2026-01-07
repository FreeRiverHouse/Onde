import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../utils/theme';

const CONVERSATIONS = [
  {
    aikoSays: 'Hello!',
    responses: [
      { text: 'Hello!', correct: true, aikoReply: 'Nice! I learned this pattern from millions of conversations.' },
      { text: 'Goodbye!', correct: false, aikoReply: 'That doesn\'t match the pattern. People usually say "Hello" back.' },
    ],
  },
  {
    aikoSays: 'How are you?',
    responses: [
      { text: 'I\'m good, thanks!', correct: true, aikoReply: 'Perfect! That\'s a natural response.' },
      { text: 'Purple elephant', correct: false, aikoReply: 'That doesn\'t make sense as a response.' },
    ],
  },
  {
    aikoSays: 'What\'s your favorite color?',
    responses: [
      { text: 'Blue!', correct: true, aikoReply: 'Great! I matched a good answer pattern.' },
      { text: 'Yes', correct: false, aikoReply: 'That doesn\'t answer the question properly.' },
    ],
  },
];

export default function ConversationGame({ onClose }) {
  const [step, setStep] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [score, setScore] = useState(0);

  const currentConvo = CONVERSATIONS[step];
  const isComplete = step >= CONVERSATIONS.length;

  const handleResponse = (response) => {
    const newConversation = [
      ...conversation,
      { speaker: 'AIKO', text: currentConvo.aikoSays },
      { speaker: 'You', text: response.text },
      { speaker: 'AIKO', text: response.aikoReply },
    ];

    setConversation(newConversation);

    if (response.correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setStep(step + 1);
    }, 2000);
  };

  return (
    <LinearGradient colors={[colors.golden.light, colors.sky.light]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversation Patterns</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.conversationArea} contentContainerStyle={styles.conversationContent}>
        {conversation.map((msg, index) => (
          <View key={index} style={[styles.messageBubble, msg.speaker === 'AIKO' ? styles.aikoBubble : styles.userBubble]}>
            <Text style={styles.speakerLabel}>{msg.speaker}</Text>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      {!isComplete && currentConvo && (
        <View style={styles.responseArea}>
          <View style={styles.aikoBubble}>
            <Text style={styles.speakerLabel}>AIKO</Text>
            <Text style={styles.messageText}>{currentConvo.aikoSays}</Text>
          </View>

          <Text style={styles.promptText}>Choose your response:</Text>

          <View style={styles.optionsContainer}>
            {currentConvo.responses.map((response, index) => (
              <TouchableOpacity
                key={index}
                style={styles.responseButton}
                onPress={() => handleResponse(response)}
              >
                <Text style={styles.responseText}>{response.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isComplete && (
        <View style={styles.completeArea}>
          <Text style={styles.completeText}>🎉 You helped AIKO learn conversation patterns!</Text>
          <Text style={styles.scoreText}>Score: {score}/{CONVERSATIONS.length}</Text>
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
  conversationArea: { flex: 1 },
  conversationContent: { padding: spacing.lg },
  messageBubble: { padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.md, maxWidth: '80%' },
  aikoBubble: { backgroundColor: colors.sky.main, alignSelf: 'flex-start' },
  userBubble: { backgroundColor: colors.background.white, alignSelf: 'flex-end' },
  speakerLabel: { ...typography.caption, fontSize: 12, fontWeight: '700', marginBottom: spacing.xs },
  messageText: { ...typography.body, fontSize: 16 },
  responseArea: { padding: spacing.lg },
  promptText: { ...typography.body, fontSize: 16, textAlign: 'center', marginVertical: spacing.md, color: colors.text.secondary },
  optionsContainer: { gap: spacing.md },
  responseButton: { backgroundColor: colors.background.white, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 2, borderColor: colors.aiko.glow },
  responseText: { ...typography.button, fontSize: 16, color: colors.text.primary, textAlign: 'center' },
  completeArea: { padding: spacing.lg, alignItems: 'center' },
  completeText: { ...typography.subtitle, fontSize: 20, textAlign: 'center', marginBottom: spacing.md },
  scoreText: { ...typography.body, fontSize: 18, color: colors.text.secondary, marginBottom: spacing.lg },
  continueButton: { width: '100%', height: 56, borderRadius: borderRadius.lg, overflow: 'hidden' },
  continueButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { ...typography.button, fontSize: 18, color: colors.text.light },
});
