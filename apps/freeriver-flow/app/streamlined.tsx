/**
 * FreeRiver Flow - Streamlined iPhone Version
 * 
 * Versione super minimalista per chattare con Claude Code sul Mac
 * Niente agent selection, niente frills, solo chat vocale
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useWinsurfConversation, type ConversationStatus } from '@/hooks/useWinsurfConversation';

const { width, height } = Dimensions.get('window');

// Onde Brand Colors - Super minimal
const Colors = {
  coral: '#FF7F7F',
  ocean: '#1A365D',
  gold: '#F4D03F',
  white: '#FFFFFF',
  black: '#000000',
  textMuted: '#94A3B8',
  cardBg: '#1E3A5F',
  error: '#EF4444',
  success: '#22C55E',
};

// Status text mapping
const STATUS_TEXT: Record<ConversationStatus, string> = {
  idle: 'Tieni premuto per parlare',
  connecting: 'Connessione al Mac...',
  listening: 'Sto ascoltando...',
  processing: 'Elaboro...',
  speaking: 'Parlo...',
};

export default function StreamlinedFreeRiverFlow() {
  const [serverUrl, setServerUrl] = useState('ws://localhost:3847');
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    status,
    messages,
    isConnected,
    error,
    startListening,
    stopListening,
    connect,
    disconnect,
  } = useWinsurfConversation({
    winsurfUrl: serverUrl,
    onStatusChange: (newStatus) => {
      console.log('Status changed:', newStatus);
    },
    onError: (err) => {
      Alert.alert('Errore', err.message);
    },
  });

  // Auto-connect on mount
  useEffect(() => {
    connect();
  }, []);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (status === 'idle' && isConnected) {
      Animated.spring(buttonScale, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start();
      startListening();
    }
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    stopListening();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'idle': return isConnected ? Colors.success : Colors.textMuted;
      case 'connecting': return Colors.gold;
      case 'listening': return Colors.coral;
      case 'processing': return Colors.gold;
      case 'speaking': return Colors.ocean;
      default: return Colors.textMuted;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'idle': return isConnected ? '🟢' : '⚪';
      case 'connecting': return '🟡';
      case 'listening': return '🔴';
      case 'processing': return '🟡';
      case 'speaking': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header - Super minimal */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>FreeRiver Flow</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {STATUS_TEXT[status]}
            </Text>
          </View>
        </View>
        
        {/* Settings button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>Server Mac</Text>
          <Text style={styles.settingsUrl}>{serverUrl}</Text>
          <TouchableOpacity
            style={styles.reconnectButton}
            onPress={() => {
              disconnect();
              setTimeout(connect, 1000);
            }}
          >
            <Text style={styles.reconnectButtonText}>Riconnetti</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages - Super clean */}
      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎙️</Text>
            <Text style={styles.emptyStateText}>
              {isConnected 
                ? 'Tieni premuto per parlare con Claude' 
                : 'In attesa di connessione al Mac...'}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
            {messages.map((message) => (
              <View key={message.id} style={styles.messageContainer}>
                <View style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.role === 'user' ? styles.userText : styles.assistantText
                  ]}>
                    {message.content}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Recording Button - Super prominent */}
      <View style={styles.recordingContainer}>
        <TouchableOpacity
          style={[
            styles.recordingButton,
            status === 'listening' && styles.recordingButtonActive,
            !isConnected && styles.recordingButtonDisabled
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!isConnected || status !== 'idle'}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Text style={styles.recordingButtonIcon}>
              {status === 'listening' ? '🔴' : '🎙️'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
        
        {/* Connection indicator */}
        <View style={styles.connectionIndicator}>
          <View style={[
            styles.connectionDot,
            isConnected ? styles.connectionDotConnected : styles.connectionDotDisconnected
          ]} />
          <Text style={styles.connectionText}>
            {isConnected ? 'Connesso al Mac' : 'Disconnesso'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ocean,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  settingsPanel: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
  },
  settingsUrl: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  reconnectButton: {
    backgroundColor: Colors.coral,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reconnectButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: Colors.coral,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.cardBg,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  assistantText: {
    color: Colors.white,
  },
  recordingContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  recordingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingButtonActive: {
    backgroundColor: Colors.coral,
    transform: [{ scale: 1.1 }],
  },
  recordingButtonDisabled: {
    opacity: 0.5,
  },
  recordingButtonIcon: {
    fontSize: 32,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionDotConnected: {
    backgroundColor: Colors.success,
  },
  connectionDotDisconnected: {
    backgroundColor: Colors.error,
  },
  connectionText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
