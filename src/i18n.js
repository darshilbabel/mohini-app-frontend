import i18n from 'i18next';
import { LANGUAGE_ENUMS } from "pages/ShikshalokamVoiceChat/enum";
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import { useSiteDataLocalStore, useSiteDataSessionStore } from 'store';

// const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language'))?.value;

const chatLanguageLocal = useSiteDataLocalStore.getState().getChatLanguage();
// const { chatLanguage: chatLanguageSession } = useSiteDataSessionStore.getState();

const languageToUse = chatLanguageLocal || LANGUAGE_ENUMS.ENGLISH;
  
i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
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
  const route = JSON.parse(sessionStorage.getItem('route')) || JSON.parse(localStorage.getItem('route'));
  const languageToUse = languageProp || route || 'en';
  console.log("Language set to: ", languageToUse);
  i18n.changeLanguage(languageToUse);
};

export default i18n;
