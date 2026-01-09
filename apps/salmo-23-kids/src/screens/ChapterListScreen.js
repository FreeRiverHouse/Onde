import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const chapters = [
  {
    id: '1',
    number: 1,
    title: 'Il Signore e il mio pastore',
    verse: '"Non ti manchera mai niente"',
    color: '#E8D5B7',
  },
  {
    id: '2',
    number: 2,
    title: 'I pascoli e le acque tranquille',
    verse: '"L\'acqua fresca ti dara forza"',
    color: '#B5D8E8',
  },
  {
    id: '3',
    number: 3,
    title: 'I sentieri giusti',
    verse: '"Io conosco la via giusta"',
    color: '#C5E8B5',
  },
  {
    id: '4',
    number: 4,
    title: 'La valle oscura',
    verse: '"Non temere, io sono qui"',
    color: '#9A8AAA',
  },
  {
    id: '5',
    number: 5,
    title: 'La tavola e la coppa',
    verse: '"Tu sei speciale"',
    color: '#F0C987',
  },
  {
    id: '6',
    number: 6,
    title: 'La casa del Signore',
    verse: '"Saro sempre qui"',
    color: '#FFD4B8',
  },
];

export default function ChapterListScreen({ navigation }) {
  const renderChapter = ({ item }) => (
    <TouchableOpacity
      style={[styles.chapterCard, { backgroundColor: item.color }]}
      onPress={() =>
        navigation.navigate('Chapter', {
          chapterId: item.id,
          title: `Capitolo ${item.number}`,
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.chapterNumber}>
        <Text style={styles.chapterNumberText}>{item.number}</Text>
      </View>
      <View style={styles.chapterContent}>
        <Text style={styles.chapterTitle}>{item.title}</Text>
        <Text style={styles.chapterVerse}>{item.verse}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.header}>Scegli un Capitolo</Text>
      <FlatList
        data={chapters}
        renderItem={renderChapter}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e6d3',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5a4a3a',
    textAlign: 'center',
    paddingVertical: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5a4a3a',
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5a4a3a',
    marginBottom: 4,
  },
  chapterVerse: {
    fontSize: 14,
    color: '#7a6a5a',
    fontStyle: 'italic',
  },
});
