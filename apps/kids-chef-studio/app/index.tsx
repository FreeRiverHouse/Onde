import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dati ricette (in futuro da recipes.json)
const recipes = [
  {
    id: 'pizza',
    name: 'Pizza Margherita',
    emoji: '🍕',
    difficulty: 1,
    time: '5 min',
    locked: false,
  },
  {
    id: 'biscotti',
    name: 'Biscotti',
    emoji: '🍪',
    difficulty: 1,
    time: '4 min',
    locked: false,
  },
  {
    id: 'frullato',
    name: 'Frullato di Frutta',
    emoji: '🥤',
    difficulty: 1,
    time: '3 min',
    locked: true,
  },
  {
    id: 'insalata',
    name: 'Insalata Colorata',
    emoji: '🥗',
    difficulty: 2,
    time: '4 min',
    locked: true,
  },
  {
    id: 'panino',
    name: 'Panino',
    emoji: '🥪',
    difficulty: 1,
    time: '3 min',
    locked: true,
  },
];

function RecipeCard({ recipe }: { recipe: typeof recipes[0] }) {
  const stars = Array(3).fill(0).map((_, i) => (
    <Text key={i} style={styles.star}>
      {i < recipe.difficulty ? '⭐' : '☆'}
    </Text>
  ));

  if (recipe.locked) {
    return (
      <View style={[styles.recipeCard, styles.lockedCard]}>
        <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
        <Text style={styles.recipeName}>{recipe.name}</Text>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.unlockText}>Premium</Text>
      </View>
    );
  }

  return (
    <Link href={`/recipe/${recipe.id}`} asChild>
      <Pressable style={styles.recipeCard}>
        <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
        <Text style={styles.recipeName}>{recipe.name}</Text>
        <View style={styles.starsRow}>{stars}</View>
        <Text style={styles.timeText}>⏱️ {recipe.time}</Text>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👨‍🍳 KidsChefStudio</Text>
        <Text style={styles.subtitle}>Impara a cucinare giocando!</Text>
      </View>

      {/* Recipe Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Ricette</Text>
        <View style={styles.grid}>
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 8,
    opacity: 0.9,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lockedCard: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  recipeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  star: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  lockIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  unlockText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});
