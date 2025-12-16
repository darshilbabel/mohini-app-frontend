// utils/helpers.js
import { languageList } from "../pages/ShikshalokamVoiceChat/enum"
import { STORAGE_KEYS } from "./constants"
import { sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum"
import { bot_websocket } from "configure"
import env from "./env"

/**
 * Get default language based on use case type
 * @param {string} usecaseType - The use case type
 * @returns {string} Default language value
 */
export const getDefaultLanguage = usecaseType => {
  switch (usecaseType) {
    default:
      return languageList[0].value
  }
}

/**
 * Filter languages by use case type
 * @param {string} usecaseType - The use case type
 * @returns {Array} Filtered language list
 */
export const getFilteredLanguages = usecaseType => {
  return languageList.filter(lang => !lang.excludeFor.some(x => x === usecaseType))
}

/**
 * Initialize language in localStorage if not exists
 * @param {string} usecaseType - The use case type
 */
export const initializeLanguageStorage = usecaseType => {
  if (!localStorage.getItem(STORAGE_KEYS.LOCAL_ROUTE)) {
    localStorage.setItem(STORAGE_KEYS.LOCAL_ROUTE, JSON.stringify(getDefaultLanguage(usecaseType)))
  }
}

/**
 * Get logo width class based on language
 * @param {string} language - Current language
 * @returns {string} CSS class for logo width
 */
export const getLogoWidthClass = language => {
  return language === "en" ? "w-[140px]" : "w-[100px]"
}

/**
 * Check if language button should be visible
 * @param {*} languageButtonSelect - Language button select state
 * @returns {boolean} Whether language button should be visible
 */
export const shouldShowLanguageButton = languageButtonSelect => {
  return languageButtonSelect && ![null, ""].includes(languageButtonSelect)
}

export function buildWebSocketUrl({ searchParams, storageFlow, selectedType }) {
  // Handle SSO code path
  if (searchParams.get("code")) {
    // NOTE: revert this code after testing
    // return `${wssProtocol}${window.location.host}/ws/chat/company/`;
    return `${env.WS_PROTOCOL()}://${env.WEBSOCKET_HOST()}/ws/chat/company/`
  }

  const baseUrl = `${env.WS_PROTOCOL()}://${env.WEBSOCKET_HOST()}`
  const currentFlow = storageFlow

  // Direct flow to websocket mapping
  const websocketConfig = {
    [sessionFlowName.GuestDiscussion]: bot_websocket.shikshalokam_chaupal,
    [sessionFlowName.LoginDiscussion]: bot_websocket.shikshalokam_chaupal,
    [sessionFlowName.ListeningActivity]: bot_websocket.listening_activity,
    [sessionFlowName.ParentPerceptionSurvey]: bot_websocket.parent_perception_survey,
  }

  // Type-based flow to websocket mapping
  const normalTypeConfig = {
    normal: {
      [sessionFlowName.LoginMiStory]: bot_websocket.normal,
      [sessionFlowName.GuestMiStory]: bot_websocket.guest_normal,
    },
    oneshot: {
      [sessionFlowName.LoginMiStory]: bot_websocket.oneshot,
      [sessionFlowName.GuestMiStory]: bot_websocket.guest_oneshot,
    },
  }

  // Check direct flow mapping first
  if (websocketConfig[currentFlow]) {
    return `${baseUrl}${websocketConfig[currentFlow]}`
  }

  // Check type-based mapping
  const selectedTypeConfig = normalTypeConfig[selectedType]
  if (selectedTypeConfig && selectedTypeConfig[currentFlow]) {
    return `${baseUrl}${selectedTypeConfig[currentFlow]}`
  }

  return null
}
