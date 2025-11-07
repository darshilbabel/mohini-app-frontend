import { useStorage } from "./useStorage"
import { STORE_NAME_CONSTANTS } from "store/constants"
import { useChatDataLocalStore } from "store"
import { getStorageSlice } from "services/storage_service"

/**
 * Custom hook to access chat storage
 * @param {Function} selector - Selector function to pick specific state
 * @returns {*} The selected state from chat storage
 */
const useChatRepository = selector => {
  return useStorage(STORE_NAME_CONSTANTS.CHAT_DATA, selector)
}

// Expose getState method on useChatStorage
useChatRepository.getState = () => {
  const accessToken = useChatDataLocalStore.getState().accessToken
  const store = getStorageSlice(STORE_NAME_CONSTANTS.CHAT_DATA, null, accessToken)
  return store.getState()
}

export default useChatRepository
