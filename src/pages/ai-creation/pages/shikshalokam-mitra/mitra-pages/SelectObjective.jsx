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
import { IoArrowForward } from "react-icons/io5";
/* icons for editable objectives */
import { TbTrashOff } from "react-icons/tb";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import TextareaWithVoice from "../../../components/textarea-with-mic";
import { getOrTextTranslation } from "../question script/secondpage_tanslation";
import Disclaimer from "./components/Disclaimer";
import Guidelines from "./components/Guidelines";

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
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [selectedObjectives, setSelectedObjectives] = useState([]);
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
      const storedSelectedObjectives = useAICreationSessionStore.getState().getSelectedObjective();
      
      // Handle both single string (legacy) and array of strings
      const selectedObjectivesArray = Array.isArray(storedSelectedObjectives) 
        ? storedSelectedObjectives 
        : (storedSelectedObjectives ? [storedSelectedObjectives] : []);

      // Find indices of all selected objectives
      const indices = selectedObjectivesArray
        .map(obj => objectiveList.findIndex(o => o?.text === obj || o === obj))
        .filter(idx => idx !== -1);
      
      setSelectedIndices(indices);
      setSelectedObjectives(indices.map(idx => objectiveList[idx]));
      
      const maxSelectedIndex = Math.max(...indices, -1);
      return maxSelectedIndex !== -1 && maxSelectedIndex > defaultValueToShow - 1
        ? maxSelectedIndex + 1
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
    disconnect
  } = useChatWebhook(
    buildWebSocketUrl({
      searchParams,
      storageFlow,
      selectedType,
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
      const storedSelected = useAICreationSessionStore.getState().getSelectedObjective();
      // Handle both legacy single string and new array format
      const selectedArray = Array.isArray(storedSelected) 
        ? storedSelected 
        : (storedSelected ? [storedSelected] : []);
      setSelectedObjectives(selectedArray.map(text => ({ text })));
      setHasClickedOnAddmore(useAICreationSessionStore.getState().getHasClickedObjAddMore());
      // setIsLoading(false);
    }
  }, [isInReadOnlyMode]);

  const handleObjectiveClick = (index) => {
    setSelectedIndices(prevIndices => {
      const isAlreadySelected = prevIndices.includes(index);
      if (isAlreadySelected) {
        // Remove from selection
        return prevIndices.filter(i => i !== index);
      } else {
        // Add to selection
        return [...prevIndices, index];
      }
    });

    setSelectedObjectives(prevObjectives => {
      const objective = objectiveList[index];
      const isAlreadySelected = prevObjectives.some(obj => obj?.text === objective?.text);
      if (isAlreadySelected) {
        // Remove from selection
        return prevObjectives.filter(obj => obj?.text !== objective?.text);
      } else {
        // Add to selection
        return [...prevObjectives, objective];
      }
    });
  };

  function updateSelectedObjectiveSources(selectedObjectiveTexts) {
    const store = useAICreationSessionStore.getState();
    const objectives = store.getObjective() || [];
    const setSelectedObjectiveSource = store.setSelectedObjectiveSource;

    // Handle both single string and array of strings for backwards compatibility
    const textsArray = Array.isArray(selectedObjectiveTexts) 
      ? selectedObjectiveTexts 
      : [selectedObjectiveTexts];

    const finalSources = [];
    const seen = new Set();

    textsArray.forEach(selectedText => {
      const matchedObjective = objectives.find(
        (o) => o.text === selectedText
      );

      (matchedObjective?.sources || []).forEach(src => {
        if (src?.url && !seen.has(src.url)) {
          seen.add(src.url);
          finalSources.push(src);
        }
      });
    });

    setSelectedObjectiveSource(finalSources);
    return finalSources;
  }

  const handleNextClick = (objectives = [], customObjective = false) => {
    // Handle both single objective (for backwards compatibility) and array of objectives
    const objectivesArray = (Array.isArray(objectives) && objectives.length > 0)
      ? objectives 
      : (objectives?.text ? [objectives] : selectedObjectives);

    // Extract text from each objective
    const userSelectedObjectives = objectivesArray
      .map(obj => obj?.text?.trim())
      .filter(text => text?.length > 0);

    if (userSelectedObjectives.length > 0) {
      setErrorText("");

      // setIsLoading(true);
      // setObjectiveList([userSelectedObjectives]);
      setSelectedObjectiveStore(userSelectedObjectives);
      updateSelectedObjectiveSources(userSelectedObjectives);
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

      // Join all selected objectives for saving to DB
      const objectivesText = userSelectedObjectives.join(", ");

      saveUserChatsInDB(
        objectivesText,
        currentSession,
        botMessage?.role,
        chunks
      )
        .then(() => {
          saveUserChatsInDB(objectivesText, currentSession, "user");
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
    // For custom text input, set as a single objective
    setSelectedObjectives([{ text: e?.target?.value }]);
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
          setSelectedObjectives([{text: inputText}])
          handleNextClick([{text: inputText}], true);
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

  if (getLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST)) {
    return <LoadingChat />
  }



  const handleOnInputText = (e) => {
    e.preventDefault();
    setTextMessage(e.target.value);
  };


  const handleAddOwnObjective = () => {
    setSelectedObjectives([])
    setSelectedIndices([])
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

  // Check if any objectives are selected (works with both local state and store)
  const hasSelectedObjectives = selectedIndices.length > 0 || 
    (Array.isArray(selectedObjective) ? selectedObjective.length > 0 : !!selectedObjective);
  const isNextDisabled = !hasSelectedObjectives;


  return (
    <>
      <div>
        <div className="secondpage-bot-div ">
          {hasClickedOnAddmore && chatSections.length === 1 && isSelectObjectiveSection ? (
            <FinalObjectivePage
              objectiveListArray={objectiveList}
              handleContinueClick={(objectives) => handleNextClick(objectives, true)}
              errorText={errorText}
              setErrorText={setErrorText}
              hasClickedOnAddmore={hasClickedOnAddmore}
              isSelectObjectiveSection={isSelectObjectiveSection}
              setHasClickedOnAddmore={setHasClickedOnAddmore}
            />
          ) : (
            <>
              {/* Only show initial objectives if there are no separators (no regenerations) */}
              {separators.length === 0 && (
                <>
                  <BotMessage primaryMessage={t("selectObjective.theseAreSomeObjectives")} secondaryMessage={t("selectObjective.selectObjective")} />
                  <div className="mb-4">
                  <Guidelines text={t("selectObjective.guidelines")} />
                    
                  </div>
                  <div className="secondpage-obj-fixed bg-white p-3 rounded-2xl">
                    <div className="mt-3">
                      <p className="secondpage-obj-text">{t("selectObjective.title")}</p>
                      {!!(!fetchError || fetchError === "") && <ObjectivesCard objectiveList={objectiveList} visibleCount={visibleCount} selectedIndices={selectedIndices} handleObjectiveClick={handleObjectiveClick} selectedObjective={selectedObjective} isSelectObjectiveSection={isSelectObjectiveSection} objectiveSource={objectiveSource} />}
                      {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
                      <div className="w-[90%]">
                        <Disclaimer text={t('disclaimer.objectivesText')} />
                      </div>
                    </div>
                    {isSelectObjectiveSection && <SuggestOrAddCta showSuggestMoreButton={visibleCount < objectiveList?.length} handleSuggestMore={handleSuggestMore} language={language} handleAddOwnClick={handleAddOwnObjective} showAddOwnButton={true} />}

                    {isSelectObjectiveSection && (
                      <div className="thirdpage-continue-div">
                            <button
                              className={`thirdpage-select-bttn ${isNextDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                              onClick={() => {
                                handleNextClick()
                              }}
                              disabled={isNextDisabled}
                            >
                              {hasClickedOnAddmore ? t("common.continue") : t("common.next")}
                              <IoArrowForward className="thirdpage-cont-arrow-icon" />
                            </button>
                          </div>
                    )}
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
                  ) : hasClickedOnAddmore && sectionIndex === chatSections.length -1 && isSelectObjectiveSection ? (
                    <FinalObjectivePage
                      objectiveListArray={sectionObjectives}
                      handleContinueClick={(objectives) => handleNextClick(objectives, true)}
                      errorText={errorText}
                      setErrorText={setErrorText}
                      hasClickedOnAddmore={hasClickedOnAddmore}
                      isSelectObjectiveSection={isSelectObjectiveSection}
                      setHasClickedOnAddmore={setHasClickedOnAddmore}
                    />
                  ) : (
                    <div>
                      <BotMessage primaryMessage={t("selectObjective.theseAreSomeObjectives")} secondaryMessage={t("selectObjective.selectObjective")} />
                      <div className="mb-4">
                        <Guidelines text={t("selectObjective.guidelines")} />
                      </div>
                      <div className="secondpage-obj-fixed bg-white p-3 rounded-2xl">
                        <div className="mt-3">
                          <p className="secondpage-obj-text">{t("selectObjective.title")}</p>

                          {!!(!fetchError || fetchError === "") && <ObjectivesCard objectiveList={sectionObjectives} visibleCount={visibleCount} selectedIndices={selectedIndices} handleObjectiveClick={handleObjectiveClick} selectedObjective={selectedObjective} isSelectObjectiveSection={isSelectObjectiveSection} objectiveSource={sectionSources} />}
                          {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
                          <div className="w-[90%]">
                            <Disclaimer text={t('disclaimer.objectivesText')} />
                          </div>
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

                      {isSelectObjectiveSection && (
                        <div className="thirdpage-continue-div">
                            <button
                              className={`thirdpage-select-bttn ${isNextDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                              onClick={() => {
                                handleNextClick()
                              }}
                              disabled={isNextDisabled}
                            >
                              {hasClickedOnAddmore ? t("common.continue") : t("common.next")}
                              <IoArrowForward className="thirdpage-cont-arrow-icon" />
                            </button>
                          </div>
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
            <></>
          ) : !isOwnObjective && (
            <div className={`div35 label1`}>
              <div className={`div36 div37`}>
                <ChatMessage 
                  message={Array.isArray(selectedObjective) ? selectedObjective.join(" and ") : selectedObjective} 
                  userType={CONVERSATION_USER_TYPES.USER} 
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  )
}

export function FinalObjectivePage({
  objectiveListArray,
  handleContinueClick,
  errorText,
  setErrorText,
  isSelectObjectiveSection,
  setHasClickedOnAddmore,
}) {
  const { t } = useTranslation("ai_creation_translation");
  const [objectiveList, setObjectiveList] = useState(() => {
    // Initialize with generated objectives or empty list
    if (objectiveListArray && objectiveListArray.length > 0) {
      return objectiveListArray.map((obj, index) => ({
        id: `obj-${index}-${Date.now()}`,
        content: obj?.text || obj || ""
      }));
    }
    return [{ id: Date.now().toString(), content: "" }];
  });
  const [isFetchingData, setIsFetchingData] = useState(false);

  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || "en";
  const language = preferredLanguage.value || "en";

  const handleInputChange = (id, value) => {
    setObjectiveList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content: value } : item))
    );
  };

  const handleDelete = (id) => {
    if (objectiveList && objectiveList.length <= 1) return;
    setObjectiveList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddObjective = () => {
    setObjectiveList((prev) => [
      ...prev,
      { id: Date.now().toString(), content: "" },
    ]);
  };

  const handleValidateAndContinue = async () => {
    try {
      setIsFetchingData(true);
      setErrorText("");

      // Get objectives to validate
      const objectivesToValidate = objectiveList
        .filter(obj => obj.content?.trim())
        .map(obj => obj.content.trim());

      const profile_id = useAICreationSessionStore.getState().getProfileId();

      // Validate all objectives
      const validate_response = await validateObjective(
        objectivesToValidate,
        language,
        profile_id
      );

      setIsFetchingData(false);

      if (validate_response?.result === "false" || validate_response?.result === false) {
        setErrorText(validate_response?.error_message || t("common.pleaseTryAgainLater"));
        return;
      }

      // If validation passes, proceed with the objectives
      const objectives = objectiveList
        .filter(obj => obj.content?.trim())
        .map(obj => ({ text: obj.content.trim() }));
      handleContinueClick(objectives);

    } catch (error) {
      const errorMessage =
        useAICreationSessionStore.getState().getSystemError() || t("common.pleaseTryAgainLater");
      setErrorText(errorMessage);
      setIsFetchingData(false);
      setTimeout(() => {
        setErrorText("");
      }, 10000);
      console.error("Error validating objectives:", error);
    }
  };

  // isContinueDisabled should be true if all the objective contents are empty or fetching data
  const isContinueDisabled = objectiveList.every((obj) => !obj.content?.trim()) || isFetchingData;

  return (
    <div className="final-action-page mt-3">
      <BotMessage 
        primaryMessage={t("selectObjective.craftYourOwnObjectives")} 
        secondaryMessage={t("selectObjective.addEditObjectives")} 
      />
      <div className="secondpage-obj-fixed">
        <div className="secondpage-obj-div">
          <p className="secondpage-obj-text">{t("selectObjective.title")}</p>
          <div className="thirdpage-error-div">
            <p className="secondpage-valid-text">{t("selectObjective.pleaseAddAtLeastOneObjective")}</p>
          </div>
          {errorText && errorText !== "" && <ErrorText errorText={errorText} />}
          
          <div>
            {objectiveList.map((objective, index) => (
              <div key={objective.id} className="action-box">
                <TextareaWithVoice 
                  value={objective.content || ""} 
                  placeholder={t("selectObjective.writeObjectiveHere")} 
                  disabled={!isSelectObjectiveSection || isFetchingData} 
                  onChange={text => handleInputChange(objective.id, text)} 
                  className="final-action-input" 
                />
                {objectiveList.length > 1 && !isFetchingData ? (
                  <FiTrash2
                    className="delete-icon"
                    onClick={e => {
                      e.stopPropagation();
                      if (isSelectObjectiveSection) {
                        handleDelete(objective.id);
                      }
                    }}
                    disabled={!isSelectObjectiveSection || isFetchingData}
                  />
                ) : (
                  <TbTrashOff className="delete-icon-disable" />
                )}
              </div>
            ))}
          </div>

          {isSelectObjectiveSection && (
            <>
              <div className="secondpage-add-div1">
                <button
                  className="flex items-center font-sans font-normal text-base leading-[1.4] text-right text-[#1177FF]"
                  onClick={() => {
                    handleAddObjective();
                  }}
                  disabled={isFetchingData}
                >
                  <FiPlusCircle className="secondpage-plus-icon" />
                  {t("selectObjective.addObjective")}
                </button>
              </div>

              <div className="secondpage-add-div1 mt-0">
                <p className="secondpage-or-text">{getOrTextTranslation(language)}</p>
              </div>

              <div className="secondpage-add-div1 mt-0">
                <button
                  onClick={() => {
                    setHasClickedOnAddmore(false);
                  }}
                  className="flex items-center font-sans font-normal text-base leading-[1.4] text-right text-[#1177FF]"
                  disabled={isFetchingData}
                >
                  {t("selectObjective.goBack")}
                </button>
              </div>

              <div className="thirdpage-continue-div">
                <button
                  className={`thirdpage-select-bttn ${isContinueDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  onClick={handleValidateAndContinue}
                  disabled={isContinueDisabled}
                >
                  {t("common.continue")}
                  <IoArrowForward className="thirdpage-cont-arrow-icon" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectObjective;
