import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getCoverData } from '../data/chaptersMultilang';
import LanguageSelector from '../components/LanguageSelector';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { i18n } = useTranslation();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const coverData = getCoverData(i18n.language);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow animation for AIKO's eyes
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <LinearGradient
      colors={[colors.golden.light, colors.sky.light, colors.golden.main]}
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
      {/* Language Button */}
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setShowLanguageSelector(true)}
      >
        <Text style={styles.languageButtonText}>🌍</Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Cover Image */}
        <View style={styles.imageContainer}>
          <Image
            source={coverData.image}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <Animated.View
            style={[
              styles.glowOverlay,
              {
                opacity: glowOpacity,
              },
            ]}
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{coverData.title}</Text>
          <Text style={styles.subtitle}>{coverData.subtitle}</Text>
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditText}>{coverData.author}</Text>
          <Text style={styles.creditText}>{coverData.illustrator}</Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('ChapterList')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.aiko.glow, colors.aiko.eye]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>Start Reading</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Dedication (subtle) */}
        <Text style={styles.dedication}>{coverData.dedication}</Text>
      </Animated.View>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    zIndex: 10,
  },
  languageButtonText: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
    marginBottom: spacing.xl,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.aiko.glow,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 48,
    fontWeight: '800',
    color: colors.text.primary,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...typography.subtitle,
    fontSize: 18,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  credits: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  creditText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.text.secondary,
    marginVertical: 2,
  },
  startButton: {
    width: width * 0.6,
    height: 56,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.light,
  },
  dedication: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: width * 0.8,
    lineHeight: 18,
  },
});
