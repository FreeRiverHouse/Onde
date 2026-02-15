'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
interface Question {
  id: number
  category: Category
  question: string
  options: string[]
  correct: number
  difficulty: 'easy' | 'medium' | 'hard'
  hint?: string
}

interface LeaderboardEntry {
  name: string
  score: number
  date: string
  combo: number
}

interface Lifelines {
  fiftyFifty: boolean
  skip: boolean
  hint: boolean
}

type Category = 'books' | 'science' | 'geography' | 'animals' | 'history' | 'movies'
type GameState = 'menu' | 'playing' | 'results'

// Quiz sounds using Web Audio API
function useQuizSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Correct answer - happy ascending tone
  const playCorrect = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2)
        osc.start(ctx.currentTime + i * 0.1)
        osc.stop(ctx.currentTime + i * 0.1 + 0.2)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Wrong answer - descending sad tone
  const playWrong = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Tick sound for timer
  const playTick = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 800
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Timer warning sound
  const playWarning = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Combo sound - exciting ascending
  const playCombo = useCallback((level: number) => {
    try {
      const ctx = getAudioContext()
      const baseFreq = 400 + level * 50
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'triangle'
        osc.frequency.value = baseFreq + i * 100
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.15)
        osc.start(ctx.currentTime + i * 0.05)
        osc.stop(ctx.currentTime + i * 0.05 + 0.15)
      }
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Game over fanfare
  const playGameOver = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4)
        osc.start(ctx.currentTime + i * 0.15)
        osc.stop(ctx.currentTime + i * 0.15 + 0.4)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Lifeline sound - magical chime
  const playLifeline = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [880, 1108.73, 1318.51] // A5, C#6, E6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3)
        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + i * 0.08 + 0.3)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  // Victory fanfare - epic celebration
  const playVictory = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98] // C5 to G6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = i % 2 === 0 ? 'sine' : 'triangle'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.5)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.5)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  return { playCorrect, playWrong, playTick, playWarning, playCombo, playGameOver, playLifeline, playVictory }
}

// Expanded Question bank with 100+ questions
const questionBank: Question[] = [
  // Books category (20 questions)
  { id: 1, category: 'books', question: 'Who wrote "Harry Potter"?', options: ['J.K. Rowling', 'Roald Dahl', 'C.S. Lewis', 'J.R.R. Tolkien'], correct: 0, difficulty: 'easy', hint: 'Her initials are J.K.' },
  { id: 2, category: 'books', question: 'What animal is Charlotte in "Charlotte\'s Web"?', options: ['Pig', 'Spider', 'Rat', 'Mouse'], correct: 1, difficulty: 'easy', hint: 'She weaves webs with words' },
  { id: 3, category: 'books', question: 'Who wrote "The Cat in the Hat"?', options: ['Dr. Seuss', 'Roald Dahl', 'Eric Carle', 'Maurice Sendak'], correct: 0, difficulty: 'easy', hint: 'He\'s a famous doctor but not a real one' },
  { id: 4, category: 'books', question: 'In "The Lion, the Witch and the Wardrobe", which country do the children find?', options: ['Wonderland', 'Narnia', 'Hogwarts', 'Neverland'], correct: 1, difficulty: 'medium', hint: 'A magical land behind furniture' },
  { id: 5, category: 'books', question: 'What color is the fish in "One Fish Two Fish Red Fish Blue Fish"?', options: ['Green and Yellow', 'Red and Blue', 'Purple and Orange', 'Pink and White'], correct: 1, difficulty: 'easy', hint: 'The title gives it away!' },
  { id: 6, category: 'books', question: 'Who is Winnie the Pooh\'s best friend?', options: ['Tigger', 'Piglet', 'Eeyore', 'Rabbit'], correct: 1, difficulty: 'easy', hint: 'A tiny pink friend' },
  { id: 7, category: 'books', question: 'In "Alice in Wonderland", what does Alice follow down the hole?', options: ['A Cat', 'A Rabbit', 'A Mouse', 'A Bird'], correct: 1, difficulty: 'easy', hint: 'It\'s late! It\'s late!' },
  { id: 8, category: 'books', question: 'What kind of creature is Shrek?', options: ['Troll', 'Giant', 'Ogre', 'Goblin'], correct: 2, difficulty: 'easy', hint: 'Green and lives in a swamp' },
  { id: 9, category: 'books', question: 'Who wrote "Matilda"?', options: ['J.K. Rowling', 'Roald Dahl', 'Dr. Seuss', 'Enid Blyton'], correct: 1, difficulty: 'medium', hint: 'Also wrote Charlie and the Chocolate Factory' },
  { id: 10, category: 'books', question: 'What does the Very Hungry Caterpillar turn into?', options: ['A Bird', 'A Butterfly', 'A Moth', 'A Bee'], correct: 1, difficulty: 'easy', hint: 'A beautiful winged insect' },
  { id: 11, category: 'books', question: 'In "Peter Pan", what is the name of the fairy?', options: ['Tinker Bell', 'Fairy Queen', 'Pixie', 'Sparkle'], correct: 0, difficulty: 'easy', hint: 'She fixes things and rings' },
  { id: 12, category: 'books', question: 'Who lives in the Hundred Acre Wood?', options: ['Peter Rabbit', 'Winnie the Pooh', 'Paddington Bear', 'Babar'], correct: 1, difficulty: 'medium', hint: 'A bear who loves honey' },
  { id: 13, category: 'books', question: 'What house is Harry Potter sorted into?', options: ['Slytherin', 'Ravenclaw', 'Hufflepuff', 'Gryffindor'], correct: 3, difficulty: 'easy', hint: 'The house of the brave' },
  { id: 14, category: 'books', question: 'Who wrote "The Jungle Book"?', options: ['Rudyard Kipling', 'Roald Dahl', 'Lewis Carroll', 'J.M. Barrie'], correct: 0, difficulty: 'medium', hint: 'A British author born in India' },
  { id: 15, category: 'books', question: 'What is the name of the boy raised by wolves in "The Jungle Book"?', options: ['Tarzan', 'Mowgli', 'Simba', 'Bagheera'], correct: 1, difficulty: 'easy', hint: 'He\'s a man-cub' },
  { id: 16, category: 'books', question: 'Who wrote "Green Eggs and Ham"?', options: ['Dr. Seuss', 'Maurice Sendak', 'Shel Silverstein', 'Eric Carle'], correct: 0, difficulty: 'easy', hint: 'The same author as The Cat in the Hat' },
  { id: 17, category: 'books', question: 'In "Charlie and the Chocolate Factory", what is the factory owner\'s first name?', options: ['William', 'Willy', 'Walter', 'Wesley'], correct: 1, difficulty: 'easy', hint: 'Willy ______ Wonka' },
  { id: 18, category: 'books', question: 'What does Paddington Bear love to eat?', options: ['Honey', 'Marmalade', 'Jam', 'Chocolate'], correct: 1, difficulty: 'medium', hint: 'A type of orange preserve' },
  { id: 19, category: 'books', question: 'Who is the main villain in "101 Dalmatians"?', options: ['Maleficent', 'Cruella de Vil', 'Ursula', 'Evil Queen'], correct: 1, difficulty: 'easy', hint: 'She wants a spotted coat' },
  { id: 20, category: 'books', question: 'What is the name of Hermione\'s cat in Harry Potter?', options: ['Scabbers', 'Hedwig', 'Crookshanks', 'Mrs. Norris'], correct: 2, difficulty: 'medium', hint: 'An orange, squashed-face cat' },

  // Science category (20 questions)
  { id: 21, category: 'science', question: 'What planet is known as the "Red Planet"?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 2, difficulty: 'easy', hint: 'Named after the Roman god of war' },
  { id: 22, category: 'science', question: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], correct: 1, difficulty: 'easy', hint: 'Pluto isn\'t counted anymore' },
  { id: 23, category: 'science', question: 'What is the largest planet in our solar system?', options: ['Earth', 'Saturn', 'Jupiter', 'Neptune'], correct: 2, difficulty: 'medium', hint: 'It has a famous big red storm' },
  { id: 24, category: 'science', question: 'What do plants need to make food?', options: ['Darkness', 'Sunlight', 'Cold', 'Wind'], correct: 1, difficulty: 'easy', hint: 'Photosynthesis uses this energy' },
  { id: 25, category: 'science', question: 'What is the center of an atom called?', options: ['Electron', 'Proton', 'Nucleus', 'Neutron'], correct: 2, difficulty: 'hard', hint: 'Like the center of a cell' },
  { id: 26, category: 'science', question: 'What gas do humans breathe out?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 2, difficulty: 'medium', hint: 'CO2' },
  { id: 27, category: 'science', question: 'What force keeps us on the ground?', options: ['Magnetism', 'Gravity', 'Friction', 'Electricity'], correct: 1, difficulty: 'easy', hint: 'Isaac Newton discovered it with an apple' },
  { id: 28, category: 'science', question: 'How many legs does a spider have?', options: ['6', '8', '10', '12'], correct: 1, difficulty: 'easy', hint: 'More than an insect' },
  { id: 29, category: 'science', question: 'What is the closest star to Earth?', options: ['North Star', 'The Sun', 'Alpha Centauri', 'Sirius'], correct: 1, difficulty: 'medium', hint: 'It rises every morning' },
  { id: 30, category: 'science', question: 'What is water made of?', options: ['Oxygen only', 'Hydrogen only', 'Hydrogen and Oxygen', 'Carbon and Oxygen'], correct: 2, difficulty: 'medium', hint: 'H2O' },
  { id: 31, category: 'science', question: 'What do you call a baby frog?', options: ['Calf', 'Tadpole', 'Fry', 'Pup'], correct: 1, difficulty: 'easy', hint: 'It has a tail and swims' },
  { id: 32, category: 'science', question: 'What is the hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Silver'], correct: 2, difficulty: 'medium', hint: 'Used in engagement rings' },
  { id: 33, category: 'science', question: 'What planet has the most moons?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correct: 1, difficulty: 'hard', hint: 'It has famous rings too' },
  { id: 34, category: 'science', question: 'What is the boiling point of water in Celsius?', options: ['50°C', '100°C', '150°C', '200°C'], correct: 1, difficulty: 'easy', hint: 'A nice round number' },
  { id: 35, category: 'science', question: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 2, difficulty: 'hard', hint: 'From the Latin word "aurum"' },
  { id: 36, category: 'science', question: 'What type of animal is a dolphin?', options: ['Fish', 'Reptile', 'Mammal', 'Amphibian'], correct: 2, difficulty: 'medium', hint: 'It breathes air and feeds milk to babies' },
  { id: 37, category: 'science', question: 'How many bones are in the adult human body?', options: ['106', '206', '306', '406'], correct: 1, difficulty: 'medium', hint: 'Just over 200' },
  { id: 38, category: 'science', question: 'What is the largest organ in the human body?', options: ['Heart', 'Brain', 'Liver', 'Skin'], correct: 3, difficulty: 'medium', hint: 'It covers your whole body' },
  { id: 39, category: 'science', question: 'What color does litmus paper turn in acid?', options: ['Blue', 'Green', 'Red', 'Yellow'], correct: 2, difficulty: 'hard', hint: 'The color of a fire truck' },
  { id: 40, category: 'science', question: 'What is the speed of light?', options: ['300 km/s', '3,000 km/s', '300,000 km/s', '3,000,000 km/s'], correct: 2, difficulty: 'hard', hint: 'About 300 thousand km per second' },

  // Geography category (20 questions)
  { id: 41, category: 'geography', question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correct: 2, difficulty: 'easy', hint: 'Its name means peaceful' },
  { id: 42, category: 'geography', question: 'Which continent is Egypt in?', options: ['Asia', 'Europe', 'Africa', 'Australia'], correct: 2, difficulty: 'medium', hint: 'The pyramids are on this continent' },
  { id: 43, category: 'geography', question: 'What is the capital of France?', options: ['London', 'Berlin', 'Madrid', 'Paris'], correct: 3, difficulty: 'easy', hint: 'City of Love and the Eiffel Tower' },
  { id: 44, category: 'geography', question: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Mississippi', 'Yangtze'], correct: 1, difficulty: 'medium', hint: 'It flows through Egypt' },
  { id: 45, category: 'geography', question: 'Which country has the most people?', options: ['USA', 'India', 'China', 'Russia'], correct: 1, difficulty: 'medium', hint: 'Recently overtook China' },
  { id: 46, category: 'geography', question: 'What ocean is between America and Europe?', options: ['Pacific', 'Indian', 'Arctic', 'Atlantic'], correct: 3, difficulty: 'easy', hint: 'The Titanic sank here' },
  { id: 47, category: 'geography', question: 'What is the smallest continent?', options: ['Europe', 'Antarctica', 'Australia', 'South America'], correct: 2, difficulty: 'medium', hint: 'It\'s also a country' },
  { id: 48, category: 'geography', question: 'In which country is the Eiffel Tower?', options: ['Italy', 'Spain', 'France', 'Germany'], correct: 2, difficulty: 'easy', hint: 'Famous for wine and cheese' },
  { id: 49, category: 'geography', question: 'What is the capital of Italy?', options: ['Venice', 'Milan', 'Rome', 'Naples'], correct: 2, difficulty: 'easy', hint: 'When in _____, do as the Romans do' },
  { id: 50, category: 'geography', question: 'Which country looks like a boot?', options: ['Spain', 'France', 'Italy', 'Greece'], correct: 2, difficulty: 'easy', hint: 'Famous for pizza and pasta' },
  { id: 51, category: 'geography', question: 'What is the largest desert in the world?', options: ['Sahara', 'Gobi', 'Antarctic', 'Arabian'], correct: 2, difficulty: 'hard', hint: 'It\'s cold, not hot!' },
  { id: 52, category: 'geography', question: 'What continent is Brazil in?', options: ['Africa', 'North America', 'South America', 'Europe'], correct: 2, difficulty: 'easy', hint: 'Famous for the Amazon rainforest' },
  { id: 53, category: 'geography', question: 'What is the capital of Japan?', options: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'], correct: 2, difficulty: 'easy', hint: 'It hosted the 2020 Olympics' },
  { id: 54, category: 'geography', question: 'Which country has the kangaroo?', options: ['New Zealand', 'Australia', 'South Africa', 'India'], correct: 1, difficulty: 'easy', hint: 'The Land Down Under' },
  { id: 55, category: 'geography', question: 'What is the tallest mountain in the world?', options: ['K2', 'Kilimanjaro', 'Mount Everest', 'Mont Blanc'], correct: 2, difficulty: 'easy', hint: 'Located in the Himalayas' },
  { id: 56, category: 'geography', question: 'How many continents are there?', options: ['5', '6', '7', '8'], correct: 2, difficulty: 'easy', hint: 'Lucky number!' },
  { id: 57, category: 'geography', question: 'What is the capital of the United Kingdom?', options: ['Manchester', 'Edinburgh', 'London', 'Dublin'], correct: 2, difficulty: 'easy', hint: 'Home of Big Ben' },
  { id: 58, category: 'geography', question: 'Which country is famous for tulips and windmills?', options: ['Belgium', 'Germany', 'Netherlands', 'Denmark'], correct: 2, difficulty: 'medium', hint: 'Also called Holland' },
  { id: 59, category: 'geography', question: 'What is the largest country by area?', options: ['Canada', 'China', 'USA', 'Russia'], correct: 3, difficulty: 'medium', hint: 'Spans two continents' },
  { id: 60, category: 'geography', question: 'Which ocean is the coldest?', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], correct: 3, difficulty: 'easy', hint: 'It\'s named after the North Pole region' },

  // Animals category (20 questions)
  { id: 61, category: 'animals', question: 'What is the largest animal on Earth?', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Shark'], correct: 1, difficulty: 'easy', hint: 'It lives in the ocean' },
  { id: 62, category: 'animals', question: 'What animal is known as the "King of the Jungle"?', options: ['Tiger', 'Elephant', 'Lion', 'Bear'], correct: 2, difficulty: 'easy', hint: 'It has a magnificent mane' },
  { id: 63, category: 'animals', question: 'How many legs does an octopus have?', options: ['6', '8', '10', '12'], correct: 1, difficulty: 'easy', hint: 'Octo means 8 in Latin' },
  { id: 64, category: 'animals', question: 'What is a group of wolves called?', options: ['Herd', 'Flock', 'Pack', 'School'], correct: 2, difficulty: 'medium', hint: 'Like a backpack!' },
  { id: 65, category: 'animals', question: 'What animal has black and white stripes?', options: ['Giraffe', 'Zebra', 'Cheetah', 'Leopard'], correct: 1, difficulty: 'easy', hint: 'Like a horse in pajamas' },
  { id: 66, category: 'animals', question: 'What do pandas mostly eat?', options: ['Fish', 'Meat', 'Bamboo', 'Berries'], correct: 2, difficulty: 'easy', hint: 'A type of tall grass' },
  { id: 67, category: 'animals', question: 'What animal can change its color?', options: ['Frog', 'Chameleon', 'Snake', 'Lizard'], correct: 1, difficulty: 'easy', hint: 'Master of camouflage' },
  { id: 68, category: 'animals', question: 'How many humps does a dromedary camel have?', options: ['0', '1', '2', '3'], correct: 1, difficulty: 'hard', hint: 'D for dromedary, D for "dos minus uno"' },
  { id: 69, category: 'animals', question: 'What is the fastest land animal?', options: ['Lion', 'Horse', 'Cheetah', 'Gazelle'], correct: 2, difficulty: 'medium', hint: 'Can reach 70 mph' },
  { id: 70, category: 'animals', question: 'What animal is Dumbo?', options: ['Giraffe', 'Elephant', 'Hippo', 'Rhino'], correct: 1, difficulty: 'easy', hint: 'He can fly with his big ears' },
  { id: 71, category: 'animals', question: 'What do butterflies start life as?', options: ['Eggs', 'Caterpillars', 'Pupae', 'Worms'], correct: 0, difficulty: 'medium', hint: 'The very first stage' },
  { id: 72, category: 'animals', question: 'What animal has the longest neck?', options: ['Elephant', 'Camel', 'Giraffe', 'Horse'], correct: 2, difficulty: 'easy', hint: 'They eat from tall trees' },
  { id: 73, category: 'animals', question: 'What is a baby kangaroo called?', options: ['Cub', 'Pup', 'Joey', 'Kit'], correct: 2, difficulty: 'medium', hint: 'Like the name Joey' },
  { id: 74, category: 'animals', question: 'Which bird cannot fly?', options: ['Eagle', 'Penguin', 'Parrot', 'Owl'], correct: 1, difficulty: 'easy', hint: 'They waddle and swim instead' },
  { id: 75, category: 'animals', question: 'What animal sleeps upside down?', options: ['Sloth', 'Bat', 'Koala', 'Possum'], correct: 1, difficulty: 'easy', hint: 'It comes out at night' },
  { id: 76, category: 'animals', question: 'What is a group of fish called?', options: ['Herd', 'Pack', 'Flock', 'School'], correct: 3, difficulty: 'easy', hint: 'Like a place where you learn' },
  { id: 77, category: 'animals', question: 'What animal has the best memory?', options: ['Dog', 'Elephant', 'Dolphin', 'Crow'], correct: 1, difficulty: 'medium', hint: 'They say this animal never forgets' },
  { id: 78, category: 'animals', question: 'What is the only mammal that can truly fly?', options: ['Flying squirrel', 'Bat', 'Sugar glider', 'Colugo'], correct: 1, difficulty: 'medium', hint: 'It sleeps hanging upside down' },
  { id: 79, category: 'animals', question: 'How many hearts does an octopus have?', options: ['1', '2', '3', '4'], correct: 2, difficulty: 'hard', hint: 'One main heart plus two gill hearts' },
  { id: 80, category: 'animals', question: 'What is the smallest bird in the world?', options: ['Sparrow', 'Hummingbird', 'Finch', 'Wren'], correct: 1, difficulty: 'medium', hint: 'It flaps its wings incredibly fast' },

  // History category (15 questions) - NEW!
  { id: 81, category: 'history', question: 'Who was the first person to walk on the moon?', options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'], correct: 1, difficulty: 'easy', hint: 'One small step for man...' },
  { id: 82, category: 'history', question: 'What ancient wonder was in Egypt?', options: ['Hanging Gardens', 'Colossus', 'Pyramids of Giza', 'Lighthouse'], correct: 2, difficulty: 'easy', hint: 'Triangular tombs for pharaohs' },
  { id: 83, category: 'history', question: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Rembrandt'], correct: 1, difficulty: 'medium', hint: 'A famous Italian inventor and artist' },
  { id: 84, category: 'history', question: 'In which year did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: 2, difficulty: 'medium', hint: 'Forty-five' },
  { id: 85, category: 'history', question: 'Who discovered America in 1492?', options: ['Vasco da Gama', 'Christopher Columbus', 'Marco Polo', 'Ferdinand Magellan'], correct: 1, difficulty: 'easy', hint: 'He sailed from Spain' },
  { id: 86, category: 'history', question: 'What ship sank on its first voyage in 1912?', options: ['Britannic', 'Olympic', 'Titanic', 'Lusitania'], correct: 2, difficulty: 'easy', hint: 'The unsinkable ship' },
  { id: 87, category: 'history', question: 'Who was the first President of the United States?', options: ['Abraham Lincoln', 'Thomas Jefferson', 'George Washington', 'John Adams'], correct: 2, difficulty: 'easy', hint: 'His face is on the one dollar bill' },
  { id: 88, category: 'history', question: 'What did Thomas Edison invent?', options: ['Telephone', 'Light Bulb', 'Television', 'Radio'], correct: 1, difficulty: 'medium', hint: 'It lights up a room' },
  { id: 89, category: 'history', question: 'Which ancient civilization built the Colosseum?', options: ['Greeks', 'Romans', 'Egyptians', 'Persians'], correct: 1, difficulty: 'easy', hint: 'In Rome!' },
  { id: 90, category: 'history', question: 'What was the name of the first satellite in space?', options: ['Explorer 1', 'Sputnik 1', 'Vanguard 1', 'Apollo 1'], correct: 1, difficulty: 'hard', hint: 'A Russian word meaning "traveling companion"' },
  { id: 91, category: 'history', question: 'Who wrote the Declaration of Independence?', options: ['George Washington', 'Benjamin Franklin', 'Thomas Jefferson', 'John Adams'], correct: 2, difficulty: 'medium', hint: 'Third President of the USA' },
  { id: 92, category: 'history', question: 'What year did humans first land on the moon?', options: ['1967', '1968', '1969', '1970'], correct: 2, difficulty: 'medium', hint: 'The year after 1968' },
  { id: 93, category: 'history', question: 'Who was the famous queen of ancient Egypt?', options: ['Nefertiti', 'Cleopatra', 'Hatshepsut', 'Nefertari'], correct: 1, difficulty: 'medium', hint: 'Also famous for her relationship with Julius Caesar' },
  { id: 94, category: 'history', question: 'What empire was ruled by Genghis Khan?', options: ['Roman', 'Ottoman', 'Mongol', 'Persian'], correct: 2, difficulty: 'hard', hint: 'From the steppes of Central Asia' },
  { id: 95, category: 'history', question: 'In what year did the Berlin Wall fall?', options: ['1987', '1988', '1989', '1990'], correct: 2, difficulty: 'hard', hint: 'One year before 1990' },

  // Movies category (15 questions) - NEW!
  { id: 96, category: 'movies', question: 'What is the name of the snowman in Frozen?', options: ['Snowy', 'Olaf', 'Frosty', 'Jack'], correct: 1, difficulty: 'easy', hint: 'He likes warm hugs' },
  { id: 97, category: 'movies', question: 'Who is the main character in The Little Mermaid?', options: ['Belle', 'Ariel', 'Aurora', 'Cinderella'], correct: 1, difficulty: 'easy', hint: 'A red-haired princess with a fish tail' },
  { id: 98, category: 'movies', question: 'What color is Lightning McQueen in Cars?', options: ['Blue', 'Yellow', 'Red', 'Green'], correct: 2, difficulty: 'easy', hint: 'Ka-chow! Like a fire truck' },
  { id: 99, category: 'movies', question: 'In Toy Story, what type of toy is Woody?', options: ['Astronaut', 'Cowboy', 'Soldier', 'Superhero'], correct: 1, difficulty: 'easy', hint: 'Reach for the sky!' },
  { id: 100, category: 'movies', question: 'What is the name of Simba\'s father in The Lion King?', options: ['Scar', 'Mufasa', 'Rafiki', 'Timon'], correct: 1, difficulty: 'easy', hint: 'The great king of Pride Rock' },
  { id: 101, category: 'movies', question: 'Who is the villain in Finding Nemo?', options: ['Gill', 'Bruce', 'Darla', 'Dory'], correct: 2, difficulty: 'medium', hint: 'A bratty human child' },
  { id: 102, category: 'movies', question: 'In Monsters, Inc., what do monsters use to power their city?', options: ['Electricity', 'Screams', 'Fire', 'Wind'], correct: 1, difficulty: 'medium', hint: 'Children\'s reactions' },
  { id: 103, category: 'movies', question: 'What does Elsa say when she creates her ice palace?', options: ['Here I Go!', 'Let It Go!', 'Let It Snow!', 'Here I Stand!'], correct: 1, difficulty: 'easy', hint: 'A famous song from the movie' },
  { id: 104, category: 'movies', question: 'Who is Wall-E\'s robot friend?', options: ['Eva', 'Eve', 'Ava', 'Ella'], correct: 1, difficulty: 'easy', hint: 'A white, egg-shaped robot' },
  { id: 105, category: 'movies', question: 'In Up, what does Carl use to make his house fly?', options: ['Rockets', 'Balloons', 'Birds', 'Helicopter'], correct: 1, difficulty: 'easy', hint: 'Colorful and full of helium' },
  { id: 106, category: 'movies', question: 'What is the name of the rat chef in Ratatouille?', options: ['Gusteau', 'Remy', 'Alfredo', 'Colette'], correct: 1, difficulty: 'easy', hint: 'He controls Alfredo like a puppet' },
  { id: 107, category: 'movies', question: 'In Shrek, what creature is Donkey\'s wife?', options: ['Horse', 'Dragon', 'Unicorn', 'Phoenix'], correct: 1, difficulty: 'medium', hint: 'She breathes fire' },
  { id: 108, category: 'movies', question: 'Who teaches Moana to sail?', options: ['Tamatoa', 'Maui', 'Te Fiti', 'Te Ka'], correct: 1, difficulty: 'medium', hint: 'A demigod with a magical fish hook' },
  { id: 109, category: 'movies', question: 'In Encanto, what is Mirabel\'s magical power?', options: ['Super strength', 'She has no power', 'Healing', 'Weather control'], correct: 1, difficulty: 'medium', hint: 'She\'s special for being ordinary' },
  { id: 110, category: 'movies', question: 'What is the name of Andy\'s neighbor in Toy Story?', options: ['Sid', 'Billy', 'Tommy', 'Zack'], correct: 0, difficulty: 'medium', hint: 'He destroys toys' },
]

// Category config
const categoryConfig: Record<Category, { emoji: string, color: string, bgGradient: string, name: string }> = {
  books: { emoji: '📚', color: 'text-purple-500', bgGradient: 'from-purple-500 to-purple-700', name: 'Books' },
  science: { emoji: '🔬', color: 'text-blue-500', bgGradient: 'from-blue-500 to-blue-700', name: 'Science' },
  geography: { emoji: '🌍', color: 'text-green-500', bgGradient: 'from-green-500 to-green-700', name: 'Geography' },
  animals: { emoji: '🦁', color: 'text-orange-500', bgGradient: 'from-orange-500 to-orange-700', name: 'Animals' },
  history: { emoji: '🏛️', color: 'text-amber-600', bgGradient: 'from-amber-500 to-amber-700', name: 'History' },
  movies: { emoji: '🎬', color: 'text-pink-500', bgGradient: 'from-pink-500 to-pink-700', name: 'Movies' },
}

// Enhanced Confetti component with multiple effects
function Confetti({ count = 50, type = 'standard' }: { count?: number, type?: 'standard' | 'epic' | 'fireworks' }) {
  const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#9b5de5', '#f15bb5']
  const shapes = type === 'epic' ? ['◆', '★', '●', '♦', '✦', '❤', '🎉', '🌟', '✨'] : ['◆']
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`absolute ${type === 'fireworks' ? 'animate-firework' : 'animate-confetti'}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: type === 'fireworks' ? '50%' : '-20px',
            animationDelay: `${Math.random() * (type === 'fireworks' ? 0.5 : 2)}s`,
            animationDuration: `${(type === 'fireworks' ? 1 : 2) + Math.random() * 2}s`,
          }}
        >
          <div
            className={`text-2xl ${type === 'epic' ? 'animate-spin-slow' : 'rotate-45'}`}
            style={{
              color: colors[i % 9],
              textShadow: type === 'epic' ? '0 0 10px currentColor' : 'none',
            }}
          >
            {shapes[i % shapes.length]}
          </div>
        </div>
      ))}
      {type === 'epic' && (
        <>
          {/* Golden sparkles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              <div className="text-3xl">✨</div>
            </div>
          ))}
          {/* Floating emojis */}
          {['🎉', '🏆', '🌟', '💯', '🔥'].map((emoji, i) => (
            <div
              key={`emoji-${i}`}
              className="absolute animate-float-up text-5xl"
              style={{
                left: `${15 + i * 17}%`,
                bottom: '-50px',
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// Animated background component
function AnimatedBackground({ category, intensity = 'normal' }: { category?: Category, intensity?: 'normal' | 'playing' | 'celebration' }) {
  const gradients = {
    books: 'from-purple-200 via-pink-100 to-purple-200',
    science: 'from-blue-200 via-cyan-100 to-blue-200',
    geography: 'from-green-200 via-emerald-100 to-green-200',
    animals: 'from-orange-200 via-amber-100 to-orange-200',
    history: 'from-amber-200 via-yellow-100 to-amber-200',
    movies: 'from-pink-200 via-rose-100 to-pink-200',
    default: 'from-blue-100 via-purple-100 to-pink-100',
  }

  const bgGradient = category ? gradients[category] : gradients.default

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} transition-all duration-1000`}>
      {/* Animated gradient orbs */}
      <div className={`absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-300/40 to-purple-400/40 rounded-full blur-3xl ${intensity === 'celebration' ? 'animate-pulse-fast' : 'animate-drift'}`} />
      <div className={`absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-blue-300/40 to-cyan-400/40 rounded-full blur-3xl ${intensity === 'celebration' ? 'animate-pulse-fast' : 'animate-drift-reverse'}`} />
      <div className={`absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-br from-yellow-300/40 to-orange-400/40 rounded-full blur-3xl ${intensity === 'celebration' ? 'animate-pulse-fast' : 'animate-drift-slow'}`} />
      
      {/* Floating particles */}
      {intensity !== 'normal' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${intensity === 'celebration' ? 'bg-yellow-400 animate-particle-fast' : 'bg-white/50 animate-particle'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Celebration rays */}
      {intensity === 'celebration' && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-full bg-gradient-to-t from-transparent via-yellow-300/20 to-transparent origin-bottom animate-ray"
              style={{
                transform: `rotate(${i * 30}deg)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Timer ring component
function TimerRing({ timeLeft, maxTime }: { timeLeft: number, maxTime: number }) {
  const percentage = (timeLeft / maxTime) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const isWarning = timeLeft <= 5

  return (
    <div className="relative w-24 h-24">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r="45"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="48"
          cy="48"
          r="45"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${isWarning ? 'text-red-500' : 'text-blue-500'}`}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-3xl font-black ${isWarning ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
        {timeLeft}
      </div>
    </div>
  )
}

// Combo display
function ComboDisplay({ combo, show }: { combo: number, show: boolean }) {
  if (!show || combo < 2) return null

  const comboText = combo >= 5 ? 'INCREDIBLE!' : combo >= 3 ? 'AWESOME!' : 'COMBO!'
  const flames = combo >= 5 ? '🔥🔥🔥' : combo >= 3 ? '🔥🔥' : '🔥'

  return (
    <div className="absolute top-4 right-4 animate-bounce-in">
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-black text-lg shadow-lg animate-pulse">
        {flames} {combo}x {comboText}
      </div>
    </div>
  )
}

// Lifeline button component
function LifelineButton({ 
  icon, 
  label, 
  used, 
  onClick, 
  disabled 
}: { 
  icon: string
  label: string
  used: boolean
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={used || disabled}
      className={`
        flex flex-col items-center justify-center p-3 rounded-xl transition-all transform
        ${used 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
          : disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-110 hover:shadow-lg active:scale-95'
        }
      `}
    >
      <span className="text-2xl mb-1">{used ? '✗' : icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </button>
  )
}

// Hint popup component
function HintPopup({ hint, onClose }: { hint: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 m-4 max-w-sm shadow-2xl animate-bounce-in" onClick={e => e.stopPropagation()}>
        <div className="text-4xl text-center mb-4">💡</div>
        <h3 className="text-xl font-bold text-center mb-2 text-purple-600">Hint</h3>
        <p className="text-center text-gray-700 text-lg">{hint}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:scale-105 transition-transform"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

function QuizGameInner() {
  const rewards = useGameContext()
  const [gameState, setGameState] = useState<GameState>('menu')
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['books', 'science', 'geography', 'animals', 'history', 'movies'])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiType, setConfettiType] = useState<'standard' | 'epic' | 'fireworks'>('standard')
  const [showCombo, setShowCombo] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Lifelines state
  const [lifelines, setLifelines] = useState<Lifelines>({ fiftyFifty: false, skip: false, hint: false })
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([])
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState('')

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { playCorrect, playWrong, playTick, playWarning, playCombo, playGameOver, playLifeline, playVictory } = useQuizSounds()

  // Load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quiz-leaderboard')
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved))
      } catch { /* Invalid data */ }
    }
    const savedName = localStorage.getItem('quiz-player-name')
    if (savedName) setPlayerName(savedName)
  }, [])

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing' || showResult) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1) // Time's up, auto-wrong
          return 15
        }
        if (prev <= 6 && prev > 1 && soundEnabled) {
          playWarning()
        } else if (soundEnabled) {
          playTick()
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, showResult, currentQuestionIndex])

  // Toggle category selection
  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        if (prev.length === 1) return prev // Must have at least one
        return prev.filter(c => c !== category)
      }
      return [...prev, category]
    })
  }

  // Start game
  const startGame = () => {
    // Get questions from selected categories
    const filtered = questionBank.filter(q => selectedCategories.includes(q.category))
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10)
    
    setQuestions(shuffled)
    setCurrentQuestionIndex(0)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setCorrectAnswers(0)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setShowResult(false)
    setLifelines({ fiftyFifty: false, skip: false, hint: false })
    setEliminatedOptions([])
    setGameState('playing')
  }

  // Handle answer selection
  const handleAnswer = useCallback((answerIndex: number) => {
    if (showResult) return

    if (timerRef.current) clearInterval(timerRef.current)
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = answerIndex === currentQuestion?.correct

    if (isCorrect) {
      if (soundEnabled) playCorrect()
      
      // Calculate score with combo multiplier
      const basePoints = 100
      const timeBonus = Math.floor(timeLeft * 5)
      const comboMultiplier = 1 + (combo * 0.25)
      const points = Math.floor((basePoints + timeBonus) * comboMultiplier)
      
      setScore(prev => prev + points)
      setCombo(prev => {
        const newCombo = prev + 1
        if (newCombo > maxCombo) setMaxCombo(newCombo)
        if (newCombo >= 2 && soundEnabled) playCombo(newCombo)
        return newCombo
      })
      setShowCombo(true)
      setTimeout(() => setShowCombo(false), 1500)
      setCorrectAnswers(prev => prev + 1)
    } else {
      if (soundEnabled) playWrong()
      setCombo(0)
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeLeft(15)
        setEliminatedOptions([])
      } else {
        // Game over
        const finalCorrect = isCorrect ? correctAnswers + 1 : correctAnswers
        if (finalCorrect >= 8) {
          if (soundEnabled) playVictory()
          setConfettiType('epic')
        } else {
          if (soundEnabled) playGameOver()
          setConfettiType('standard')
        }
        setGameState('results')
      rewards.trackWin()
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 6000)
        setShowNameInput(true)
      }
    }, 1500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, questions, currentQuestionIndex, timeLeft, combo, maxCombo, soundEnabled, correctAnswers])

  // Lifeline: 50/50
  const useFiftyFifty = useCallback(() => {
    if (lifelines.fiftyFifty || showResult) return
    
    const currentQuestion = questions[currentQuestionIndex]
    const wrongOptions = [0, 1, 2, 3].filter(i => i !== currentQuestion.correct)
    const toEliminate = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2)
    
    setEliminatedOptions(toEliminate)
    setLifelines(prev => ({ ...prev, fiftyFifty: true }))
    if (soundEnabled) playLifeline()
  }, [lifelines.fiftyFifty, showResult, questions, currentQuestionIndex, soundEnabled, playLifeline])

  // Lifeline: Skip
  const useSkip = useCallback(() => {
    if (lifelines.skip || showResult) return
    
    if (timerRef.current) clearInterval(timerRef.current)
    
    setLifelines(prev => ({ ...prev, skip: true }))
    if (soundEnabled) playLifeline()
    
    // Move to next question without penalty
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeLeft(15)
        setEliminatedOptions([])
      } else {
        // End game if this was the last question
        if (soundEnabled) playGameOver()
        setGameState('results')
        setShowConfetti(true)
        setConfettiType(correctAnswers >= 7 ? 'epic' : 'standard')
        setTimeout(() => setShowConfetti(false), 6000)
        setShowNameInput(true)
      }
    }, 500)
  }, [lifelines.skip, showResult, questions.length, currentQuestionIndex, soundEnabled, playLifeline, playGameOver, correctAnswers])

  // Lifeline: Hint
  const useHint = useCallback(() => {
    if (lifelines.hint || showResult) return
    
    const currentQuestion = questions[currentQuestionIndex]
    setCurrentHint(currentQuestion.hint || 'No hint available for this question!')
    setShowHint(true)
    setLifelines(prev => ({ ...prev, hint: true }))
    if (soundEnabled) playLifeline()
  }, [lifelines.hint, showResult, questions, currentQuestionIndex, soundEnabled, playLifeline])

  // Save score to leaderboard
  const saveScore = () => {
    if (!playerName.trim()) return

    localStorage.setItem('quiz-player-name', playerName)
    
    const entry: LeaderboardEntry = {
      name: playerName.trim().substring(0, 10).toUpperCase(),
      score,
      date: new Date().toISOString(),
      combo: maxCombo,
    }

    const newLeaderboard = [...leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    setLeaderboard(newLeaderboard)
    localStorage.setItem('quiz-leaderboard', JSON.stringify(newLeaderboard))
    setShowNameInput(false)
  }

  // Share score
  const shareScore = async () => {
    const text = `🧠 Quiz Challenge!\n\n🏆 Score: ${score.toLocaleString()}\n✅ ${correctAnswers}/10 correct\n🔥 Max combo: ${maxCombo}x\n\nPlay at onde.la/games/quiz`
    
    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch { /* User cancelled */ }
    }
    
    try {
      await navigator.clipboard.writeText(text)
      alert('Score copied to clipboard!')
    } catch { /* Failed */ }
  }

  // Render menu
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2 animate-title">
          QUIZ TIME!
        </h1>
        <p className="text-xl text-gray-600">Test your knowledge! 🧠</p>
        <p className="text-sm text-gray-500 mt-1">100+ questions across 6 categories</p>
      </div>

      {/* Category selection */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 max-w-lg w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.keys(categoryConfig) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`
                p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105
                ${selectedCategories.includes(cat)
                  ? `bg-gradient-to-r ${categoryConfig[cat].bgGradient} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-2xl block mb-1">{categoryConfig[cat].emoji}</span>
              {categoryConfig[cat].name}
            </button>
          ))}
        </div>
      </div>

      {/* Lifelines info */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-6 max-w-lg w-full">
        <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">🎯 Lifelines Available</h3>
        <div className="flex justify-center gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">✂️</span>
            <span className="text-xs text-gray-600">50/50</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">⏭️</span>
            <span className="text-xs text-gray-600">Skip</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">💡</span>
            <span className="text-xs text-gray-600">Hint</span>
          </div>
        </div>
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 font-medium hover:bg-white transition-all"
      >
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </button>

      {/* Start button */}
      <button
        onClick={startGame}
        className="px-12 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-2xl rounded-full shadow-xl hover:scale-110 transition-all animate-bounce"
      >
        START QUIZ! 🚀
      </button>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="mt-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">🏆 High Scores</h2>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  i === 0 ? 'bg-yellow-100' : i === 1 ? 'bg-gray-100' : i === 2 ? 'bg-orange-100' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                  <span className="font-bold">{entry.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg">{entry.score.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">🔥 {entry.combo}x combo</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // Render playing
  const renderPlaying = () => {
    const question = questions[currentQuestionIndex]
    if (!question) return null

    return (
      <div className="min-h-screen p-4 flex flex-col relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setGameState('menu')}
            className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-gray-700 shadow hover:scale-105 transition-all"
          >
            ✕ Quit
          </button>
          <div className="text-center">
            <div className="text-sm text-gray-500">Question</div>
            <div className="font-black text-xl">{currentQuestionIndex + 1}/{questions.length}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Score</div>
            <div className="font-black text-xl text-purple-600">{score.toLocaleString()}</div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <TimerRing timeLeft={timeLeft} maxTime={15} />
        </div>

        {/* Lifelines */}
        <div className="flex justify-center gap-3 mb-4">
          <LifelineButton
            icon="✂️"
            label="50/50"
            used={lifelines.fiftyFifty}
            onClick={useFiftyFifty}
            disabled={showResult}
          />
          <LifelineButton
            icon="⏭️"
            label="Skip"
            used={lifelines.skip}
            onClick={useSkip}
            disabled={showResult}
          />
          <LifelineButton
            icon="💡"
            label="Hint"
            used={lifelines.hint}
            onClick={useHint}
            disabled={showResult}
          />
        </div>

        {/* Category badge */}
        <div className="flex justify-center mb-4">
          <span className={`px-4 py-1 rounded-full text-white font-bold bg-gradient-to-r ${categoryConfig[question.category].bgGradient}`}>
            {categoryConfig[question.category].emoji} {categoryConfig[question.category].name}
          </span>
        </div>

        {/* Question */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 flex-grow max-w-2xl mx-auto w-full">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto w-full">
          {question.options.map((option, i) => {
            const isEliminated = eliminatedOptions.includes(i)
            let bgClass = 'bg-white hover:bg-gray-50 border-2 border-gray-200'
            
            if (isEliminated) {
              bgClass = 'bg-gray-100 border-2 border-gray-200 opacity-30 cursor-not-allowed'
            } else if (showResult) {
              if (i === question.correct) {
                bgClass = 'bg-green-500 text-white border-2 border-green-600 animate-correct'
              } else if (i === selectedAnswer && i !== question.correct) {
                bgClass = 'bg-red-500 text-white border-2 border-red-600 animate-wrong'
              } else {
                bgClass = 'bg-gray-100 border-2 border-gray-200 opacity-50'
              }
            }

            return (
              <button
                key={i}
                onClick={() => !isEliminated && handleAnswer(i)}
                disabled={showResult || isEliminated}
                className={`
                  p-4 rounded-xl font-bold text-lg transition-all transform
                  ${!showResult && !isEliminated && 'hover:scale-105 hover:shadow-lg'}
                  ${bgClass}
                `}
              >
                <span className="mr-2 opacity-60">{['A', 'B', 'C', 'D'][i]}.</span>
                {isEliminated ? '---' : option}
              </button>
            )
          })}
        </div>

        {/* Combo indicator */}
        {combo >= 2 && (
          <div className="text-center mt-4">
            <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-black animate-pulse">
              🔥 {combo}x Combo!
            </span>
          </div>
        )}

        <ComboDisplay combo={combo} show={showCombo} />
        
        {/* Hint popup */}
        {showHint && <HintPopup hint={currentHint} onClose={() => setShowHint(false)} />}
      </div>
    )
  }

  // Render results
  const renderResults = () => {
    const isEpic = correctAnswers >= 8
    const isPerfect = correctAnswers === 10
    
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center relative z-10">
        {showConfetti && <Confetti count={isPerfect ? 150 : isEpic ? 100 : 50} type={confettiType} />}
        
        <div className="text-center mb-8">
          {isPerfect ? (
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2 animate-title">
              🌟 PERFECT! 🌟
            </h1>
          ) : isEpic ? (
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-2 animate-title">
              🎉 AMAZING!
            </h1>
          ) : correctAnswers >= 5 ? (
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 mb-2">
              👏 GREAT JOB!
            </h1>
          ) : (
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500 mb-2">
              💪 NICE TRY!
            </h1>
          )}
        </div>

        {/* Score card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 max-w-md w-full">
          <div className="text-center">
            <div className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isPerfect ? 'from-yellow-400 to-orange-500' : 'from-purple-600 to-pink-500'} mb-2`}>
              {score.toLocaleString()}
            </div>
            <div className="text-gray-500 mb-6">POINTS</div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl mb-1">✅</div>
                <div className="font-black text-xl">{correctAnswers}/10</div>
                <div className="text-xs text-gray-500">Correct</div>
              </div>
              <div>
                <div className="text-3xl mb-1">🔥</div>
                <div className="font-black text-xl">{maxCombo}x</div>
                <div className="text-xs text-gray-500">Max Combo</div>
              </div>
              <div>
                <div className="text-3xl mb-1">⭐</div>
                <div className="font-black text-xl">{Math.floor(correctAnswers * 10)}%</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
            </div>
            
            {/* Lifelines used */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-2">Lifelines Used</div>
              <div className="flex justify-center gap-4">
                <span className={lifelines.fiftyFifty ? 'opacity-30' : ''}>✂️</span>
                <span className={lifelines.skip ? 'opacity-30' : ''}>⏭️</span>
                <span className={lifelines.hint ? 'opacity-30' : ''}>💡</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement badges */}
        {(isPerfect || maxCombo >= 5 || correctAnswers >= 8) && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {isPerfect && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold animate-pulse">
                🏆 Perfect Score!
              </span>
            )}
            {maxCombo >= 5 && (
              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-sm font-bold">
                🔥 Combo Master!
              </span>
            )}
            {correctAnswers >= 8 && !isPerfect && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold">
                ⭐ Quiz Champion!
              </span>
            )}
          </div>
        )}

        {/* Name input for leaderboard */}
        {showNameInput && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Save Your Score!</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                placeholder="YOUR NAME"
                maxLength={10}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-center uppercase focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={saveScore}
                disabled={!playerName.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50"
              >
                SAVE
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={shareScore}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            📤 Share Score
          </button>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🔄 Play Again
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="px-8 py-4 bg-gray-200 text-gray-700 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🏠 Menu
          </button>
        </div>
      </div>
    )
  }

  // Determine background intensity
  const bgIntensity = gameState === 'results' && showConfetti ? 'celebration' : gameState === 'playing' ? 'playing' : 'normal'
  const currentCategory = gameState === 'playing' && questions[currentQuestionIndex] ? questions[currentQuestionIndex].category : undefined

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground category={currentCategory} intensity={bgIntensity} />
      
      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {['❓', '💡', '🧠', '⭐', '🎯', '📚', '🔬', '🌍', '🦁', '🏛️', '🎬'].map((emoji, i) => (
          <div
            key={i}
            className="absolute animate-float-slow opacity-20"
            style={{
              left: `${(i * 9) % 100}%`,
              top: `${(i * 13) % 100}%`,
              animationDelay: `${i * 0.5}s`,
              fontSize: '2rem',
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Back link */}
      <Link
        href="/games/arcade/"
        className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-gray-700 shadow-lg hover:scale-105 transition-all"
      >
        ← Games
      </Link>

      {/* Main content */}
      {gameState === 'menu' && renderMenu()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'results' && renderResults()}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes firework {
          0% { transform: scale(0) translateY(0); opacity: 1; }
          50% { transform: scale(1.5) translateY(-100px); opacity: 1; }
          100% { transform: scale(0.5) translateY(-200px); opacity: 0; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes correct {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes wrong {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -20px); }
          50% { transform: translate(-20px, 30px); }
          75% { transform: translate(-30px, -10px); }
        }
        @keyframes drift-reverse {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-30px, 20px); }
          50% { transform: translate(20px, -30px); }
          75% { transform: translate(30px, 10px); }
        }
        @keyframes drift-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -15px); }
        }
        @keyframes particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-30px) scale(1.5); opacity: 1; }
        }
        @keyframes particle-fast {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-50px) scale(2); opacity: 1; }
        }
        @keyframes ray {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1) rotate(180deg); opacity: 1; }
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes title {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        .animate-firework {
          animation: firework 2s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
        .animate-correct {
          animation: correct 0.3s ease-in-out;
        }
        .animate-wrong {
          animation: wrong 0.3s ease-in-out;
        }
        .animate-drift {
          animation: drift 15s ease-in-out infinite;
        }
        .animate-drift-reverse {
          animation: drift-reverse 18s ease-in-out infinite;
        }
        .animate-drift-slow {
          animation: drift-slow 20s ease-in-out infinite;
        }
        .animate-particle {
          animation: particle 3s ease-in-out infinite;
        }
        .animate-particle-fast {
          animation: particle-fast 1.5s ease-in-out infinite;
        }
        .animate-ray {
          animation: ray 2s ease-in-out infinite;
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        .animate-float-up {
          animation: float-up 4s ease-out forwards;
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-title {
          animation: title 2s ease-in-out infinite;
        }
        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function QuizGame() {
  return (
    <GameWrapper gameName="Quiz Challenge" gameId="quiz" emoji={"❓"}>
      <QuizGameInner />
    </GameWrapper>
  )
}
