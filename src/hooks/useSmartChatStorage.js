import { sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";
import { useUserPreferenceLocalStore, useUserPreferenceSessionStore, useChatDataSessionStore, useChatDataLocalStore } from 'store';

const useSmartChatStorage = () => {
  const { flow: flow_local } = useUserPreferenceLocalStore.getState();
  const { flow: flow_session } = useUserPreferenceSessionStore.getState();

  const flow = flow_session || flow_local;
  const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory];
  const isTemporary = flow && sessionFlows.includes(flow);

  const { chatHistory: chatHistory_session, setChatHistory: setChatHistory_session } = useChatDataSessionStore.getState();
  const { chatHistory: chatHistory_local, setChatHistory: setChatHistory_local } = useChatDataLocalStore.getState();

  const removeVal = () => {
    if (isTemporary) {
      setChatHistory_session([]); // Update state after removing
    } else {
      setChatHistory_local([]); // Update state after removing
    }
  };

  if (isTemporary) {
    return [chatHistory_session, setChatHistory_session, removeVal];
  } else {
    return [chatHistory_local, setChatHistory_local, removeVal];
  }
};

export default useSmartChatStorage