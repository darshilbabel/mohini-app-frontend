import { STORE_NAME_CONSTANTS } from "./constants"

import useChatDataSessionStore from "./slices/chatData/chatDataSession"
import useChatDataLocalStore from "./slices/chatData/chatDataLocal"
import useSiteDataLocalStore from "./slices/siteData/siteDataLocal"
import useSiteDataSessionStore from "./slices/siteData/siteDataSession"
import useUserDataLocalStore from "./slices/userData/userDataLocal"
import useUserDataSessionStore from "./slices/userData/userDataSession"

const SLICES_STORE_MAP = {
  local: {
    [STORE_NAME_CONSTANTS.USER_DATA]: useUserDataLocalStore,
    [STORE_NAME_CONSTANTS.CHAT_DATA]: useChatDataLocalStore,
    [STORE_NAME_CONSTANTS.SITE_DATA]: useSiteDataLocalStore,
  },
  session: {
    [STORE_NAME_CONSTANTS.USER_DATA]: useUserDataSessionStore,
    [STORE_NAME_CONSTANTS.CHAT_DATA]: useChatDataSessionStore,
    [STORE_NAME_CONSTANTS.SITE_DATA]: useSiteDataSessionStore,
  },
}

export {
  useChatDataLocalStore,
  useChatDataSessionStore,
  useSiteDataLocalStore,
  useSiteDataSessionStore,
  useUserDataLocalStore,
  useUserDataSessionStore,

  // slices export
  SLICES_STORE_MAP,
}
