import API_ENDPOINTS from "constants/urls";
import { apiClient } from "../client";

/**
 * Creates a new user profile
 * @param {Object} data - The data object containing user profile information
 * @param {string} data.access_token - The access token for the user
 * @returns {Promise<Object>} The created user profile data
 */
export const createUserProfileApi = async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_USER_PROFILE, data);
    return response.data;
}