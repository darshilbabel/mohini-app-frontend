import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
/* utils and api services */
import { saveUserChatsInDB } from "../../../../../api/endpoints/chat_flow";
import { getTranslatedIntroMessageApi } from "../../../../../api/endpoints/ai";
/* components */
import LoadingChat from "./components/LoadingChat";
import BotMessage from "./components/chat-message/BotMessage";
import ChatBox from "./components/ChatBox";
import ChatWindow from "./components/ChatWindow";
/* constants */
import { LOADER_KEYS } from "../../../constants/common";
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants";
/* styles */
import "../stylesheet/chatStyle.css";
import { useAICreationSessionStore } from "store";
import { useChatWebhook } from "hooks/useChatWebhook";
import { buildWebSocketUrl } from "utils/helpers";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sessionFlowName } from "../../../../../constants/session";
import { bot_routes } from "../../../../../configure";
import { useConfirmationPopup } from "../../../../../hooks/useConfirmationPopup"
import { clearMitraSessionStorage } from "../MainPage"

const { BOT, USER } = CONVERSATION_USER_TYPES;

function WeeksSelection({
  isWeeksSelectionSection = false,
  handleScrollIntoView,
  getLoaderState,
  setCurrentPageValue,
}) {
  const textInputRef = useRef(null);
  const navigate = useNavigate()
  const [textMessage, setTextMessage] = useState("");
  const [isWeekSectionLoader, setIsWeekSectionLoader] = useState(false);
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [useTextbox, setUseTextbox] = useState(false);
  const [introMessage, setIntroMessage] = useState(null);
  const [isLoadingIntro, setIsLoadingIntro] = useState(true);
  const { commonsNetworkReconnectionPopup } = useConfirmationPopup()

  const { getDurationChatHistory, setDurationChatHistoryStore } = useAICreationSessionStore.getState()

  const { t } = useTranslation("ai_creation_translation");

  const localChatHistory =
    useAICreationSessionStore.getState().getDurationChatHistory();

  const [durationChatHistory, setDurationChatHistory] = useState(
    localChatHistory?.length ? localChatHistory : []
  );

  const {
    setSelectedWeek: setSelectedWeekStore,
    profileId,
    getSession,
    getPreferredLanguage,
  } = useAICreationSessionStore.getState();

  const [searchParams] = useSearchParams();
  const storageFlow = sessionFlowName.Creation;
  const sessionId = getSession();
  const chatLanguage = getPreferredLanguage() || "en";
  const accessToken = sessionStorage.getItem("accToken");

  // Fetch intro message from API
  useEffect(() => {
    const fetchIntroMessage = async () => {
      try {
        setIsLoadingIntro(true);
        const response = await getTranslatedIntroMessageApi({
          language: "en",
          company_bot__route: bot_routes.mitra_duration,
        });
        const message = response?.[0]?.alt_introductory_message;
        setIntroMessage(message);
        useAICreationSessionStore.getState().setDurationIntroMessage(message);
      } catch (error) {
        console.error("Error fetching duration intro message:", error);
        // Fallback to translation if API fails
        setIntroMessage(t("weeksSelection.howManyWeeks"));
      } finally {
        setIsLoadingIntro(false);
      }
    };

    const storedIntroMessage = useAICreationSessionStore.getState().getDurationIntroMessage();
    if (storedIntroMessage) {
      setIntroMessage(storedIntroMessage);
      setIsLoadingIntro(false);
    } else {
      fetchIntroMessage();
    }
  }, [t]);

  useEffect(() => {

    let timeout;
    if(!isWeekSectionLoader) {
      setIsWeekSectionLoader(true);
      timeout = setTimeout(() => {
        setIsWeekSectionLoader(false);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [isWeeksSelectionSection]);

  function onFinalReconnectAttempt() {
    function onYesButtonClick() {
      try {
        let chat_history = getDurationChatHistory();
        if (Array.isArray(chat_history)) {
          chat_history = chat_history.filter((chat, index) => !(index == chat_history.length - 1 && chat.source === "user"))
        }
        setDurationChatHistoryStore(chat_history)

        window.location.reload()
      } catch (error) {
        console.error("Error cleaning chat history before reload:", error)
        window.location.reload()
      }
    }

    function onNoButtonClick() {
      clearMitraSessionStorage()
      navigate("/")
      window.location.reload()
    }

    commonsNetworkReconnectionPopup(onYesButtonClick, onNoButtonClick)
  }

  const onWebSocketOpen = useCallback(() => {
    sendSocketMessage({
      type: "authenticate",
      sessionid: sessionId,
      profileid: profileId,
      access_token: accessToken,
      route: "en",
      bot_route: bot_routes.mitra_duration,
      flow_name: storageFlow,
    });
  }, [sessionId, profileId, accessToken, chatLanguage, storageFlow]);

  const onWebSocketMessage = useCallback(
    (event) => {
      const data = JSON.parse(event.data);
      const message = data?.text;

      if (message?.msg && message?.source === "bot") {
        const newMessage = {
          msg: message.msg,
          source: "bot",
          updated_at: Date.now(),
        };

        setDurationChatHistory((prev) => [...prev, newMessage]);

        const currentStoreHistory =
          useAICreationSessionStore
            .getState()
            .getDurationChatHistory();

        useAICreationSessionStore
          .getState()
          .setDurationChatHistory([...currentStoreHistory, newMessage]);

        setIsWaitingForBot(false);
        handleScrollIntoView();
      } else if (
        message?.source === "bot" &&
        message?.extra_content?.should_move_forward === "yes"
      ) {
        const numOfWeeks =
          message?.extra_content?.query?.match(/\d+/)?.[0] ?? 1;
        handleContinueClick(Number(numOfWeeks));
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
      storageFlow,
      selectedType: "",
    }),
    {
      onOpen: onWebSocketOpen,
      onMessage: onWebSocketMessage,
      autoConnect: false,
      onFinalReconnectAttempt
    }
  );

  useEffect(() => {
    connectToWebSocket();

    return () => {
      disconnect();
    }
  }, [connectToWebSocket, disconnect]);

  const handleSendMessage = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!textMessage.trim()) return;

    const newMessage = {
      msg: textMessage,
      source: "user",
      updated_at: Date.now(),
    };

    setDurationChatHistory((prev) => [...prev, newMessage]);

    const currentStoreHistory = useAICreationSessionStore.getState().getDurationChatHistory();

    useAICreationSessionStore.getState().setDurationChatHistory([...currentStoreHistory, newMessage]);

    setIsWaitingForBot(true);

    sendSocketMessage({
      text: textMessage,
      context: "",
    });

    handleScrollIntoView();
    setTextMessage("");
  };

  const handleContinueClick = async (selectedWeek) => {
    if (!selectedWeek) return;

    setSelectedWeekStore(selectedWeek);
    const botMessage = introMessage || t("weeksSelection.howManyWeeks");

    const currentSession =
      useAICreationSessionStore.getState().getSession();

    await saveUserChatsInDB(botMessage, currentSession, BOT);
    await saveUserChatsInDB(
      JSON.stringify(selectedWeek),
      currentSession,
      USER
    );

    setCurrentPageValue(4);
  };

  if (getLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION)) return null;
  if ((isWeekSectionLoader || isLoadingIntro) && isWeeksSelectionSection) return <LoadingChat />;


  return (
    <div>
      {introMessage && <BotMessage showChatStyle primaryMessage={introMessage} />}

      <div className="flex flex-col h-auto">
        {durationChatHistory.length > 0 && (
          <ChatWindow
            chatHistory={durationChatHistory}
            page={4}
          />
        )}

        {isWeeksSelectionSection && (
          <div className="mt-auto">
            <ChatBox
              textInputRef={textInputRef}
              textMessage={textMessage}
              handleOnInputText={(e) =>
                setTextMessage(e.target.value)
              }
              setUseTextbox={setUseTextbox}
              handleSendMessage={handleSendMessage}
              isReadOnly={false}
              disabled={isWaitingForBot}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeksSelection;
