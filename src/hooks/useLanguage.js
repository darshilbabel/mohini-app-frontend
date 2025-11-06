import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { setLanguage } from "i18n";
import { useSiteStorage } from "hooks/useStorage";
import { STORE_NAME_CONSTANTS } from "store/constants";

// Get default language based on usecase type
export const useLanguage = () => {
  // Parse URL params
  const { language: urlLanguage } = useParams();
  
  const setChatLanguage = useSiteStorage()((state) => state.setChatLanguage)
  const hasSelectedLanguage = useSiteStorage()((state) => state.hasSelectedLanguage)
  const { setHasSelectedLanguage } = useSiteStorage()((state) => state.setHasSelectedLanguage)

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
      setHasSelectedLanguage(true);
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