import { useLocalStorage, useSessionStorage } from "react-use";
import { sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";

const useSmartChatStorage = () => {
  const flow = sessionStorage.getItem('flow') || localStorage.getItem('flow');
  const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory];
  const isTemporary = flow && sessionFlows.includes(flow);

  const [sessionValue, setSessionValue] = useSessionStorage("chat-history", []);
  const [localValue, setLocalValue, removeLocalValue] = useLocalStorage("chat-history", []);

  const removeVal = () => {
    if (isTemporary) {
      sessionStorage.removeItem("chat-history");
      setSessionValue([]); // Update state after removing
    } else {
      localStorage.removeItem("chat-history");
      setLocalValue([]); // Update state after removing
    }
  };

  if (isTemporary) {
    return [sessionValue, setSessionValue, removeVal];
  } else {
    return [localValue, setLocalValue, removeVal];
  }
};

export default useSmartChatStorage