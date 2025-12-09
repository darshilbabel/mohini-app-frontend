import { useChatStorage } from "./useStorage"

const useSmartChatStorage = () => {
  const chatHistory = useChatStorage()(state => state.chatHistory)
  const { setChatHistory, getChatHistory } = useChatStorage().getState()

  const removeVal = () => {
    setChatHistory([])
  }

  return [chatHistory, setChatHistory, removeVal, getChatHistory]
}

export default useSmartChatStorage
