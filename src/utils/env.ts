/**
 * Environment configuration utility
 * Supports both build-time (import.meta.env, via Vite's envPrefix) and runtime (window._env_) variables
 *
 * Priority: window._env_ > import.meta.env
 */

const getEnv = (key: string, defaultValue: string = "") => {
  // Check runtime environment variables first (window._env_)
  if ((window as any)._env_ && (window as any)._env_[key] !== undefined) {
    return (window as any)._env_[key]
  }

  // Fallback to build-time environment variables (Vite exposes REACT_APP_*
  // keys here per vite.config.ts's envPrefix - there is no global `process`
  // object in Vite's browser output, unlike webpack/CRA)
  if (import.meta.env[key] !== undefined) {
    return import.meta.env[key]
  }

  // Return default value if not found
  return defaultValue
}

// Export all environment variables with their getters
export const env = {
  // API Configuration
  LOCAL_PROXY: () => getEnv("REACT_APP_LOCAL_PROXY", "http://localhost:8000"),
  WEBSOCKET_HOST: () => getEnv("REACT_APP_WEBSOCKET_HOST", "localhost:8000"),

  // Retry Configuration
  WEBSOCKET_RETRY_NUM: () => parseInt(getEnv("REACT_APP_WEBSOCKET_RETRY_NUM", "2"), 10),
  S3_UPLOAD_RETRY_NUM: () => parseInt(getEnv("REACT_APP_S3_UPLOAD_RETRY_NUM", "3"), 10),

  // Profile IDs
  MEGA_PTM_PROFILE_ID: () => getEnv("REACT_APP_MEGA_PTM_PROFILE_ID", "3"),
  YLC_PROFILE_ID: () => getEnv("REACT_APP_YLC_PROFILE_ID", "127"),

  // Paths
  AUDIO_PATH: () => getEnv("REACT_APP_ADUIO_PATH", ""),
  ROOT_PATH: () => getEnv("REACT_APP_ROOT_PATH", ""),

  // URLs
  RECORD_STORY_URL: () => getEnv("REACT_APP_RECORD_STORY_URL", ""),
  BASE_URL: () => getEnv("REACT_APP_BASE_URL", "https://shikshagraha.org"),

  // Auth
  ACCESS_TOKEN_KEY: () => getEnv("REACT_APP_ACCESS_TOKEN_KEY", ""),

  WS_PROTOCOL: () => getEnv("REACT_APP_WS_PROTOCOL", "wss"),

  AUTH_METHOD: () => getEnv("REACT_APP_AUTH_METHOD", "url"),

  AUTH_ROUTE: () => getEnv("REACT_APP_AUTH_ROUTE", "/api/shikshalokam/read-elevate-profile/"),

  // Flow Configuration
  GUEST_DISCUSSION_FLOW: () => getEnv("REACT_APP_GUEST_DISCUSSION_FLOW"),
  GUEST_MI_STORY_FLOW: () => getEnv("REACT_APP_GUEST_MI_STORY_FLOW"),

  LOCALES_DOMAIN: () => getEnv("REACT_APP_LOCALES_DOMAIN", "mitra.shikshalokam.org"),

  LOCALES_DIR_PATH: () => getEnv("REACT_APP_LOCALES_DIR_PATH", ""),

  // Generic getter for any environment variable
  get: (key: string, defaultValue: string = "") => getEnv(key, defaultValue),
}

export default env
