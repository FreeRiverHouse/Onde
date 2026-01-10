/**
 * FreeRiver Flow - Voice First Development App
 *
 * "Mattia on Steroids" - Develop while running, walking, living.
 *
 * This is the main screen that provides:
 * 1. Voice recording with hold-to-talk
 * 2. Speech-to-text via Whisper API
 * 3. AI conversation via Claude API
 * 4. Text-to-speech for responses
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useConversation, DEFAULT_AGENTS, type Agent, type ConversationStatus } from '@/hooks/useConversation';

const { width } = Dimensions.get('window');

// Onde Brand Colors
const Colors = {
  coral: '#FF7F7F',
  ocean: '#1A365D',
  gold: '#F4D03F',
  oceanLight: '#2D4A6D',
  oceanDark: '#0F1C2E',
  white: '#FFFFFF',
  textMuted: '#94A3B8',
  cardBg: '#1E3A5F',
  error: '#EF4444',
  success: '#22C55E',
};

// Status text mapping
const STATUS_TEXT: Record<ConversationStatus, string> = {
  idle: 'Tieni premuto per parlare',
  listening: 'Sto ascoltando...',
  processing: 'Elaboro...',
  speaking: 'Parlo...',
};

// Avatar component with initials fallback
function AgentAvatar({ agent, size = 48 }: { agent: Agent; size?: number }) {
  const initials = agent.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const bgColors: Record<string, string> = {
    'editore-capo': Colors.gold,
    'pina-pennello': Colors.coral,
    'emilio': '#60A5FA',
    'gianni-parola': '#A78BFA',
  };

  const bgColor = bgColors[agent.id] || Colors.coral;

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor + '30',
          borderColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.avatarEmoji, { fontSize: size * 0.5 }]}>
        {agent.avatar}
      </Text>
    </View>
  );
}

// Agent selection card
function AgentCard({
  agent,
  isSelected,
  onPress,
}: {
  agent: Agent;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const bgColors: Record<string, string> = {
    'editore-capo': Colors.gold,
    'pina-pennello': Colors.coral,
    'emilio': '#60A5FA',
    'gianni-parola': '#A78BFA',
  };

  const bgColor = bgColors[agent.id] || Colors.coral;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View
          style={[
            styles.agentCard,
            isSelected && { borderColor: bgColor, borderWidth: 2 },
          ]}
        >
          <AgentAvatar agent={agent} size={56} />
          <Text style={styles.agentName}>{agent.name}</Text>
          <Text style={styles.agentRole}>{agent.role}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Header with logo
function Header({ status }: { status: ConversationStatus }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'listening' || status === 'processing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  return (
    <View style={styles.header}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.logoWave}>~</Text>
      </Animated.View>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>FreeRiver Flow</Text>
        <Text style={styles.headerSubtitle}>
          {status === 'idle' ? 'Parla con i tuoi agenti' : STATUS_TEXT[status]}
        </Text>
      </View>
    </View>
  );
}

// Voice button with hold-to-talk
function VoiceButton({
  status,
  onPressIn,
  onPressOut,
}: {
  status: ConversationStatus;
  onPressIn: () => void;
  onPressOut: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isActive = status === 'listening';
  const isProcessing = status === 'processing' || status === 'speaking';

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  const handlePressIn = () => {
    if (isProcessing) return;
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
    onPressIn();
  };

  const handlePressOut = () => {
    if (isProcessing) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    onPressOut();
  };

  const getButtonStyle = () => {
    if (isActive) return styles.talkButtonRecording;
    if (isProcessing) return styles.talkButtonProcessing;
    return {};
  };

  const getButtonText = () => {
    switch (status) {
      case 'listening':
        return 'Sto ascoltando...';
      case 'processing':
        return 'Elaboro...';
      case 'speaking':
        return 'Sto parlando...';
      default:
        return 'Hold to Talk';
    }
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={isProcessing}
    >
      <View style={styles.talkButtonWrapper}>
        {isActive && (
          <Animated.View
            style={[
              styles.talkButtonPulse,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
        )}
        <Animated.View
          style={[
            styles.talkButton,
            getButtonStyle(),
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.talkButtonIcon}>
              {isActive ? '...' : '  '}
            </Text>
          )}
          <Text style={styles.talkButtonText}>{getButtonText()}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

// Message bubble component
function MessageBubble({
  content,
  role,
  agentId,
  agents,
}: {
  content: string;
  role: 'user' | 'assistant';
  agentId?: string;
  agents: Agent[];
}) {
  const isUser = role === 'user';
  const agent = agents.find(a => a.id === agentId);

  const bgColors: Record<string, string> = {
    'editore-capo': Colors.gold,
    'pina-pennello': Colors.coral,
    'emilio': '#60A5FA',
    'gianni-parola': '#A78BFA',
  };

  const agentColor = agent ? bgColors[agent.id] || Colors.coral : Colors.coral;

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.agentBubble,
      ]}
    >
      {!isUser && agent && (
        <View style={styles.messageHeader}>
          <Text style={styles.agentEmoji}>{agent.avatar}</Text>
          <Text style={[styles.messageSender, { color: agentColor }]}>
            {agent.name}
          </Text>
        </View>
      )}
      {isUser && (
        <Text style={styles.messageSenderUser}>Tu</Text>
      )}
      <Text style={styles.messageText}>{content}</Text>
    </View>
  );
}

// Main screen component
export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [initError, setInitError] = useState<string | null>(null);

  // Use the conversation hook that ties everything together
  const {
    messages,
    activeAgent,
    status,
    error,
    agents,
    startListening,
    stopListening,
    setActiveAgent,
    cancelSpeaking,
  } = useConversation({
    initialAgent: 'editore-capo',
    useElevenLabs: false, // Start with expo-speech for simplicity
    onStatusChange: (newStatus) => {
      console.log('[Home] Status changed:', newStatus);
    },
    onMessage: (message) => {
      console.log('[Home] New message:', message.role, message.content.substring(0, 50));
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: (err) => {
      console.error('[Home] Error:', err.message);
      setInitError(err.message);
    },
  });

  // Handle voice button press
  const handleVoiceStart = async () => {
    setInitError(null);
    await startListening();
  };

  const handleVoiceEnd = async () => {
    await stopListening();
  };

  // Handle tap while speaking
  const handleTapWhileSpeaking = () => {
    if (status === 'speaking') {
      cancelSpeaking();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <Header status={status} />

      {/* Error display */}
      {(error || initError) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error || initError}</Text>
        </View>
      )}

      {/* Agent selection */}
      <View style={styles.agentsSection}>
        <Text style={styles.sectionTitle}>Seleziona agente</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.agentsScroll}
        >
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={activeAgent === agent.id}
              onPress={() => setActiveAgent(agent.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Conversation area */}
      <View style={styles.conversationSection}>
        <Text style={styles.sectionTitle}>Conversazione</Text>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onTouchStart={handleTapWhileSpeaking}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>  </Text>
              <Text style={styles.emptyStateText}>
                Tieni premuto il pulsante e parla
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Il tuo messaggio verra' trascritto e inviato a{' '}
                {agents.find(a => a.id === activeAgent)?.name || 'l\'agente'}
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                role={message.role}
                agentId={message.agentId}
                agents={agents}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Voice button */}
      <View style={styles.bottomSection}>
        <VoiceButton
          status={status}
          onPressIn={handleVoiceStart}
          onPressOut={handleVoiceEnd}
        />
        <Text style={styles.statusHint}>
          {status === 'speaking' ? 'Tocca per fermare' : STATUS_TEXT[status]}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.oceanDark,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.oceanLight,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWave: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: 'bold',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Error banner
  errorBanner: {
    backgroundColor: Colors.error + '20',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.error + '40',
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: 'center',
  },

  // Agents section
  agentsSection: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  agentsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  agentCard: {
    width: 110,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  avatarEmoji: {
    textAlign: 'center',
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  agentRole: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Conversation section
  conversationSection: {
    flex: 1,
    marginTop: 16,
  },
  messagesContainer: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: Colors.ocean,
    borderRadius: 16,
    marginBottom: 16,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
    minHeight: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.coral,
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardBg,
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  agentEmoji: {
    fontSize: 18,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageSenderUser: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.white,
    lineHeight: 22,
  },

  // Bottom section
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  statusHint: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textMuted,
  },
  talkButtonWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  talkButtonPulse: {
    position: 'absolute',
    width: 200,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.coral + '40',
  },
  talkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.coral,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 32,
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: Colors.coral,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  talkButtonRecording: {
    backgroundColor: Colors.gold,
  },
  talkButtonProcessing: {
    backgroundColor: Colors.oceanLight,
    opacity: 0.9,
  },
  talkButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  talkButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
