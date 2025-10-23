import { create } from 'zustand'
import { createPersistentStore } from 'store/store.config'
import { STORE_NAME_CONSTANTS } from 'store/constants'
import { INITIAL_STATE } from './state';

const initialState = INITIAL_STATE;

const useUserDataLocalStore = create(
    createPersistentStore(
        STORE_NAME_CONSTANTS.USER_DATA,
        (set) => ({
            ...initialState,

            setProfileid: (profileid) => set({ profileid }),

            setAccessToken: (access_token) => set({ access_token }),
        })
    )
)

export default useUserDataLocalStore;