import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const chapterContent = {
  '1': {
    title: 'Il Signore e il mio pastore',
    image: '01-pastore.jpg',
    text: `C'era una volta un pastore buono, il piu buono del mondo.
Aveva occhi gentili come il miele
e un sorriso che scaldava come il sole.

"Io saro sempre con te," sussurrava il pastore,
"Non ti manchera mai niente,
perche io mi prendo cura di te."

E le sue pecorelle, bianche come nuvole,
lo seguivano felici dovunque andasse.`,
    nextChapter: '2',
    prevChapter: null,
  },
  '2': {
    title: 'I pascoli e le acque tranquille',
    image: '02-acque-tranquille.jpg',
    text: `Il pastore conosceva i posti piu belli:
prati verdi dove l'erba era morbida,
ruscelli che cantavano canzoni d'argento.

"Riposa qui," diceva il pastore,
"L'acqua fresca ti dara forza,
e l'erba verde ti fara crescere."

Le pecorelle si sdraiavano contente,
e il mondo sembrava un abbraccio grande.`,
    nextChapter: '3',
    prevChapter: '1',
  },
  '3': {
    title: 'I sentieri giusti',
    image: '03-sentieri.jpg',
    text: `A volte la strada sembrava difficile,
piena di sassi e curve misteriose.

Ma il pastore camminava davanti:
"Seguimi," diceva con voce sicura,
"Io conosco la via giusta.
Ti porto dove c'e la luce."

E le pecorelle camminavano tranquille,
perche sapevano di essere al sicuro.`,
    nextChapter: '4',
    prevChapter: '2',
  },
  '4': {
    title: 'La valle oscura',
    image: '04-valle-oscura.jpg',
    text: `Un giorno arrivo una valle buia,
dove le ombre sembravano giganti
e il vento faceva paura.

Ma il pastore strinse forte il suo bastone:
"Non temere," disse piano,
"Io sono qui, proprio accanto a te.
Il buio non ti puo far male
quando camminiamo insieme."

E le pecorelle sentirono il cuore calmo,
perche il pastore era vicino.`,
    nextChapter: '5',
    prevChapter: '3',
  },
  '5': {
    title: 'La tavola e la coppa',
    image: '05-tavola.jpg',
    text: `Poi arrivo un giorno di festa!
Il pastore preparo una tavola bellissima
piena di frutti colorati,
pane dorato e miele dolce.

"Questa e per te," disse sorridendo,
"Perche tu sei speciale.
La tua coppa e cosi piena
che trabocca di gioia!"

E le pecorelle mangiarono felici,
sentendosi le piu amate del mondo.`,
    nextChapter: '6',
    prevChapter: '4',
  },
  '6': {
    title: 'La casa del Signore',
    image: '06-casa-signore.jpg',
    text: `E cosi, giorno dopo giorno,
il pastore guidava le sue pecorelle
verso casa - una casa bellissima
fatta di luce e amore.

"Questa e la tua casa," disse il pastore,
"E io saro sempre qui.
Oggi, domani e per sempre,
la bonta e l'amore ti seguiranno."

E le pecorelle capirono
che con il loro pastore,
sarebbero state felici per sempre.`,
    nextChapter: null,
    prevChapter: '5',
  },
};

export default function ChapterScreen({ route, navigation }) {
  const { chapterId } = route.params;
  const chapter = chapterContent[chapterId];
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const handlePrevious = () => {
    if (chapter.prevChapter) {
      navigation.replace('Chapter', {
        chapterId: chapter.prevChapter,
        title: `Capitolo ${chapter.prevChapter}`,
      });
    }
  };

  const handleNext = () => {
    if (chapter.nextChapter) {
      navigation.replace('Chapter', {
        chapterId: chapter.nextChapter,
        title: `Capitolo ${chapter.nextChapter}`,
      });
    } else {
      // End of story - go back to home
      navigation.navigate('Home');
    }
  };

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
    // TODO: Implement audio playback with expo-av
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chapter Title */}
        <Text style={styles.chapterTitle}>{chapter.title}</Text>

        {/* Illustration Placeholder */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationText}>Illustrazione</Text>
            <Text style={styles.illustrationSubtext}>{chapter.image}</Text>
          </View>
        </View>

        {/* Audio Button */}
        <TouchableOpacity
          style={styles.audioButton}
          onPress={toggleAudio}
          activeOpacity={0.8}
        >
          <Text style={styles.audioButtonText}>
            {isAudioPlaying ? 'Pausa Audio' : 'Ascolta la Storia'}
          </Text>
        </TouchableOpacity>

        {/* Story Text */}
        <View style={styles.textContainer}>
          <Text style={styles.storyText}>{chapter.text}</Text>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, !chapter.prevChapter && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={!chapter.prevChapter}
          activeOpacity={0.8}
        >
          <Text style={[styles.navButtonText, !chapter.prevChapter && styles.navButtonTextDisabled]}>
            Indietro
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.navButtonNext]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.navButtonText, styles.navButtonNextText]}>
            {chapter.nextChapter ? 'Avanti' : 'Fine'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e6d3',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  chapterTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#5a4a3a',
    textAlign: 'center',
    marginBottom: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  illustrationPlaceholder: {
    width: width - 60,
    height: (width - 60) * 0.75,
    backgroundColor: '#e8d5c4',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d4c4b0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  illustrationText: {
    fontSize: 16,
    color: '#8a7a6a',
    fontWeight: '600',
  },
  illustrationSubtext: {
    fontSize: 12,
    color: '#a09080',
    marginTop: 4,
  },
  audioButton: {
    backgroundColor: '#8B7355',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  storyText: {
    fontSize: 20,
    lineHeight: 32,
    color: '#5a4a3a',
    textAlign: 'center',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f5e6d3',
    borderTopWidth: 1,
    borderTopColor: '#e0d0c0',
  },
  navButton: {
    flex: 1,
    backgroundColor: '#e0d0c0',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  navButtonNext: {
    backgroundColor: '#8B7355',
  },
  navButtonDisabled: {
    backgroundColor: '#e8e0d8',
  },
  navButtonText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#5a4a3a',
  },
  navButtonNextText: {
    color: '#fff',
  },
  navButtonTextDisabled: {
    color: '#b0a090',
  },
});
