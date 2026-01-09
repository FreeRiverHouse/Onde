import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { getPoem, Poem } from '../../data/poems';

export default function PoemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [fontSize, setFontSize] = useState(20);

  useEffect(() => {
    if (id) {
      const foundPoem = getPoem(id);
      setPoem(foundPoem || null);
    }
  }, [id]);

  if (!poem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Poesia non trovata</Text>
      </View>
    );
  }

  const increaseFontSize = () => {
    if (fontSize < 32) setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 14) setFontSize(fontSize - 2);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: poem.title,
          headerRight: () => (
            <View style={styles.fontControls}>
              <Pressable onPress={decreaseFontSize} style={styles.fontButton}>
                <Text style={styles.fontButtonText}>A-</Text>
              </Pressable>
              <Pressable onPress={increaseFontSize} style={styles.fontButton}>
                <Text style={styles.fontButtonText}>A+</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.emojiContainer, { backgroundColor: poem.color + '20' }]}>
          <Text style={styles.emoji}>{poem.emoji}</Text>
        </View>

        <Text style={styles.title}>{poem.title}</Text>

        <View style={styles.authorContainer}>
          <Text style={styles.author}>{poem.author}</Text>
          <Text style={styles.authorYears}>({poem.authorYears})</Text>
        </View>

        <View style={[styles.poemContainer, { borderColor: poem.color }]}>
          {poem.text.map((line, index) => (
            <Text
              key={index}
              style={[
                styles.poemLine,
                { fontSize },
                line === '' && styles.emptyLine,
              ]}
            >
              {line || ' '}
            </Text>
          ))}
        </View>

        <View style={styles.themeTag}>
          <Text style={[styles.themeText, { color: poem.color }]}>
            {poem.theme === 'notte' && 'Ninna nanna'}
            {poem.theme === 'primavera' && 'Primavera'}
            {poem.theme === 'natale' && 'Befana'}
            {poem.theme === 'animali' && 'Animali'}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Testo in dominio pubblico
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  fontControls: {
    flexDirection: 'row',
    gap: 8,
  },
  fontButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ECE5D5',
    borderRadius: 8,
  },
  fontButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  author: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  authorYears: {
    fontSize: 14,
    color: '#95A5A6',
  },
  poemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  poemLine: {
    color: '#2C3E50',
    lineHeight: 32,
    fontFamily: 'Georgia',
  },
  emptyLine: {
    height: 20,
  },
  themeTag: {
    alignSelf: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 40,
  },
});
