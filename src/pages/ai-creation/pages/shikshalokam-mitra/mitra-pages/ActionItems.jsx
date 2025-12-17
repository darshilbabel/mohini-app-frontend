import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
/* icons */
import { PiDotsSixVerticalBold } from "react-icons/pi";
import { TbTrashOff } from "react-icons/tb";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
/* utils and api services */

import {
  getActionList,
  saveUserChatsInDB,
  validateActionList,
} from "../../../../../api/endpoints/chat_flow";
import { transformActionListSources } from "../../../utils/mitra-chat";
/* components */
import ActionItemsList from "./components/action-items/ActionItemsList";
import UserMessage from "./components/chat-message/UserMessage";
import LoadingChat from "./components/LoadingChat";
import BotMessage from "./components/chat-message/BotMessage";
import SuggestOrAddCta from "./components/SuggestOrAddCta";
import ErrorText from "./components/ErrorText";
import Source from "./components/Source";
/* constants */
import { LOADER_KEYS } from "../../../constants/common";
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants";
/* styles */
import "../stylesheet/chatStyle.css";
import { useAICreationSessionStore } from "store";
import ChatWindow from "./components/ChatWindow";
import ChatBox from "./components/ChatBox";
import { useSearchParams } from "react-router-dom";
import { sessionFlowName } from "../../../../ShikshalokamVoiceChat/enum";
import { bot_routes } from "../../../../../configure";
import { useChatWebhook } from "../../../../../hooks/useChatWebhook";
import { buildWebSocketUrl } from "../../../../../utils/helpers";
import { ShowLoader } from "../MainPage";
import ChatMessage from "./components/chat-message/ChatMessage";

const { BOT, USER } = CONVERSATION_USER_TYPES;

function ActionItems({
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  setIsLoading,
  isLoading,
  handleGoBack,
  setCurrentPageValue,
  handleGoForward,
  setChatHistory,
  errorText,
  setErrorText,
  isSelectActionItems,
  handleScrollIntoView,
  handleLoaderState,
  getLoaderState,
}) {
  const { t } = useTranslation("ai_creation_translation");
  const [actionList, setActionList] = useState([]);

  const [visibleCount, setVisibleCount] = useState(false);
  const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [wantsToMoveForward, setWantsToMoveForward] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [actionItemSource, setActionItemSource] = useState({});
  useEffect(() => {
    const storedActionItemSource =
      useAICreationSessionStore.getState().getActionItemSource()
    if (storedActionItemSource) {
      setActionItemSource(storedActionItemSource);
    }
    if (isSelectActionItems) handleScrollIntoView();
  }, []);
  const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(() => {
    const storedActionList = useAICreationSessionStore.getState().getSelectedAction();
    if (storedActionList) {
      if (storedActionList.length === 1) {
        return true;
      }
    }
    return false;
  });

  const textInputRef = useRef(null);
  const [textMessage, setTextMessage] = useState("");
  const [isNewlyGeneratedList, setIsNewlyGeneratedList] = useState(false)
  const [useTextbox, setUseTextbox] = useState(false);

  const localChatHistory = useAICreationSessionStore.getState().getActionListChatHistory()

  const [actionListChatHistory, setActionListChatHistory] = useState(
    !!localChatHistory?.length ? localChatHistory : []
  );
  const [searchParams] = useSearchParams()
  const storageFlow = sessionFlowName.Creation;
  const selectedType = ""
  const wss_protocol = "wss://"
  const sessionId = useAICreationSessionStore.getState().getSession();

  const { setActionList: setActionListStore, setActionItemSource: setActionItemSourceStore, setSelectedAction: setSelectedActionStore } = useAICreationSessionStore.getState()
  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || {}
  const language = preferredLanguage.value || "en";

  const { profileId, selectedAction } = useAICreationSessionStore.getState();
  const accessToken = sessionStorage.getItem("accToken");
  

  // ws logic

  const onWebSocketClose = useCallback(() => {
  }, [])

  const onWebSocketOpen = useCallback(() => {
    sendSocketMessage({
      type: "authenticate",
      sessionid: sessionId,
      profileid: profileId,
      access_token: accessToken,
      route: "en",
      bot_route: bot_routes.mitra_action_list,
      flow_name: storageFlow,
    })
  }, [sessionId, profileId, accessToken, preferredLanguage, storageFlow])

  const onWebSocketMessage = useCallback((event) => {
    const data = JSON.parse(event.data)
    const message = data?.text
  
    if (message?.msg && message?.source === "bot") {
      const newMessage = {
        msg: message.msg,
        source: "bot",
        updated_at: Date.now(),
      }
      
      setActionListChatHistory(prev => [...prev, newMessage])
      
      // Update store - get current value first, then set new value
      const currentStoreHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()
      useAICreationSessionStore.getState().setActionListChatHistory([...currentStoreHistory, newMessage])
      
      handleScrollIntoView();
    }
    else if(message?.source === "bot" && message?.extra_content?.should_move_forward === "yes" && message?.extra_content?.validation === "CREATE_NEW") {

      const newMessage = {
        msg: "",
        source: "SEPARATOR",
        updated_at: Date.now(),
      }
      
      setActionListChatHistory(prev => [...prev, newMessage])
      // Update store - get current value first, then set new value
      const currentStoreHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()
      useAICreationSessionStore.getState().setActionListChatHistory([...currentStoreHistory, newMessage])

      fetchActionList(true, message?.extra_content?.query)
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

    setActionListChatHistory(prev => [...prev, newMessage])

    // Update store - get current value first, then set new value
    const currentStoreHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()
    useAICreationSessionStore.getState().setActionListChatHistory([...currentStoreHistory, newMessage])
    
    sendSocketMessage({
      text: textMessage,
      context: "",
      // asr_audio: asrAudio,
    })

    handleScrollIntoView();
    setTextMessage("")
  }

  const defaultActionList = [
    {id: "0", content: t("actionItems.action1")},
    {id: "1", content: t("actionItems.action2")}
  ];

  const handleRightArrowClick = () => {
    setSelectedIndex((prevIndex) => {
      if (prevIndex < actionList.length - 1) {
        setSwipeDirection("right");
        return prevIndex + 1;
      }
      return prevIndex;
    });
  };

  const handleLeftArrowClick = () => {
    setSelectedIndex((prevIndex) => {
      if (prevIndex > 0) {
        setSwipeDirection("left");
        return prevIndex - 1;
      }
      return prevIndex;
    });
  };

  const handleSuggestMore = () => {
    setVisibleCount(true);
    handleScrollIntoView();
  };

  async function fetchActionList(createNew = false) {
    // setIsLoading(true);
    try {
      handleLoaderState(LOADER_KEYS.FETCH_ACTION_LIST, true);
      if (!actionList || actionList?.length === 0) {
        // setIsLoading(true);
        const userProblemStatement = useAICreationSessionStore.getState().getUserProblemStatement()
        const objective = useAICreationSessionStore.getState().getSelectedObjective()
        const profile_id = useAICreationSessionStore.getState().getProfileId()
        const fetchedActionList = await getActionList(
          userProblemStatement,
          objective,
          language,
          profile_id
        );

        const { message = "", action_list = [] } = fetchedActionList || {};

        if (action_list?.length > 0) {

          if(createNew) {
            // setPrevActionListStore(objectiveList)
            // setPrevActionList(objectiveList)
            setIsNewlyGeneratedList(true)
          }


          setActionList(action_list);
          setActionListStore(action_list)

          const transformedSource = transformActionListSources(action_list);

          setActionItemSource(transformedSource);
          setActionItemSourceStore(transformedSource)
          if (isSelectActionItems) handleScrollIntoView();
        } else {
          const errorMessage = message?.length > 0 ? message : (useAICreationSessionStore.getState().getSystemError() || t("common.pleaseTryAgainLater"));
          setFetchError(errorMessage);
          // window.location.reload();
        }
      }
    } catch (error) {
      setFetchError(
        useAICreationSessionStore.getState().getSystemError() ||
          t("common.pleaseTryAgainLater")
      );
      console.error(error);
    } finally {
      handleLoaderState(LOADER_KEYS.FETCH_ACTION_LIST, false);
    }
  }

  useEffect(() => {

    const storedActions = useAICreationSessionStore.getState().getActionList()

    if (Array.isArray(storedActions)) {
      setActionList(storedActions);
    } else {
      fetchActionList();
    }
  }, []);

  useEffect(() => {
    if (swipeDirection) {
      const timeout = setTimeout(() => setSwipeDirection(null), 500);
      return () => clearTimeout(timeout);
    }
  }, [swipeDirection]);

  // useEffect(() => {
  //   if (isInReadOnlyMode) {
  //     setIsLoading(true);
  //     setIsLoading(false);
  //   }
  // }, [isInReadOnlyMode]);

  const getActionListArray = () => {
    if (!isSelectActionItems || isInReadOnlyMode) {
      let stored_action = useAICreationSessionStore.getState().getSelectedAction()?.[0]?.actionSteps?.map((action, index) => ({
        id: index.toString(),
        content: action,
      }));


      return stored_action;
    } else {
      let arrayValue = defaultActionList;

      if (!hasClickedOnAddmore && actionList[selectedIndex]?.actionSteps) {
        arrayValue = actionList[selectedIndex]?.actionSteps.map(
          (step, index) => ({
            id: index.toString(),
            content: step,
          })
        );
      }

      return arrayValue;
    }
  };

  function updateSelectedActionPlanSources(selectedIndex) {
    const store = useAICreationSessionStore.getState();
    const actionList = store.getActionList() || [];
    const setSelectedActionSource = store.setSelectedActionSource;

    if (!Array.isArray(actionList) || !actionList[selectedIndex]) {
      setSelectedActionSource([]);
      return [];
    }

    const selectedPlan = actionList[selectedIndex];
    const finalSources = [];
    const seen = new Set();

    (selectedPlan?.actionSteps || []).forEach(step => {
      (step?.sources || []).forEach(src => {
        if (src?.url && !seen.has(src.url)) {
          seen.add(src.url);
          finalSources.push(src);
        }
      });
    });

    setSelectedActionSource(finalSources);
    return finalSources;
  }


  const isActionEmptyOrDefault = (action_to_store) => {

    if (!action_to_store || action_to_store.length === 0) {
      return true;
    }


    return action_to_store.some((action) => {
      return (
        !action.content?.step?.trim() ||
        defaultActionList.some(
          (defaultAction) => defaultAction.content?.step === action.content?.step?.trim()
        )
      );
    });
  };

  const handleContinueClick = async (action_to_store) => {

    console.log({action_to_store})
    try {

      if (isActionEmptyOrDefault(action_to_store)) {
        return;
      }
      const actionListToStore = [
        {
          duration: "",
          actionSteps: action_to_store.map((action) => action.content),
        },
      ];
      const userProblemStatement = useAICreationSessionStore.getState().getUserProblemStatement()
      const objective = useAICreationSessionStore.getState().getSelectedObjective()
      // setIsLoading(true);
      const profile_id = useAICreationSessionStore.getState().getProfileId()
      const validate_response = await validateActionList(
        action_to_store.map((action) => action.content),
        objective,
        userProblemStatement,
        language,
        profile_id
      );
      // setIsLoading(false);

      if (validate_response?.result === false) {
        setErrorText(validate_response?.error_message);
        return;
      }

      if (actionList) {
        // setIsLoading(true);
        handleLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION, true);
        setSelectedActionStore(actionListToStore)
        const currentSession = useAICreationSessionStore.getState().getSession()
        const botMessage = {
          role: BOT,
          message:
            t("actionItems.takeActionItems") + "\n" + hasClickedOnAddmore
              ? t("actionItems.craftYourOwnActionPlan")
              : t("actionItems.finalizeActionList") + "\n" + hasClickedOnAddmore
              ? t("actionItems.addEachStep")
              : t("actionItems.editReorderDeleteActions") +
                "\n" +
                JSON.stringify(useAICreationSessionStore.getState().getActionList()),
          messageId: "7_1",
        };

        saveUserChatsInDB(botMessage?.message, currentSession, botMessage?.role)
          .then(() => {
            saveUserChatsInDB(
              JSON.stringify(action_to_store),
              currentSession,
              USER
            );
          })
          .then(() => {
            setErrorText("");
            setCurrentPageValue(3);
            // setIsLoading(false);
          });
      }
    } catch (error) {
      const errorMessage =
        useAICreationSessionStore.getState().getSystemError() ||
        t("common.pleaseTryAgainLater");
      setErrorText(errorMessage);
      // setIsLoading(false);
      setTimeout(() => {
        setErrorText("");
      }, 10000);
      handleLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION, false);
      console.error(error);
    } finally {
      handleLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION, false);
    }
  };

  if (getLoaderState(LOADER_KEYS.FETCH_ACTION_LIST)) {
    return <LoadingChat />;
  }


  const handleOnInputText = (e) => {
    e.preventDefault();
    setTextMessage(e.target.value);
  };

  const separatorIndex = actionListChatHistory?.findIndex(item => item?.source === "SEPARATOR");

  const beforeActionListHistory = separatorIndex !== -1 ?actionListChatHistory?.slice(0, separatorIndex) : []
  const afterActionListHistory = separatorIndex !== -1 ?actionListChatHistory?.slice(separatorIndex + 1) : actionListChatHistory;


  console.log({hasClickedOnAddmore, wantsToMoveForward, actionList, isLoading, isSelectActionItems})


  return (
    <>
      <div>
        {(!hasClickedOnAddmore &&
          !wantsToMoveForward &&
          actionList &&
          !isLoading) ||
        !isSelectActionItems ? (
          <div>
            <BotMessage
              primaryMessage={t("actionItems.takeActionItems")}
              secondaryMessage={t("actionItems.selectOneToGetStarted")}
              customClassNames={{ wrapperStyles: "pb-3" }}
            />
            <div className="bg-white p-3 rounded-2xl">
            <ActionItemsList
              language={language}
              visibleCount={visibleCount}
              selectedIndex={selectedIndex}
              actionList={actionList}
              handleLeftArrowClick={handleLeftArrowClick}
              handleRightArrowClick={handleRightArrowClick}
              fetchError={fetchError}
              swipeDirection={swipeDirection}
              isViewMode={!isSelectActionItems}
              finalActionList={getActionListArray()}
              handleActionListClick={() => {
                if (selectedIndex !== null) {
                  updateSelectedActionPlanSources(selectedIndex);
                }
                setWantsToMoveForward(true);
              }}
            />
            <Source
              source={actionItemSource}
              customClassNames={{
                wrapperStyles: "md:!w-[60%] md:min-w-[570px]",
              }}
            />
            {isSelectActionItems && !!actionList && actionList?.length > 0 && (
              <>
                <SuggestOrAddCta
                  handleSuggestMore={handleSuggestMore}
                  handleAddOwnClick={() => setHasClickedOnAddmore(true)}
                  language={language}
                  showSuggestMoreButton={
                    !visibleCount && actionList?.length > 1
                  }
                  showAddOwnButton={true}
                />
                {/* <div className="thirdpage-next-div">
                  <button
                    className={`thirdpage-select-bttn mt-14 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400`}
                    onClick={() => {
                      if (selectedIndex !== null) {
                        updateSelectedActionPlanSources(selectedIndex);
                      }
                      setWantsToMoveForward(true);
                    }}
                  >
                    {t("common.select")}
                    <IoArrowForward className="thirdpage-cont-arrow-icon" />
                  </button>
                </div> */}
              </>
            )}
            </div>


          {beforeActionListHistory?.length > 0 && <ChatWindow chatHistory={beforeActionListHistory} />}

          {/* {isNewlyGeneratedList && (
            <div>
              <BotMessage primaryMessage={t("selectObjective.theseAreSomeObjectives")} secondaryMessage={t("selectObjective.selectObjective")} />
              <div className="secondpage-obj-fixed">
                <div className="mt-3">
                  <p className="secondpage-obj-text">{t("selectObjective.title")}</p>
                  {!!(!fetchError || fetchError === "") && <ObjectivesCard objectiveList={objectiveList} visibleCount={visibleCount} selectedIndex={selectedIndex} handleObjectiveClick={handleObjectiveClick} selectedObjective={selectedObjective} isSelectObjectiveSection={isSelectObjectiveSection} objectiveSource={objectiveSource} />}
                  {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
                </div>
                {isSelectObjectiveSection && <SuggestOrAddCta showSuggestMoreButton={visibleCount < objectiveList?.length} handleSuggestMore={handleSuggestMore} language={language} handleAddOwnClick={handleAddOwnObjective} showAddOwnButton={true} />}
              </div>
            </div>
          )} */}


          {afterActionListHistory?.length > 0 && <ChatWindow chatHistory={afterActionListHistory} />}

          {!selectedAction && !isNewlyGeneratedList ? (
            <div className="mt-5">
              <ChatBox
                textInputRef={textInputRef}
                textMessage={textMessage}
                handleOnInputText={handleOnInputText}
                handleSendMessage={handleSendMessage}
                // disabled={isFetchingData || hasStartedRecording}
                // hasStartedRecording={hasStartedRecording}
                // startRecording={startRecording}
                // stopRecording={stopRecording}
                // isFetchingData={isFetchingData}
                // seconds={seconds}
                setUseTextbox={setUseTextbox}
                isReadOnly={false}
              />
            </div>
          ) : (
            <div className={`div35 label1`}>
            <div className={`div36 div37`}>
              <ChatMessage message={actionList[selectedIndex]?.plan_name} userType={CONVERSATION_USER_TYPES.USER} />
            </div>
          </div>
          )}
          </div>
        ) : (
          <div className="bg-white p-3 rounded-2xl">
            <FinalActionPage
              actionListArray={getActionListArray()}
              isBotTalking={isBotTalking}
              handleSpeakerOn={handleSpeakerOn}
              handleSpeakerOff={handleSpeakerOff}
              handleContinueClick={handleContinueClick}
              errorText={errorText}
              hasClickedOnAddmore={hasClickedOnAddmore}
              isSelectActionItems={isSelectActionItems}
              setHasClickedOnAddmore={setHasClickedOnAddmore}
              setWantsToMoveForward={setWantsToMoveForward}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default ActionItems;

export function FinalActionPage({
  actionListArray,
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  handleContinueClick,
  errorText,
  hasClickedOnAddmore,
  isSelectActionItems,
  setHasClickedOnAddmore,
  setWantsToMoveForward
}) {
  const { t } = useTranslation("ai_creation_translation");
  const [actionList, setActionList] = useState(actionListArray || []);
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const items = Array.from(actionList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setActionList(items);
  };

  const handleInputChange = (id, value) => {
    setActionList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content: {...item?.content, step: value} } : item))
    );
  };

  const handleDelete = (id) => {
    if (actionList && actionList.length <= 1) return;
    setActionList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddAction = () => {
    setActionList((prev) => [
      ...prev,
      { id: Date.now().toString(), content: "" },
    ]);
  };


  return (
    <div className="final-action-page">
      <BotMessage primaryMessage={hasClickedOnAddmore ? t("actionItems.craftYourOwnActionPlan") : t("actionItems.finalizeActionList")} secondaryMessage={hasClickedOnAddmore ? t("actionItems.addEachStep") : t("actionItems.editReorderDeleteActions")} />
      <div className="secondpage-obj-fixed">
        <div className="secondpage-obj-div">
          <p className="secondpage-obj-text">{t("actionItems.title")}</p>
          <div className="thirdpage-error-div">
            <p className="secondpage-valid-text">{t("actionItems.pleaseAddAtLeastOneAction")}</p>
          </div>
          {errorText && errorText !== "" && <ErrorText errorText={errorText} />}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="actionList">
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {actionList.map((action, index) => (
                    <Draggable key={action.id} draggableId={action.id} index={index} isDragDisabled={!isSelectActionItems} disableInteractiveElementBlocking={!isSelectActionItems}>
                      {provided => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="action-box">
                          <div className="drag-handle">
                            <span>
                              <PiDotsSixVerticalBold className="drag-icon" />{" "}
                            </span>
                          </div>
                          <input type="text" placeholder={t("actionItems.writeActionHere")} disabled={!isSelectActionItems} value={action?.content?.step} className="final-action-input" onChange={e => handleInputChange(action.id, e.target.value)} />
                          {actionList && actionList.length > 1 ? (
                            <FiTrash2
                              className="delete-icon"
                              onClick={e => {
                                e.stopPropagation()
                                if (isSelectActionItems) {
                                  handleDelete(action.id)
                                }
                              }}
                              onMouseDown={e => e.stopPropagation()}
                              disabled={!isSelectActionItems}
                            />
                          ) : (
                            <TbTrashOff className="delete-icon-disable" />
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {isSelectActionItems && (
            <>
              <div className="secondpage-add-div1">
                <button
                  className="secondpage-add-bttn"
                  onClick={() => {
                    handleAddAction()
                  }}
                >
                  <FiPlusCircle className="secondpage-plus-icon" />
                  {t("actionItems.addAction")}
                </button>
              </div>

              <div className="secondpage-add-div1">
                <button onClick={() => {
                  setHasClickedOnAddmore(false)
                  setWantsToMoveForward(false)
                }} className="secondpage-add-bttn cursor-pointer">
                  {t("actionItems.goBack")}
                </button>
              </div>

              <div className="thirdpage-continue-div">
                <button
                  className="thirdpage-select-bttn"
                  onClick={() => {
                    handleContinueClick(actionList)
                  }}
                >
                  {hasClickedOnAddmore ? t("common.continue") : t("common.next")}
                  <IoArrowForward className="thirdpage-cont-arrow-icon" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
