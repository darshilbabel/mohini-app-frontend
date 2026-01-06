import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

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
import ChatMessage from "./components/chat-message/ChatMessage";
import LoadingChat from "./components/LoadingChat";

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
  const [objectiveList, setObjectiveList] = useState(() => {
    const storedObjective = useAICreationSessionStore.getState().getObjective();
    if (storedObjective?.length > 0) {
      return storedObjective
    }
    else return []
  });
  const [prevObjectiveList, setPrevObjectiveList] = useState(() => {
    const storedPrevObjective = useAICreationSessionStore.getState().getPrevObjective();
    if (storedPrevObjective?.length > 0) {
      return storedPrevObjective
    }
    else return []
  });
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
  const [prevObjectiveSource, setPrevObjectiveSource] = useState([]);
  const textInputRef = useRef(null);
  const [textMessage, setTextMessage] = useState("");
  const [useTextbox, setUseTextbox] = useState(false);
  const [isNewlyGeneratedList, setIsNewlyGeneratedList] = useState(() => {
    const storedPrevObjective = useAICreationSessionStore.getState().getPrevObjective();
    if (storedPrevObjective?.length > 0) {
      return true
    }
    else return false
  })
  const [objectiveListLoading, setObjectiveListLoading] = useState(false)
  const [prevObjectiveShown, setPrevObjectiveShown] = useState(() => {
    const isPrevObjectiveShown = useAICreationSessionStore.getState().getIsPrevObjectiveShown();
    if (isPrevObjectiveShown) {
      return true
    }
    else return false;
  })

  const localChatHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()
  const isOwnObjective = useAICreationSessionStore.getState().getIsOwnObjective();

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
  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || "en";
  const language = preferredLanguage.value || "en";
  const { setObjective: setObjectiveStore, setPrevObjective: setPrevObjectiveStore, setPrevObjectiveSource: setPrevObjectiveSourceStore, setObjectiveSource: setObjectiveSourceStore, setChunks: setChunksStore, setSelectedObjective: setSelectedObjectiveStore, setHasClickedObjAddMore, setIsOwnObjective, setObjectListRetries, setIsPrevObjectiveShown: setIsPrevObjectiveShownStore, setErrorText: setErrorTextStore } = useAICreationSessionStore.getState()

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


          setErrorTextStore("")


          if(createNew) {
            setIsNewlyGeneratedList(true)
          }


          setObjectiveList(objective_list);
          setObjectiveStore(objective_list)


          const transformedSource = transformSource(
            objective_list
          );



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
       error?.response?.data?.message || t("common.pleaseTryAgainLater")
      );

      setErrorTextStore(error?.response?.data?.message || t("common.pleaseTryAgainLater"))
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

      // Get current objective list from store to avoid stale closure
      const currentObjectiveList = useAICreationSessionStore.getState().getObjective() || []
      const currentObjectiveSource = useAICreationSessionStore.getState().getObjectiveSource()

      // Store the objective list data IN the separator message
      const newMessage = {
        msg: "",
        source: "SEPARATOR",
        updated_at: Date.now(),
        objectiveListData: {
          objectives: currentObjectiveList,
          sources: currentObjectiveSource
        }
      }
      
      setObjectiveChatHistory(prev => [...prev, newMessage])
      // Update store - get current value first, then set new value
      const currentStoreHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()
      useAICreationSessionStore.getState().setObjectiveChatHistory([...currentStoreHistory, newMessage])

      setPrevObjectiveStore(currentObjectiveList)
      setPrevObjectiveList(currentObjectiveList)
      setPrevObjectiveSourceStore(currentObjectiveSource)
      setObjectListRetries(useAICreationSessionStore.getState().getObjectListRetries() + 1)
      setPrevObjectiveShown(false)
      setIsPrevObjectiveShownStore(false)
      setSelectedObjectiveStore(null)

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
    disconnect
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

    return () => {
      disconnect();
    }
  }, [disconnect])


  

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

    if(hasClickedOnAddmore) {
      handleInputSend(textMessage)
      setIsOwnObjective(true)
      setHasClickedOnAddmore(false)
    }
    else {
      sendSocketMessage({
        text: textMessage,
        context: "",
        // asr_audio: asrAudio,
      })
    }
    

    handleScrollIntoView();
    setTextMessage("")
  }

  useEffect(() => {

    const storedObjective = useAICreationSessionStore.getState().getObjective();


    if(!storedObjective)
      fetchObjectiveList();

    const storedObjectiveSource = useAICreationSessionStore.getState().getObjectiveSource();
    const storedPrevObjectiveSource = useAICreationSessionStore.getState().getPrevObjectiveSource();

    if (storedObjectiveSource) {
      setObjectiveSource(storedObjectiveSource);
    }
    if (storedPrevObjectiveSource) {
      setPrevObjectiveSource(storedPrevObjectiveSource);
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

  const handleNextClick = (text = '', customObjective = false) => {


    const finalText = text ?? inputText;


    const userSelectedObjective = finalText?.text?.trim();

    if (userSelectedObjective?.trim()?.length > 0) {
      setErrorText("");

      // setIsLoading(true);
      // setObjectiveList([userSelectedObjective]);
      setSelectedObjectiveStore(userSelectedObjective);
      updateSelectedObjectiveSources(userSelectedObjective);
      const currentSession = useAICreationSessionStore.getState().getSession();
      const botMessage = hasClickedOnAddmore && !customObjective
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
        userSelectedObjective,
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

  async function handleInputSend(inputText = '') {
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
          setInputText(inputText)
          handleNextClick({text: inputText}, true);
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

  const selectedObjective = useAICreationSessionStore(
    state => state.selectedObjective
  ) || null;

  if (getLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST) && !prevObjectiveList?.length) {
    return <></>;
  }
  else if(getLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST) && prevObjectiveList?.length) {
    return <LoadingChat />
  }



  const handleOnInputText = (e) => {
    e.preventDefault();
    setTextMessage(e.target.value);
  };


  const handleAddOwnObjective = () => {
    setInputText({})
    setHasClickedOnAddmore(true)
  }

  // Find all separator messages with their data
  const separators = [];
  objectiveChatHistory?.forEach((item, index) => {
    if (item?.source === "SEPARATOR") {
      separators.push({
        index,
        objectives: item?.objectiveListData?.objectives || prevObjectiveList,
        sources: item?.objectiveListData?.sources || useAICreationSessionStore.getState().getPrevObjectiveSource()
      });
    }
  });

  // Create sections: chat history between separators
  const chatSections = [];
  
  if (separators.length === 0) {
    // No separators, all chat history goes in one section
    chatSections.push({
      chatHistory: objectiveChatHistory,
      showObjectives: false,
      objectiveListData: null
    });
  } else {
    // Before first separator
    if (separators[0].index > 0) {
      chatSections.push({
        chatHistory: objectiveChatHistory.slice(0, separators[0].index),
        showObjectives: false,
        objectiveListData: null
      });
    }

    // Between separators and after last separator
    for (let i = 0; i < separators.length; i++) {
      const currentSeparator = separators[i];
      const nextSeparator = separators[i + 1];
      
      // Add objective list for this separator
      chatSections.push({
        chatHistory: [],
        showObjectives: true,
        objectiveListData: {
          isLatest: i === separators.length - 1,
          sectionIndex: i,
          objectives: currentSeparator.objectives,
          sources: currentSeparator.sources
        }
      });

      // Add chat history after this separator until next separator (or end)
      const endIndex = nextSeparator?.index || objectiveChatHistory.length;
      if (currentSeparator.index + 1 < endIndex) {
        chatSections.push({
          chatHistory: objectiveChatHistory.slice(currentSeparator.index + 1, endIndex),
          showObjectives: false,
          objectiveListData: null
        });
      }
    }
  }



  return (
    <>
      <div>
        <div className="secondpage-bot-div ">
          {hasClickedOnAddmore && chatSections.length === 1 ? (
            <div>
              <BotMessage primaryMessage={t("selectObjective.enterObjective")} />
              {(!selectedObjective || isSelectObjectiveSection) && <button onClick={() => setHasClickedOnAddmore(false)} className="flex items-center font-sans font-normal text-base leading-[1.4] text-right text-[#1177FF] mx-auto">
                {t("selectObjective.goBack")}
              </button>}
            </div>
          ) : (
            <>
              {/* Only show initial objectives if there are no separators (no regenerations) */}
              {separators.length === 0 && (
                <>
                  <BotMessage primaryMessage={t("selectObjective.theseAreSomeObjectives")} secondaryMessage={t("selectObjective.selectObjective")} />
                  <div className="secondpage-obj-fixed bg-white p-3 rounded-2xl">
                    <div className="mt-3">
                      <p className="secondpage-obj-text">{t("selectObjective.title")}</p>
                      {!!(!fetchError || fetchError === "") && <ObjectivesCard objectiveList={objectiveList} visibleCount={visibleCount} selectedIndex={selectedIndex} handleObjectiveClick={handleObjectiveClick} selectedObjective={selectedObjective} isSelectObjectiveSection={isSelectObjectiveSection} objectiveSource={objectiveSource} />}
                      {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
                    </div>
                    {isSelectObjectiveSection && <SuggestOrAddCta showSuggestMoreButton={visibleCount < objectiveList?.length} handleSuggestMore={handleSuggestMore} language={language} handleAddOwnClick={handleAddOwnObjective} showAddOwnButton={true} />}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col h-auto">
          {chatSections.map((section, sectionIndex) => {

            const isLatestList = section.objectiveListData?.isLatest || false;


            // For previous objective lists, just show simple text
            if (!isLatestList && section?.showObjectives) {
              return (
                <div key={`objectives-${sectionIndex}`} className="my-4">
                  <BotMessage primaryMessage="Previous objectives list" />
                </div>
              );
            }
            if (section.showObjectives) {
              // This is an objectives section

              
              // For previous objective lists, just show simple text
              // if (!isLatestList) {
              //   return (
              //     <div key={`objectives-${sectionIndex}`} className="my-4">
              //       <BotMessage primaryMessage="Previous objectives list" />
              //     </div>
              //   );
              // }
              
              // For latest list, show full objectives card

              const sectionObjectives = prevObjectiveShown ? prevObjectiveList : objectiveList;
              const sectionSources = prevObjectiveShown ? useAICreationSessionStore.getState().getPrevObjectiveSource() : objectiveSource;
              
              return (
                <div key={`objectives-${sectionIndex}`}>
                  {objectiveListLoading ? (
                    <LoadingChat />
                  ) : hasClickedOnAddmore && sectionIndex === chatSections.length -1 ? (
                    <>
                      <div>
                        <BotMessage primaryMessage={t("selectObjective.enterObjective")} />
                        {(!selectedObjective || isSelectObjectiveSection) && (
                          <button onClick={() => setHasClickedOnAddmore(false)} className="flex items-center font-sans font-normal text-base leading-[1.4] text-right text-[#1177FF] mx-auto">
                            {t("selectObjective.goBack")}
                          </button>
                        )}
                        <div className="mt-3">{errorText && <p>{errorText}</p>}</div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <BotMessage primaryMessage={t("selectObjective.theseAreSomeObjectives")} secondaryMessage={t("selectObjective.selectObjective")} />
                      <div className="secondpage-obj-fixed bg-white p-3 rounded-2xl">
                        <div className="mt-3">
                          <p className="secondpage-obj-text">{t("selectObjective.title")}</p>

                          {!!(!fetchError || fetchError === "") && <ObjectivesCard objectiveList={sectionObjectives} visibleCount={visibleCount} selectedIndex={selectedIndex} handleObjectiveClick={handleObjectiveClick} selectedObjective={selectedObjective} isSelectObjectiveSection={isSelectObjectiveSection} objectiveSource={sectionSources} />}
                          {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
                        </div>
                        {isSelectObjectiveSection && (
                          <SuggestOrAddCta
                            showSuggestMoreButton={visibleCount < objectiveList?.length}
                            handleSuggestMore={handleSuggestMore}
                            language={language}
                            handleAddOwnClick={handleAddOwnObjective}
                            showAddOwnButton={true}
                            showAdditionalCTA={!prevObjectiveShown && separators.length > 0}
                            additionCTAText={t("selectObjective.showPrevious")}
                            handleAdditionalCTAClick={() => {
                              setObjectiveList(prevObjectiveList)
                              setObjectiveSource(useAICreationSessionStore.getState().getPrevObjectiveSource())
                              setPrevObjectiveShown(true)
                              setIsPrevObjectiveShownStore(true)
                              setObjectiveListLoading(true)
                              setSelectedObjectiveStore(null)

                              setTimeout(() => {
                                setObjectiveListLoading(false)
                              }, 1000)
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            } else if (section.chatHistory?.length > 0 && !hasClickedOnAddmore) {
              // This is a chat history section
              return (
                <ChatWindow 
                  key={`chat-${sectionIndex}`}
                  chatHistory={section.chatHistory} 
                  page={2} 
                />
              );
            }
            return null;
          })}

          {isSelectObjectiveSection ? (
            <div className="mt-5">
              <ChatBox
                textInputRef={textInputRef}
                textMessage={textMessage}
                handleOnInputText={handleOnInputText}
                setUseTextbox={setUseTextbox}
                handleSendMessage={handleSendMessage}
                isReadOnly={false}
              />
            </div>
          ) : !isOwnObjective && (
            // <></>
            <div className={`div35 label1`}>
              <div className={`div36 div37`}>
                <ChatMessage message={selectedObjective} userType={CONVERSATION_USER_TYPES.USER} />
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  )
}

export default SelectObjective;
