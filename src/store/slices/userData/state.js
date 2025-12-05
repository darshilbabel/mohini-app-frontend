export const INITIAL_STATE = (set, get, store) => ({
  access_token: null,
  companyName: null,
  device_id: null,
  firstName: "",
  flow: null,
  has_accepted_tnc: "ONGOING",
  ipCity: null,
  ipCountry: null,
  ipZipCode: null,
  ipState: null,
  ipFetched: false,
  preferredLanguage: null,
  profileId: null,
  state: null,
  userId: null,

  setIpZipCode: ipZipCode => set({ ipZipCode }),

  setIpFetched: ipFetched => set({ ipFetched }),

  setPrefferedLanguage: preferredLanguage => set({ preferredLanguage }),

  setFirstName: firstName => set({ firstName }),

  setCompanyName: companyName => set({ companyName }),

  setState: state => set({ state }),

  setAcceptedTnC: has_accepted_tnc => set({ has_accepted_tnc }),

  setHasAcceptedTnc: has_accepted_tnc => set({ has_accepted_tnc }),

  setAccessToken: access_token => set({ access_token }),

  getAccessToken: () => get().access_token,

  setUserId: userId => set({ userId }),

  setDeviceId: device_id => set({ device_id }),

  setProfileId: profileId => set({ profileId }),

  setIpCity: ipCity => set({ ipCity }),

  setIpState: ipState => set({ ipState }),

  setIpCountry: ipCountry => set({ ipCountry }),

  reset: () => {
    console.log(store.getInitialState(), "initial_state")
    set(store.getInitialState())
  },
})
