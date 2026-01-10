import React, { useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { AgentCard, Agent, AgentStatus } from './AgentCard';

// Onde brand colors
const COLORS = {
  background: '#FFF8E7',
  surface: '#FFFFFF',
  border: '#ECE5D5',
  selected: '#27AE60',
};

interface AgentListProps {
  agents: Agent[];
  selectedAgentId?: string;
  onAgentSelect?: (agent: Agent) => void;
  showSelectedIndicator?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 120;
const CARD_MARGIN = 12;
const CONTAINER_PADDING = 20;

export function AgentList({
  agents,
  selectedAgentId,
  onAgentSelect,
  showSelectedIndicator = true,
}: AgentListProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate scroll position to center selected agent
  const scrollToAgent = useCallback((index: number) => {
    if (scrollViewRef.current) {
      const scrollX = index * (CARD_WIDTH + CARD_MARGIN) -
        (SCREEN_WIDTH - CARD_WIDTH) / 2 + CONTAINER_PADDING;

      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollX),
        animated: true,
      });
    }
  }, []);

  // Handle agent selection
  const handleAgentPress = useCallback((agent: Agent) => {
    onAgentSelect?.(agent);

    // Find index and scroll to selected agent
    const index = agents.findIndex(a => a.id === agent.id);
    if (index !== -1) {
      scrollToAgent(index);
    }
  }, [agents, onAgentSelect, scrollToAgent]);

  // Prepare agents with selected status
  const agentsWithSelection = agents.map(agent => ({
    ...agent,
    status: (selectedAgentId === agent.id ? 'selected' : agent.status) as AgentStatus,
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="center"
      >
        {agentsWithSelection.map((agent, index) => (
          <View
            key={agent.id}
            style={[
              styles.cardWrapper,
              index === agents.length - 1 && styles.lastCard,
            ]}
          >
            <AgentCard
              agent={agent}
              onPress={handleAgentPress}
            />

            {/* Selected indicator line at bottom */}
            {showSelectedIndicator && selectedAgentId === agent.id && (
              <View style={styles.selectedIndicator} />
            )}
          </View>
        ))}
      </ScrollView>

      {/* Gradient fade effects on edges */}
      <View style={styles.fadeLeft} pointerEvents="none" />
      <View style={styles.fadeRight} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: CONTAINER_PADDING,
  },
  cardWrapper: {
    marginRight: CARD_MARGIN,
    alignItems: 'center',
  },
  lastCard: {
    marginRight: CONTAINER_PADDING,
  },
  selectedIndicator: {
    marginTop: 8,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.selected,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'transparent',
    // Note: LinearGradient would be better here with expo-linear-gradient
    // For now using a simple semi-transparent overlay
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'transparent',
  },
});

// Sample agents data for testing
export const SAMPLE_AGENTS: Agent[] = [
  {
    id: 'emilio',
    name: 'Emilio',
    emoji: '🤖',
    role: 'AI Assistant',
    status: 'idle',
    isSpeaking: false,
  },
  {
    id: 'gianni',
    name: 'Gianni Parola',
    emoji: '✍️',
    role: 'Scrittore',
    status: 'idle',
    isSpeaking: false,
  },
  {
    id: 'pina',
    name: 'Pina Pennello',
    emoji: '🎨',
    role: 'Illustratrice',
    status: 'busy',
    isSpeaking: false,
  },
  {
    id: 'maestro',
    name: 'Maestro',
    emoji: '🎵',
    role: 'Compositore',
    status: 'idle',
    isSpeaking: false,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    emoji: '🔍',
    role: 'Ricercatore',
    status: 'idle',
    isSpeaking: false,
  },
];

export default AgentList;
