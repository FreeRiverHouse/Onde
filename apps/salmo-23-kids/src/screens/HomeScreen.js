import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Background Image - Shepherd */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Immagine Copertina</Text>
          <Text style={styles.imagePlaceholderSubtext}>Il Pastore Buono</Text>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Il Salmo 23</Text>
        <Text style={styles.subtitle}>per Bambini</Text>
        <Text style={styles.description}>
          Una storia di amore e protezione
        </Text>
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('ChapterList')}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>Inizia la Storia</Text>
      </TouchableOpacity>

      {/* Credits */}
      <View style={styles.credits}>
        <Text style={styles.creditsText}>Testi: Gianni Parola</Text>
        <Text style={styles.creditsText}>Illustrazioni: Pina Pennello</Text>
        <Text style={styles.creditsText}>Casa Editrice Onde</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e6d3', // Warm beige background
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxHeight: height * 0.4,
  },
  imagePlaceholder: {
    width: width * 0.8,
    height: height * 0.35,
    backgroundColor: '#e8d5c4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#d4c4b0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imagePlaceholderText: {
    fontSize: 18,
    color: '#8a7a6a',
    fontWeight: '600',
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: '#a09080',
    marginTop: 8,
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#5a4a3a', // Dark brown
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#7a6a5a',
    textAlign: 'center',
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    color: '#8a7a6a',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#8B7355', // Warm brown
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginVertical: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  credits: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  creditsText: {
    fontSize: 12,
    color: '#a09080',
    marginVertical: 2,
  },
});
