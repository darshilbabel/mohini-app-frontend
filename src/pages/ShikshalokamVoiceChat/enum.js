import { SESSION_USECASE_TYPE, sessionFlowName } from "constants/session"

export const modelLabel = {
  models: [
    { label: "Llama Normal", value: "llama-normal" },
    { label: "Llama Finetune", value: "llama-finetune" },
    { label: "GPT4O MINI", value: "gpt-4o-mini" },
  ],
}

// used for purpose of future flow type, not releated with session flow name
export const LANGUAGE_ENUMS = {
  ENGLISH: "en",
  HINDI: "hi",
  KANNADA: "kn",
  TELUGU: "te",
}

export const languageValueMap = {
  en: "English",
  hi: "हिंदी",
  kn: "ಕನ್ನಡ",
  te: "తెలుగు",
  or: "ଓଡ଼ିଆ",
}

export const languageList = [
  { label: "English", value: "en", excludeFor: [] },
  { label: "हिंदी", value: "hi", excludeFor: [sessionFlowName.megaPTM, SESSION_USECASE_TYPE.YLC] },
  { label: "ಕನ್ನಡ", value: "kn", excludeFor: [
      sessionFlowName.megaPTM,  SESSION_USECASE_TYPE.ListeningActivity, SESSION_USECASE_TYPE.ParentPerceptionSurvey
    ] 
  },
  { label: "తెలుగు", value: "te", excludeFor: [
      SESSION_USECASE_TYPE.ListeningActivity, SESSION_USECASE_TYPE.YLC, SESSION_USECASE_TYPE.ParentPerceptionSurvey
    ] 
  },
];

export const PTM_CONVERSATION_STATUS_TYPE = {
  COMPLETED: "COMPLETED",
  IN_PROGRESS: "IN_PROGRESS",
  STARTED: "STARTED",
  PAUSE: "PAUSE",
  RESUME: "RESUME",
}

export const TextConversionType = {
  TRANSLATE: "TRANSLATE",
  TRANSLITERATE: "TRANSLITERATE",
}
