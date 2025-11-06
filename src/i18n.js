import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

const preferredLanguage = JSON.parse(localStorage.getItem('preferred_language'))?.value;
const languageToUse = 
  JSON.parse(sessionStorage.getItem("route")) || JSON.parse(localStorage.getItem("route")) || 
  JSON.parse(sessionStorage.getItem("local_route")) || JSON.parse(localStorage.getItem("local_route")) || 
  "en";

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
      loadPath: `${process.env.REACT_APP_ROOT_PATH ? `/${process.env.REACT_APP_ROOT_PATH}` : ''}/locales/{{lng}}/{{ns}}.json`,
    },
  });

export const setLanguage = (languageProp) => {
  const route = JSON.parse(sessionStorage.getItem('route')) || JSON.parse(localStorage.getItem('route'));
  const languageToUse = languageProp || route || 'en';
  console.log("Language set to: ", languageToUse);
  i18n.changeLanguage(languageToUse);
};

export default i18n;
