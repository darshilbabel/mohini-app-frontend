import { apiClient } from "../client"
import { API_ENDPOINTS } from "constants/urls"

/**
 * Get location data by parent ID
 * @param {string|null} parentId - Optional parent ID to filter locations
 * @returns {Promise<Object>} The location data
 */
export const getLocationApi = async (parentId = null) => {
  let params = undefined

  if (parentId) {
    params = { parentId }
  }

  const response = await apiClient.get(API_ENDPOINTS.GET_LOCATION, { params })
  return response.data
}

/**
 * Get IP-based location data
 * @returns {Promise<Object>} The IP location data
 */
export const getIpLocationApi = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.GET_IP_LOCATION, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    return response.data
  } catch (error) {
    return error?.response?.data
  }
}
