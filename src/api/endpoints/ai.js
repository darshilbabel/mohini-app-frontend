import { API_ENDPOINTS } from "constants/urls"
import { apiClient } from "../client"
import { bot_routes } from "../../configure"

/**
 * Get AI4Bharat audio (Text-to-Speech)
 * @param {string} text - The text to convert to speech
 * @param {string} [sourceLanguage="en"] - Source language code (e.g., "en", "hi", "te")
 * @param {string} [storedRoute=bot_routes.normal] - Bot route configuration
 * @returns {Promise<string>} The audio data
 */
export const getAI4BharatAudioApi = async (text, sourceLanguage = "en", storedRoute = bot_routes.normal) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.TEXT_TO_SPEECH, {
      text: text,
      source_language: sourceLanguage,
      route: storedRoute,
    })

    return response.data.audio
  } catch (error) {
    console.error("Error fetching AI4Bharat audio:", error)
    throw error
  }
}

/**
 * AI4Bharat Automatic Speech Recognition (ASR)
 * @param {string} base64 - Base64 encoded audio or S3 URL
 * @param {string} [sourceLanguage="en"] - Source language code
 * @param {string} [storedRoute=bot_routes.normal] - Bot route configuration
 * @returns {Promise<string>} The transcript text
 */
export const ai4BharatASRApi = async (base64, sourceLanguage = "en", storedRoute = bot_routes.normal) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ASR, {
      s3Url: base64,
      source_language: sourceLanguage,
      route: storedRoute,
    })

    return response.data.transcript
  } catch (error) {
    console.error("Error fetching AI4Bharat ASR:", error)
    return ""
  }
}

/**
 * Transliterate text from one language to another
 * @param {string} message - The message to transliterate
 * @param {string} [sourceLanguage="en"] - Source language code
 * @param {string} [targetLanguage="en"] - Target language code
 * @param {string} [storedRoute=bot_routes.shikshalokam_chaupal] - Bot route configuration
 * @param {boolean} [detect_language=false] - Whether to detect language automatically
 * @returns {Promise<string>} The transliterated text
 */
export const transliterateApiFunc = async (message, sourceLanguage = "en", targetLanguage = "en", storedRoute = bot_routes.shikshalokam_chaupal, detect_language = false) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.TEXT_TRANSLITERATE, {
      message_body: message,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      route: storedRoute,
      detect_language: detect_language,
    })

    const content = response.data?.transcript?.content
    if (Array.isArray(content)) {
      return content[0]
    } else if (typeof content === "string") {
      return content
    } else {
      console.warn("Unexpected content type:", content)
      return ""
    }
  } catch (error) {
    console.error("Error fetching Transliterate text:", error)
    return ""
  }
}

/**
 * Retrieves translated introduction message based on language and bot route
 * @param {Object} params - The parameters object
 * @param {string} params.language - The language code for translation
 * @param {string} params.company_bot__route - The company bot route identifier
 * @returns {Promise<Object>} The translated introduction message data
 */
export const getTranslatedIntroMessageApi = async params => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.BOT_VERNACULAR, {
      params: params,
    })
    return response.data?.results
  } catch (error) {
    console.error("Error fetching translated introduction message:", error)
    throw error
  }
}
