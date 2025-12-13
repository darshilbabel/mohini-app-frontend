import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
/* icons */
import { IoArrowForward } from "react-icons/io5";
/* utils and api services */
import { saveUserChatsInDB } from "../../../../../api/endpoints/chat_flow";
/* components */
import UserMessage from "./components/chat-message/UserMessage";
import LoadingChat from "./components/LoadingChat";
import BotMessage from "./components/chat-message/BotMessage";
import Slider from "../../../../../components/Slider/slider";
/* constants */
import { LOADER_KEYS } from "../../../constants/common";
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants";
/* styles */
import "../stylesheet/chatStyle.css";
import { useAICreationSessionStore } from "store";
import ChatBox from "./components/ChatBox";
import { useChatWebhook } from "hooks/useChatWebhook"
import { buildWebSocketUrl } from "utils/helpers"
import { useSearchParams } from "react-router-dom";
import { sessionFlowName } from "../../../../ShikshalokamVoiceChat/enum";
import { bot_routes } from "../../../../../configure";
import { createMessage } from "../../../../interview-voice";
import ChatWindow from "./components/ChatWindow";


const { BOT, USER } = CONVERSATION_USER_TYPES;

function WeeksSelection({
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  setIsLoading,
  isLoading,
  handleGoBack,
  handleGoForward,
  setCurrentPageValue,
  setChatHistory,
  isWeeksSelectionSection = false,
  handleScrollIntoView,
  handleLoaderState,
  getLoaderState,
}) {
  const textInputRef = useRef(null);
  const [textMessage, setTextMessage] = useState("");
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [useTextbox, setUseTextbox] = useState(false);
  const [seconds, setSeconds] = useState(0)

  const localChatHistory = useAICreationSessionStore.getState().getDurationChatHistory()

  console.log({localChatHistory})

  const [durationChatHistory, setDurationChatHistory] = useState(
    !!localChatHistory?.length ? localChatHistory : []
  );



  const { t } = useTranslation("ai_creation_translation");
  const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(
    useAICreationSessionStore.getState().getSelectedWeek() ? true : false
  );

  const { setSelectedWeek: setSelectedWeekStore, profileId } = useAICreationSessionStore.getState();


  const [searchParams] = useSearchParams()
  const storageFlow = sessionFlowName.Creation;
  const selectedType = ""
  const wss_protocol = "wss://"
  const sessionId = useAICreationSessionStore.getState().getSession();
  const chatLanguage = useAICreationSessionStore.getState().getPreferredLanguage();
  let accessToken = sessionStorage.getItem("accToken");


  const onWebSocketClose = useCallback(() => {
  }, [])

  const onWebSocketOpen = useCallback(() => {
    sendSocketMessage({
      type: "authenticate",
      sessionid: sessionId,
      profileid: profileId,
      access_token: accessToken,
      route: "en",
      bot_route: bot_routes.mitra_duration,
      flow_name: storageFlow,
    })
  }, [sessionId, profileId, accessToken, chatLanguage, storageFlow])

  const onWebSocketMessage = useCallback((event) => {
    const data = JSON.parse(event.data)
    const message = data?.text
  
    if (message?.msg && message?.source === "bot") {
      const newMessage = {
        msg: message.msg,
        source: "bot",
        updated_at: Date.now(),
      }
      
      setDurationChatHistory(prev => [...prev, newMessage])
      
      // Update store - get current value first, then set new value
      const currentStoreHistory = useAICreationSessionStore.getState().getDurationChatHistory()
      useAICreationSessionStore.getState().setDurationChatHistory([...currentStoreHistory, newMessage])
      
      handleScrollIntoView();
    }
    else if(message?.source === "bot" && message?.extra_content?.should_move_forward === "yes") {
      const numOfWeeks = message?.extra_content?.query?.split("_weeks")[0];
      handleContinueClick(Number(numOfWeeks))
    }
  }, [])

  const onWebSocketError = useCallback((error) => {
  }, [])

  const onFinalReconnectAttempt = useCallback(() => {
  }, [])

  const {
    sendMessage: sendSocketMessage,
    connect: connectToWebSocket,
    isFreshConnection,
  } = useChatWebhook(
    buildWebSocketUrl({
      searchParams,
      storageFlow,
      selectedType,
      wssProtocol: wss_protocol,
    }),
    {
      onOpen: onWebSocketOpen,
      onMessage: onWebSocketMessage,
      onClose: onWebSocketClose,
      onError: onWebSocketError,
      onFinalReconnectAttempt,
      autoConnect: false,
    }
  )

  useEffect(() => {
    connectToWebSocket();
  }, [])


  useEffect(() => {
    if (isWeeksSelectionSection) handleScrollIntoView();
  }, []);

  useEffect(() => {
    if (isInReadOnlyMode) {
      // setIsLoading(true);
      localStorage.removeItem("selected_week");
      localStorage.removeItem("project_title");
      // setIsLoading(false);
    }
  }, [isInReadOnlyMode]);

  

  function handleSendMessage(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (!textMessage.trim()) return

    const newMessage = {
      msg: textMessage,
      source: "user",
      updated_at: Date.now(),
    }

    setDurationChatHistory(prev => [...prev, newMessage])

    // Update store - get current value first, then set new value
    const currentStoreHistory = useAICreationSessionStore.getState().getDurationChatHistory()
    useAICreationSessionStore.getState().setDurationChatHistory([...currentStoreHistory, newMessage])
    
    sendSocketMessage({
      text: textMessage,
      context: "",
      // asr_audio: asrAudio,
    })

    handleScrollIntoView();
    setTextMessage("")
  }


  const handleSliderChange = (value) => {};

  const handleContinueClick = async (selectedWeek) => {
    if (selectedWeek) {
      // setIsLoading(true);
      setSelectedWeekStore(selectedWeek)
      const botMessage =
        t("weeksSelection.howManyWeeks") +
        " " +
        t("weeksSelection.slideToSelect");
      const currentSession = useAICreationSessionStore.getState().getSession();

      saveUserChatsInDB(botMessage, currentSession, BOT)
        .then(() => {
          saveUserChatsInDB(
            JSON.stringify(selectedWeek),
            currentSession,
            USER
          );
        })
        .then(() => {
          setCurrentPageValue(4);
        });
    }
  };

  if (getLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION)) {
    return <LoadingChat />;
  }


  const handleOnInputText = (e) => {
    e.preventDefault();
    setTextMessage(e.target.value);
  };



  return (
    <>
      <div>
        <BotMessage primaryMessage={t("weeksSelection.howManyWeeks")} />
        {/* <Slider
          min={1}
          max={6}
          onValueChange={handleSliderChange}
          value={selectedWeek}
          setValue={setSelectedWeek}
          isDisabled={!isWeeksSelectionSection}
        /> */}

        <div className="flex flex-col h-auto">
          {durationChatHistory?.length > 0 && <ChatWindow
            // isTalking={isTalking}
            // handleOnSpeaking={handleOnSpeaking}
            // handleOnStopSpeaking={handleOnStopSpeaking}
            // botNameToDisplay={botNameToDisplay}
            // isStreamingComplete={isStreamingComplete}
            // setNotMute={setNotMute}
            // userDetail={userDetail}
            chatHistory={durationChatHistory}
            // isReadOnly={isReadOnly}
            // hasStartedListening={hasStartedListening}
            // hasOverRideId={hasOverRideId}
            // scrollRef={scrollRef}
          />}
          {isWeeksSelectionSection && (
            <div className="mt-auto">
              <ChatBox
                textInputRef={textInputRef}
                textMessage={textMessage}
                handleOnInputText={handleOnInputText}
                setUseTextbox={setUseTextbox}
                handleSendMessage={handleSendMessage}
                disabled={isFetchingData || hasStartedRecording}
                hasStartedRecording={hasStartedRecording}
                // startRecording={startRecording}
                // stopRecording={stopRecording}
                isFetchingData={isFetchingData}
                seconds={seconds}
                isReadOnly={false}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default WeeksSelection;
