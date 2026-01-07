import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import it from './locales/it.json';
import fr from './locales/fr.json';

const LANGUAGE_KEY = '@aiko_language';

// Get saved language or default to device language
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    return savedLanguage || 'en';
  } catch (error) {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      it: { translation: it },
      fr: { translation: fr },
    },
    lng: 'en', // Will be overridden by saved preference
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Load saved language on init
getInitialLanguage().then(lng => {
  i18n.changeLanguage(lng);
});

export const changeLanguage = async (lng) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  i18n.changeLanguage(lng);
};

export default i18n;
