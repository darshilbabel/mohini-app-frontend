import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language'))?.value;
const languageToUse = preferredLanguage || JSON.parse(localStorage.getItem("route")) || "en";

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: languageToUse,
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/mohini/locales/{{lng}}/{{ns}}.json',
    },
  });

export const setLanguage = (languageProp) => {
  const route = JSON.parse(localStorage.getItem('route'));
  const languageToUse = languageProp || route || 'en';

  i18n.changeLanguage(languageToUse);
};

export default i18n;
