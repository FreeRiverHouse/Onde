import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, StatusBar } from 'react-native';
import { Book } from '../types/book';
import { getAllBooks, getFreeBooks, seedCatalog } from '../db/database';
import { BookCard } from '../components/BookCard';

interface HomeScreenProps {
  onBookPress: (book: Book) => void;
}

export function HomeScreen({ onBookPress }: HomeScreenProps) {
  const [freeBooks, setFreeBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    try {
      await seedCatalog();
      const [free, all] = await Promise.all([getFreeBooks(), getAllBooks()]);
      setFreeBooks(free);
      setAllBooks(all.filter(b => !b.isFree)); // Exclude free books from "all" section
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  }, [loadBooks]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>onde books</Text>
          <Text style={styles.tagline}>Storie belle, prezzo giusto.</Text>
        </View>

        {/* Free Books Section */}
        {freeBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gratis per te</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
              {freeBooks.map(book => (
                <BookCard key={book.id} book={book} onPress={onBookPress} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Books Section */}
        {allBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Il nostro catalogo</Text>
            <View style={styles.priceNote}>
              <Text style={styles.priceNoteText}>Solo €0.30 a libro</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
              {allBooks.map(book => (
                <BookCard key={book.id} book={book} onPress={onBookPress} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Mission Statement */}
        <View style={styles.mission}>
          <Text style={styles.missionTitle}>Perche onde books?</Text>
          <Text style={styles.missionText}>
            Crediamo che le belle storie debbano essere accessibili a tutti.
            Niente €3-5 a libro come su Amazon. Niente commissioni del 65%.
            Solo libri di qualita a prezzo giusto, direttamente dagli autori a te.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with love by Onde</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  horizontalList: {
    paddingLeft: 20,
  },
  priceNote: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  priceNoteText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  mission: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  missionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
