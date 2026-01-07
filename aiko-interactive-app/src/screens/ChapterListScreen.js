import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getChapters } from '../data/chaptersMultilang';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

const { width } = Dimensions.get('window');

const ChapterCard = ({ chapter, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(chapter)}
        activeOpacity={0.9}
      >
        <View style={styles.cardImageContainer}>
          <Image source={chapter.image} style={styles.cardImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.cardGradient}
          />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterNumber}>Chapter {chapter.id}</Text>
          </View>
          <Text style={styles.chapterTitle} numberOfLines={2}>
            {chapter.title}
          </Text>
          <Text style={styles.chapterInteraction} numberOfLines={1}>
            {chapter.interaction}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ChapterListScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const chapters = getChapters(i18n.language);

  return (
    <LinearGradient
      colors={[colors.golden.light, colors.background.cream]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('chapterList.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('chapterList.subtitle')}</Text>
      </View>

      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <ChapterCard
            chapter={item}
            index={index}
            onPress={(chapter) => navigation.navigate('Chapter', { chapter })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.title,
    fontSize: 36,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.caption,
    fontSize: 16,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  cardImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  cardContent: {
    padding: spacing.md,
  },
  chapterBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.aiko.glow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  chapterNumber: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.light,
  },
  chapterTitle: {
    ...typography.subtitle,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  chapterInteraction: {
    ...typography.caption,
    fontSize: 14,
    color: colors.aiko.eye,
    fontStyle: 'italic',
  },
});
