import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import WelcomeCard from './components/WelcomeCard';
import ChatMessage from './components/chat-message/ChatMessage';
import ChatBox from './components/ChatBox';
import ChatWindow from './components/ChatWindow';
import { useAICreationSessionStore } from 'store';
import { useChatWebhook } from 'hooks/useChatWebhook';
import { buildWebSocketUrl } from 'utils/helpers';
import { sessionFlowName } from '../../../../../constants/session';
import { bot_routes, FLOW_TYPES } from '../../../../../configure';
import { getNewSessionID } from '../../../../../api/endpoints/chat_flow';
import { compareFlowTypesEquality } from '../../../utils/common_flow';
import env from "../../../../../../src/utils/env";
import { useConfirmationPopup } from "../../../../../../src/hooks/useConfirmationPopup";
const InitialSwitch = ({ introMessage, handleScrollIntoView, onFlowTypeSelected, isInitialSwitchSection, acceptedTnc }) => {
  const textInputRef = useRef(null);
  const isConnectedRef = useRef(false); 
  const hasAttemptedConnectionRef = useRef(false);
  const pendingMessageRef = useRef(null);
  const [textMessage, setTextMessage] = useState('');
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  // Use refs to store callback dependencies to prevent websocket reconnection
  const handleScrollIntoViewRef = useRef(handleScrollIntoView);
  const onFlowTypeSelectedRef = useRef(onFlowTypeSelected);
  const { commonsNetworkReconnectionPopup } = useConfirmationPopup()

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
    setSession: setSessionStore,
    getInitialSwitchChatHistory,
    setInitialSwitchChatHistory : setInitialSwitchChatHistoryStore,
  } = useAICreationSessionStore.getState();

  const [searchParams] = useSearchParams();
  const storageFlow = sessionFlowName.Creation;
  const accessToken = sessionStorage.getItem("accToken");

  useEffect(() => {
    const initializeSession = async () => {
      let currentSessionId = useAICreationSessionStore.getState().getSession();
      if (!currentSessionId) {
        const session = await getNewSessionID();
        setSessionStore(session);
      }

      const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || {};
      const language = preferredLanguage?.value || "en";
      sessionStorage.setItem("route", JSON.stringify(language));
      
      setIsSessionReady(true);
    };

    initializeSession();
  }, []);

  const onWebSocketOpen = useCallback(() => {
    isConnectedRef.current = true;
    
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
        
        if (compareFlowTypesEquality(validation, FLOW_TYPES.MIP)) {
          useAICreationSessionStore.getState().setSelectedFlowType(FLOW_TYPES.MIP);
          onFlowTypeSelectedRef.current?.(FLOW_TYPES.MIP);
        } else if (
          compareFlowTypesEquality(validation, FLOW_TYPES.LFA) || 
          compareFlowTypesEquality(validation, FLOW_TYPES.LCF) || 
          compareFlowTypesEquality(validation, FLOW_TYPES.FREE_FLOW)
        ) {
            useAICreationSessionStore.getState().setSelectedFlowType(validation?.toLowerCase());
            onFlowTypeSelectedRef.current?.(validation?.toLowerCase());
        }
      }
    },
    []
  );

  const onFinalReconnectAttempt = useCallback(() => {
    function onYesButtonClick() {
      try {
        let chat_history = getInitialSwitchChatHistory();

        if (Array.isArray(chat_history) && chat_history.length) {
          const lastIndex = chat_history.length - 1;

          if (chat_history[chat_history.length - 1]?.source === "user") {
            chat_history = chat_history.slice(0, -1);
          }
        }

        setInitialSwitchChatHistoryStore(chat_history);

        window.location.reload();
      } catch (error) {
        console.error("Error cleaning chat history before reload:", error);
        window.location.reload();
      }
    }

    function onNoButtonClick() {
      useAICreationSessionStore.getState().reset();
      window.location.reload();
    }

    commonsNetworkReconnectionPopup(onYesButtonClick, onNoButtonClick);
  }, []);

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
      onFinalReconnectAttempt,
      autoConnect: false,
      reconnect: true,
      reconnectAttempts: env.WEBSOCKET_RETRY_NUM(),
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