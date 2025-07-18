export const modelLabel = {
  models: [
    { label: "Llama Normal", value: "llama-normal" },
    { label: "Llama Finetune", value: "llama-finetune" },
    { label: "GPT4O MINI", value: "gpt-4o-mini" },
  ],
};

// used for purpose of future flow type, not releated with session flow name
export const sessionUsecaseType = {
  MEGA_PTM: "MEGA_PTM",
};
export const languageList = [
  { label: "English", value: "en", excludeFor: [] },
  { label: "हिंदी", value: "hi", excludeFor: [sessionUsecaseType.MEGA_PTM] },
  { label: "ಕನ್ನಡ", value: "kn", excludeFor: [sessionUsecaseType.MEGA_PTM] },
  { label: "తెలుగు", value: "te", excludeFor: [] },
];

export const sessionFlowName = {
  GuestDiscussion: "guest-discussion",
  LoginDiscussion: "login-discussion",
  GuestMiStory: "guest-mi-story",
  LoginMiStory: "login",
  SsoFlow: "sso",
  Reflection: "reflection",
  megaPTM: "megaPTM",
};

export const PTM_CONVERSATION_STATUS_TYPE = {
  COMPLETED: "COMPLETED",
  IN_PROGRESS: "IN_PROGRESS",
  STARTED: "STARTED",
  PAUSE: "PAUSE",
  RESUME: "RESUME",
};
