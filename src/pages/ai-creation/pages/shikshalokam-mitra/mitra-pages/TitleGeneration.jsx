import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
/* utils and api services */
import { clearMitraLocalStorage } from "../MainPage";
import {
  getEncodedSessionStorage,
  setEncodedSessionStorage,
} from "../../../utils/storage_utils";
import {
  createProject,
  getTitle,
  saveUserChatsInDB,
  updateChatSession,
  validateTitle,
} from "../../../../../api/endpoints/chat_flow";
/* components */
import BotMessage from "./components/chat-message/BotMessage";
import ErrorText from "./components/ErrorText";
import LoadingChat from "./components/LoadingChat";
import UserMessage from "./components/chat-message/UserMessage";
/* constants */
import { LOADER_KEYS } from "../../../constants/common";
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants";
import ROUTES from "../../../../../url";
/* styles */
import "../stylesheet/chatStyle.css";
import { useNavigate } from "react-router-dom";

const { BOT, USER } = CONVERSATION_USER_TYPES;
function TitleGeneration({
  isBotTalking,
  handleSpeakerOn,
  handleSpeakerOff,
  setIsLoading,
  isLoading,
  handleGoBack,
  handleScrollIntoView,
  isTitleGenerationSection,
  handleLoaderState,
  getLoaderState,
}) {
  const { t } = useTranslation("ai_creation_translation");
  const navigate = useNavigate();
  const [inputText, setInputText] = useState(() => {
    let title = getEncodedSessionStorage("project_title") || "";
    return title;
  });

  const titleCharacterLimit = 100;

  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [shouldDisableButton, setShouldDisableButton] = useState(false);
  const [media, setMedia] = useState([]);
  const [isApiCalling, setIsApiCalling] = useState(false);

  const preferredLanguage = JSON.parse(
    getEncodedSessionStorage("preferred_language") || "{}"
  );
  const language = preferredLanguage.value || "en";
  const [fetchError, setFetchError] = useState("");

  const [localErrorText, setLocalErrorText] = useState("");

  useEffect(() => {
    async function fetchTitle() {
      try {
        handleLoaderState(LOADER_KEYS.LOAD_TITLE_GENERATION, true);
        let title = getEncodedSessionStorage("project_title");
        if (!title) {
          const user_problem_statement = getEncodedSessionStorage(
            "user_problem_statement"
          );
          const user_objective = getEncodedSessionStorage("selected_objective");
          const user_action_list = getEncodedSessionStorage("selected_action");
          const profile_id = getEncodedSessionStorage("profileid");
          title = await getTitle(
            user_problem_statement,
            user_objective,
            user_action_list,
            language,
            profile_id
          );
          if (title) {
            setInputText(title);
            setEncodedSessionStorage("project_title", title);
            if (isTitleGenerationSection) handleScrollIntoView();
          } else {
            window.location.reload();
          }
        } else {
          if (isTitleGenerationSection) handleScrollIntoView();
        }
      } catch (error) {
        setFetchError(
          getEncodedSessionStorage("system_error") || t("common.pleaseTryAgainLater")
        );
        handleLoaderState(LOADER_KEYS.LOAD_TITLE_GENERATION, false);
        console.error(error);
      } finally {
        handleLoaderState(LOADER_KEYS.LOAD_TITLE_GENERATION, false);
      }
    }
    fetchTitle();
  }, []);

  function handleInputText(e) {
    const newText = e?.target?.value;
    const specialCharRegex = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~₹]/;
    if (specialCharRegex.test(newText)) {
      setShouldDisableButton(true);
      setLocalErrorText(t("titleGeneration.shouldNotContainNumbers"));
    } else if (newText.length > titleCharacterLimit) {
      setShouldDisableButton(true);
      setLocalErrorText(t("titleGeneration.shouldNotExceed100Characters"));
    } else if (newText === "") {
      setShouldDisableButton(true);
      setLocalErrorText(t("titleGeneration.titleCannotBeEmpty"));
    } else {
      setShouldDisableButton(false);
    }

    setInputText(newText);
  }

  useEffect(() => {
    const textarea = document.getElementById("autoGrow");

    const adjustHeight = () => {
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    adjustHeight();

    textarea?.addEventListener("input", adjustHeight);

    return () => textarea?.removeEventListener("input", adjustHeight);
  }, [inputText]);

  async function handleCreateImprovement() {
    if (
      inputText &&
      inputText !== "" &&
      inputText.length <= titleCharacterLimit &&
      !shouldDisableButton
    ) {
      // setIsLoading(true);
      setIsApiCalling(true);
      const user_problem_statement = getEncodedSessionStorage(
        "user_problem_statement"
      );
      const user_objective = getEncodedSessionStorage("selected_objective");
      const user_action_list = getEncodedSessionStorage("selected_action");
      const profile_id = getEncodedSessionStorage("profileid");
      const validate_response = await validateTitle(
        inputText,
        user_problem_statement,
        user_objective,
        user_action_list,
        language,
        profile_id
      );
      setIsApiCalling(false);
      if (validate_response?.result) {
      } else {
        setLocalErrorText(validate_response?.error_message);
        return;
      }
      setIsLocalLoading(true);
      setEncodedSessionStorage("project_title", inputText);
      const session = getEncodedSessionStorage("session");
      const field_to_update = {
        title: inputText,
        session_status: "COMPLETED",
      };

      const botMessage = {
        message:
          t("titleGeneration.hereIsTheTitle") +
          " " +
          t("titleGeneration.youCanEditIt"),
        role: BOT,
      };
      await saveUserChatsInDB(botMessage?.message, session, botMessage?.role);
      await saveUserChatsInDB(inputText, session, USER);

      try {
        const response = await updateChatSession(session, field_to_update);
        if (response) {
          const user_problem_statement = getEncodedSessionStorage(
            "user_problem_statement"
          );
          const project_duration = getEncodedSessionStorage("selected_week");
          const user_objective = getEncodedSessionStorage("selected_objective");
          const user_action_list =
            getEncodedSessionStorage("selected_action")[0]?.actionSteps;
          const access_token = getEncodedSessionStorage(
            process.env.REACT_APP_ACCESS_TOKEN_KEY
          );
          const chunks = JSON.parse(getEncodedSessionStorage("chunks"));

          const project_response = await createProject(
            access_token,
            user_problem_statement,
            user_action_list,
            project_duration,
            inputText,
            profile_id,
            session,
            user_objective,
            chunks
          );

          const {
            media = [],
            mitra_result = {},
            status = "",
          } = project_response || {};

          if (media?.length > 0) setMedia(media);

          const { message = "", project_id: projectId = 0 } =
            mitra_result || {};

          if (status?.toLowerCase() === "ok") {
            clearMitraLocalStorage();
            setEncodedSessionStorage("media", media);
            // window.location.replace(
            //   `/${ROUTES.IMPROVEMENT_PLAN}`
            // );
            navigate(ROUTES.IMPROVEMENT_PLAN)

          }
        }
      } catch (error) {
        console.error("Error: ", error);
        window.location.href = ROUTES.LOGIN;
      }
    }
  }

  if (getLoaderState(LOADER_KEYS.LOAD_TITLE_GENERATION)) {
    return <LoadingChat />;
  }

  return (
    <>
      <div>
        <BotMessage
          primaryMessage={t("titleGeneration.hereIsTheTitle")}
          secondaryMessage={t("titleGeneration.youCanEditIt")}
        />
        {(!fetchError || fetchError === "") && (
          <div className="secondpage-textbox-container sm:w-full md:w-1/2 lg:w-1/2">
            <textarea
              id="autoGrow"
              type="text"
              placeholder={t("titleGeneration.aiGeneratedTitle")}
              className="secondpage-text-input"
              value={inputText}
              onChange={(e) => handleInputText(e)}
              disabled={isApiCalling || isLocalLoading || media?.length > 0}
            />
          </div>
        )}
        {fetchError && fetchError !== "" && (
          <ErrorText errorText={fetchError} />
        )}
        {localErrorText && localErrorText !== "" && (
          <ErrorText errorText={localErrorText} />
        )}

        {!isApiCalling && !isLocalLoading && media?.length === 0 && (
          <div className="fourthpage-next-div">
            <button
              className={`${
                shouldDisableButton
                  ? "fifthpage-disable-button"
                  : "fifthpage-select-bttn"
              } `}
              onClick={handleCreateImprovement}
            >
              {t("titleGeneration.createMicroImprovementPlan")}
            </button>
          </div>
        )}
        {(isApiCalling || isLocalLoading) && (
          <>
            <UserMessage message={t("titleGeneration.createMicroImprovementPlan")} />
            <LoadingChat />
          </>
        )}
      </div>
    </>
  );
}

export default TitleGeneration;
