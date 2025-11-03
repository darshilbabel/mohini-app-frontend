import { useMemo } from "react";
import { getStorageSlice } from "services/storage_service";

/**
 * Custom hook to access a storage slice
 * @param {string} sliceName - Required. The name of the storage slice to retrieve
 * @returns {Object} The storage slice object
 */
export const useStorage = (sliceName) => {
  return useMemo(() => {
    let slice = getStorageSlice(sliceName)
    return slice
  }, [])
}