import API_ENDPOINTS from "constants/urls"
import { apiClient } from "../client"

/**
 * Generic authenticated request handler
 * @param {Object} params - Request parameters
 * @param {Function} params.loader - Loading state setter function
 * @param {Function} params.setter - Response data setter function
 * @param {Function} params.errorHandler - Error handler function
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Request payload data
 * @param {string} params.method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {string} params.url - API endpoint URL
 * @param {Object} params.params - Query parameters
 * @returns {Promise<void>}
 */
export async function createAuthRequest({ loader = () => {}, setter = () => {}, errorHandler = () => {}, token = "", data = {}, method = "", url = "", params = {} }) {
  try {
    if (!token && !url && !method) {
      throw new Error("Insufficient data!")
    }
    loader(true)

    const config = {
      headers: {
        Authorization: token,
      },
    }

    if (Object.keys(params).length > 0) {
      config.params = params
    }

    let response
    switch (method.toUpperCase()) {
      case "GET":
        response = await apiClient.get(url, config)
        break
      case "POST":
        response = await apiClient.post(url, data, config)
        break
      case "PUT":
        response = await apiClient.put(url, data, config)
        break
      case "PATCH":
        response = await apiClient.patch(url, data, config)
        break
      case "DELETE":
        response = await apiClient.delete(url, config)
        break
      default:
        throw new Error(`Unsupported HTTP method: ${method}`)
    }

    setter(response?.data || {})
    loader(false)
  } catch (error) {
    console.error({ error })
    errorHandler({
      response: error?.request?.response,
      status: error?.request?.status,
    })
    loader(false)
  }
}

/**
 * Get story by ID
 * @param {Object} params - Request parameters
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Data object containing story ID
 * @param {string} params.data.id - Story ID
 * @returns {Promise<Object>} Response data
 */
export const getStoryById = async ({
  token,
  data = {
    id: "",
  },
}) => {
  try {
    if (!token) {
      throw new Error("Authorization token is required!")
    }

    if (!data.id) {
      throw new Error("Story ID is required!")
    }

    const config = {
      headers: {
        Authorization: token,
      },
    }

    const response = await apiClient.get(`${API_ENDPOINTS.STORY}${data.id}/`, config)

    return response?.data || {}
  } catch (error) {
    console.error("Error fetching story by ID:", error)
    throw error
  }
}

/**
 * Get all media for a story
 * @param {Object} params - Request parameters
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Data object containing story ID
 * @param {string} params.data.story - Story ID
 * @returns {Promise<Object>} Response data
 */
export const getStoryAllMedia = async ({
  token,
  data = {
    story: "",
  },
}) => {
  try {
    if (!token) {
      throw new Error("Authorization token is required!")
    }

    const config = {
      headers: {
        Authorization: token,
      },
      params: data,
    }

    const response = await apiClient.get(API_ENDPOINTS.STORY_MEDIA, config)
    return response?.data || {}
  } catch (error) {
    console.error("Error fetching story media:", error)
    throw error
  }
}

/**
 * Create story media
 * @param {Object} params - Request parameters
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Media data
 * @param {string} params.data.story - Story ID
 * @param {string} params.data.name - Media name
 * @param {Array} params.data.file - File array
 * @param {string} params.data.file_url - File URL
 * @param {string} params.data.media_type - Media type
 * @returns {Promise<Object>} Response data
 */
export const createStoryMedia = async ({
  token,
  data = {
    story: "",
    name: "",
    file: [],
    file_url: "",
    media_type: "",
  },
}) => {
  try {
    if (!token) {
      throw new Error("Authorization token is required!")
    }

    const config = {
      headers: {
        Authorization: token,
      },
    }

    const response = await apiClient.post(API_ENDPOINTS.STORY_MEDIA, data, config)

    return response?.data || {}
  } catch (error) {
    console.error("Error creating story media:", error)
    throw error
  }
}

/**
 * Partially update story by ID
 * @param {Object} params - Request parameters
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Update data
 * @param {string} params.data.id - Story ID
 * @param {Object} params.data.formatted_content - Formatted content object
 * @param {string} params.data.access_token - Access token
 * @param {string} params.data.session - Session ID
 * @param {string} params.data.flow - Flow type
 * @param {Object} params.data.other_params - Additional parameters
 * @returns {Promise<Object>} Response data
 */
export const partialUpdateStoryById = async ({
  token,
  data = {
    id: "",
    formatted_content: "",
    access_token: "",
    session: "",
    flow: "",
    other_params: {},
  },
}) => {
  try {
    if (!token) {
      throw new Error("Authorization token is required!")
    }

    if (!data.id) {
      throw new Error("Story ID is required!")
    }

    const config = {
      headers: {
        Authorization: token,
      },
    }

    const requestData = {
      formatted_content: data?.formatted_content ? JSON.stringify(data.formatted_content) : data?.formatted_content,
      access_token: data?.access_token,
      session: data?.session,
      flow: data?.flow,
      other_params: data?.other_params,
    }

    const response = await apiClient.patch(`${API_ENDPOINTS.STORY}${data.id}/`, requestData, config)

    return response?.data || {}
  } catch (error) {
    console.error("Error updating story:", error)
    throw error
  }
}

/**
 * Update story media
 * @param {Object} params - Request parameters
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Update data
 * @param {string} params.data.story - Story ID
 * @param {string} params.data.name - Media name
 * @param {File} params.data.file - File to upload
 * @param {string} params.data.id - Media ID
 * @param {string} params.data.access_token - Access token
 * @param {string} params.data.session - Session ID
 * @param {string} params.data.flow - Flow type
 * @param {string} params.data.media_type - Media type
 * @returns {Promise<Object>} Response data
 */
export const updateStoryMedia = async ({
  token,
  data = {
    story: "",
    name: "",
    file: [],
    id: "",
    access_token: "",
    session: "",
    flow: "",
    media_type: "",
    include_in_story: false,
  },
}) => {
  try {
    if (!token) {
      throw new Error("Authorization token is required!")
    }

    if (!data.id) {
      throw new Error("Media ID is required!")
    }

    const formData = new FormData()
    formData.append("story", data.story)
    formData.append("name", data.name)
    formData.append("file", data.file)
    formData.append("media_type", data.media_type)
    formData.append("access_token", data.access_token)
    formData.append("flow", data.flow)
    formData.append("session", data.session)

    const config = {
      headers: {
        Authorization: token,
      },
    }

    const response = await apiClient.put(`${API_ENDPOINTS.STORY_MEDIA}${data.id}/`, formData, config)

    return response?.data || {}
  } catch (error) {
    console.error("Error updating story media:", error)
    throw error
  }
}
