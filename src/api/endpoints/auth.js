import { apiClient } from "../client"
import { API_ENDPOINTS } from "constants/urls"
import useUserDataLocalStore from "store/slices/userData/userDataLocal"

/**
 * Login API endpoint
 * @param {Object} data - Login credentials
 * @param {string} data.email - User email address
 * @param {string} data.password - User password
 * @returns {Promise<Object>} Response data containing access token and user information
 */
export const loginApi = async data => {
  const response = await apiClient.post(API_ENDPOINTS.LOGIN, data)
  return response.data
}

export const logoutApi = async () => {
  const accessToken = useUserDataLocalStore.getState().getAccessToken()
  const headers = {}

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  const response = await apiClient.post(API_ENDPOINTS.LOGOUT, {}, headers)
  return response.data
}
