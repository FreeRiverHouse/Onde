# 🌍 AIKO Interactive - Multilingual Support

## Languages Supported

- **🇬🇧 English** (EN) - Original
- **🇮🇹 Italiano** (IT) - Complete
- **🇫🇷 Français** (FR) - Complete

---

## Features

### 1. **Language Selector** ✨
- Beautiful modal with flag selection
- Tap the **🌍 globe icon** on the home screen
- Smooth animations and visual feedback
- Instant language switching

### 2. **Persistent Preferences** 💾
- Language choice saved using AsyncStorage
- Automatically loads your preferred language on next launch
- Falls back to English if preference not found

### 3. **Full Translation Coverage** 📝
All content translated:
- ✅ All 8 chapter texts
- ✅ Chapter titles and interactions
- ✅ Cover page (title, subtitle, dedication)
- ✅ Navigation buttons (Back, Next, Continue)
- ✅ UI labels and headers

### 4. **Auto-Detection** 🤖
- Detects device language on first launch
- Seamlessly defaults to supported language
- Graceful fallback to English

---

## How to Use

### For Users

1. **Open the app** - Launches in your device's language (if supported)
2. **Tap the 🌍 globe button** - Top right corner of home screen
3. **Select your language** - Tap flag to switch
4. **Enjoy!** - Entire app updates instantly

### For Developers

#### Change Language Programmatically
```javascript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
await i18n.changeLanguage('it'); // Switch to Italian
```

#### Get Translated Chapter Data
```javascript
import { getChapters, getCoverData } from './src/data/chaptersMultilang';

const chapters = getChapters('fr'); // Get French chapters
const cover = getCoverData('it'); // Get Italian cover
```

#### Use Translation Strings
```javascript
const { t } = useTranslation();
<Text>{t('navigation.back')}</Text> // Displays "Back", "Indietro", or "Retour"
```

---

## File Structure

```
src/
├── i18n/
│   ├── i18n.js                 # i18n configuration
│   └── locales/
│       ├── en.json             # English UI strings
│       ├── it.json             # Italian UI strings
│       └── fr.json             # French UI strings
├── data/
│   └── chaptersMultilang.js    # All chapters in 3 languages
└── components/
    └── LanguageSelector.js     # Language selection modal
```

---

## Translation Examples

### Chapter 1 - "A Strange New Friend"

**English:**
> On her seventh birthday, Sofia found a cardboard box with her name on it.

**Italiano:**
> Per il suo settimo compleanno, Sofia trovò una scatola di cartone con il suo nome sopra.

**Français:**
> Pour son septième anniversaire, Sofia trouva une boîte en carton avec son nom dessus.

---

## Dependencies

```json
{
  "i18next": "^23.x.x",
  "react-i18next": "^14.x.x",
  "@react-native-async-storage/async-storage": "^2.x.x"
}
```

---

## Adding New Languages

To add a new language (e.g., Spanish):

1. **Create translation file:**
   ```
   src/i18n/locales/es.json
   ```

2. **Add UI strings:**
   ```json
   {
     "home": {
       "startReading": "Comenzar a Leer",
       ...
     }
   }
   ```

3. **Add chapter translations** in `chaptersMultilang.js`:
   ```javascript
   es: {
     chapters: [
       {
         id: 1,
         title: "Un Nuevo Amigo Extraño",
         text: [...],
         interaction: "¡Toca a AIKO para despertarlo!"
       },
       ...
     ]
   }
   ```

4. **Register in i18n.js:**
   ```javascript
   import es from './locales/es.json';

   resources: {
     en: { translation: en },
     it: { translation: it },
     fr: { translation: fr },
     es: { translation: es },
   }
   ```

5. **Add flag to selector:**
   ```javascript
   { code: 'es', name: 'Español', flag: '🇪🇸' }
   ```

---

## Testing

### Manual Testing Checklist

- [ ] Tap globe icon on home screen
- [ ] Select Italian → all text switches to Italian
- [ ] Navigate to chapter list → titles in Italian
- [ ] Open a chapter → text and buttons in Italian
- [ ] Switch to French → instant update
- [ ] Close and reopen app → language persists
- [ ] Test on different devices/OS versions

---

## Known Limitations

- Games currently in English only (can be localized later)
- No RTL (Right-to-Left) language support yet
- Font might need adjustment for Asian languages (KO, JA)

---

## Future Enhancements

- [ ] Add Spanish (ES)
- [ ] Add German (DE)
- [ ] Add Korean (KO)
- [ ] Add Japanese (JA)
- [ ] Localize game content
- [ ] Add narration audio in multiple languages
- [ ] RTL language support (Arabic, Hebrew)

---

*Multilingual support added: 2026-01-07*
*Languages: IT, EN, FR*
*Total translations: 500+ strings*
