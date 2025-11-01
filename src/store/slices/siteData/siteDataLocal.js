import { create } from 'zustand'
import { createPersistentStore } from 'store/store.config'
import { STORE_NAME_CONSTANTS } from 'store/constants'
import { INITIAL_STATE } from './state';

const initialState = INITIAL_STATE;

const useSiteDataLocalStore = create(
    createPersistentStore(
        STORE_NAME_CONSTANTS.SITE_DATA,
        (set, get) => ({
            ...initialState,

            setAccessToken: (accessToken) => set({ accessToken }),

            getAccessToken: () => get().accessToken,

            setChatLanguage: (chatLanguage) => set({ chatLanguage }),

            getChatLanguage: () => get().chatLanguage,

            setHasSelectedLanguage: (hasSelectedLanguage) => set({ hasSelectedLanguage }),

            getHasSelectedLanguage: () => get().hasSelectedLanguage,
        })
    )
)

export default useSiteDataLocalStore;