// utils/helpers.js
import { languageList } from "../pages/ShikshalokamVoiceChat/enum";
import { STORAGE_KEYS } from "./constants";
import { getFromStorageSlice } from "../services/storage_service";

/**
 * Get default language based on use case type
 * @param {string} usecaseType - The use case type
 * @returns {string} Default language value
 */
export const getDefaultLanguage = (usecaseType) => {
  switch (usecaseType) {
    default:
      return languageList[0].value;
  }
};

/**
 * Filter languages by use case type
 * @param {string} usecaseType - The use case type
 * @returns {Array} Filtered language list
 */
export const getFilteredLanguages = (usecaseType) => {
  return languageList.filter(
    (lang) => !lang.excludeFor.some((x) => x === usecaseType)
  );
};

/**
 * Initialize language in localStorage if not exists
 * @param {string} usecaseType - The use case type
 */
export const initializeLanguageStorage = (usecaseType) => {
  if (!localStorage.getItem(STORAGE_KEYS.LOCAL_ROUTE)) {
    localStorage.setItem(
      STORAGE_KEYS.LOCAL_ROUTE,
      JSON.stringify(getDefaultLanguage(usecaseType))
    );
  }
};

/**
 * Check if user has access token
 * @returns {boolean} Whether user has access token
 */
export const hasAccessToken = () => {
  return !!getFromStorageSlice("userPreference", "accessToken");
};

/**
 * Get logo width class based on language
 * @param {string} language - Current language
 * @returns {string} CSS class for logo width
 */
export const getLogoWidthClass = (language) => {
  return language === "en" ? "w-[140px]" : "w-[100px]";
};

/**
 * Check if language button should be visible
 * @param {*} languageButtonSelect - Language button select state
 * @returns {boolean} Whether language button should be visible
 */
export const shouldShowLanguageButton = (languageButtonSelect) => {
  return languageButtonSelect && ![null, ""].includes(languageButtonSelect);
};