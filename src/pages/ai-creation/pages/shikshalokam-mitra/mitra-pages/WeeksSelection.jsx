import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
/* utils and api services */
import { saveUserChatsInDB } from "../../../../../api/endpoints/chat_flow";
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
import { useSearchParams } from "react-router-dom";
import { sessionFlowName } from "../../../../ShikshalokamVoiceChat/enum";
import { bot_routes } from "../../../../../configure";

const { BOT, USER } = CONVERSATION_USER_TYPES;

function WeeksSelection({
  isWeeksSelectionSection = false,
  handleScrollIntoView,
  getLoaderState,
  setCurrentPageValue,
}) {
  const textInputRef = useRef(null);
  const [textMessage, setTextMessage] = useState("");
  const [isWeekSectionLoader, setIsWeekSectionLoader] = useState(false);
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [useTextbox, setUseTextbox] = useState(false);


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
  const chatLanguage = getPreferredLanguage();
  const accessToken = sessionStorage.getItem("accToken");

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

  const onWebSocketOpen = useCallback(() => {
    sendSocketMessage({
      type: "authenticate",
      sessionid: sessionId,
      profileid: profileId,
      access_token: accessToken,
      route: chatLanguage || "en",
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
  } = useChatWebhook(
    buildWebSocketUrl({
      searchParams,
      storageFlow,
      selectedType: "",
      wssProtocol: "wss://",
    }),
    {
      onOpen: onWebSocketOpen,
      onMessage: onWebSocketMessage,
      autoConnect: false,
    }
  );

  useEffect(() => {
    connectToWebSocket();
  }, [connectToWebSocket]);

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

    const currentStoreHistory =
      useAICreationSessionStore
        .getState()
        .getDurationChatHistory();

    useAICreationSessionStore
      .getState()
      .setDurationChatHistory([...currentStoreHistory, newMessage]);

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
    const botMessage =
      t("weeksSelection.howManyWeeks") +
      " " +
      t("weeksSelection.slideToSelect");

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
  if (isWeekSectionLoader && isWeeksSelectionSection) return <LoadingChat />;


  return (
    <div>
      <BotMessage primaryMessage={t("weeksSelection.howManyWeeks")} />

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
              isReadOnly={true}
              disabled={isWaitingForBot}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeksSelection;
