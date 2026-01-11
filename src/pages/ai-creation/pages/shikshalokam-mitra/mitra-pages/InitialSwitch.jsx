import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import WelcomeCard from './components/WelcomeCard';
import ChatMessage from './components/chat-message/ChatMessage';
import ChatBox from './components/ChatBox';
import ChatWindow from './components/ChatWindow';
import { useAICreationSessionStore } from 'store';
import { useChatWebhook } from 'hooks/useChatWebhook';
import { buildWebSocketUrl } from 'utils/helpers';
import { sessionFlowName } from '../../../../ShikshalokamVoiceChat/enum';
import { bot_routes, FLOW_TYPES } from '../../../../../configure';
import { getNewSessionID } from '../../../../../api/endpoints/chat_flow';

const InitialSwitch = ({ introMessage, handleScrollIntoView, onFlowTypeSelected, isInitialSwitchSection }) => {
  const textInputRef = useRef(null);
  const hasConnectedRef = useRef(false);
  const [textMessage, setTextMessage] = useState('');
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  // Use refs to store callback dependencies to prevent websocket reconnection
  const handleScrollIntoViewRef = useRef(handleScrollIntoView);
  const onFlowTypeSelectedRef = useRef(onFlowTypeSelected);

  // Keep refs up to date
  useEffect(() => {
    handleScrollIntoViewRef.current = handleScrollIntoView;
    onFlowTypeSelectedRef.current = onFlowTypeSelected;
  }, [handleScrollIntoView, onFlowTypeSelected]);

  const localChatHistory = useAICreationSessionStore.getState().getInitialSwitchChatHistory();

  const [initialSwitchChatHistory, setInitialSwitchChatHistory] = useState(
    localChatHistory?.length ? localChatHistory : []
  );

  const [isWelcomeScreen, setIsWelcomeScreen] = useState(
    !localChatHistory?.length
  );

  const {
    profileId,
    getSession,
    getPreferredLanguage,
    setSession: setSessionStore,
  } = useAICreationSessionStore.getState();

  const [searchParams] = useSearchParams();
  const storageFlow = sessionFlowName.Creation;
  const [sessionId, setSessionId] = useState(getSession());
  const chatLanguage = getPreferredLanguage() || 'en';
  const accessToken = sessionStorage.getItem("accToken");

  useEffect(() => {
    const initializeSession = async () => {
      let currentSessionId = useAICreationSessionStore.getState().getSession();
      if (!currentSessionId) {
        const session = await getNewSessionID();
        setSessionStore(session);
        setSessionId(session);
      } else {
        setSessionId(currentSessionId);
      }

      const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || {};
      const language = preferredLanguage?.value || "en";
      sessionStorage.setItem("route", JSON.stringify(language));
      
      setIsSessionReady(true);
    };

    initializeSession();
  }, []);

  // Use stable callbacks that read from refs to prevent websocket reconnection
  const onWebSocketOpen = useCallback(() => {
    const currentSessionId = useAICreationSessionStore.getState().getSession();
    sendSocketMessage({
      type: 'authenticate',
      sessionid: currentSessionId,
      profileid: profileId,
      access_token: accessToken,
      route: 'en',
      bot_route: bot_routes.initial_switch_bot,
      flow_name: storageFlow,
    });
  }, []); // Empty deps - reads from store directly

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

        setInitialSwitchChatHistory((prev) => [...prev, newMessage]);

        const currentStoreHistory =
          useAICreationSessionStore
            .getState()
            .getInitialSwitchChatHistory();

        useAICreationSessionStore
          .getState()
          .setInitialSwitchChatHistory([...currentStoreHistory, newMessage]);

        setIsWaitingForBot(false);
        handleScrollIntoViewRef.current?.();
      } 
      else if (
        message?.source === 'bot' && 
        message?.extra_content?.should_move_forward === 'yes'
      ) {
        const validation = message?.extra_content?.validation;
        
        setIsWaitingForBot(false);
        
        if (validation === FLOW_TYPES.MIP) {
          useAICreationSessionStore.getState().setSelectedFlowType(FLOW_TYPES.MIP);
          onFlowTypeSelectedRef.current?.(FLOW_TYPES.MIP);
        } else if (
          validation === FLOW_TYPES.LFA || 
          validation === FLOW_TYPES.LCF || 
          validation === FLOW_TYPES.FREE_FLOW
        ) {
          // Other flows - use CommonFlow
          useAICreationSessionStore.getState().setSelectedFlowType(validation);
          onFlowTypeSelectedRef.current?.(validation);
        }
      }
    },
    [] // Empty deps - uses refs for callback access
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
      wssProtocol: 'wss://',
    }),
    {
      onOpen: onWebSocketOpen,
      onMessage: onWebSocketMessage,
      autoConnect: false,
    }
  );

  useEffect(() => {
    if (!isSessionReady || hasConnectedRef.current) return;
    
    hasConnectedRef.current = true;
    connectToWebSocket();

    return () => {
      disconnect();
      hasConnectedRef.current = false;
    };
  }, [isSessionReady]);

  useEffect(() => {
    if (initialSwitchChatHistory?.length > 0) {
      setIsWelcomeScreen(false);
    }
  }, [initialSwitchChatHistory]);

  const handleSendMessage = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!textMessage.trim()) return;

    const newMessage = {
      msg: textMessage,
      source: 'user',
      updated_at: Date.now(),
    };

    setInitialSwitchChatHistory((prev) => [...prev, newMessage]);

    const currentStoreHistory =
      useAICreationSessionStore
        .getState()
        .getInitialSwitchChatHistory();

    useAICreationSessionStore
      .getState()
      .setInitialSwitchChatHistory([...currentStoreHistory, newMessage]);

    setIsWaitingForBot(true);
    setIsWelcomeScreen(false);

    sendSocketMessage({
      text: textMessage,
      context: '',
    });

    handleScrollIntoView?.();
    setTextMessage('');
  };

  return (
    <div className="flex flex-col h-auto">
      <WelcomeCard />
      <ChatMessage message={introMessage} userType="bot" />
      
      {!isWelcomeScreen && initialSwitchChatHistory.length > 0 && (
        <ChatWindow
          chatHistory={initialSwitchChatHistory}
          page={0}
        />
      )}

      {isInitialSwitchSection && (
        <div className="mt-auto">
          <ChatBox
            textInputRef={textInputRef}
            textMessage={textMessage}
            handleOnInputText={(e) => setTextMessage(e.target.value)}
            setUseTextbox={() => {}}
            handleSendMessage={handleSendMessage}
            isReadOnly={false}
            disabled={isWaitingForBot}
          />
        </div>
      )}
    </div>
  );
};

export default InitialSwitch;
