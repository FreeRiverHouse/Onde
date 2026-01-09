import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface GameButtonProps {
  title: string;
  emoji: string;
  href: string;
  delay: number;
  color: string;
}

function GameButton({ title, emoji, href, delay, color }: GameButtonProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Link href={href as any} asChild>
        <TouchableOpacity
          style={[styles.gameButton, { borderColor: color }]}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonEmoji}>{emoji}</Text>
          <Text style={styles.buttonTitle}>{title}</Text>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
}

function StarField() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * width,
    top: Math.random() * 200,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
  }));

  return (
    <View style={styles.starField}>
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const moonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title fade in
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Moon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(moonAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const moonScale = moonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StarField />

      <View style={styles.header}>
        <Animated.Text style={[styles.moon, { transform: [{ scale: moonScale }] }]}>
          🌙
        </Animated.Text>
        <Animated.Text style={[styles.title, { opacity: titleAnim }]}>
          Moonlight Puzzle
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: titleAnim }]}>
          Giochi notturni per piccoli sognatori
        </Animated.Text>
      </View>

      <View style={styles.gamesContainer}>
        <GameButton
          title="Memory"
          emoji="🃏"
          href="/games/memory"
          delay={200}
          color={Colors.accent.gold}
        />
        <GameButton
          title="Abbina"
          emoji="🔗"
          href="/games/matching"
          delay={400}
          color={Colors.accent.purple}
        />
        <GameButton
          title="Puzzle"
          emoji="🧩"
          href="/games/sliding"
          delay={600}
          color={Colors.accent.pink}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Onde Publishing</Text>
        <Text style={styles.stars}>✨ ⭐ ✨</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  starField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  star: {
    position: 'absolute',
    backgroundColor: Colors.accent.gold,
    borderRadius: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  moon: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textShadowColor: Colors.accent.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  gamesContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  gameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.medium,
    paddingVertical: 25,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
  },
  buttonEmoji: {
    fontSize: 40,
    marginRight: 20,
  },
  buttonTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    color: Colors.text.muted,
    fontSize: 14,
  },
  stars: {
    marginTop: 5,
    fontSize: 16,
  },
});
