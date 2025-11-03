export const INITIAL_STATE = (set, get) => ({
    access_token: null,
    companyName: null,
    device_id: null,
    firstName: "",
    flow: null,
    has_accepted_tnc: "ONGOING",
    ipCity: null,
    ipCountry: null,
    ipState: null,
    preferredLanguage: null,
    profileId: null,
    state: null,
    userId: null,

    setPrefferedLanguage: (preferredLanguage) => set({ preferredLanguage }),

    setFirstName: (firstName) => set({ firstName }),

    setCompanyName: (companyName) => set({ companyName }),

    setState: (state) => set({ state }),

    setAcceptedTnC: (has_accepted_tnc) => set({ has_accepted_tnc }),

    setHasAcceptedTnc: (has_accepted_tnc) => set({ has_accepted_tnc }),

    setProfileid: (profileid) => set({ profileid }),

    setAccessToken: (access_token) => set({ access_token }),

    getAccessToken: () => get().access_token,

    setCompanyName: (companyName) => set({ companyName }),
    
    setUserId: (userId) => set({ userId }),

    setDeviceId: (device_id) => set({ device_id }),

    setProfileId: (profileId) => set({ profileId }),

    setFirstName: (firstName) => set({ firstName }),

    setIpCity: (ipCity) => set({ ipCity }),

    setIpState: (ipState) => set({ ipState }),

    setIpCountry: (ipCountry) => set({ ipCountry }),

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