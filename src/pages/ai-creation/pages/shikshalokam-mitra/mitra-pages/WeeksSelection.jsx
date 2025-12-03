import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
/* icons */
import { IoArrowForward } from "react-icons/io5";
/* utils and api services */
import {
  getEncodedSessionStorage,
  setEncodedSessionStorage,
} from "../../../utils/storage_utils";
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
  const { t } = useTranslation("ai_creation_translation");
  const [selectedWeek, setSelectedWeek] = useState(
    getEncodedSessionStorage("selected_week") || 1
  );
  const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(
    getEncodedSessionStorage("selected_week") ? true : false
  );

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

  const handleSliderChange = (value) => {};

  const handleContinueClick = async () => {
    if (selectedWeek) {
      // setIsLoading(true);
      setEncodedSessionStorage("selected_week", selectedWeek);
      const botMessage =
        t("weeksSelection.howManyWeeks") +
        " " +
        t("weeksSelection.slideToSelect");
      const currentSession = getEncodedSessionStorage("session");

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

  return (
    <>
      <div>
        <BotMessage
          primaryMessage={t("weeksSelection.howManyWeeks")}
          secondaryMessage={t("weeksSelection.slideToSelect")}
        />
        <Slider
          min={1}
          max={6}
          onValueChange={handleSliderChange}
          value={selectedWeek}
          setValue={setSelectedWeek}
          isDisabled={!isWeeksSelectionSection}
        />
        {isWeeksSelectionSection ? (
          <div className="fourthpage-next-div">
            <button
              className={`thirdpage-select-bttn`}
              onClick={handleContinueClick}
            >
              {t("common.next")}

              <IoArrowForward className="thirdpage-cont-arrow-icon" />
            </button>
          </div>
        ) : (
          <UserMessage message={t("common.next")} />
        )}
      </div>
    </>
  );
}

export default WeeksSelection;
