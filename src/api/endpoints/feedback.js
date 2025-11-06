import { API_ENDPOINTS } from "constants/urls";
import { apiClient } from "../client";

/**
 * Submit feedback
 * @param {Object} body - The feedback data to submit
 * @returns {Promise<Object>} The response data from the feedback submission
 */
export const submitFeedBackApi = async (body) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.SUBMIT_FEEDBACK, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
};
