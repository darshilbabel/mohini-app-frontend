import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatBox from './components/ChatBox';
import ChatWindow from './components/ChatWindow';
import LoadingChat from './components/LoadingChat';
import BotMessage from './components/chat-message/BotMessage';
import { useAICreationSessionStore } from 'store';
import { useChatWebhook } from 'hooks/useChatWebhook';
import { buildWebSocketUrl } from 'utils/helpers';
import { getTranslatedIntroMessageApi } from '../../../../../api/endpoints/ai';
import { sessionFlowName } from '../../../../ShikshalokamVoiceChat/enum';
import { getBotConfigForFlow } from '../../../utils/common_flow';

const CommonFlow = ({ flowType, handleScrollIntoView }) => {
  const textInputRef = useRef(null);
  const hasConnectedRef = useRef(false);
  const pendingMessageRef = useRef(null);
  const [textMessage, setTextMessage] = useState('');
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [introMessage, setIntroMessage] = useState(null);
  const [isLoadingIntro, setIsLoadingIntro] = useState(true);

  const handleScrollIntoViewRef = useRef(handleScrollIntoView);

  useEffect(() => {
    handleScrollIntoViewRef.current = handleScrollIntoView;
  }, [handleScrollIntoView]);

  const localChatHistory = useAICreationSessionStore.getState().getCommonFlowChatHistory();

  const [commonFlowChatHistory, setCommonFlowChatHistory] = useState(
    localChatHistory?.length ? localChatHistory : []
  );

  const { profileId } = useAICreationSessionStore.getState();

  const [searchParams] = useSearchParams();
  const accessToken = sessionStorage.getItem('accToken');

  const storageFlow = getBotConfigForFlow(flowType).flow_name;
  const botRoute = getBotConfigForFlow(flowType).route;

  useEffect(() => {
    const fetchIntroMessage = async () => {
      try {
        setIsLoadingIntro(true);
        const response = await getTranslatedIntroMessageApi({
          language: 'en',
          company_bot__route: botRoute,
        });
        const message = response?.[0]?.alt_introductory_message;
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

    if (pendingMessageRef.current) {
      setTimeout(() => {
        sendSocketMessage({
          text: pendingMessageRef.current,
          context: '',
        });
        pendingMessageRef.current = null;
      }, 100);
    }
  }, [profileId, accessToken, botRoute, storageFlow]);

  const onWebSocketMessage = useCallback(
    (event) => {
      const data = JSON.parse(event.data);
      const message = data?.text;

      if (message?.source === 'bot') {
        setCommonFlowChatHistory((prevChatHistory) => {
          const updatedChatHistory = [...prevChatHistory];

          if (
            updatedChatHistory.length > 0 &&
            updatedChatHistory[updatedChatHistory.length - 1]?.source === 'bot'
          ) {
            if (message?.msg) {
              updatedChatHistory[updatedChatHistory.length - 1].msg += message?.msg;
            }
          } else {
            updatedChatHistory.push({
              msg: message?.msg || '',
              source: 'bot',
              updated_at: Date.now(),
            });
          }

          useAICreationSessionStore
            .getState()
            .setCommonFlowChatHistory(updatedChatHistory);

          return updatedChatHistory;
        });

        if (message?.finish_reason === 'stop') {
          setIsWaitingForBot(false);
        }

        handleScrollIntoViewRef.current?.();
      }
    },
    []
  );

  const {
    sendMessage: sendSocketMessage,
    connect: connectToWebSocket,
    disconnect,
  } = useChatWebhook(
    buildWebSocketUrl({
      searchParams,
      storageFlow,
      selectedType: '',
    }),
    {
      onOpen: onWebSocketOpen,
      onMessage: onWebSocketMessage,
      autoConnect: false,
      reconnect: false,
    }
  );


  useEffect(() => {
    return () => {
      if (hasConnectedRef.current) {
        disconnect();
        hasConnectedRef.current = false;
      }
    };
  }, []);

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

    const currentStoreHistory =
      useAICreationSessionStore
        .getState()
        .getCommonFlowChatHistory();

    useAICreationSessionStore
      .getState()
      .setCommonFlowChatHistory([...currentStoreHistory, newMessage]);

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
      {isLoadingIntro ? (
        <LoadingChat />
      ) : (
        <>
          {introMessage && (
            <BotMessage primaryMessage={introMessage} />
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

