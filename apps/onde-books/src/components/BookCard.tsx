import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Book } from '../types/book';

interface BookCardProps {
  book: Book;
  onPress: (book: Book) => void;
}

export function BookCard({ book, onPress }: BookCardProps) {
  const priceDisplay = book.isFree ? 'GRATIS' : `€${(book.price / 100).toFixed(2)}`;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(book)} activeOpacity={0.8}>
      <Image source={{ uri: book.coverUrl }} style={styles.cover} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, book.isFree && styles.freePrice]}>{priceDisplay}</Text>
          {book.isPurchased && !book.isFree && (
            <Text style={styles.purchased}>Acquistato</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
    marginBottom: 20,
  },
  cover: {
    width: 160,
    height: 220,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  info: {
    marginTop: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 18,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  freePrice: {
    color: '#16a34a',
  },
  purchased: {
    fontSize: 10,
    color: '#16a34a',
    marginLeft: 8,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
