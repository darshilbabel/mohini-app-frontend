import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { setLanguage } from "../i18n";
import { getFromStorage, setInStorage } from "../services/storage_service";
import useSiteDataLocalStore from "store/slices/siteData/siteDataLocal";

// Get default language based on usecase type
export const useLanguage = (usecaseType) => {
  const location = useLocation();
  
  // Parse URL params
  // const urlParams = new URLSearchParams(location.search);
  // const urlLanguage = urlParams.get('language');
  const { language: urlLanguage } = useParams();
  
  // const defaultLanguage = urlLanguage ||
  //   useUserStore.getState().local_route ||
  //   getDefaultLanguage(usecaseType);

  const chatLanguage = useSiteDataLocalStore((state) => state.chatLanguage)
  const setChatLanguage = useSiteDataLocalStore((state) => state.setChatLanguage)
  const hasSelectedLanguage = useSiteDataLocalStore((state) => state.hasSelectedLanguage)

  /**
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [languageButtonSelect, setLanguageButtonSelect] = useState(false);

  useEffect(() => {
    if (urlLanguage) {
      setLanguageButtonSelect(false);
    }
    else if(hasSelectedLanguage) {
      setLanguageButtonSelect(true);
    }
  }, [urlLanguage, hasSelectedLanguage]);

  // Auto-apply URL language on mount
  useEffect(() => {
    if (urlLanguage) {
      setInStorage("hasSelectedLanguage", true);
      setLanguage(urlLanguage);
      setChatLanguage(urlLanguage);
      setInStorage("route", JSON.stringify(urlLanguage));
      setLanguageButtonSelect(true);
    }
  }, [urlLanguage]);

  const handleLanguageChange = (newLanguage, audioRef, stopAllAudio, setStopAudioTriggered) => {
    audioRef.current = null;
    setChatLanguage(newLanguage);
    setStopAudioTriggered(true);
    stopAllAudio();
    setLanguage(newLanguage);
  };

  const setSelectedLanguage = (language) => {
    // setInStorage("hasSelectedLanguage", true);
    setChatLanguage(language);
    // setLanguage(language);
    // setInStorage("route", JSON.stringify(language));
    setLanguageButtonSelect(true);
  };

  return {
    userLanguage: chatLanguage,
    setUserLanguage: setChatLanguage,
    languageButtonSelect,
    setLanguageButtonSelect,
    handleLanguageChange,
    setSelectedLanguage,
  };
};