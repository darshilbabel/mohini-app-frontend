import { devtools, subscribeWithSelector, persist } from 'zustand/middleware'
import { createStorageConfig, STORAGE_TYPES } from './middleware/storage/storageFactory'

// Configuration for stores with localStorage
export const createPersistentStore = (name, storeCreator, options = {}) => {
    const storageConfig = createStorageConfig({
        name,
        storage: STORAGE_TYPES.LOCAL,
        ...options
    })
    
    return devtools(
        persist(
            subscribeWithSelector(storeCreator),
            storageConfig
        ),
        { name }
    )
}

// Configuration for stores with sessionStorage
export const createSessionStore = (name, storeCreator, options = {}) => {
    const storageConfig = createStorageConfig({
        name,
        storage: STORAGE_TYPES.SESSION,
        ...options
    })
    
    return devtools(
        persist(
            subscribeWithSelector(storeCreator),
            storageConfig
        ),
        { name }
    )
}

// Configuration for stores without persistence
export const createMemoryStore = (name, storeCreator) => {
    return devtools(
        subscribeWithSelector(storeCreator),
        { name }
    )
}