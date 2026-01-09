import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dati ricette dettagliati
const recipesData: Record<string, {
  name: string;
  emoji: string;
  description: string;
  ingredients: { name: string; emoji: string }[];
  steps: string[];
  time: string;
}> = {
  pizza: {
    name: 'Pizza Margherita',
    emoji: '🍕',
    description: 'Impara a fare una deliziosa pizza margherita con mozzarella e pomodoro!',
    ingredients: [
      { name: 'Farina', emoji: '🌾' },
      { name: 'Acqua', emoji: '💧' },
      { name: 'Salsa pomodoro', emoji: '🍅' },
      { name: 'Mozzarella', emoji: '🧀' },
      { name: 'Basilico', emoji: '🌿' },
    ],
    steps: [
      'Prepara l\'impasto con farina e acqua',
      'Stendi l\'impasto sulla teglia',
      'Aggiungi la salsa di pomodoro',
      'Metti la mozzarella',
      'Cuoci nel forno',
    ],
    time: '5 minuti',
  },
  biscotti: {
    name: 'Biscotti',
    emoji: '🍪',
    description: 'Prepara dei biscotti croccanti usando le formine divertenti!',
    ingredients: [
      { name: 'Farina', emoji: '🌾' },
      { name: 'Burro', emoji: '🧈' },
      { name: 'Zucchero', emoji: '🍬' },
      { name: 'Uova', emoji: '🥚' },
      { name: 'Gocce cioccolato', emoji: '🍫' },
    ],
    steps: [
      'Mescola farina e burro',
      'Aggiungi zucchero e uova',
      'Usa le formine per i biscotti',
      'Decora con le gocce di cioccolato',
      'Cuoci nel forno',
    ],
    time: '4 minuti',
  },
};

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipesData[id || ''] || recipesData.pizza;

  const handlePlay = () => {
    router.push(`/play/${id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con emoji */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{recipe.emoji}</Text>
        </View>

        {/* Nome e descrizione */}
        <Text style={styles.name}>{recipe.name}</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        {/* Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoEmoji}>⏱️</Text>
            <Text style={styles.infoText}>{recipe.time}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoEmoji}>⭐</Text>
            <Text style={styles.infoText}>Facile</Text>
          </View>
        </View>

        {/* Ingredienti */}
        <Text style={styles.sectionTitle}>Ingredienti</Text>
        <View style={styles.ingredientsGrid}>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredientCard}>
              <Text style={styles.ingredientEmoji}>{ing.emoji}</Text>
              <Text style={styles.ingredientName}>{ing.name}</Text>
            </View>
          ))}
        </View>

        {/* Passaggi */}
        <Text style={styles.sectionTitle}>Come si fa</Text>
        {recipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottone Play */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.playButton} onPress={handlePlay}>
          <Text style={styles.playButtonText}>▶️ Cuciniamo!</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 80,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 16,
    marginTop: 8,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  ingredientCard: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ingredientEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 12,
    color: '#333',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF8E7',
  },
  playButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
