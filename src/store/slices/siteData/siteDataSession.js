
import { create } from 'zustand'
import { createSessionStore } from 'store/store.config'
import { STORE_NAME_CONSTANTS } from 'store/constants'
import { INITIAL_STATE } from './state';

const initialState = INITIAL_STATE;

const useSiteDataSessionStore = create(
    createSessionStore(
        STORE_NAME_CONSTANTS.SITE_DATA,
        (set, get) => ({
            ...initialState,

            setChatLanguage: (chatLanguage) => set({ chatLanguage }),

            getChatLanguage: () => get().chatLanguage,

            setHasSelectedLanguage: (hasSelectedLanguage) => set({ hasSelectedLanguage }),

            getHasSelectedLanguage: () => get().hasSelectedLanguage,

            setPreviousUrl: (previousUrl) => set({ previousUrl }),
        })
    )
)

export default useSiteDataSessionStore;