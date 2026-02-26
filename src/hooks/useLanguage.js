import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { setLanguage } from "i18n"
import { useSiteStorage } from "hooks/useStorage"
import { STORE_NAME_CONSTANTS } from "store/constants"
import { useSiteDataSessionStore } from "store"
import { useSearchParams } from "react-router-dom"

// Get default language based on usecase type
export const useLanguage = () => {
  // Parse URL params
  // const { language: urlLanguage } = useParams()
  const [searchParams] = useSearchParams()

  const setChatLanguage = useSiteDataSessionStore(state => state.setChatLanguage)
  const hasSelectedLanguage = useSiteDataSessionStore(state => state.hasSelectedLanguage)
  const setHasSelectedLanguage = useSiteDataSessionStore(state => state.setHasSelectedLanguage)

  // TODO: Can be deprecated
  /**
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [languageButtonSelect, setLanguageButtonSelect] = useState(false)

  useEffect(() => {
    const urlLanguage = searchParams.get("language")
    if (urlLanguage) {
      setLanguageButtonSelect(false)
    } else if (hasSelectedLanguage) {
      setLanguageButtonSelect(true)
    }
  }, [searchParams, hasSelectedLanguage])

  // Auto-apply URL language on mount
  useEffect(() => {
    const urlLanguage = searchParams.get("language")
    if (urlLanguage) {
      setHasSelectedLanguage(true)
      setLanguage(urlLanguage)
      setChatLanguage(urlLanguage)
      setLanguageButtonSelect(false)
    }
  }, [searchParams])

  const handleLanguageChange = (newLanguage, audioRef, stopAllAudio, setStopAudioTriggered) => {
    audioRef.current = null
    setStopAudioTriggered(true)
    stopAllAudio()
    setLanguage(newLanguage)
  }

  return {
    languageButtonSelect,
    handleLanguageChange,
  }
}
