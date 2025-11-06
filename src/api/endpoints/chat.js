import { API_ENDPOINTS } from "constants/urls"
import { apiClient } from "../client"

/**
 * Generate a new session
 * @returns {Promise<Object>} The generated session data including sessionid
 */
export const getSessionDetailsApi = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.GENERATE_SESSION, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    return response.data
  } catch (error) {
    return error?.response?.data
  }
}

/**
 * Retrieves chat session data based on sessionId or projectId
 * @param {Object} data - The data object containing session identifiers
 * @param {string} [data.sessionId] - Optional session ID to filter by
 * @param {string} [data.projectId] - Optional project ID to filter by
 * @param {string} [data.profile] - Optional profile ID to filter by
 * @param {string} [data.flow] - Optional flow to filter by
 * @returns {Promise<Object>} The chat session data
 */
export const getChatSessionApi = async data => {
  const { sessionId, projectId, profile, flow } = data
  let params = {}

  if (sessionId) {
    params = { ...params, sessionId }
  }

  if (projectId) {
    params = { projectId }
  }

  if (profile) {
    params = { ...params, profile }
  }

  if (flow) {
    params = { ...params, flow }
  }

  const response = await apiClient.get(API_ENDPOINTS.GET_CHAT_SESSION, {
    params,
  })
  return response
}

export const getCompanyBotApi = async data => {
  const response = await apiClient.get(API_ENDPOINTS.GET_COMPANY_BOT, {
    params: data,
  })
  return response.data
}

export const getStoryBySessionAPI = async sessionID => {
  const res = await apiClient.get(API_ENDPOINTS.GET_STORY, {
    params: {
      session: sessionID,
    },
  })
  return res?.data?.results
}
