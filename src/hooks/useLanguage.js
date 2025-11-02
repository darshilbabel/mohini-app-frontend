import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { setLanguage } from "i18n";
import { setInStorage } from "services/storage_service";
import { useStorage } from "hooks/useStorage";
import { STORE_NAME_CONSTANTS } from "store/constants";

// Get default language based on usecase type
export const useLanguage = () => {
  // Parse URL params
  const { language: urlLanguage } = useParams();
  
  const setChatLanguage = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.setChatLanguage)
  const hasSelectedLanguage = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.hasSelectedLanguage)

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
      setLanguageButtonSelect(true);
    }
  }, [urlLanguage]);

  const handleLanguageChange = (newLanguage, audioRef, stopAllAudio, setStopAudioTriggered) => {
    audioRef.current = null;
    setStopAudioTriggered(true);
    stopAllAudio();
    setLanguage(newLanguage);
  };

  return {
    languageButtonSelect,
    handleLanguageChange,
  };
};