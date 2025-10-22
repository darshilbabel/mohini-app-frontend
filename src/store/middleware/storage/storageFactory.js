import { createJSONStorage } from 'zustand/middleware'

// Enum-like object for storage types
export const STORAGE_TYPES = {
    LOCAL: 'local',
    SESSION: 'session',
    NONE: 'none'
}

// Factory function to create storage configuration
export const createStorageConfig = (options = {}) => {
    const {
        name,
        storage = STORAGE_TYPES.LOCAL,
        version = 1,
        migrate,
    } = options
    
    // Select appropriate storage based on type
    const getStorage = () => {
        switch (storage) {
            case STORAGE_TYPES.LOCAL:
                return createJSONStorage(() => localStorage)
            case STORAGE_TYPES.SESSION:
                return createJSONStorage(() => sessionStorage)
            case STORAGE_TYPES.NONE:
                return null
            default:
                return localStorage
        }
    }
    
    // Return configuration object for persist middleware
    if (storage === STORAGE_TYPES.NONE) {
        return null  // No persistence
    }
    
    return {
        name,
        storage: getStorage(),
        version,
        migrate
    }
}