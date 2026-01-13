import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatBox from './components/ChatBox';
import ChatWindow from './components/ChatWindow';
import LoadingChat from './components/LoadingChat';
import BotMessage from './components/chat-message/BotMessage';
import { useAICreationSessionStore } from 'store';
import { useChatWebhook } from 'hooks/useChatWebhook';
import { buildWebSocketUrl } from 'utils/helpers';
import { FLOW_TYPES, FLOW_CONFIG, bot_routes } from '../../../../../configure';
import { getTranslatedIntroMessageApi } from '../../../../../api/endpoints/ai';
import { sessionFlowName } from '../../../../ShikshalokamVoiceChat/enum';

const CommonFlow = ({ flowType, handleScrollIntoView }) => {
  const textInputRef = useRef(null);
  const [textMessage, setTextMessage] = useState('');
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [introMessage, setIntroMessage] = useState(null);
  const [isLoadingIntro, setIsLoadingIntro] = useState(true);

  const localChatHistory = useAICreationSessionStore.getState().getCommonFlowChatHistory();

  const [commonFlowChatHistory, setCommonFlowChatHistory] = useState(
    localChatHistory?.length ? localChatHistory : []
  );

  const {
    profileId,
    getSession,
  } = useAICreationSessionStore.getState();

  const [searchParams] = useSearchParams();
  const sessionId = getSession();
  const accessToken = sessionStorage.getItem('accToken');

  const flowConfig = FLOW_CONFIG[flowType] || FLOW_CONFIG[FLOW_TYPES.FREE_FLOW];
  const storageFlow = flowConfig.flow_name;
  const botRoute = flowConfig.bot_route;

  const getBotRouteForIntro = () => {
    switch (flowType) {
      case FLOW_TYPES.LFA:
        return bot_routes.lfa_bot;
      case FLOW_TYPES.LCF:
        return bot_routes.lcf_bot;
      case FLOW_TYPES.FREE_FLOW:
        return bot_routes.free_flow_bot;
      default:
        return bot_routes.free_flow_bot;
    }
  };

  useEffect(() => {
    const fetchIntroMessage = async () => {
      try {
        setIsLoadingIntro(true);
        const response = await getTranslatedIntroMessageApi({
          language: 'en',
          company_bot__route: getBotRouteForIntro(),
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

    sendSocketMessage({
      type: 'authenticate',
      sessionid: sessionId,
      profileid: profileId,
      access_token: accessToken,
      route: 'en',
      bot_route: botRoute,
      flow_name: storageFlow,
    });
  }, [sessionId, profileId, accessToken, botRoute, storageFlow]);

  const onWebSocketMessage = useCallback(
    (event) => {
      const data = JSON.parse(event.data);
      const message = data?.text;

      if (message?.msg && message?.source === 'bot') {
        const newMessage = {
          msg: message.msg,
          source: 'bot',
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

        setIsWaitingForBot(false);
        handleScrollIntoView?.();
      }
    },
    [handleScrollIntoView]
  );

  const {
    sendMessage: sendSocketMessage,
    connect: connectToWebSocket,
    disconnect,
  } = useChatWebhook(
    buildWebSocketUrl({
      searchParams,
      storageFlow: sessionFlowName.Creation,
      selectedType: '',
      wssProtocol: 'wss://',
    }),
    {
      onOpen: onWebSocketOpen,
      onMessage: onWebSocketMessage,
      autoConnect: false,
    }
  );

  useEffect(() => {
    connectToWebSocket();

    return () => {
      disconnect();
    };
  }, [connectToWebSocket, disconnect]);

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

    sendSocketMessage({
      text: textMessage,
      context: '',
    });

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

