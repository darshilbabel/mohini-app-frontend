import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
/* icons */
import { IoArrowForward } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
/* utils and api services */
import {
  getEncodedSessionStorage,
  setEncodedSessionStorage,
} from "../../../utils/storage_utils";
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
  const { t } = useTranslation();
  const [objectiveList, setObjectiveList] = useState([]);

  const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(() => {
    const storedObjective = getEncodedSessionStorage("selected_objective");
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
      const objectiveList = getEncodedSessionStorage("objective") || [];
      const selectedObjective = getEncodedSessionStorage("selected_objective");

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
  const preferredLanguage = JSON.parse(
    getEncodedSessionStorage("preferred_language") || "{}"
  );
  const language = preferredLanguage.value || "en";

  useEffect(() => {
    async function fetchObjectiveList() {
      try {
        if (!objectiveList || objectiveList?.length === 0) {
          // setIsLoading(true);
          handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, true);
          const userProblemStatement = getEncodedSessionStorage(
            "user_problem_statement"
          );
          const profile_id = getEncodedSessionStorage("profileid");
          const fetched_objectiveList = await getObjectiveList(
            userProblemStatement,
            language,
            profile_id
          );
          const { message = "", objective_list = [] } = fetched_objectiveList || {};
          if (
            objective_list?.length > 0
          ) {
            setObjectiveList(objective_list);
            setEncodedSessionStorage(
              "objective",
              objective_list
            );

            const transformedSource = transformSource(
              objective_list
            );

            setEncodedSessionStorage(
              "objective_source",
              JSON.stringify(transformedSource)
            );
            setObjectiveSource(transformedSource);

            setEncodedSessionStorage(
              "chunks",
              JSON.stringify(objective_list?.chunks)
            );
            // setIsLoading(false);
            if (isSelectObjectiveSection) handleScrollIntoView();
          } else {
            const errorMessage = message?.length > 0 ? message : (getEncodedSessionStorage("system_error") || t("common.pleaseTryAgainLater"));
            setFetchError(errorMessage);
            // window.location.reload();
          }
        }
      } catch (error) {
        setFetchError(
          getEncodedSessionStorage("system_error") || t("common.pleaseTryAgainLater")
        );
        // setIsLoading(false);
        handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, false);
        console.error(error);
      } finally {
        handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, false);
      }
    }
    const storedObjective = getEncodedSessionStorage("objective");

    if (storedObjective) {
      setObjectiveList(
        typeof storedObjective === "string"
          ? [storedObjective]
          : storedObjective
      );
    } else {
      fetchObjectiveList();
    }

    const storedObjectiveSource = getEncodedSessionStorage("objective_source");
    if (storedObjectiveSource) {
      setObjectiveSource(JSON.parse(storedObjectiveSource));
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
      setInputText(getEncodedSessionStorage("selected_objective") || "");
      setHasClickedOnAddmore(getEncodedSessionStorage("hasClickedObjAddMore"));
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
      setEncodedSessionStorage("selected_objective", userSelectedObjective);
      const currentSession = getEncodedSessionStorage("session");
      const botMessage = hasClickedOnAddmore
        ? t("selectObjective.enterObjective")
        : {
            role: BOT,
            message:
              t("selectObjective.theseAreSomeObjectives") +
              " " +
              t("selectObjective.selectObjective") +
              " " +
              JSON.stringify(getEncodedSessionStorage("objective")),
            messageId: "4_0",
          };

      const chunks = JSON.parse(getEncodedSessionStorage("chunks"));

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
        const profile_id = getEncodedSessionStorage("profileid");
        const validate_response = await validateObjective(
          inputText,
          language,
          profile_id
        );
        // setIsLoading(false);
        if (validate_response?.result) {
          setEncodedSessionStorage("hasClickedObjAddMore", true);
          handleNextClick();
        } else {
          setErrorText(validate_response?.error_message);
        }
      }
    } catch (error) {
      const errorMessage =
        getEncodedSessionStorage("system_error") || t("common.pleaseTryAgainLater");

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
      setEncodedSessionStorage("hasClickedObjAddMore", false);
    } else {
      handleGoBack(index);
    }
  }

  const selectedObjective = getEncodedSessionStorage("selected_objective");

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
