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
import { compareFlowTypesEquality } from '../../../utils/common_flow';

const InitialSwitch = ({ introMessage, handleScrollIntoView, onFlowTypeSelected, isInitialSwitchSection, acceptedTnc }) => {
  const textInputRef = useRef(null);
  const isConnectedRef = useRef(false); 
  const hasAttemptedConnectionRef = useRef(false);
  const pendingMessageRef = useRef(null);

  const initialSwitchChatHistory = useAICreationSessionStore(state => state.initialSwitchChatHistory);
  const profileId = useAICreationSessionStore(state => state.profileId);
  const session = useAICreationSessionStore(state => state.session);
  const preferredLanguage = useAICreationSessionStore(state => state.preferredLanguage);

  // Setters from store
  const { getSession, setSession: setSessionStore, setInitialSwitchChatHistory, getInitialSwitchChatHistory, setSelectedFlowType } = useAICreationSessionStore.getState();

  const [textMessage, setTextMessage] = useState('');
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isWelcomeScreen, setIsWelcomeScreen] = useState(
    !initialSwitchChatHistory?.length
  );

  // Use refs to store callback dependencies to prevent websocket reconnection
  const handleScrollIntoViewRef = useRef(handleScrollIntoView);
  const onFlowTypeSelectedRef = useRef(onFlowTypeSelected);

  useEffect(() => {
    handleScrollIntoViewRef.current = handleScrollIntoView;
    onFlowTypeSelectedRef.current = onFlowTypeSelected;
  }, [handleScrollIntoView, onFlowTypeSelected]);

  const [searchParams] = useSearchParams();
  const storageFlow = sessionFlowName.Creation;
  const accessToken = sessionStorage.getItem("accToken");

  useEffect(() => {
    const initializeSession = async () => {
      if (!session) {
        const newSession = await getNewSessionID();
        setSessionStore(newSession);
      }

      const language = preferredLanguage?.value || "en";
      sessionStorage.setItem("route", JSON.stringify(language));
      
      setIsSessionReady(true);
    };

    initializeSession();
  }, []);

  const onWebSocketOpen = useCallback(() => {
    isConnectedRef.current = true;
    
    const currentSessionId = getSession();
    sendSocketMessage({
      type: 'authenticate',
      sessionid: currentSessionId,
      profileid: profileId,
      access_token: accessToken,
      route: 'en',
      bot_route: bot_routes.initial_switch_bot,
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
  }, []);

  const onWebSocketClose = useCallback(() => {
    isConnectedRef.current = false;
  }, []);

  const onWebSocketError = useCallback(() => {
    isConnectedRef.current = false;
    pendingMessageRef.current = null;
    setIsWaitingForBot(false);
  }, []);

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

        const currentStoreHistory = getInitialSwitchChatHistory();
        setInitialSwitchChatHistory([...currentStoreHistory, newMessage]);

        setIsWaitingForBot(false);
        handleScrollIntoViewRef.current?.();
      } 
      else if (
        message?.source === 'bot' && 
        message?.extra_content?.should_move_forward === 'yes'
      ) {
        const validation = message?.extra_content?.validation;
        
        setIsWaitingForBot(false);
        
        if (compareFlowTypesEquality(validation, FLOW_TYPES.MIP)) {
          setSelectedFlowType(FLOW_TYPES.MIP);
          onFlowTypeSelectedRef.current?.(FLOW_TYPES.MIP);
        } else if (
          compareFlowTypesEquality(validation, FLOW_TYPES.LFA) || 
          compareFlowTypesEquality(validation, FLOW_TYPES.LCF) || 
          compareFlowTypesEquality(validation, FLOW_TYPES.FREE_FLOW)
        ) {
            setSelectedFlowType(validation?.toLowerCase());
            onFlowTypeSelectedRef.current?.(validation?.toLowerCase());
        }
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
      onClose: onWebSocketClose,
      onError: onWebSocketError,
      autoConnect: false,
      reconnect: false,
    }
  );

  useEffect(() => {
    return () => {
      if (hasAttemptedConnectionRef.current) {
        isConnectedRef.current = false;
        hasAttemptedConnectionRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (initialSwitchChatHistory?.length > 0) {
      setIsWelcomeScreen(false);
    }
  }, [initialSwitchChatHistory]);

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  useEffect(() => {
    if (acceptedTnc === true && textInputRef?.current) {
      textInputRef.current.focus();
    }
  }, [acceptedTnc]);

  const handleSendMessage = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!textMessage.trim() || !isSessionReady) return;

    const newMessage = {
      msg: textMessage,
      source: 'user',
      updated_at: Date.now(),
    };

    setInitialSwitchChatHistory([...initialSwitchChatHistory, newMessage]);

    setIsWaitingForBot(true);
    setIsWelcomeScreen(false);

    if (!isConnectedRef.current) {
      // Not connected - store message and connect (or reconnect)
      pendingMessageRef.current = textMessage;
      hasAttemptedConnectionRef.current = true;
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
