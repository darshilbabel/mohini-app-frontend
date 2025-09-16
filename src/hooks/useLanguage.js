import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { languageList } from "../pages/ShikshalokamVoiceChat/enum";
import { setLanguage } from "../i18n";
import { getFromStorage, setInStorage } from "../services/storage_service";

// Get default language based on usecase type
function getDefaultLanguage(usecaseType) {
  switch (usecaseType) {
    default:
      return languageList[0].value;
  }
}

export const useLanguage = (usecaseType) => {
  const location = useLocation();
  
  // Parse URL params
  const urlParams = new URLSearchParams(location.search);
  const urlLanguage = urlParams.get('language');
  
  const defaultLanguage = urlLanguage ||
    getFromStorage("local_route", true, "localStorage") ||
    getDefaultLanguage(usecaseType);
  
  const [userLanguage, setUserLanguage] = useState(defaultLanguage);
  const [languageButtonSelect, setLanguageButtonSelect] = useState(
    urlLanguage ? true : (getFromStorage("hasSelectedLanguage") || null)
  );

  // Auto-apply URL language on mount
  useEffect(() => {
    if (urlLanguage) {
      setInStorage("hasSelectedLanguage", true);
      setLanguage(urlLanguage);
      localStorage.setItem("local_route", JSON.stringify(urlLanguage));
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
    localStorage.setItem("local_route", JSON.stringify(newLanguage));
  };

  const setSelectedLanguage = (language) => {
    setInStorage("hasSelectedLanguage", true);
    setUserLanguage(language);
    setLanguage(language);
    localStorage.setItem("local_route", JSON.stringify(language));
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