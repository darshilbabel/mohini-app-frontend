import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
/* icons */
import { PiDotsSixVerticalBold } from "react-icons/pi";
import { TbTrashOff } from "react-icons/tb";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import { IoArrowForward } from "react-icons/io5";
/* utils and api services */

import {
  getActionList,
  saveUserChatsInDB,
  validateActionList,
} from "../../../../../api/endpoints/chat_flow";
import { transformSource } from "../../../utils/mitra-chat";
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
      setActionItemSource(JSON.parse(storedActionItemSource));
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

  const { setActionList: setActionListStore, setActionItemSource: setActionItemSourceStore, setSelectedAction: setSelectedActionStore } = useAICreationSessionStore.getState()
  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || {}
  const language = preferredLanguage.value || "en";

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

  useEffect(() => {
    async function fetchActionList() {
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
            setActionList(action_list);
            setActionListStore(action_list)
            const transformedSource = transformSource(action_list);
            setActionItemSource(transformedSource);
            setActionItemSourceStore(transformSource)
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

  const isActionEmptyOrDefault = (action_to_store) => {
    if (!action_to_store || action_to_store.length === 0) {
      return true;
    }

    return action_to_store.some((action) => {
      return (
        !action.content.trim() ||
        defaultActionList.some(
          (defaultAction) => defaultAction.content === action.content.trim()
        )
      );
    });
  };

  const handleContinueClick = async (action_to_store) => {
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
                  showAddOwnButton={false}
                />
                <div className="thirdpage-next-div">
                  <button
                    className={`thirdpage-select-bttn mt-14 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400`}
                    onClick={() => {
                      setWantsToMoveForward(true);
                    }}
                  >
                    {t("common.select")}
                    <IoArrowForward className="thirdpage-cont-arrow-icon" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <FinalActionPage
              actionListArray={getActionListArray()}
              isBotTalking={isBotTalking}
              handleSpeakerOn={handleSpeakerOn}
              handleSpeakerOff={handleSpeakerOff}
              handleContinueClick={handleContinueClick}
              errorText={errorText}
              hasClickedOnAddmore={hasClickedOnAddmore}
              isSelectActionItems={isSelectActionItems}
            />
          </>
        )}
      </div>
      {!isSelectActionItems && <UserMessage message={t("common.next")} />}
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
      prev.map((item) => (item.id === id ? { ...item, content: value } : item))
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
      <BotMessage
        primaryMessage={hasClickedOnAddmore ? t("actionItems.craftYourOwnActionPlan") : t("actionItems.finalizeActionList")}
        secondaryMessage={hasClickedOnAddmore ? t("actionItems.addEachStep") : t("actionItems.editReorderDeleteActions")}
      />
      <div className="secondpage-obj-fixed">
        <div className="secondpage-obj-div">
          <p className="secondpage-obj-text">
            {t("actionItems.title")}
          </p>
          <div className="thirdpage-error-div">
            <p className="secondpage-valid-text">
              {t("actionItems.pleaseAddAtLeastOneAction")}
            </p>
          </div>
          {errorText && errorText !== "" && (
            <ErrorText errorText={errorText} />
          )}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="actionList">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {actionList.map((action, index) => (
                    <Draggable
                      key={action.id}
                      draggableId={action.id}
                      index={index}
                      isDragDisabled={!isSelectActionItems}
                      disableInteractiveElementBlocking={!isSelectActionItems}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="action-box"
                        >
                          <div className="drag-handle">
                            <span>
                              <PiDotsSixVerticalBold className="drag-icon" />{" "}
                            </span>
                          </div>
                          <input
                            type="text"
                            placeholder={t("actionItems.writeActionHere")}
                            disabled={!isSelectActionItems}
                            value={action?.content}
                            className="final-action-input"
                            onChange={(e) =>
                              handleInputChange(action.id, e.target.value)
                            }
                          />
                          {actionList && actionList.length > 1 ? (
                            <FiTrash2
                              className="delete-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSelectActionItems) {
                                  handleDelete(action.id);
                                }
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
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
                    handleAddAction();
                  }}
                >
                  <FiPlusCircle className="secondpage-plus-icon" />
                  {t("actionItems.addAction")}
                </button>
              </div>
              <div className="thirdpage-continue-div">
                <button
                  className="thirdpage-select-bttn"
                  onClick={() => {
                    handleContinueClick(actionList);
                  }}
                >
                  {hasClickedOnAddmore
                    ? t("common.continue")
                    : t("common.next")}
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
