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
  const { name, emoji, role, status, isSpeaking } = agent;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Speaking animation - pulsing effect
  useEffect(() => {
    if (isSpeaking) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      );

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isSpeaking, pulseAnim, glowAnim]);

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

  // Get status color and label
  const getStatusConfig = (status: AgentStatus) => {
    switch (status) {
      case 'selected':
        return { color: COLORS.selected, label: 'Attivo' };
      case 'busy':
        return { color: COLORS.busy, label: 'Occupato' };
      case 'idle':
      default:
        return { color: COLORS.idle, label: 'Disponibile' };
    }
  };

  const statusConfig = getStatusConfig(status);

  // Interpolate glow color for speaking animation
  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(52, 152, 219, 0)', 'rgba(52, 152, 219, 0.4)'],
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
          status === 'selected' && styles.cardSelected,
        ]}
      >
        {/* Speaking glow effect */}
        {isSpeaking && (
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
            isSpeaking && styles.avatarSpeaking,
          ]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          {/* Speaking indicator */}
          {isSpeaking && (
            <View style={styles.speakingIndicator}>
              <View style={styles.soundWave}>
                <View style={[styles.soundBar, styles.soundBar1]} />
                <View style={[styles.soundBar, styles.soundBar2]} />
                <View style={[styles.soundBar, styles.soundBar3]} />
              </View>
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
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 120,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: COLORS.selected,
    borderWidth: 3,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarSpeaking: {
    borderColor: COLORS.secondary,
    borderWidth: 3,
  },
  emoji: {
    fontSize: 36,
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    padding: 4,
  },
  soundWave: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 12,
    gap: 2,
  },
  soundBar: {
    width: 3,
    backgroundColor: COLORS.surface,
    borderRadius: 1.5,
  },
  soundBar1: {
    height: 6,
  },
  soundBar2: {
    height: 12,
  },
  soundBar3: {
    height: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  role: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AgentCard;
