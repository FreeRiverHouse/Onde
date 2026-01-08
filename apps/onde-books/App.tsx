import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Book } from './src/types/book';
import { HomeScreen } from './src/screens/HomeScreen';
import { BookDetailScreen } from './src/screens/BookDetailScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';

type Screen = 'home' | 'detail' | 'reader';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookPress = useCallback((book: Book) => {
    setSelectedBook(book);
    setCurrentScreen('detail');
  }, []);

  const handleBack = useCallback(() => {
    setCurrentScreen('home');
    setSelectedBook(null);
  }, []);

  const handleRead = useCallback((book: Book) => {
    setSelectedBook(book);
    setCurrentScreen('reader');
  }, []);

  const handleCloseReader = useCallback(() => {
    setCurrentScreen('detail');
  }, []);

  const handlePurchaseComplete = useCallback(() => {
    // Force refresh of home screen data
    setRefreshKey(k => k + 1);
  }, []);

  // Simple navigation without external dependencies
  return (
    <>
      <StatusBar style={currentScreen === 'reader' ? 'light' : 'dark'} />
      {currentScreen === 'home' && (
        <HomeScreen key={refreshKey} onBookPress={handleBookPress} />
      )}
      {currentScreen === 'detail' && selectedBook && (
        <BookDetailScreen
          book={selectedBook}
          onBack={handleBack}
          onRead={handleRead}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
      {currentScreen === 'reader' && selectedBook && (
        <ReaderScreen book={selectedBook} onClose={handleCloseReader} />
      )}
    </>
  );
}
