import { API_ENDPOINTS } from "constants/urls"
import { apiClient } from "../client"

/**
 * Update reflection/project status
 * @param {string} projectId - The project ID to update
 * @param {string} [status="completed"] - The status to set (e.g., "completed", "in_progress")
 * @param {string|null} [flow=null] - Optional flow name, will be fetched from storage if not provided
 * @param {string|null} [accessToken=null] - Optional access token, will be fetched from storage if not provided
 * @returns {Promise<Object>} The response from the status update
 */
export const updateReflectionStatusApi = async (projectId, status = "completed", flow = null, accessToken = null) => {
  try {
    // Get flow from storage if not provided
    const response = await apiClient.post(API_ENDPOINTS.UPDATE_PROJECT_STATUS, {
      access_token: accessToken,
      project_id: projectId,
      flow: flow,
      status: status,
    })

    return response
  } catch (error) {
    console.error(error)
    return { error: "Error updating reflection status." }
  }
}
