import { useStorage } from "./useStorage";
import { STORE_NAME_CONSTANTS } from "store/constants";

const useSmartChatStorage = () => {
  const chatHistory = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)(state => state.chatHistory);
  const setChatHistory = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)(state => state.setChatHistory);

  const removeVal = () => {
    setChatHistory([]);
  };

  return [chatHistory, setChatHistory, removeVal];
};

export default useSmartChatStorage