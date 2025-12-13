import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
/* icons */
import { IoArrowForward } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
/* utils and api services */

import {
  getObjectiveList,
  saveUserChatsInDB,
  validateObjective,
} from "../../../../../api/endpoints/chat_flow";
import { transformSource } from "../../../utils/mitra-chat";
/* components */
import BotMessage from "./components/chat-message/BotMessage";
import ObjectivesCard from "./components/objectives/ObjectivesCard";
import SuggestOrAddCta from "./components/SuggestOrAddCta";
import ErrorText from "./components/ErrorText";
import UserMessage from "./components/chat-message/UserMessage";
import LoadingChat from "./components/LoadingChat";
/* constants */
import { LOADER_KEYS } from "../../../constants/common";
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants";
/* styles */
import "../stylesheet/chatStyle.css";
import { useAICreationSessionStore } from "store";
import ChatBox from "./components/ChatBox";
import { bot_routes } from "../../../../../configure";
import { useChatWebhook } from "../../../../../hooks/useChatWebhook";
import { buildWebSocketUrl } from "../../../../../utils/helpers";
import { sessionFlowName } from "../../../../ShikshalokamVoiceChat/enum";
import { useSearchParams } from "react-router-dom";
import ChatWindow from "./components/ChatWindow";

const { BOT, USER } = CONVERSATION_USER_TYPES;

function SelectObjective({
  isSelectObjectiveSection,
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  setIsLoading,
  isLoading,
  handleGoBack,
  handleGoForward,
  setCurrentPageValue,
  setChatHistory,
  errorText,
  setErrorText,
  handleScrollIntoView,
  handleLoaderState,
  getLoaderState,
}) {
  const { t } = useTranslation("ai_creation_translation");
  const [objectiveList, setObjectiveList] = useState([]);
  const [prevObjectiveList, setPrevObjectiveList] = useState([]);
  const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(() => {
    const storedObjective = useAICreationSessionStore.getState().getSelectedObjective();
    if (storedObjective) {
      return typeof storedObjective === "string" ? true : false;
    }
  });
  const [objectiveSource, setObjectiveSource] = useState([]);

  const textInputRef = useRef(null);
  const [textMessage, setTextMessage] = useState("");
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [useTextbox, setUseTextbox] = useState(false);
  const [seconds, setSeconds] = useState(0)
  const [isNewlyGeneratedList, setIsNewlyGeneratedList] = useState(false)

  const localChatHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()

  const [objectiveChatHistory, setObjectiveChatHistory] = useState(
    !!localChatHistory?.length ? localChatHistory : []
  );


  const [visibleCount, setVisibleCount] = useState(() => {
    const defaultValueToShow = 3;
    if (!isInReadOnlyMode) {
      return defaultValueToShow;
    } else {
      const objectiveList = useAICreationSessionStore.getState().getObjective() || [];
      const selectedObjective = useAICreationSessionStore.getState().getSelectedObjective();

      const selectedIndex = Array.isArray(objectiveList)
        ? objectiveList.indexOf(selectedObjective)
        : -1;
      setSelectedIndex(selectedIndex);
      setInputText(objectiveList[selectedIndex]);
      return selectedIndex !== -1 && selectedIndex > defaultValueToShow - 1
        ? selectedIndex + 1
        : defaultValueToShow;
    }
  });
  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || {};
  const language = preferredLanguage.value || "en";
  const { setObjective: setObjectiveStore, setPrevObjective: setPrevObjectiveStore, setObjectiveSource: setObjectiveSourceStore, setChunks: setChunksStore, setSelectedObjective: setSelectedObjectiveStore, setHasClickedObjAddMore } = useAICreationSessionStore.getState()

  const { setSelectedWeek: setSelectedWeekStore, profileId, setUserProblemStatement: setUserProblemStatementStore } = useAICreationSessionStore.getState();


  const [searchParams] = useSearchParams()
  const storageFlow = sessionFlowName.Creation;
  const selectedType = ""
  const wss_protocol = "wss://"
  const sessionId = useAICreationSessionStore.getState().getSession();
  const chatLanguage = useAICreationSessionStore.getState().getPreferredLanguage();
  let accessToken = sessionStorage.getItem("accToken");


  async function fetchObjectiveList(createNew = false, newProblemStatement = '') {

    try {
      if (!objectiveList || objectiveList?.length === 0) {
        // setIsLoading(true);
        handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, true);
        const userProblemStatement = newProblemStatement || useAICreationSessionStore.getState().getUserProblemStatement() || null;
        const profile_id = useAICreationSessionStore.getState().getProfileId() || null;
        const fetched_objectiveList = await getObjectiveList(
          userProblemStatement,
          language,
          profile_id
        );
        const { message = "", objective_list = [] } = fetched_objectiveList || {};

        if (
          objective_list?.length > 0
        ) {



          if(createNew) {
            setPrevObjectiveStore(objectiveList)
            setPrevObjectiveList(objectiveList)
            setIsNewlyGeneratedList(true)
          }


          setObjectiveList(objective_list);
          setObjectiveStore(objective_list)


          const transformedSource = transformSource(
            objective_list
          );


          console.log({transformedSource})

          setObjectiveSourceStore(transformedSource)
          setObjectiveSource(transformedSource);


          setChunksStore(objective_list?.chunks)
          // setIsLoading(false);
          if (isSelectObjectiveSection) handleScrollIntoView();
        } else {
          const errorMessage = message?.length > 0 ? message : (useAICreationSessionStore.getState().getSystemError() || t("common.pleaseTryAgainLater"));
          setFetchError(errorMessage);
          // window.location.reload();
        }
      }
    } catch (error) {
      setFetchError(
        useAICreationSessionStore.getState().getSystemError() || t("common.pleaseTryAgainLater")
      );
      // setIsLoading(false);
      handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, false);
      console.error(error);
    } finally {
      handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, false);
    }
  }

  const onWebSocketClose = useCallback(() => {
  }, [])

  const onWebSocketOpen = useCallback(() => {
    sendSocketMessage({
      type: "authenticate",
      sessionid: sessionId,
      profileid: profileId,
      access_token: accessToken,
      route: "en",
      bot_route: bot_routes.mitra_objective_list,
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
      
      setObjectiveChatHistory(prev => [...prev, newMessage])
      
      // Update store - get current value first, then set new value
      const currentStoreHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()
      useAICreationSessionStore.getState().setObjectiveChatHistory([...currentStoreHistory, newMessage])
      
      handleScrollIntoView();
    }
    else if(message?.source === "bot" && message?.extra_content?.should_move_forward === "yes" && message?.extra_content?.validation === "CREATE_NEW") {

      const newMessage = {
        msg: "",
        source: "SEPARATOR",
        updated_at: Date.now(),
      }
      
      setObjectiveChatHistory(prev => [...prev, newMessage])
      // Update store - get current value first, then set new value
      const currentStoreHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()
      useAICreationSessionStore.getState().setObjectiveChatHistory([...currentStoreHistory, newMessage])

      setUserProblemStatementStore(message?.extra_content?.query)
      fetchObjectiveList(true, message?.extra_content?.query)
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

    setObjectiveChatHistory(prev => [...prev, newMessage])

    // Update store - get current value first, then set new value
    const currentStoreHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()
    useAICreationSessionStore.getState().setObjectiveChatHistory([...currentStoreHistory, newMessage])
    
    sendSocketMessage({
      text: textMessage,
      context: "",
      // asr_audio: asrAudio,
    })

    handleScrollIntoView();
    setTextMessage("")
  }

  useEffect(() => {

    const storedObjective = useAICreationSessionStore.getState().getObjective();


    if (storedObjective) {
      setObjectiveList(
        typeof storedObjective === "string"
          ? [storedObjective]
          : storedObjective
      );
    } else {
      fetchObjectiveList();
    }

    const storedObjectiveSource = useAICreationSessionStore.getState().getObjectiveSource();
    if (storedObjectiveSource) {
      setObjectiveSource(storedObjectiveSource);
    }
    if (isSelectObjectiveSection) handleScrollIntoView();
  }, []);

  const handleSuggestMore = () => {
    setVisibleCount((prevCount) => {
      const newCount = prevCount + 3;
      handleScrollIntoView();
      return newCount;
    });
  };

  useEffect(() => {
    if (isInReadOnlyMode) {
      // setIsLoading(true);
      localStorage.removeItem("actionList");
      localStorage.removeItem("selected_action");
      setInputText(useAICreationSessionStore.getState().getSelectedObjective() || "");
      setHasClickedOnAddmore(useAICreationSessionStore.getState().getHasClickedObjAddMore());
      // setIsLoading(false);
    }
  }, [isInReadOnlyMode]);

  const handleObjectiveClick = (index) => {
    setSelectedIndex(index);
    const text = objectiveList[index]
    setInputText(text)
    handleNextClick(text)
  };

  function updateSelectedObjectiveSources(selectedObjectiveText) {
    const store = useAICreationSessionStore.getState();
    const objectives = store.getObjective() || [];
    const setSelectedObjectiveSource = store.setSelectedObjectiveSource;

    const matchedObjective = objectives.find(
      (o) => o.text === selectedObjectiveText
    );

    const finalSources = [];
    const seen = new Set();

    (matchedObjective?.sources || []).forEach(src => {
      if (src?.url && !seen.has(src.url)) {
        seen.add(src.url);
        finalSources.push(src);
      }
    });

    setSelectedObjectiveSource(finalSources);
    return finalSources;
  }

  const handleNextClick = (text = '') => {

    const finalText = text ?? inputText;

    const userSelectedObjective = finalText?.text?.trim();
    if (userSelectedObjective?.trim()?.length > 0) {
      setErrorText("");
      // setIsLoading(true);
      // setObjectiveList([userSelectedObjective]);
      setSelectedObjectiveStore(userSelectedObjective);
      updateSelectedObjectiveSources(userSelectedObjective);
      const currentSession = useAICreationSessionStore.getState().getSession();
      const botMessage = hasClickedOnAddmore
        ? t("selectObjective.enterObjective")
        : {
            role: BOT,
            message:
              t("selectObjective.theseAreSomeObjectives") +
              " " +
              t("selectObjective.selectObjective") +
              " " +
              JSON.stringify(useAICreationSessionStore.getState().getObjective()),
            messageId: "4_0",
          };


      const chunks = JSON.parse(useAICreationSessionStore.getState().getChunks());

      saveUserChatsInDB(
        botMessage?.message,
        currentSession,
        botMessage?.role,
        chunks
      )
        .then(() => {
          saveUserChatsInDB(userSelectedObjective, currentSession, "user");
        })
        .then(() => {
          setCurrentPageValue(2);
        })
        .catch((error) => {
          console.error("Error saving chats:", error);
        });
    }
  };

  function handleInputText(e) {
    setInputText(e?.target?.value);
  }

  async function handleInputSend() {
    try {
      if (!inputText || inputText === "") {
        setErrorText(t("selectObjective.emptyObjective"));
        setTimeout(() => {
          setErrorText("");
        }, 3000);
      } else {
        // setIsLoading(true);
        const profile_id = useAICreationSessionStore.getState().getProfileId();
        const validate_response = await validateObjective(
          inputText,
          language,
          profile_id
        );
        // setIsLoading(false);
        if (validate_response?.result) {
          setHasClickedObjAddMore(true)
          handleNextClick();
        } else {
          setErrorText(validate_response?.error_message);
        }
      }
    } catch (error) {
      const errorMessage =
        useAICreationSessionStore.getState().getSystemError() || t("common.pleaseTryAgainLater");

      setErrorText(errorMessage);
      setTimeout(() => {
        setErrorText("");
      }, 10000);
      // setIsLoading(false);
      console.error(error);
    }
  }

  function localHandleGoBack(index) {
    if (isInReadOnlyMode && hasClickedOnAddmore) {
      setHasClickedOnAddmore(false);
      setErrorText("");
      setHasClickedObjAddMore(false)
    } else {
      handleGoBack(index);
    }
  }

  const selectedObjective = useAICreationSessionStore.getState().getSelectedObjective() || null;

  if (getLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST)) {
    return <LoadingChat />;
  }



  const handleOnInputText = (e) => {
    e.preventDefault();
    setTextMessage(e.target.value);
  };

  console.log({objectiveSource, selectedObjective})

  const separatorIndex = objectiveChatHistory?.findIndex(item => item?.source === "SEPARATOR");

  const beforeObjectiveHistory = separatorIndex !== -1 ?objectiveChatHistory?.slice(0, separatorIndex) : []
  const afterObjectiveHistory = separatorIndex !== -1 ?objectiveChatHistory?.slice(separatorIndex + 1) : objectiveChatHistory;

  console.log({beforeObjectiveHistory, afterObjectiveHistory})

  return (
    <>
      <div>
        <div className="secondpage-bot-div">
          <BotMessage primaryMessage={t("selectObjective.theseAreSomeObjectives")} secondaryMessage={t("selectObjective.selectObjective")} />
          {!isNewlyGeneratedList && <div className="secondpage-obj-fixed">
            <div className="mt-3">
              <p className="secondpage-obj-text">{t("selectObjective.title")}</p>
              {!!(!fetchError || fetchError === "") && <ObjectivesCard objectiveList={objectiveList} visibleCount={visibleCount} selectedIndex={selectedIndex} handleObjectiveClick={handleObjectiveClick} selectedObjective={selectedObjective} isSelectObjectiveSection={isSelectObjectiveSection} objectiveSource={objectiveSource} />}
              {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
            </div>
            {isSelectObjectiveSection && (
              <SuggestOrAddCta
                showSuggestMoreButton={visibleCount < objectiveList?.length}
                handleSuggestMore={handleSuggestMore}
                language={language}
                handleAddOwnClick={() => {
                  setInputText({})
                  localStorage.removeItem("selected_objective")
                  setHasClickedOnAddmore(true)
                }}
                showAddOwnButton={false}
              />
            )}
          </div>}
          {isNewlyGeneratedList && <div>Previous Objectives List</div>}

        </div>

        <div className="flex flex-col h-auto">
          {beforeObjectiveHistory?.length > 0 && (
            <ChatWindow
              chatHistory={beforeObjectiveHistory}
            />
          )}

          {isNewlyGeneratedList && (
            <div>
              <BotMessage primaryMessage={t("selectObjective.theseAreSomeObjectives")} secondaryMessage={t("selectObjective.selectObjective")} />
              <div className="secondpage-obj-fixed">
                <div className="mt-3">
                  <p className="secondpage-obj-text">{t("selectObjective.title")}</p>
                  {!!(!fetchError || fetchError === "") && <ObjectivesCard objectiveList={objectiveList} visibleCount={visibleCount} selectedIndex={selectedIndex} handleObjectiveClick={handleObjectiveClick} selectedObjective={selectedObjective} isSelectObjectiveSection={isSelectObjectiveSection} objectiveSource={objectiveSource} />}
                  {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
                </div>
                {isSelectObjectiveSection && (
                  <SuggestOrAddCta
                    showSuggestMoreButton={visibleCount < objectiveList?.length}
                    handleSuggestMore={handleSuggestMore}
                    language={language}
                    handleAddOwnClick={() => {
                      setInputText({})
                      localStorage.removeItem("selected_objective")
                      setHasClickedOnAddmore(true)
                    }}
                    showAddOwnButton={false}
                  />
                )}
              </div>
            </div>
          )}

          {afterObjectiveHistory?.length > 0 && (
            <ChatWindow
              chatHistory={afterObjectiveHistory}
            />
          )}

          {!selectedObjective && !isNewlyGeneratedList ? <div className="mt-auto">
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
          </div> : <UserMessage message={selectedObjective}/>}
        </div>

        {/* {!isSelectObjectiveSection && (
                
        )} */}
      </div>
    </>
  )
}

export default SelectObjective;
