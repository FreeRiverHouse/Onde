import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

// Colori Onde
const Colors = {
  coral: '#FF7F7F',
  ocean: '#1A365D',
  gold: '#F4D03F',
  oceanLight: '#2D4A6D',
  oceanDark: '#0F1C2E',
  white: '#FFFFFF',
  textMuted: '#94A3B8',
  cardBg: '#1E3A5F',
};

// Agenti della redazione
interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
}

const AGENTS: Agent[] = [
  {
    id: 'editore-capo',
    name: 'Editore Capo',
    role: 'Orchestrazione produzione',
    avatar: '/assets/avatars/editore.png',
    color: Colors.gold,
  },
  {
    id: 'pina-pennello',
    name: 'Pina Pennello',
    role: 'Illustratrice',
    avatar: '/assets/avatars/pina.png',
    color: Colors.coral,
  },
  {
    id: 'emilio',
    name: 'Emilio',
    role: 'AI Educator',
    avatar: '/assets/avatars/emilio.png',
    color: '#60A5FA',
  },
];

// Messaggio nella conversazione
interface Message {
  id: string;
  sender: 'user' | 'agent';
  agentId?: string;
  text: string;
  timestamp: Date;
}

// Componente Avatar Agente con fallback
function AgentAvatar({ agent, size = 48 }: { agent: Agent; size?: number }) {
  const initials = agent.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: agent.color + '30',
          borderColor: agent.color,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.4, color: agent.color }]}>
        {initials}
      </Text>
    </View>
  );
}

// Card Agente
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
            isSelected && { borderColor: agent.color, borderWidth: 2 },
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

// Header con Logo
function Header() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.header}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.logoWave}>~</Text>
      </Animated.View>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>FreeRiver Flow</Text>
        <Text style={styles.headerSubtitle}>Parla con i tuoi agenti</Text>
      </View>
    </View>
  );
}

// Bottone Hold to Talk
function HoldToTalkButton({
  isRecording,
  onPressIn,
  onPressOut,
}: {
  isRecording: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
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
  }, [isRecording]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
    onPressIn();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    onPressOut();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <View style={styles.talkButtonWrapper}>
        {isRecording && (
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
            isRecording && styles.talkButtonRecording,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.talkButtonIcon}>
            {isRecording ? '...' : '  '}
          </Text>
          <Text style={styles.talkButtonText}>
            {isRecording ? 'Sto ascoltando' : 'Hold to Talk'}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

// Bolla messaggio
function MessageBubble({ message, agents }: { message: Message; agents: Agent[] }) {
  const isUser = message.sender === 'user';
  const agent = agents.find(a => a.id === message.agentId);

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.agentBubble,
      ]}
    >
      {!isUser && agent && (
        <View style={styles.messageHeader}>
          <AgentAvatar agent={agent} size={24} />
          <Text style={[styles.messageSender, { color: agent.color }]}>
            {agent.name}
          </Text>
        </View>
      )}
      {isUser && (
        <Text style={styles.messageSender}>Tu</Text>
      )}
      <Text style={styles.messageText}>{message.text}</Text>
    </View>
  );
}

// Schermata principale
export default function HomeScreen() {
  const [selectedAgent, setSelectedAgent] = useState<string>(AGENTS[0].id);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      agentId: 'editore-capo',
      text: 'Ciao! Sono l\'Editore Capo. Come posso aiutarti oggi?',
      timestamp: new Date(),
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleVoiceStart = () => {
    setIsRecording(true);
  };

  const handleVoiceEnd = () => {
    setIsRecording(false);

    // Simula un messaggio utente
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: 'Comando vocale ricevuto...',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Simula risposta agente
    setTimeout(() => {
      const agent = AGENTS.find(a => a.id === selectedAgent);
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentId: selectedAgent,
        text: `[${agent?.name}] Sto elaborando la tua richiesta...`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentMessage]);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      {/* Lista Agenti - Scrollabile orizzontalmente */}
      <View style={styles.agentsSection}>
        <Text style={styles.sectionTitle}>Seleziona agente</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.agentsScroll}
        >
          {AGENTS.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent === agent.id}
              onPress={() => setSelectedAgent(agent.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Area Conversazione */}
      <View style={styles.conversationSection}>
        <Text style={styles.sectionTitle}>Conversazione</Text>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} agents={AGENTS} />
          ))}
        </ScrollView>
      </View>

      {/* Bottone Hold to Talk */}
      <View style={styles.bottomSection}>
        <HoldToTalkButton
          isRecording={isRecording}
          onPressIn={handleVoiceStart}
          onPressOut={handleVoiceEnd}
        />
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

  // Agenti
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
  avatarText: {
    fontWeight: 'bold',
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

  // Conversazione
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
  messageSender: {
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

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
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
    shadowColor: Colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  talkButtonRecording: {
    backgroundColor: Colors.gold,
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
