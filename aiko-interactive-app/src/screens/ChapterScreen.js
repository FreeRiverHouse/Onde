import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

// Import games
import DiscoveryGame from '../games/DiscoveryGame';
import PatternMatchingGame from '../games/PatternMatchingGame';
import ImageRecognitionGame from '../games/ImageRecognitionGame';
import ConversationGame from '../games/ConversationGame';
import AbilitiesShowcase from '../games/AbilitiesShowcase';
import EmotionsGame from '../games/EmotionsGame';
import SafetyQuiz from '../games/SafetyQuiz';
import FutureBuilder from '../games/FutureBuilder';

const { width, height } = Dimensions.get('window');

const GAMES_MAP = {
  discovery: DiscoveryGame,
  'pattern-matching': PatternMatchingGame,
  'image-recognition': ImageRecognitionGame,
  conversation: ConversationGame,
  'abilities-showcase': AbilitiesShowcase,
  emotions: EmotionsGame,
  'safety-quiz': SafetyQuiz,
  'future-builder': FutureBuilder,
};

export default function ChapterScreen({ route, navigation }) {
  const { chapter } = route.params;
  const { t } = useTranslation();
  const [showGame, setShowGame] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const GameComponent = GAMES_MAP[chapter.gameType];

  const handleNext = () => {
    if (currentParagraph < chapter.text.length - 1) {
      setCurrentParagraph(currentParagraph + 1);
    }
  };

  const handlePrevious = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(currentParagraph - 1);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.golden.light, colors.sky.light]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← {t('navigation.back')}</Text>
          </TouchableOpacity>
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterNumber}>Chapter {chapter.id}</Text>
          </View>
        </View>

        {/* Main Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image source={chapter.image} style={styles.chapterImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
          />
        </Animated.View>

        {/* Chapter Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
        </View>

        {/* Text Content - Paginated */}
        <ScrollView style={styles.textContainer} contentContainerStyle={styles.textContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            {chapter.text.map((paragraph, index) => (
              <View
                key={index}
                style={[
                  styles.paragraphContainer,
                  index <= currentParagraph ? styles.paragraphVisible : styles.paragraphHidden,
                ]}
              >
                <Text style={styles.paragraphText}>{paragraph}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            {currentParagraph > 0 && (
              <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                <Text style={styles.navButtonText}>← {t('navigation.previous')}</Text>
              </TouchableOpacity>
            )}
            {currentParagraph < chapter.text.length - 1 && (
              <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                <Text style={styles.navButtonText}>{t('navigation.next')} →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Interactive Game Button */}
        {currentParagraph === chapter.text.length - 1 && (
          <Animated.View style={[styles.gameButtonContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.gameButton}
              onPress={() => setShowGame(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.interactive.primary, colors.aiko.eye]}
                style={styles.gameButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.gameButtonText}>🎮 {chapter.interaction}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Game Modal */}
        {GameComponent && (
          <Modal
            visible={showGame}
            animationType="slide"
            presentationStyle="fullScreen"
          >
            <GameComponent chapter={chapter} onClose={() => setShowGame(false)} />
          </Modal>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    ...typography.button,
    fontSize: 16,
    color: colors.text.primary,
  },
  chapterBadge: {
    backgroundColor: colors.aiko.glow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  chapterNumber: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.light,
  },
  imageContainer: {
    width: width,
    height: height * 0.35,
    position: 'relative',
  },
  chapterImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  chapterTitle: {
    ...typography.title,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
  },
  textContainer: {
    flex: 1,
  },
  textContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  paragraphContainer: {
    marginBottom: spacing.md,
  },
  paragraphVisible: {
    opacity: 1,
  },
  paragraphHidden: {
    opacity: 0.3,
  },
  paragraphText: {
    ...typography.body,
    fontSize: 17,
    lineHeight: 26,
    color: colors.text.primary,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  navButton: {
    backgroundColor: colors.background.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  navButtonText: {
    ...typography.button,
    fontSize: 16,
    color: colors.text.primary,
  },
  gameButtonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  gameButton: {
    width: '100%',
    height: 60,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  gameButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameButtonText: {
    ...typography.button,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.light,
  },
});
