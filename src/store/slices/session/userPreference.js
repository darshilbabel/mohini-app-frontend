import { create } from 'zustand'
import { createSessionStore } from 'store/store.config'
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
    isChatVisible: false,
    lang_progress: null,
    statemachine_length: 0,
    selected_type: null,
    llmError: "",
    preferred_language: null,
    intro_message: null,
    isOldChatOpen: false,
    first_name: null,
    state: null,
    showHomepage: null,
    showFileInput: null,
    botName: null,
    defaultBotName: null,
    taskId: null,
    ssoRerouteURL: null,
    "chat-history": [],
    "chatbot_clickedOn?": null,
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

            setIsChatVisible: (isChatVisible) => set({ isChatVisible }),

            setLangProgress: (lang_progress) => set({ lang_progress }),

            setStateMachineLength: (statemachine_length) => set({ statemachine_length }),

            setSelectedType: (selected_type) => set({ selected_type }),

            setLlmError: (llmError) => set({ llmError }),

            setPreferredLanguage: (preferred_language) => set({ preferred_language }),

            setIntroMessage: (intro_message) => set({ intro_message }),

            setIsOldChatOpen: (isOldChatOpen) => set({ isOldChatOpen }),

            setFirstName: (first_name) => set({ first_name }),

            setState: (state) => set({ state }),

            setShowHomepage: (showHomepage) => set({ showHomepage }),

            setShowFileInput: (showFileInput) => set({ showFileInput }),

            setBotName: (botName) => set({ botName }),

            setDefaultBotName: (defaultBotName) => set({ defaultBotName }),

            setTaskId: (taskId) => set({ taskId }),

            setSsoRerouteURL: (ssoRerouteURL) => set({ ssoRerouteURL }),

            setChatHistory: (chatHistory) => set({ "chat-history": chatHistory }),

            setChatbotClickedOn: (chatbot_clickedOn) => set({ "chatbot_clickedOn?": chatbot_clickedOn }),
        })
    )
)

export default useUserPreferenceStore