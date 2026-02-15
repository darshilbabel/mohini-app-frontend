import { SLICES_STORE_MAP } from "../store"
import axiosInstance from "../utils/axios"
import { useChatDataLocalStore, useChatDataSessionStore, useSiteDataLocalStore, useSiteDataSessionStore, useUserDataLocalStore, useUserDataSessionStore } from "../store"
import env from "../utils/env"

/**
 * Gets a storage slice (Zustand store) based on the slice name and storage type
 * @param {string} sliceName - The name of the storage slice to retrieve (e.g., 'siteData', 'userPreference')
 * @param {string|null} storageType - The type of storage ('sessionStorage' or 'localStorage'), or null for auto-detection based on accessToken
 * @returns {Object} The Zustand store instance for the specified slice
 * @description
 * This function dynamically loads and returns a Zustand store slice. It determines whether to use
 * the Local or Session variant of the store based on:
 * - If storageType is provided: uses the specified storage type
 * - If storageType is null: checks for accessToken - uses Local storage if token exists, Session storage otherwise
 * The function constructs the module path as: store/slices/{sliceName}/{sliceName}{Local|Session}.js
 */
export const getStorageSlice = (sliceName, storageType = null, accessToken = undefined) => {
  const LOCAL_STORAGE_SLICES = "local"
  const SESSION_STORAGE_SLICES = "session"

  let storage = null

  if (typeof storageType == "string" && storageType !== "") {
    storage = storageType === "sessionStorage" ? SESSION_STORAGE_SLICES : LOCAL_STORAGE_SLICES
  } else {
    storage = accessToken ? LOCAL_STORAGE_SLICES : SESSION_STORAGE_SLICES
  }

  const slice = SLICES_STORE_MAP[storage][sliceName]
  return slice
}

// Helper for exponential backoff with jitter
// This function calculates a delay time for retries using exponential backoff strategy.
// The delay increases exponentially with each attempt (baseDelay * 2^attempt),
// and a random jitter (up to 1000ms) is added to help avoid retry storms when many clients retry at once.
// The delay is capped at maxDelay milliseconds.
function exponentialBackoff(attempt, baseDelay = 1000, maxDelay = 30000) {
  const expDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  const jitter = Math.random() * 1000
  return expDelay + jitter
}

// S3 upload with exponential backoff and retry logic
// This function uploads a file to S3 using a presigned URL, with retry logic for handling rate limiting (SlowDown) and network errors.
// On each failure, it waits for an exponentially increasing delay (with jitter) before retrying, up to maxRetries times.
// If the upload is successful, it returns the S3 URL. If all retries fail, it returns an empty string.
export const handleS3Upload = async (file, fileName, folderStructure, storyData, maxRetries = env.S3_UPLOAD_RETRY_NUM()) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get a new presigned URL for each attempt
      const res = await axiosInstance.post("api/get-presigned-url/", {
        fileName: fileName,
        fileType: file.type,
        storyId: storyData?.id,
        folder_structure: folderStructure,
      })

      const { uploadUrl, s3Url } = res.data

      // Attempt to upload the file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      // If upload is successful, return the S3 URL
      if (uploadResponse.ok) {
        return s3Url
      }

      // Handle S3 rate limiting (SlowDown)
      if (uploadResponse.status === 503) {
        const errorText = await uploadResponse.text()
        if (errorText.includes("SlowDown")) {
          if (attempt < maxRetries - 1) {
            const delay = exponentialBackoff(attempt)
            console.warn(`S3 rate limited (SlowDown), retrying in ${delay}ms... [attempt ${attempt + 1}]`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }
      }

      // Throw error for other failed uploads
      throw new Error(`Upload failed: ${uploadResponse.status}`)
    } catch (error) {
      // Retry on network errors or explicit SlowDown
      if (attempt < maxRetries - 1 && (error.message?.includes("SlowDown") || error.message === "Failed to fetch")) {
        const delay = exponentialBackoff(attempt)
        console.warn(`Upload error, retrying in ${delay}ms... [attempt ${attempt + 1}]`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      // Log error and return empty string if all retries fail
      console.error("Error uploading to S3:", error)
      if (attempt === maxRetries - 1) return ""
    }
  }
  return ""
}

export function clearFromStorage() {
  try {
    console.log("clearing storage")
    useChatDataLocalStore.setState(useChatDataLocalStore.getInitialState(), true)
    useChatDataSessionStore.setState(useChatDataSessionStore.getInitialState(), true)

    useSiteDataLocalStore.setState(useSiteDataLocalStore.getInitialState(), true)
    useSiteDataSessionStore.setState(useSiteDataSessionStore.getInitialState(), true)

    useUserDataLocalStore.setState(useUserDataLocalStore.getInitialState(), true)
    useUserDataSessionStore.setState(useUserDataSessionStore.getInitialState(), true)
  } catch (error) {
    console.error("Error while clearing: ", error)
  }
}
