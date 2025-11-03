export const INITIAL_STATE = (set, get) => ({
    showFileInput: null,
    llmError: "",
    chatHistory: [],
    intro_message: null,
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

    setShowFileInput: (showFileInput) => set({ showFileInput }),

    setLlmError: (llmError) => set({ llmError }),

    setChatHistory: (chatHistory) => set({ chatHistory }),

    setIntroMessage: (intro_message) => set({ intro_message }),

    getIntroMessage: () => get().intro_message,

    setFlow: (flow) => set({ flow }),

    getFlow: () => get().flow,

    setSessionId: (sessionId) => set({ sessionId }),

    getSessionId: () => get().sessionId,

    setIsOldChatOpen: (isOldChatOpen) => set({ isOldChatOpen }),
    
    setIsNewChatOpen: (isNewChatOpen) => set({ isNewChatOpen }),

    setLangProgress: (langProgress) => set({ langProgress }),

    getLangProgress: () => get().langProgress,

    setIsChatVisible: (isChatVisible) => set({ isChatVisible }),

    setChatbotClickedOn: (chatbotClickedOn) => set({ chatbotClickedOn }),

    setShowHomepage: (showHomepage) => set({ showHomepage }),

    setBotName: (botName) => set({ botName }),

    setDefaultBotName: (defaultBotName) => set({ defaultBotName }),

    setSelectedType: (selectedType) => set({ selectedType }),

    setStateMachineLength: (stateMachineLength) => set({ stateMachineLength }),

    setProjectId: (projectId) => set({ projectId }),

    setTaskId: (taskId) => set({ taskId }),

    setChatBotClickedOn: (chatBotClickedOn) => set({ chatBotClickedOn }),
})