import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
/* icons */
import { PiDotsSixVerticalBold } from "react-icons/pi";
import { FiPlusCircle } from "react-icons/fi";
import { IoArrowForward } from "react-icons/io5";
/* utils and api services */

import {
  getActionList,
  saveUserChatsInDB,
  validateActionList,
} from "../../../../../api/endpoints/chat_flow";
import { transformActionListSources } from "../../../utils/mitra-chat";
/* components */
import ActionItemsList from "./components/action-items/ActionItemsList";
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
import { useSearchParams } from "react-router-dom";
import { sessionFlowName } from "../../../../ShikshalokamVoiceChat/enum";
import { bot_routes } from "../../../../../configure";
import { useChatWebhook } from "../../../../../hooks/useChatWebhook";
import { buildWebSocketUrl } from "../../../../../utils/helpers";
import ChatMessage from "./components/chat-message/ChatMessage";
import { getOrTextTranslation } from "../question script/secondpage_tanslation";
import TextareaWithVoice from "../../../components/textarea-with-mic";
import Disclaimer from "./components/Disclaimer";
import Guidelines from "./components/Guidelines";
import Reasons from "./components/Reasons";
import LoadingWithStatus from "./components/LoadingWithStatus";

const { BOT, USER } = CONVERSATION_USER_TYPES;

function ActionItems({
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  isLoading,
  handleGoBack,
  setCurrentPageValue,
  errorText,
  setErrorText,
  isSelectActionItems,
  handleScrollIntoView,
  handleLoaderState,
  getLoaderState,
}) {
  const { t } = useTranslation("ai_creation_translation");
  const [actionList, setActionList] = useState(() => {
    const storedActionList = useAICreationSessionStore.getState().getActionList()
    return storedActionList || []
  });

  const [visibleCount, setVisibleCount] = useState(false);
  const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(() => {
    return useAICreationSessionStore.getState().getHasClickedActionAddMore() || false;
  });
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

  const [goBack, setGoBack] = useState(false)
  const [showSelectedActionLoader, setShowSelectedActionLoader] = useState(false)

  const localChatHistory = useAICreationSessionStore.getState().getActionListChatHistory()

  const [actionListChatHistory, setActionListChatHistory] = useState(
    !!localChatHistory?.length ? localChatHistory : []
  );

  const { setActionList: setActionListStore, setActionItemSource: setActionItemSourceStore, setSelectedAction: setSelectedActionStore, setActionListChatHistory: setActionListChatHistoryStore, setSelectedObjective: setSelectedObjectiveStore, setErrorText: setErrorTextStore, setHasClickedActionAddMore: setHasClickedActionAddMoreStore } = useAICreationSessionStore.getState()
  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || "en"
  const language = preferredLanguage.value || "en";

  const objective = useAICreationSessionStore(state => state.selectedObjective)
  const [isFetchingData, setIsFetchingData] = useState(false)

  // Sync hasClickedOnAddmore with store
  useEffect(() => {
    setHasClickedActionAddMoreStore(hasClickedOnAddmore);
  }, [hasClickedOnAddmore, setHasClickedActionAddMoreStore]);

  const defaultActionList = [
    {id: "0", content: ""},
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

  async function fetchActionList(createNew = false, newObjective) {
    try {
      handleLoaderState(LOADER_KEYS.FETCH_ACTION_LIST, true);
        const userProblemStatement = useAICreationSessionStore.getState().getUserProblemStatement()
        const profile_id = useAICreationSessionStore.getState().getProfileId()

        const finalObjective = createNew ? newObjective : objective
        const fetchedActionList = await getActionList(
          userProblemStatement,
          finalObjective,
          language,
          profile_id
        );

        const { message = "", action_list = [] } = fetchedActionList || {};

        if (action_list?.length > 0) {

          setErrorTextStore("")
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
      // }
    } catch (error) {
      setFetchError(
       error?.response?.data?.message || useAICreationSessionStore.getState().getSystemError() || t("common.pleaseTryAgainLater")
      );

      setActionList([])
      setActionListStore([])
      setActionItemSource({})
      setActionItemSourceStore({})

      setErrorTextStore(
       error?.response?.data?.message || useAICreationSessionStore.getState().getSystemError() || t("common.pleaseTryAgainLater")
      )
      setErrorText(error?.response?.data?.message || "")
      console.error(error);
    } finally {
      handleLoaderState(LOADER_KEYS.FETCH_ACTION_LIST, false);
    }
  }


  useEffect(() => {
    // Only fetch if objective has actually changed to a different value
    // Use JSON.stringify to compare arrays/objects by value, not reference
    const currentObjectiveStr = JSON.stringify(objective);
    const lastFetchedObjective = useAICreationSessionStore.getState().getLastFetchedActionListObjective();
    const lastFetchedStr = JSON.stringify(lastFetchedObjective);
    
    if (objective && currentObjectiveStr !== lastFetchedStr) {
      useAICreationSessionStore.getState().setLastFetchedActionListObjective(objective);
      fetchActionList();
    }
  }, [objective]);



  useEffect(() => {
    if (swipeDirection) {
      const timeout = setTimeout(() => setSwipeDirection(null), 500);
      return () => clearTimeout(timeout);
    }
  }, [swipeDirection]);

  useEffect(() => {
    if (showSelectedActionLoader) {
      setTimeout(() => {
        setShowSelectedActionLoader(false)
      }, 1000)
    }
  }, [showSelectedActionLoader])

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


    try {

      setIsFetchingData(true)

      const store = useAICreationSessionStore.getState();
      const setSelectedActionSource = store.setSelectedActionSource;
      const finalSources = [];
      const seen = new Set();

      action_to_store?.forEach(action => {
        (action.content?.sources || []).forEach(src => {
          if (src?.url && !seen.has(src.url)) {
            seen.add(src.url);
            finalSources.push(src);
          }
        });
      });

      setSelectedActionSource(finalSources);

      const actionListToStore = [
        {
          duration: "",
          actionSteps: action_to_store?.filter((action) => action.content?.step?.trim())?.map((action) => action.content),
        },
      ];

      const userProblemStatement = useAICreationSessionStore.getState().getUserProblemStatement()
      const objective = useAICreationSessionStore.getState().getSelectedObjective()
      // setIsLoading(true);
      const profile_id = useAICreationSessionStore.getState().getProfileId()
      const editedActionsForValidation = action_to_store
        .filter(action => {
          if (action.isNew) {
            return action.content?.step?.trim();
          }
          const originalStep = action.originalContent?.step || "";
          const currentStep = action.content?.step || "";
          return originalStep.trim() !== currentStep.trim();
        })
        .map(action => action.content);
      
      if (editedActionsForValidation.length > 0) {
        const validate_response = await validateActionList(
          editedActionsForValidation,
          objective,
          userProblemStatement,
          language,
          profile_id
        );

        // setIsLoading(false);

        if (String(validate_response?.result) === "false") {
          setErrorText(validate_response?.error_message);
          return false;
        }
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

        const planName = actionList[selectedIndex]?.plan_name || t("actionItems.myActionPlan");

        await saveUserChatsInDB(planName, currentSession, botMessage?.role);
        await saveUserChatsInDB(planName, currentSession, USER);
        setErrorText("");
        setCurrentPageValue(3);
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
      setIsFetchingData(false);
      handleLoaderState(LOADER_KEYS.LOAD_WEEKS_SELECTION, false);
    }
  };

  const actionLoadingStatusMessages = t("actionItems.loadingStatusMessages", { returnObjects: true });

  if (getLoaderState(LOADER_KEYS.FETCH_ACTION_LIST)) {
    return <LoadingWithStatus statusMessages={actionLoadingStatusMessages} />
  }

  // Find all separator messages
  const separators = [];
  actionListChatHistory?.forEach((item, index) => {
    if (item?.source === "SEPARATOR") {
      separators.push({
        index
      });
    }
  });

  // Create sections: chat history between separators
  const chatSections = [];
  
  if (separators.length === 0) {
    // No separators, all chat history goes in one section
    chatSections.push({
      chatHistory: actionListChatHistory,
      showActionList: false
    });
  } else {
    // Before first separator
    if (separators[0].index > 0) {
      chatSections.push({
        chatHistory: actionListChatHistory.slice(0, separators[0].index),
        showActionList: false
      });
    }

    // Between separators and after last separator
    for (let i = 0; i < separators.length; i++) {
      const currentSeparator = separators[i];
      const nextSeparator = separators[i + 1];
      
      // Add action list for this separator
      chatSections.push({
        chatHistory: [],
        showActionList: true,
        isLatest: i === separators.length - 1
      });

      // Add chat history after this separator until next separator (or end)
      const endIndex = nextSeparator?.index || actionListChatHistory.length;
      if (currentSeparator.index + 1 < endIndex) {
        chatSections.push({
          chatHistory: actionListChatHistory.slice(currentSeparator.index + 1, endIndex),
          showActionList: false
        });
      }
    }
  }


  const handleGoBackToObjectives = () => {
    handleGoBack(3)
    setActionListChatHistory([])
    setActionListChatHistoryStore([])
    setSelectedObjectiveStore(null)
  }

  if(goBack) return <></>;

  return (
      <div>
        {(!hasClickedOnAddmore &&
          !wantsToMoveForward &&
          actionList &&
          !isLoading) ||
        !isSelectActionItems ? (
          <div>
            {/* Only show initial action list if there are no separators (no regenerations) */}
            {separators.length === 0 && (
              <>
                <BotMessage
                  showChatStyle
                  primaryMessage={t("actionItems.takeActionItems")}
                  secondaryMessage={t("actionItems.selectOneToGetStarted")}
                  customClassNames={{ wrapperStyles: "pb-3" }}
                />
                <div className="mb-4">
                  <Guidelines text={t("actionItems.guidelines")} />
                </div>
                <div className="bg-white p-3 rounded-2xl">
                  {!isSelectActionItems ? <ActionItemsList
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
                      setShowSelectedActionLoader(true)

                      if (selectedIndex !== null) {
                        updateSelectedActionPlanSources(selectedIndex);
                      }
                      setWantsToMoveForward(true);
                    }}
                    hasClickedOnAddmore={hasClickedOnAddmore}
                    isSelectActionItems={isSelectActionItems}
                  /> : <FinalActionPage
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
                  isFetchingData={isFetchingData}
                  selectedIndex={selectedIndex}
                  handleGoBackToObjectives={handleGoBackToObjectives}
                  actionItemSource={actionItemSource}
                />}
                  <div className="flex flex-col gap-2">
                      {!isSelectActionItems && <Reasons 
                        reasonList={getActionListArray()}
                        customClassNames={{
                          wrapperStyles: "md:!w-[100%]",
                        }}
                      />}
                      {!isSelectActionItems && <Source
                        source={actionItemSource}
                        customClassNames={{
                          wrapperStyles: "md:!w-[100%]",
                        }}
                      />}

                  </div>
                      {!isSelectActionItems && <Disclaimer text={t('disclaimer.actionsText')}/>}
                </div>
              </>
            )}

            {/* Render chat sections */}
            {chatSections.map((section, sectionIndex) => {
              const isLatestList = section.isLatest || false;

              // For previous action lists, just show simple text
              if (!isLatestList && section?.showActionList) {
                return (
                  <div key={`action-list-${sectionIndex}`} className="my-4">
                    <BotMessage primaryMessage="Previous Action List" />
                  </div>
                );
              }

              if (section.showActionList) {
                // This is the latest action list section
                return (
                  <div key={`action-list-${sectionIndex}`}>
                    <BotMessage
                      showChatStyle
                      primaryMessage={t("actionItems.takeActionItems")}
                      secondaryMessage={t("actionItems.selectOneToGetStarted")}
                      customClassNames={{ wrapperStyles: "pb-3" }}
                    />
                    <div className="mb-4">
                      <Guidelines text={t("actionItems.guidelines")} />
                    </div>
                    <div className="bg-white p-3 rounded-2xl">
                      

                      {!isSelectActionItems ? <ActionItemsList
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
                        hasClickedOnAddmore={hasClickedOnAddmore}
                        isSelectActionItems={isSelectActionItems}

                      /> : <FinalActionPage
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
                      isFetchingData={isFetchingData}
                      selectedIndex={selectedIndex}
                      handleGoBackToObjectives={handleGoBackToObjectives}
                      actionItemSource={actionItemSource}
                    />}


                      <Reasons 
                        reasonList={actionList[selectedIndex]?.actionSteps || []}
                        customClassNames={{
                          wrapperStyles: "md:!w-[100%]",
                        }}
                      />
                      <Source
                        source={actionItemSource}
                        customClassNames={{
                          wrapperStyles: "md:!w-[100%]",
                        }}
                      />
                    </div>
                  </div>
                );
              } else if (section.chatHistory?.length > 0) {
                // This is a chat history section
                return (
                  <ChatWindow 
                    key={`chat-${sectionIndex}`}
                    chatHistory={section.chatHistory} 
                    page={3} 
                  />
                );
              }
              return null;
            })}

            {showSelectedActionLoader && <LoadingChat />}


            {isSelectActionItems ? (
              <></>
              // <div className="mt-5">
              //   <ChatBox
              //     textInputRef={textInputRef}
              //     textMessage={textMessage}
              //     handleOnInputText={handleOnInputText}
              //     handleSendMessage={handleSendMessage}
              //     setUseTextbox={setUseTextbox}
              //     isReadOnly={false}
              //   />
              // </div>
            ) : (
              // <></>
              <div className={`div35 label1`}>
              <div className={`div36 div37`}>
                {hasClickedOnAddmore ? <ChatMessage message="My Action Plan" userType={CONVERSATION_USER_TYPES.USER} /> : <ChatMessage message={actionList[selectedIndex]?.plan_name || t("actionItems.myActionPlan")} userType={CONVERSATION_USER_TYPES.USER} />}
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
              isFetchingData={isFetchingData}
              selectedIndex={selectedIndex}
            />
          </div>
        )}
      </div>
  );
}

export default ActionItems;

export function FinalActionPage({
  actionListArray,
  handleContinueClick,
  errorText,
  hasClickedOnAddmore,
  isSelectActionItems,
  isFetchingData,
  handleGoBackToObjectives,
  actionItemSource,
  appendEmptyTextarea = false
}) {

  const { t } = useTranslation("ai_creation_translation");
  const errorRef = useRef(null);
  const normalizeContent = (content) =>
  typeof content === "string"
    ? { step: content }
    : (content ?? { step: "" });

  const [{ actionList, selectedIds }, setActionState] = useState(() => {
    const timestamp = Date.now();
    const newItemId = `new-${timestamp}`;
    
    if (actionListArray && actionListArray.length > 0) {
      const mappedActions = actionListArray.map((action, index) => {
        const normalized = normalizeContent(action.content);
        return {
          id: action.id || `action-${index}-${timestamp}`,
          content: normalized,
          isNew: false,
          originalContent: { ...normalized },
        };
      });
      
      const allIds = mappedActions.map(action => action.id);
      
      if (appendEmptyTextarea) {
        mappedActions.push({ id: newItemId, content: { step: "" }, isNew: true, originalContent: { step: "" }, } );
        allIds.push(newItemId);
      }
      return {
        actionList: mappedActions,
        selectedIds: new Set(allIds)
      };
    }
    return {
      actionList: [{
        id: newItemId,
        content: { step: "" },
        isNew: true,
        originalContent: { step: "" },
      }],
      selectedIds: new Set([newItemId])
    };
  });

  const setActionList = (updater) => {
    setActionState(prev => ({
      ...prev,
      actionList: typeof updater === 'function' ? updater(prev.actionList) : updater
    }));
  };

  const setSelectedIds = (updater) => {
    setActionState(prev => ({
      ...prev,
      selectedIds: typeof updater === 'function' ? updater(prev.selectedIds) : updater
    }));
  };

  useEffect(() => {
    if (errorText && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [errorText]);

  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || "en"
  const language = preferredLanguage.value || "en";

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
    prev.map((item) =>
      item.id === id
        ? { ...item, content: { ...item?.content, step: value } }
        : item
    )
  );
};


  const handleCheckboxToggle = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddAction = () => {
    const newId = Date.now().toString();
    setActionList((prev) => [
      ...prev,
      { id: newId, content: { step: "" }, originalContent: { step: "" }, isNew: true }
    ]);
    setSelectedIds((prev) => new Set([...prev, newId]));
  };

  const handleSelectAllToggle = () => {
    setSelectedIds(prev => {
      if (actionList.every(action => prev.has(action.id))) {
        return new Set();
      }
      return new Set(actionList.map(action => action.id));
    });
  };

  const hasSelectedActionsWithContent = actionList.some(
    (action) => selectedIds.has(action.id) && action.content?.step?.trim()
  );
  const isContinueDisabled = !hasSelectedActionsWithContent || isFetchingData;
  const allSelected = actionList.length > 0 && actionList.every(action => selectedIds.has(action.id));
  const someSelected = actionList.some(action => selectedIds.has(action.id));
  
  const getSelectedActions = () => {
    return actionList.filter(action => selectedIds.has(action.id) && action.content?.step?.trim());
  };
  
  const reasonList = actionList?.map(item => item?.content)


  return (
    <div className="final-action-page mt-3">
      <BotMessage primaryMessage={hasClickedOnAddmore ? t("actionItems.craftYourOwnActionPlan") : t("actionItems.finalizeActionList")} secondaryMessage={hasClickedOnAddmore ? t("actionItems.addEachStep") : t("actionItems.editReorderDeleteActions")} />
      <div className="secondpage-obj-fixed">
        <div className="secondpage-obj-div">
          <p className="secondpage-obj-text">{t("actionItems.title")}</p>
          <div className="thirdpage-error-div">
            <p className="secondpage-valid-text">{t("actionItems.pleaseAddAtLeastOneAction")}</p>
          </div>
          {errorText && errorText !== "" && (
            <div ref={errorRef}>
              <ErrorText errorText={errorText} />
            </div>
          )}
          <div className="flex items-center justify-end mb-3 action-box shadow-none">
            <span className="mr-2 text-sm">
              {allSelected
                ? (t("common.deselectAll") || "Deselect all")
                : (t("common.selectAll") || "Select all")}
            </span>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => {
                  if (el) el.indeterminate = !allSelected && someSelected;
                }}
                onChange={handleSelectAllToggle}
                disabled={!isSelectActionItems || isFetchingData}
                className="action-checkbox"
              />
              <span className="checkmark"></span>
            </label>
          </div>
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
                          <TextareaWithVoice value={action?.content?.step || ""} placeholder={t("actionItems.writeActionHere")} disabled={!isSelectActionItems || isFetchingData} onChange={text => handleInputChange(action.id, text)} className="final-action-input" />
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(action.id)}
                              onChange={() => handleCheckboxToggle(action.id)}
                              disabled={!isSelectActionItems || isFetchingData}
                              className="action-checkbox"
                            />
                            <span className="checkmark"></span>
                          </label>
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

              <div className="flex flex-col gap-2">
                {!hasClickedOnAddmore && <Reasons reasonList={reasonList} />}

                {!hasClickedOnAddmore && <Source
                          source={actionItemSource}
                          customClassNames={{
                            wrapperStyles: "md:w-[90%]",
                          }}
                />}
              </div>
            

              <div className="w-full md:w-[90%]">
                <Disclaimer text={t('disclaimer.actionsText')}/>
              </div>


              <div className="secondpage-add-div1">
                <button
                  className="flex items-center font-sans font-normal text-base leading-[1.4] text-right text-[#1177FF]"
                  onClick={() => {
                    handleAddAction()
                  }}
                >
                  <FiPlusCircle className="secondpage-plus-icon" />
                  {t("actionItems.addAction")}
                </button>
              </div>

              <div className="secondpage-add-div1 mt-0">
                <p className="secondpage-or-text">{getOrTextTranslation(language)}</p>
              </div>

              <div className="secondpage-add-div1 mt-0">
                <button
                  // onClick={() => {
                  //   setHasClickedOnAddmore(false)
                  //   setWantsToMoveForward(false)
                  // }}
                  onClick={handleGoBackToObjectives}
                  className="flex items-center font-sans font-normal text-base leading-[1.4] text-right text-[#1177FF]"
                >
                  {t("selectObjective.goBack")}
                </button>
              </div>

              <div className="thirdpage-continue-div">
                <button
                  className={`thirdpage-select-bttn ${isContinueDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  onClick={async () => {
                    const success = await handleContinueClick(getSelectedActions());
                    if (success === false) return;
                  }}
                  disabled={isContinueDisabled}
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
