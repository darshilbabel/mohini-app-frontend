import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LANGUAGE_ENUMS } from "pages/ShikshalokamVoiceChat/enum";
import { setLanguage } from "../i18n";
import { getFromStorage, setInStorage } from "../services/storage_service";
import { useUserPreferenceLocalStore } from 'store';

// Get default language based on usecase type
function getDefaultLanguage(usecaseType) {
  switch (usecaseType) {
    default:
      return LANGUAGE_ENUMS.ENGLISH;
  }
}

export const useLanguage = (usecaseType) => {
  const location = useLocation();
  
  // Parse URL params
  const urlParams = new URLSearchParams(location.search);
  const urlLanguage = urlParams.get('language');
  
  // const defaultLanguage = urlLanguage ||
  //   useUserStore.getState().local_route ||
  //   getDefaultLanguage(usecaseType);

  const { local_route: userLanguage, setLocalRoute: setUserLanguage } = useUserPreferenceLocalStore.getState();

  const [languageButtonSelect, setLanguageButtonSelect] = useState(
    urlLanguage ? true : (getFromStorage("hasSelectedLanguage") || null)
  );

  // Auto-apply URL language on mount
  useEffect(() => {
    if (urlLanguage) {
      setInStorage("hasSelectedLanguage", true);
      setLanguage(urlLanguage);
      setUserLanguage(urlLanguage);
      setInStorage("route", JSON.stringify(urlLanguage));
      setLanguageButtonSelect(true);
    }
  }, [urlLanguage]);

  const handleLanguageChange = (newLanguage, audioRef, stopAllAudio, setStopAudioTriggered) => {
    audioRef.current = null;
    setUserLanguage(newLanguage);
    setStopAudioTriggered(true);
    stopAllAudio();
    setLanguage(newLanguage);
  };

  const setSelectedLanguage = (language) => {
    setInStorage("hasSelectedLanguage", true);
    setUserLanguage(language);
    setLanguage(language);
    setInStorage("route", JSON.stringify(language));
    setLanguageButtonSelect(true);
  };

  return {
    userLanguage,
    setUserLanguage,
    languageButtonSelect,
    setLanguageButtonSelect,
    handleLanguageChange,
    setSelectedLanguage,
    getDefaultLanguage,
  };
};