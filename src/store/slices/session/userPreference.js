import { create } from 'zustand'
import { createSessionStore } from 'store/store.config'
import { STORE_NAME_CONSTANTS } from 'store/constants'
import { LANGUAGE_ENUMS } from "pages/ShikshalokamVoiceChat/enum";

const initialState = {
    route: null,
    local_route: LANGUAGE_ENUMS.ENGLISH,
    flow: null
}

const useUserPreferenceStore = create(
    createSessionStore(
        STORE_NAME_CONSTANTS.USER_PREFERENCE,
        (set) => ({
            // State
            ...initialState,
            
            // Actions
            setRoute: (route) => set({ route }),

            setLocalRoute: (local_route) => set({ local_route }),

            setFlow: (flow) => set({ flow }),
        })
    )
)

export default useUserPreferenceStore