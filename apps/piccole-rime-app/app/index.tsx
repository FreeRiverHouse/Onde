import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { poems } from '../data/poems';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📚</Text>
        <Text style={styles.subtitle}>
          Filastrocche italiane della tradizione
        </Text>
      </View>

      <View style={styles.poemsGrid}>
        {poems.map((poem) => (
          <Link key={poem.id} href={`/poem/${poem.id}`} asChild>
            <Pressable style={[styles.poemCard, { borderLeftColor: poem.color }]}>
              <Text style={styles.poemEmoji}>{poem.emoji}</Text>
              <View style={styles.poemInfo}>
                <Text style={styles.poemTitle}>{poem.title}</Text>
                <Text style={styles.poemAuthor}>{poem.author}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Onde Publishing
        </Text>
        <Text style={styles.footerSubtext}>
          Storie che fanno sognare
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  poemsGrid: {
    gap: 16,
  },
  poemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  poemEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  poemInfo: {
    flex: 1,
  },
  poemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  poemAuthor: {
    fontSize: 14,
    color: '#95A5A6',
  },
  arrow: {
    fontSize: 24,
    color: '#BDC3C7',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#ECE5D5',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 4,
  },
});
