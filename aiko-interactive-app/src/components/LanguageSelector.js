import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function LanguageSelector({ visible, onClose }) {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleSelectLanguage = async (languageCode) => {
    setSelectedLanguage(languageCode);
    await i18n.changeLanguage(languageCode);
    // Give a moment for the UI to update before closing
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Language</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.languageList}>
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageButton,
                  selectedLanguage === language.code && styles.languageButtonSelected,
                ]}
                onPress={() => handleSelectLanguage(language.code)}
              >
                <Text style={styles.flag}>{language.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.languageNameSelected,
                  ]}
                >
                  {language.name}
                </Text>
                {selectedLanguage === language.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.sky.light,
  },
  title: {
    ...typography.title,
    fontSize: 24,
    color: colors.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sky.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  languageList: {
    padding: spacing.lg,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background.cream,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonSelected: {
    backgroundColor: colors.sky.light,
    borderColor: colors.aiko.glow,
  },
  flag: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  languageName: {
    ...typography.subtitle,
    fontSize: 20,
    flex: 1,
    color: colors.text.primary,
  },
  languageNameSelected: {
    fontWeight: '700',
    color: colors.aiko.eye,
  },
  checkmark: {
    fontSize: 24,
    color: colors.aiko.glow,
    fontWeight: '700',
  },
});
