import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

// Onde brand colors
const COLORS = {
  primary: '#2C3E50',
  secondary: '#3498DB',
  accent: '#E74C3C',
  background: '#FFF8E7',
  surface: '#FFFFFF',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#FFFFFF',
  border: '#ECE5D5',

  // Message colors
  userBubble: '#2C3E50',
  userText: '#FFFFFF',
  agentBubble: '#FFFFFF',
  agentText: '#2C3E50',

  // Shadows
  shadow: '#000000',
};

export type MessageType = 'user' | 'agent';

export interface MessageAgent {
  id: string;
  name: string;
  emoji: string;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  agent?: MessageAgent;
  isTyping?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  showAgentInfo?: boolean;
  style?: ViewStyle;
}

function formatTimestamp(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function TypingIndicator() {
  return (
    <View style={styles.typingContainer}>
      <View style={[styles.typingDot, styles.typingDot1]} />
      <View style={[styles.typingDot, styles.typingDot2]} />
      <View style={[styles.typingDot, styles.typingDot3]} />
    </View>
  );
}

export const MessageBubble = memo(function MessageBubble({
  message,
  showTimestamp = true,
  showAgentInfo = true,
  style,
}: MessageBubbleProps) {
  const { type, content, timestamp, agent, isTyping } = message;
  const isUser = type === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.containerUser : styles.containerAgent,
        style,
      ]}
    >
      {/* Agent avatar (only for agent messages) */}
      {!isUser && agent && showAgentInfo && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{agent.emoji}</Text>
          </View>
        </View>
      )}

      <View style={styles.bubbleWrapper}>
        {/* Agent name (only for agent messages) */}
        {!isUser && agent && showAgentInfo && (
          <Text style={styles.agentName}>{agent.name}</Text>
        )}

        {/* Message bubble */}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAgent,
          ]}
        >
          {isTyping ? (
            <TypingIndicator />
          ) : (
            <Text
              style={[
                styles.messageText,
                isUser ? styles.messageTextUser : styles.messageTextAgent,
              ]}
            >
              {content}
            </Text>
          )}

          {/* Bubble tail */}
          <View
            style={[
              styles.bubbleTail,
              isUser ? styles.bubbleTailUser : styles.bubbleTailAgent,
            ]}
          />
        </View>

        {/* Timestamp */}
        {showTimestamp && !isTyping && (
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.timestampUser : styles.timestampAgent,
            ]}
          >
            {formatTimestamp(timestamp)}
          </Text>
        )}
      </View>

      {/* Spacer for user messages (to balance layout) */}
      {isUser && <View style={styles.avatarSpacer} />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  containerUser: {
    justifyContent: 'flex-end',
  },
  containerAgent: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  avatarSpacer: {
    width: 44,
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  agentName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    position: 'relative',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleUser: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: COLORS.agentBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    height: 12,
  },
  bubbleTailUser: {
    right: -4,
    borderBottomLeftRadius: 12,
    backgroundColor: COLORS.userBubble,
    transform: [{ rotate: '45deg' }],
  },
  bubbleTailAgent: {
    left: -4,
    borderBottomRightRadius: 12,
    backgroundColor: COLORS.agentBubble,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    borderRightWidth: 0,
    transform: [{ rotate: '-45deg' }],
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextUser: {
    color: COLORS.userText,
  },
  messageTextAgent: {
    color: COLORS.agentText,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  timestampUser: {
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginRight: 12,
  },
  timestampAgent: {
    color: COLORS.textSecondary,
    textAlign: 'left',
    marginLeft: 12,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  typingDot1: {
    // Animation would go here with Animated API
  },
  typingDot2: {
    // Animation would go here with Animated API
  },
  typingDot3: {
    // Animation would go here with Animated API
  },
});

// Sample messages for testing
export const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'user',
    content: 'Ciao Emilio! Puoi aiutarmi a scrivere una storia?',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    type: 'agent',
    content: 'Ciao! Certo che posso aiutarti! Che tipo di storia vorresti creare? Una fiaba, un\'avventura, o qualcos\'altro?',
    timestamp: new Date(Date.now() - 240000),
    agent: {
      id: 'emilio',
      name: 'Emilio',
      emoji: '🤖',
    },
  },
  {
    id: '3',
    type: 'user',
    content: 'Vorrei una storia su un robot che impara a dipingere!',
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: '4',
    type: 'agent',
    content: 'Che bella idea! Lascio che Pina ti aiuti con le illustrazioni mentre io scrivo la storia.',
    timestamp: new Date(Date.now() - 120000),
    agent: {
      id: 'emilio',
      name: 'Emilio',
      emoji: '🤖',
    },
  },
  {
    id: '5',
    type: 'agent',
    content: 'Ciao! Sono entusiasta di questo progetto! Immagino gia\' i colori brillanti e le pennellate allegre per il nostro robot artista!',
    timestamp: new Date(Date.now() - 60000),
    agent: {
      id: 'pina',
      name: 'Pina Pennello',
      emoji: '🎨',
    },
  },
];

export default MessageBubble;
