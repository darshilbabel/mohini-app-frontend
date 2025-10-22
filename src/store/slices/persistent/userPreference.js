import { create } from 'zustand'
import { createPersistentStore } from 'store/store.config'
import { STORE_NAME_CONSTANTS } from 'store/constants'
import { LANGUAGE_ENUMS } from "pages/ShikshalokamVoiceChat/enum";

const initialState = {
    route: null,
    local_route: LANGUAGE_ENUMS.ENGLISH,
    flow: null,
    projectId: null,
    hasSelectedLanguage: false,
    previousUrl: null,
    tempCode: null,
}

const useUserPreferenceStore = create(
    createPersistentStore(
        STORE_NAME_CONSTANTS.USER_PREFERENCE,
        (set) => ({
            // State
            ...initialState,
            
            // Actions
            setRoute: (route) => set({ route }),

            setLocalRoute: (local_route) => set({ local_route }),

            setFlow: (flow) => set({ flow }),
            
            setProjectId: (projectId) => set({ projectId }),

            setHasSelectedLanguage: (hasSelectedLanguage) => set({ hasSelectedLanguage }),

            setPreviousUrl: (previousUrl) => set({ previousUrl }),

            setTempCode: (tempCode) => set({ tempCode }),
        })
    )
)

export default useUserPreferenceStore