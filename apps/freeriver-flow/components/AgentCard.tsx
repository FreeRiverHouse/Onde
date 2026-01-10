/**
 * AgentCard Component
 *
 * Mostra una card per un agente AI con stato visivo.
 * Supporta stati: idle, listening, thinking, speaking
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';

// Dark theme colors (matching FreeRiver Flow design)
const COLORS = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHighlight: '#334155',
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#334155',

  // Agent states
  idle: '#64748b',
  listening: '#22c55e',
  thinking: '#f59e0b',
  speaking: '#3b82f6',

  // Shadows
  shadow: '#000000',
};

// Agent status types matching index.tsx
export type AgentStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

// Agent interface matching index.tsx
export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastMessage?: string;
}

interface AgentCardProps {
  agent: Agent;
  onPress?: (agent: Agent) => void;
  style?: ViewStyle;
}

export function AgentCard({ agent, onPress, style }: AgentCardProps) {
  const { name, role, status, lastMessage } = agent;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Determine if agent is active (not idle)
  const isActive = status !== 'idle';

  // Animation for active states (listening, thinking, speaking)
  useEffect(() => {
    if (isActive) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );

      const glowAnimation = Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      });

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isActive, pulseAnim, glowAnim]);

  // Press animation
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
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    onPress?.(agent);
  };

  // Get status configuration
  const getStatusConfig = (agentStatus: AgentStatus) => {
    switch (agentStatus) {
      case 'listening':
        return { color: COLORS.listening, label: 'In ascolto', icon: '' };
      case 'thinking':
        return { color: COLORS.thinking, label: 'Elabora...', icon: '' };
      case 'speaking':
        return { color: COLORS.speaking, label: 'Parla', icon: '' };
      case 'idle':
      default:
        return { color: COLORS.idle, label: 'Disponibile', icon: '' };
    }
  };

  // Get emoji for agent based on name
  const getAgentEmoji = (agentName: string): string => {
    const emojiMap: Record<string, string> = {
      'Scrittore': '',
      'Illustratore': '',
      'Publisher': '',
      'Marketing': '',
      'Editore': '',
      'PR': '',
    };
    return emojiMap[agentName] || '';
  };

  const statusConfig = getStatusConfig(status);
  const emoji = getAgentEmoji(name);

  // Interpolate glow color based on status
  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(59, 130, 246, 0)', `${statusConfig.color}40`],
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          isActive && styles.cardActive,
        ]}
      >
        {/* Glow effect for active states */}
        {isActive && (
          <Animated.View
            style={[
              styles.glowOverlay,
              { backgroundColor: glowColor },
            ]}
          />
        )}

        {/* Avatar with emoji */}
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={[
            styles.avatar,
            isActive && { borderColor: statusConfig.color },
          ]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          {/* Status icon indicator */}
          {isActive && (
            <View style={[styles.statusIcon, { backgroundColor: statusConfig.color }]}>
              <Text style={styles.statusIconText}>{statusConfig.icon}</Text>
            </View>
          )}
        </Animated.View>

        {/* Agent info */}
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.role} numberOfLines={1}>
          {role}
        </Text>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusConfig.color },
            ]}
          />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Last message preview */}
        {lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={2}>
            {lastMessage}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '47%',
    marginBottom: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardActive: {
    borderWidth: 2,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  emoji: {
    fontSize: 28,
  },
  statusIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  statusIconText: {
    fontSize: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  role: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  lastMessage: {
    marginTop: 8,
    fontSize: 9,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AgentCard;
