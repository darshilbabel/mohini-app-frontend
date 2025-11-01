import { useMemo } from "react";
import { getStorageSlice } from "services/storage_service";

export const useStorage = (sliceName) => {
  return useMemo(() => {
    let slice = getStorageSlice(sliceName)
    return slice
  }, [])
}