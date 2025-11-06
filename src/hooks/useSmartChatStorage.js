import { useChatStorage } from "./useStorage";
import { STORE_NAME_CONSTANTS } from "store/constants";

const useSmartChatStorage = () => {
  const chatHistory = useChatStorage()(state => state.chatHistory);
  const setChatHistory = useChatStorage()(state => state.setChatHistory);

  const removeVal = () => {
    setChatHistory([]);
  };

  return [chatHistory, setChatHistory, removeVal];
};

export default useSmartChatStorage