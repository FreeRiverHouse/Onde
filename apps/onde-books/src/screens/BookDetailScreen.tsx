import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../types/book';
import { purchaseBook } from '../db/database';

interface BookDetailScreenProps {
  book: Book;
  onBack: () => void;
  onRead: (book: Book) => void;
  onPurchaseComplete: () => void;
}

export function BookDetailScreen({ book, onBack, onRead, onPurchaseComplete }: BookDetailScreenProps) {
  const [purchasing, setPurchasing] = useState(false);
  const canRead = book.isFree || book.isPurchased;

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      // In production, this would integrate with Stripe
      // For now, simulate a purchase
      await purchaseBook(book.id);
      Alert.alert(
        'Acquisto completato!',
        `Hai acquistato "${book.title}" per €${(book.price / 100).toFixed(2)}`,
        [{ text: 'Leggi ora', onPress: () => { onPurchaseComplete(); onRead(book); } }]
      );
    } catch (error) {
      Alert.alert('Errore', 'Si e verificato un errore durante l\'acquisto. Riprova.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: book.coverUrl }} style={styles.cover} resizeMode="cover" />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="globe-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{book.language.toUpperCase()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bookmark-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{book.category}</Text>
            </View>
          </View>

          <Text style={styles.description}>{book.description}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            {book.isFree ? (
              <Text style={styles.freePrice}>GRATIS</Text>
            ) : (
              <>
                <Text style={styles.price}>€{(book.price / 100).toFixed(2)}</Text>
                <Text style={styles.priceCompare}>vs €3-5 su Amazon</Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        {canRead ? (
          <TouchableOpacity style={styles.readButton} onPress={() => onRead(book)}>
            <Ionicons name="book-outline" size={20} color="#fff" />
            <Text style={styles.readButtonText}>Leggi ora</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.buyButton, purchasing && styles.buyButtonDisabled]}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.buyButtonText}>
              {purchasing ? 'Elaborazione...' : `Acquista per €${(book.price / 100).toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  coverContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cover: {
    width: 200,
    height: 280,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  info: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
  },
  freePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#16a34a',
  },
  priceCompare: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
  },
  readButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
