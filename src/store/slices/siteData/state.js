import { LANGUAGE_ENUMS } from "pages/ShikshalokamVoiceChat/enum"

export const INITIAL_STATE = (set, get, store) => ({
  accessToken: null,
  chatLanguage: LANGUAGE_ENUMS.ENGLISH,
  hasSelectedLanguage: false,
  previousUrl: null,
  ssoRerouteURL: null,

  setAccessToken: accessToken => set({ accessToken }),

  getAccessToken: () => get().accessToken,

  setChatLanguage: chatLanguage => set({ chatLanguage }),

  getChatLanguage: () => get().chatLanguage,

  setHasSelectedLanguage: hasSelectedLanguage => set({ hasSelectedLanguage }),

  getHasSelectedLanguage: () => get().hasSelectedLanguage,

  setPreviousUrl: previousUrl => set({ previousUrl }),

  setSsoRerouteURL: ssoRerouteURL => set({ ssoRerouteURL }),

  reset: () => {
    set(store.getInitialState())
  },
})
