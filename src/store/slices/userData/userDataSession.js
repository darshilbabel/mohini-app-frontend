import { create } from 'zustand'
import { createSessionStore } from 'store/store.config'
import { STORE_NAME_CONSTANTS } from 'store/constants'
import { INITIAL_STATE } from './state';

const initialState = INITIAL_STATE;

const useUserDataSessionStore = create(
    createSessionStore(
        STORE_NAME_CONSTANTS.USER_DATA,
        (set, get) => ({
            ...initialState(set, get),

            setHasAcceptedTnc: (has_accepted_tnc) => set({ has_accepted_tnc }),

            setProfileid: (profileid) => set({ profileid }),

            getAccessToken: () => get().access_token,

            setCompanyName: (companyName) => set({ companyName }),
            
            setUserId: (userId) => set({ userId }),

            setDeviceId: (device_id) => set({ device_id }),

            setProfileId: (profileId) => set({ profileId }),

            setFirstName: (firstName) => set({ firstName }),

            setIpCity: (ipCity) => set({ ipCity }),

            setIpState: (ipState) => set({ ipState }),

            setIpCountry: (ipCountry) => set({ ipCountry }),
        })
    )
)

export default useUserDataSessionStore;