import { useMemo } from "react"
import { getStorageSlice } from "services/storage_service"
import { useChatDataLocalStore } from "store"
import { STORE_NAME_CONSTANTS } from "store/constants"

/**
 * Custom hook to access a storage slice
 * @param {string} sliceName - Required. The name of the storage slice to retrieve
 * @returns {Object} The storage slice object
 */
export const useStorage = sliceName => {
  const accessToken = useChatDataLocalStore(state => state.accessToken)

  return useMemo(() => {
    let slice = getStorageSlice(sliceName, null, accessToken)
    return slice
  }, [accessToken])
}

export const useChatStorage = () => {
  return useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)
}

export const useUserStorage = () => {
  return useStorage(STORE_NAME_CONSTANTS.USER_DATA)
}

export const useSiteStorage = () => {
  return useStorage(STORE_NAME_CONSTANTS.SITE_DATA)
}
