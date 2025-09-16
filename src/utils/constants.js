// utils/constants.js
import { sessionUsecaseType, sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";

// Flow configuration
export const FLOW_CONFIG = {
  [sessionFlowName.GuestDiscussion]: {
    buttonText: 'commonPageButtonText2',
    buttonId: 'capture-discussion',
    logo: 'https://s3.ap-south-1.amazonaws.com/static-media.gritworks.ai/fe-images/PNG/Shikshalokam/discussion_capture_logo.png',
    route: '/mohini/shikshalokam-guest-voice-chat'
  },
  [sessionFlowName.GuestMiStory]: {
    buttonText: 'commonPageButtonText1',
    buttonId: 'capture-mi-story',
    logo: 'https://s3.ap-south-1.amazonaws.com/static-media.gritworks.ai/fe-images/PNG/Shikshalokam/mi_story_capture_logo.png',
    route: '/mohini/shikshalokam-guest-mi-story'
  }
};

// PTM use cases
export const PTM_USE_CASES = [sessionUsecaseType.MEGA_PTM];

// Storage keys
export const STORAGE_KEYS = {
  LOCAL_ROUTE: 'local_route',
  ACCESS_TOKEN: 'accessToken',
  HAS_SELECTED_LANGUAGE: 'hasSelectedLanguage',
  FLOW: 'flow',
  PREVIOUS_URL: 'previousUrl',
  TEMP_CODE: 'tempCode',
  SSO_REROUTE_URL: 'ssoRerouteURL',
  ROUTE: 'route'
};

// Default values
export const DEFAULT_VALUES = {
  TEMP_CODE: 'xyz123'
};

// UI Classes
export const UI_CLASSES = {
  FLOW_SELECTED: 'bg-[#efeafe]',
  FLOW_UNSELECTED: 'bg-[#e3ecf48f]',
  BUTTON_ENABLED: 'bg-[#572E91] cursor-pointer',
  BUTTON_DISABLED: 'bg-[#8d888857] cursor-not-allowed'
};