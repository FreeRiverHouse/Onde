# AIKO Interactive - AI Education App for Children

An interactive educational app based on the book "AIKO: AI Explained to Children" by Onde Publishing.

## Features

- **8 Interactive Chapters** - Each chapter from the book comes to life with beautiful illustrations
- **Educational Mini-Games** - Custom games for each chapter that teach AI concepts:
  - Discovery Game - Wake up AIKO
  - Pattern Matching - Learn how AI recognizes patterns
  - Image Recognition - Teach AIKO to see
  - Conversation - Understand how AI learns language
  - Abilities Showcase - Explore what AI can do
  - Emotions - Learn what AI can't feel
  - Safety Quiz - Master the 4 rules of AI safety
  - Future Builder - Imagine the future with AI

- **Beautiful Design** - Watercolor illustrations with warm, golden tones
- **Touch-Optimized** - Perfect for iPad and tablets
- **Offline-First** - All content works without internet

## Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Easy deployment to iOS/Android
- **React Navigation** - Smooth screen transitions
- **Linear Gradients** - Beautiful UI effects
- **Custom Animations** - Engaging interactions

## Design System

Based on the AIKO book illustrations:
- **Colors**: Golden sunsets, sky blues, AIKO's cyan glow
- **Typography**: Clear, readable, kid-friendly
- **Spacing**: Generous touch targets for small fingers
- **Animations**: Smooth, delightful, not distracting

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Building for Production

```bash
# Install Expo CLI globally (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Project Structure

```
aiko-interactive-app/
├── assets/
│   └── images/          # All chapter illustrations
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Main app screens
│   │   ├── HomeScreen.js
│   │   ├── ChapterListScreen.js
│   │   └── ChapterScreen.js
│   ├── games/           # 8 interactive mini-games
│   │   ├── DiscoveryGame.js
│   │   ├── PatternMatchingGame.js
│   │   ├── ImageRecognitionGame.js
│   │   ├── ConversationGame.js
│   │   ├── AbilitiesShowcase.js
│   │   ├── EmotionsGame.js
│   │   ├── SafetyQuiz.js
│   │   └── FutureBuilder.js
│   ├── data/
│   │   └── chapters.js  # Book content and chapter data
│   └── utils/
│       └── theme.js     # Design system (colors, typography, spacing)
├── App.js               # Main app component with navigation
└── package.json
```

## Content

The app includes all 8 chapters from the book:
1. A Strange New Friend
2. What Is Artificial Intelligence?
3. How AIKO Learned to See
4. How AIKO Learned to Talk
5. What AIKO Can Do
6. What AIKO Cannot Do
7. Using AI Safely
8. The Future We Build Together

## Credits

- **Author**: Gianni Parola
- **Illustrator**: Pino Pennello
- **Publisher**: Onde - Free River House
- **App Development**: Created with React Native + Expo

## License

All content and illustrations © Onde Publishing 2026

---

*Built with ❤️ for curious kids who want to understand AI*
