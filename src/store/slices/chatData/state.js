export const INITIAL_STATE = (set, get, store) => ({
  showFileInput: null,
  llmError: "",
  llmErrorType: null,
  chatHistory: [],
  introMessage: null,
  flow: null,
  sessionId: null,
  isOldChatOpen: true,
  isNewChatOpen: false,
  langProgress: null,
  isChatVisible: false,
  chatbotClickedOn: null,
  showHomepage: null,
  botName: null,
  defaultBotName: null,
  selectedType: "normal",
  stateMachineLength: 0,
  projectId: null,
  taskId: null,
  chatBotClickedOn: null,
  strandStep: null,

  setShowFileInput: showFileInput => set({ showFileInput }),

  setLlmError: llmError => set({ llmError }),
  
  setLlmErrorType: llmErrorType => set({ llmErrorType }),

  setChatHistory: chatHistory => set({ chatHistory }),

  getChatHistory: () => get().chatHistory,

  setIntroMessage: introMessage => set({ introMessage }),

  getIntroMessage: () => get().introMessage,

  setFlow: flow => set({ flow }),

  getFlow: () => get().flow,

  getStrandStep: () => get().strandStep,

  setSessionId: sessionId => set({ sessionId }),

  getSessionId: () => get().sessionId,

  setIsOldChatOpen: isOldChatOpen => set({ isOldChatOpen }),

  setIsNewChatOpen: isNewChatOpen => set({ isNewChatOpen }),

  setLangProgress: langProgress => set({ langProgress }),

  getLangProgress: () => get().langProgress,

  setIsChatVisible: isChatVisible => set({ isChatVisible }),

  setChatbotClickedOn: chatbotClickedOn => set({ chatbotClickedOn }),

  setShowHomepage: showHomepage => set({ showHomepage }),

  setBotName: botName => set({ botName }),

  setDefaultBotName: defaultBotName => set({ defaultBotName }),

  setSelectedType: selectedType => set({ selectedType }),

  setStateMachineLength: stateMachineLength => set({ stateMachineLength }),

  getStateMachineLength: () => get().stateMachineLength,

  setProjectId: projectId => set({ projectId }),

  setTaskId: taskId => set({ taskId }),

  setChatBotClickedOn: chatBotClickedOn => set({ chatBotClickedOn }),

  setStrandStep: strandStep => set({ strandStep }),

  reset: () => {
    set(store.getInitialState())
  },
})
