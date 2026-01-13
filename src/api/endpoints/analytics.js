import { apiClient } from "../client"

/**
 * Track resource view analytics
 * Fire-and-forget - does not block navigation and silently ignores errors
 * @param {string|number} resourceId - The ID of the resource being viewed
 */
export const trackResourceView = (resourceId) => {
  if (!resourceId) return

  // Fire-and-forget: don't await, catch errors silently
  apiClient.post(`/api/track-view/${resourceId}/`).catch(() => {
    // Silently ignore errors - analytics should not impact user experience
  })
}

/**
 * Track resource download analytics
 * Fire-and-forget - does not block download and silently ignores errors
 * @param {string|number} resourceId - The ID of the resource being downloaded
 */
export const trackResourceDownload = (resourceId) => {
  if (!resourceId) return

  // Fire-and-forget: don't await, catch errors silently
  apiClient.post(`/api/track-download/${resourceId}/`).catch(() => {
    // Silently ignore errors - analytics should not impact user experience
  })
}

/**
 * Track MIP download analytics
 * Fire-and-forget - does not block download and silently ignores errors
 * @param {string} projectId - The project ID from create-project API response
 */
export const trackSolutionDownload = (projectId) => {
  if (!projectId) return

  // Fire-and-forget: don't await, catch errors silently
  apiClient.post(`/api/track-solution-download/${projectId}/`).catch(() => {
    // Silently ignore errors - analytics should not impact user experience
  })
}
