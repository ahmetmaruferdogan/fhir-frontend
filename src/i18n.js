import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import global_en from './translations/en/global.json';
import global_tr from './translations/tr/global.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      global: global_en
    },
    tr: {
      global: global_tr
    }
  },
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
