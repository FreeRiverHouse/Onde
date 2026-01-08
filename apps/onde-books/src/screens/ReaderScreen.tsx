import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../types/book';

interface ReaderScreenProps {
  book: Book;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export function ReaderScreen({ book, onClose }: ReaderScreenProps) {
  const [showControls, setShowControls] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12; // Mock value

  // In production, this would use an epub.js WebView or similar
  // For MVP, we show a placeholder reader

  const toggleControls = () => setShowControls(!showControls);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      {showControls && (
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
          <View style={styles.placeholder} />
        </View>
      )}

      {/* Reader Content */}
      <TouchableOpacity
        style={styles.readerArea}
        activeOpacity={1}
        onPress={toggleControls}
      >
        <View style={styles.pageContent}>
          <Text style={styles.chapterTitle}>Capitolo 1</Text>
          <Text style={styles.bodyText}>
            {book.language === 'it' ? (
              `Il Signore e il mio pastore: non manco di nulla.

Su pascoli erbosi mi fa riposare,
ad acque tranquille mi conduce.
Rinfranca l'anima mia,
mi guida per il giusto cammino
a motivo del suo nome.

Anche se vado per una valle oscura,
non temo alcun male, perche tu sei con me.
Il tuo bastone e il tuo vincastro
mi danno sicurezza.`
            ) : (
              `The Lord is my shepherd; I shall not want.

He makes me lie down in green pastures.
He leads me beside still waters.
He restores my soul.
He leads me in paths of righteousness
for his name's sake.

Even though I walk through the valley
of the shadow of death,
I will fear no evil,
for you are with me;
your rod and your staff,
they comfort me.`
            )}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Bar */}
      {showControls && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.navButton}
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? '#666' : '#fff'} />
          </TouchableOpacity>

          <Text style={styles.pageIndicator}>{currentPage} / {totalPages}</Text>

          <TouchableOpacity
            style={styles.navButton}
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? '#666' : '#fff'} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f', // Dark mode reading - chill cosmico
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  closeButton: {
    padding: 4,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 36,
  },
  readerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pageContent: {
    maxWidth: 600,
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 2,
  },
  bodyText: {
    fontSize: 18,
    color: '#d0d0d0',
    lineHeight: 32,
    fontFamily: 'Georgia',
    textAlign: 'left',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  navButton: {
    padding: 8,
  },
  pageIndicator: {
    fontSize: 14,
    color: '#888',
  },
});
