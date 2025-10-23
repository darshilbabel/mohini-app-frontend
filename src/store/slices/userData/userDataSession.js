import { create } from 'zustand'
import { createSessionStore } from 'store/store.config'
import { STORE_NAME_CONSTANTS } from 'store/constants'
import { INITIAL_STATE } from './state';

const initialState = INITIAL_STATE;

const useUserDataSessionStore = create(
    createSessionStore(
        STORE_NAME_CONSTANTS.USER_DATA,
        (set) => ({
            ...initialState,

            setHasAcceptedTnc: (has_accepted_tnc) => set({ has_accepted_tnc }),

            setProfileid: (profileid) => set({ profileid }),
        })
    )
)

export default useUserDataSessionStore;