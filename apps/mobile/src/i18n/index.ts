import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  fr: {
    translation: fr,
  },
  en: {
    translation: en,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.includes('fr') ? 'fr' : 'en',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;