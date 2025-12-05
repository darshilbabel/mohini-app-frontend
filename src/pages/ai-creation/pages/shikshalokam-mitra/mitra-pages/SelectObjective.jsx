import React, { useState, useEffect } from "react";
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
  const [objectiveSource, setObjectiveSource] = useState({});

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
  const { setObjective: setObjectiveStore, setObjectiveSource: setObjectiveSourceStore, setChunks: setChunksStore, setSelectedObjective: setSelectedObjectiveStore, setHasClickedObjAddMore } = useAICreationSessionStore.getState()

  useEffect(() => {
    async function fetchObjectiveList() {

      try {
        if (!objectiveList || objectiveList?.length === 0) {
          // setIsLoading(true);
          handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, true);
          const userProblemStatement = useAICreationSessionStore.getState().getUserProblemStatement() || null;
          const profile_id = useAICreationSessionStore.getState().getProfileId() || null;
          const fetched_objectiveList = await getObjectiveList(
            userProblemStatement,
            language,
            profile_id
          );
          const { message = "", objective_list = [] } = fetched_objectiveList || {};

          console.log({objective_list})

          if (
            objective_list?.length > 0
          ) {
            setObjectiveList(objective_list);
            setObjectiveStore(objective_list)


            const transformedSource = transformSource(
              objective_list
            );

            setObjectiveSourceStore(transformedSource)
            setObjectiveSource(transformedSource);

            console.log({objective_list})

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
    console.log({storedObjective})
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
    setInputText(objectiveList[index]);
  };

  const handleNextClick = () => {
    const userSelectedObjective = inputText?.text?.trim();
    if (userSelectedObjective?.trim()?.length > 0) {
      setErrorText("");
      // setIsLoading(true);
      setObjectiveList(userSelectedObjective);
      setSelectedObjectiveStore(userSelectedObjective)
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

      console.log("cccc", useAICreationSessionStore.getState().getChunks())

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

 
  return (
    <>
      <div>
        {!hasClickedOnAddmore ? (
          <div className="secondpage-bot-div">
            <BotMessage
              primaryMessage={t("selectObjective.theseAreSomeObjectives")}
              secondaryMessage={t("selectObjective.selectObjective")}
            />
            <div className="secondpage-obj-fixed">
              <div className="mt-3">
                <p className="secondpage-obj-text">
                  {t("selectObjective.title")}
                </p>
                {!!(!fetchError || fetchError === "") && (
                  <ObjectivesCard
                    objectiveList={objectiveList}
                    visibleCount={visibleCount}
                    selectedIndex={selectedIndex}
                    handleObjectiveClick={handleObjectiveClick}
                    selectedObjective={selectedObjective}
                    isSelectObjectiveSection={isSelectObjectiveSection}
                    objectiveSource={objectiveSource}
                  />
                )}
                {!!(fetchError && fetchError !== "") && (
                  <ErrorText errorText={fetchError} />
                )}
              </div>
              {isSelectObjectiveSection && (
                <SuggestOrAddCta
                  showSuggestMoreButton={visibleCount < objectiveList?.length}
                  handleSuggestMore={handleSuggestMore}
                  language={language}
                  handleAddOwnClick={() => {
                    setInputText({});
                    localStorage.removeItem("selected_objective");
                    setHasClickedOnAddmore(true);
                  }}
                  showAddOwnButton={false}
                />
              )}
            </div>
            {isSelectObjectiveSection && !!objectiveList && objectiveList?.length > 0 && (
              <div className="secondpage-next-div">
                <button
                  className={`${
                    Number.isInteger(selectedIndex)
                      ? "secondpage-next-bttn-selected"
                      : "secondpage-next-bttn"
                  } `}
                  onClick={handleNextClick}
                  disabled={!Number.isInteger(selectedIndex)}
                >
                  {t("common.next")} <IoArrowForward />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <BotMessage primaryMessage={t("selectObjective.theseAreSomeObjectives")} />
            {!!(!isSelectObjectiveSection && selectedObjective?.length > 0) ? (
              <div className="secondpage-obj-selected-button-div">
                <div className="secondpage-obj-line"></div>
                <button className="secondpage-obj-bttn">
                  {selectedObjective}
                </button>
              </div>
            ) : (
              <>
                <div className="secondpage-textbox-container">
                  <input
                    type="text"
                    placeholder={t("selectObjective.enterObjectivePlaceholder")}
                    className="secondpage-text-input"
                    value={inputText}
                    onChange={(e) => handleInputText(e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleInputSend(e);
                      }
                    }}
                  />
                  <RxCrossCircled
                    className="secondpage-cross-icon"
                    onClick={() => {
                      setInputText({});
                    }}
                  />
                </div>
                {errorText && errorText !== "" && (
                  <ErrorText errorText={errorText} />
                )}
                <div className="secondpage-continue-div">
                  <button
                    className="secondpage-continue-bttn"
                    onClick={() => handleInputSend()}
                  >
                    {t("common.continue")}{" "}
                    <IoArrowForward className="secondpage-right-arror" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {!isSelectObjectiveSection && <UserMessage message={t("common.next")} />}
      </div>
    </>
  );
}

export default SelectObjective;
