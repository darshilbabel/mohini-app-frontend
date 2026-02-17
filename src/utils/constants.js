// utils/constants.js
import { sessionFlowName } from "../constants/session"
import { SESSION_USECASE_TYPE } from "constants/session"
import env from "./env"

export const rootPath = env.ROOT_PATH() ? `/${env.ROOT_PATH().replace(/^\/|\/$/g, "")}` : ""

// Flow configuration
export const FLOW_CONFIG = {
  [sessionFlowName.GuestDiscussion]: {
    buttonText: 'commonPageButtonText2',
    buttonId: 'capture-discussion',
    logo: 'https://s3.ap-south-1.amazonaws.com/static-media.gritworks.ai/fe-images/PNG/Shikshalokam/discussion_capture_logo.png',
    route: `${rootPath}/shikshalokam-guest-voice-chat`
  },
  [sessionFlowName.GuestMiStory]: {
    buttonText: 'commonPageButtonText1',
    buttonId: 'capture-mi-story',
    logo: 'https://s3.ap-south-1.amazonaws.com/static-media.gritworks.ai/fe-images/PNG/Shikshalokam/mi_story_capture_logo.png',
    route: `${rootPath}/shikshalokam-guest-mi-story`
  }
};

// PTM use cases
export const PTM_USE_CASES = [SESSION_USECASE_TYPE.MEGA_PTM, sessionFlowName.YLC];

// Storage keys
export const STORAGE_KEYS = {
  LOCAL_ROUTE: "local_route",
  ACCESS_TOKEN: "accessToken",
  HAS_SELECTED_LANGUAGE: "hasSelectedLanguage",
  FLOW: "flow",
  PREVIOUS_URL: "previousUrl",
  TEMP_CODE: "tempCode",
  SSO_REROUTE_URL: "ssoRerouteURL",
  ROUTE: "route",
}
