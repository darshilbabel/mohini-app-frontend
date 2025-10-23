import { create } from 'zustand'
import { createSessionStore } from 'store/store.config'
import { STORE_NAME_CONSTANTS } from 'store/constants'
import { INITIAL_STATE } from './state';

const initialState = INITIAL_STATE;

const useChatDataSessionStore = create(
    createSessionStore(
        STORE_NAME_CONSTANTS.CHAT_DATA,
        (set, get) => ({
            ...initialState,

            setShowFileInput: (showFileInput) => set({ showFileInput }),

            setLlmError: (llmError) => set({ llmError }),

            setChatHistory: (chatHistory) => set({ chatHistory }),

            setIntroMessage: (intro_message) => set({ intro_message }),

            getIntroMessage: () => get().intro_message,
        })
    )
)

export default useChatDataSessionStore;