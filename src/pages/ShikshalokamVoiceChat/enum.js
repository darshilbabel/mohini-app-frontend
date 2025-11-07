import { SESSION_USECASE_TYPE } from "constants/session";

export const modelLabel = {
  models: [
    { label: "Llama Normal", value: "llama-normal" },
    { label: "Llama Finetune", value: "llama-finetune" },
    { label: "GPT4O MINI", value: "gpt-4o-mini" },
  ],
};

// used for purpose of future flow type, not releated with session flow name
export const LANGUAGE_ENUMS = {
  ENGLISH: "en",
  HINDI: "hi",
  KANNADA: "kn",
  TELUGU: "te",
}

export const languageList = [
  { label: "English", value: "en", excludeFor: [] },
  { label: "हिंदी", value: "hi", excludeFor: [SESSION_USECASE_TYPE.MEGA_PTM, SESSION_USECASE_TYPE.YLC] },
  { label: "ಕನ್ನಡ", value: "kn", excludeFor: [SESSION_USECASE_TYPE.MEGA_PTM,  SESSION_USECASE_TYPE.ListeningActivity] },
  { label: "తెలుగు", value: "te", excludeFor: [SESSION_USECASE_TYPE.ListeningActivity, SESSION_USECASE_TYPE.YLC] },
];

export const sessionFlowName = {
  GuestDiscussion: "guest-discussion",
  LoginDiscussion: "login-discussion",
  GuestMiStory: "guest-mi-story",
  LoginMiStory: "login",
  SsoFlow: "guest-mi-story",
  Reflection: "reflection",
  megaPTM: "megaPTM",
  YLC: "YLC",
  ListeningActivity: "listening-activity",
};

export const PTM_CONVERSATION_STATUS_TYPE = {
  COMPLETED: "COMPLETED",
  IN_PROGRESS: "IN_PROGRESS",
  STARTED: "STARTED",
  PAUSE: "PAUSE",
  RESUME: "RESUME",
};

export const TextConversionType = {
  TRANSLATE: "TRANSLATE",
  TRANSLITERATE: "TRANSLITERATE"
}