import { buildWebSocketUrl } from 'utils/helpers';
import { clearMitraSessionStorage } from "../MainPage"
import { CONVERSATION_USER_TYPES } from '../../../constants/mitra.constants';
import { getBotConfigForFlow } from '../../../utils/common_flow';
import { getNewSessionID } from '../../../../../api/endpoints';
import { getTranslatedIntroMessageApi } from '../../../../../api/endpoints/ai';
import { ToastContainer } from "react-toastify";
import { useAICreationSessionStore } from 'store';
import { useChatWebhook } from 'hooks/useChatWebhook';
import { useConfirmationPopup } from "../../../../../hooks/useConfirmationPopup"
import { useNavigate, useSearchParams } from 'react-router-dom';
import BotMessage from './components/chat-message/BotMessage';
import ChatBox from './components/ChatBox';
import ChatWindow from './components/ChatWindow';
import LoadingChat from './components/LoadingChat';
import env from "../../../../../utils/env";
import React, { useCallback, useEffect, useRef, useState } from 'react';

const { USER } = CONVERSATION_USER_TYPES;

const CommonFlow = ({ flowType, handleScrollIntoView }) => {
  const textInputRef = useRef(null);
  const hasConnectedRef = useRef(false);
  const pendingMessageRef = useRef(null);
  const timeoutRef = useRef([]);
  const [textMessage, setTextMessage] = useState('');
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [introMessage, setIntroMessage] = useState(null);
  const [isLoadingIntro, setIsLoadingIntro] = useState(true);
  const { commonsNetworkReconnectionPopup } = useConfirmationPopup()
  const navigate = useNavigate()

  const handleScrollIntoViewRef = useRef(handleScrollIntoView);
  

  useEffect(() => {
    handleScrollIntoViewRef.current = handleScrollIntoView;
  }, [handleScrollIntoView]);

  const localChatHistory = useAICreationSessionStore.getState().getCommonFlowChatHistory();

  const [commonFlowChatHistory, setCommonFlowChatHistory] = useState(
    localChatHistory?.length ? localChatHistory : []
  );

  const { profileId, getInitialSwitchChatHistory, getCommonFlowChatHistory, setCommonFlowChatHistory: setCommonFlowChatHistoryStore } = useAICreationSessionStore.getState();

  const [searchParams] = useSearchParams();
  const accessToken = sessionStorage.getItem('accToken');

  const storageFlow = getBotConfigForFlow(flowType).flow_name;
  const botRoute = getBotConfigForFlow(flowType).route;

  const generateNewSession = async () => {
    try {
      const newSession = await getNewSessionID();
      if (newSession) {
        useAICreationSessionStore.getState().setSession(newSession);
      }
    } catch (e) {
      console.error("Failed to refresh session for LCF", e);
    } 
  }

  useEffect(() => {
    const fetchIntroMessage = async () => {
      try {
        setIsLoadingIntro(true);
        const response = await getTranslatedIntroMessageApi({
          language: 'en',
          company_bot__route: botRoute,
        });
        const message = response?.[0]?.alt_introductory_message;
        if(message) {
          generateNewSession();
        }
        setIntroMessage(message);
        useAICreationSessionStore.getState().setCommonFlowIntroMessage(message);
      } catch (error) {
        console.error('Error fetching intro message:', error);
      } finally {
        setIsLoadingIntro(false);
      }
    };

    const storedIntroMessage = useAICreationSessionStore.getState().getCommonFlowIntroMessage();
    if (storedIntroMessage) {
      setIntroMessage(storedIntroMessage);
      setIsLoadingIntro(false);
    } else {
      fetchIntroMessage();
    }
  }, [flowType]);

  const onFinalReconnectAttempt = useCallback(() => {
    function onYesButtonClick() {
      try {
        let chat_history = getCommonFlowChatHistory(); 

        if (Array.isArray(chat_history) && chat_history.length) {
          const lastIndex = chat_history.length - 1;

          chat_history = chat_history.filter((_, index) => {
            if (index !== lastIndex) return true;
            return chat_history[index]?.source !== "user";
          });
        }

        setCommonFlowChatHistoryStore(chat_history);

        window.location.reload();
      } catch (error) {
        console.error("Error cleaning chat history before reload:", error);
        window.location.reload();
      }
    }

    function onNoButtonClick() {
      clearMitraSessionStorage()
      navigate("/")
      window.location.reload();
    }

    commonsNetworkReconnectionPopup(onYesButtonClick, onNoButtonClick);
  }, []);

  const onWebSocketOpen = useCallback(() => {
    const currentSessionId = useAICreationSessionStore.getState().getSession();
    sendSocketMessage({
      type: 'authenticate',
      sessionid: currentSessionId,
      profileid: profileId,
      access_token: accessToken,
      route: 'en',
      bot_route: botRoute,
      flow_name: storageFlow,
    });

    const initial_switch_chat_history = getInitialSwitchChatHistory();
    const common_flow_chat_history = getCommonFlowChatHistory();

    if (!introMessage && Array.isArray(initial_switch_chat_history) && initial_switch_chat_history.length && initial_switch_chat_history[initial_switch_chat_history.length - 1]?.source === USER && Array.isArray(common_flow_chat_history) && !common_flow_chat_history.length) {
      const timeout_obj = setTimeout(() => {
        sendSocketMessage({
          text: initial_switch_chat_history[initial_switch_chat_history.length - 1]?.msg,
          context: '',
        });
      }, 100);
      timeoutRef.current.push(timeout_obj);
    }

    if (!introMessage && pendingMessageRef.current) {
      const timeout_obj = setTimeout(() => {
        sendSocketMessage({
          text: pendingMessageRef.current,
          context: '',
        });
        pendingMessageRef.current = null;
      }, 100);
      timeoutRef.current.push(timeout_obj);
    }

  }, [profileId, accessToken, botRoute, storageFlow, introMessage]);

  const onWebSocketMessage = useCallback(
    (event) => {
      const data = JSON.parse(event.data);
      const message = data?.text;

      if (message?.source === 'bot') {
        setCommonFlowChatHistory((prevChatHistory) => {
          const lastIndex = prevChatHistory.length - 1;
          const lastMessage = prevChatHistory[lastIndex];

          if (lastIndex >= 0 && lastMessage?.source === 'bot') {
            if (message?.msg) {
              let updatedLastMessage = { ...lastMessage, msg: lastMessage.msg + message.msg };

              if (Array.isArray(message?.extra_content?.sources) && message?.extra_content?.sources.length) {
                updatedLastMessage["sources"] = message?.extra_content?.sources;
              }

              if(message?.extra_content?.file_url) {
                updatedLastMessage["file_url"] = message?.extra_content?.file_url;
              }

              return [...prevChatHistory.slice(0, lastIndex), updatedLastMessage];
            }

            if (Array.isArray(message?.extra_content?.sources) && message?.extra_content?.sources.length) {
              let updatedLastMessage = { ...lastMessage };
              updatedLastMessage["sources"] = message?.extra_content?.sources;
              return [...prevChatHistory.slice(0, lastIndex), updatedLastMessage];
            }

            if(message?.extra_content?.file_url) {
              let updatedLastMessage = { ...lastMessage, file_url: message?.extra_content?.file_url };
              return [...prevChatHistory.slice(0, lastIndex), updatedLastMessage];
            }

            return prevChatHistory;
          } else {
            const updatedMessage = {
              msg: message?.msg || '',
              source: 'bot',
              updated_at: Date.now(),
            }
            if (Array.isArray(message?.extra_content?.sources) && message?.extra_content?.sources.length) {
              updatedMessage["sources"] = message?.extra_content?.sources;
            }
            if(message?.extra_content?.file_url) {
              updatedMessage["file_url"] = message?.extra_content?.file_url;
            }
            return [
              ...prevChatHistory,
              updatedMessage,
            ];
          }
        });

        if (message?.finish_reason === 'stop') {
          setIsWaitingForBot(false);
        }

        handleScrollIntoViewRef.current?.();
      }
    },
    []
  );

  useEffect(() => {
    useAICreationSessionStore.getState().setCommonFlowChatHistory(commonFlowChatHistory);
  }, [commonFlowChatHistory]);

  const {
    sendMessage: sendSocketMessage,
    connect: connectToWebSocket,
    disconnect,
    isConnected
  } = useChatWebhook(
    buildWebSocketUrl({
      searchParams,
      storageFlow,
      selectedType: '',
    }),
    {
      onOpen: onWebSocketOpen,
      onMessage: onWebSocketMessage,
      onFinalReconnectAttempt,
      autoConnect: false,
      reconnect: true,
      reconnectAttempts: env.WEBSOCKET_RETRY_NUM(),
    }
  );

  useEffect(() => {
    return () => {
      if (hasConnectedRef.current) {
        disconnect();
        hasConnectedRef.current = false;
      }
      if (timeoutRef.current.length) {
        timeoutRef.current.forEach(clearTimeout);
        timeoutRef.current = [];
      }
    };
  }, []);

  useEffect(() => {
    if (!isConnected && !isLoadingIntro) {
      connectToWebSocket()
      hasConnectedRef.current = true;
    }
  }, [isConnected, isLoadingIntro])

  const handleSendMessage = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!textMessage.trim()) return;

    const newMessage = {
      msg: textMessage,
      source: 'user',
      updated_at: Date.now(),
    };

    setCommonFlowChatHistory((prev) => [...prev, newMessage]);
    setIsWaitingForBot(true);

    if (!hasConnectedRef.current) {
      pendingMessageRef.current = textMessage;
      hasConnectedRef.current = true;
      connectToWebSocket();
    } else {
      sendSocketMessage({
        text: textMessage,
        context: '',
      });
    }

    handleScrollIntoView?.();
    setTextMessage('');
  };


  return (
    <div className="flex flex-col h-auto">
      <ToastContainer />
      {isLoadingIntro ? (
        <LoadingChat />
      ) : (
        <>
          {introMessage && (
            <BotMessage primaryMessage={introMessage} showChatStyle />
          )}
          
            {commonFlowChatHistory.length > 0 && (
              <ChatWindow
                chatHistory={commonFlowChatHistory}
              />
            )}   
            


            <div className="mt-auto">
                <ChatBox
                  textInputRef={textInputRef}
                  textMessage={textMessage}
                  handleOnInputText={(e) => setTextMessage(e.target.value)}
                  setUseTextbox={() => {}}
                  handleSendMessage={handleSendMessage}
                  isReadOnly={false}
                  disabled={isWaitingForBot}
                  isCommonFlow={true}
                />
            </div>
         
        </>
      )}
    </div>
  );
};

export default CommonFlow;
