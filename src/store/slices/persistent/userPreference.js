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
    device_id: null,
    company: null,
    accessToken: null,
    has_accepted_tnc: null,
    ip_city: null,
    ip_state: null,
    ip_country: null,
    sessionid: null,
    profileid: null,
    chatLanguage: null,
    isNewChatOpen: false,
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

            setDeviceId: (device_id) => set({ device_id }),

            setCompany: (company) => set({ company }),

            setAccessToken: (accessToken) => set({ accessToken }),

            setHasAcceptedTnc: (has_accepted_tnc) => set({ has_accepted_tnc }),

            setIpCity: (ip_city) => set({ ip_city }),

            setIpState: (ip_state) => set({ ip_state }),

            setIpCountry: (ip_country) => set({ ip_country }),

            setSessionid: (sessionid) => set({ sessionid }),

            setProfileid: (profileid) => set({ profileid }),

            setChatLanguage: (chatLanguage) => set({ chatLanguage }),

            setIsNewChatOpen: (isNewChatOpen) => set({ isNewChatOpen }),
        })
    )
)

export default useUserPreferenceStore