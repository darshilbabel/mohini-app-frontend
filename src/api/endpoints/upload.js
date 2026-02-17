import { API_ENDPOINTS } from "constants/urls"
import { apiClient } from "../client"

/**
 * Get presigned URL for S3 upload
 * @param {Object} data - The upload configuration
 * @param {string} data.fileName - The name of the file to upload
 * @param {string} data.fileType - The MIME type of the file
 * @param {string} data.storyId - The story ID associated with the upload
 * @param {string} data.folder_structure - The folder structure in S3
 * @returns {Promise<Object>} Object containing uploadUrl and s3Url
 */
export const getPresignedUrlApi = async data => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.GET_PRESIGNED_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error getting presigned URL:", error)
    throw error
  }
}

/**
 * Upload file to S3 using presigned URL
 * @param {string} uploadUrl - The presigned URL for upload
 * @param {File} file - The file to upload
 * @returns {Promise<Response>} The fetch response
 */
export const uploadToS3Api = async (uploadUrl, file) => {
  try {
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    })
    return uploadResponse
  } catch (error) {
    console.error("Error uploading to S3:", error)
    throw error
  }
}
