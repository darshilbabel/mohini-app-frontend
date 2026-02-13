import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
/* api services and utils */
import { handleAI4BharatTTSRequest } from "../../apiServices/ai4bharat_services";

import { setLanguage } from "../../../../i18n";
/* components */
import StateMachineDefineChallenge from "./mitra-pages/StateMachineDefineChallenge";
import Sidebar from "./mitra-pages/components/Sidebar";
import ConversationWrapperCard from "./mitra-pages/components/ConversationWrapperCard";
import Footer from "../../../shikshagraha-repository/common/Footer";
import Header from "../../../shikshagraha-repository/listing/Header";
import ActionItems from "./mitra-pages/ActionItems";
import WeeksSelection from "./mitra-pages/WeeksSelection";
import TitleGeneration from "./mitra-pages/TitleGeneration";
import SelectObjective from "./mitra-pages/SelectObjective";
import Popup from "../../../../components/Popup/index";
import PrivacyPolicyPopup from "../../../../components/TnC/privacyPolicyPopup";
import FAQ from "./mitra-pages/components/FAQ";
import CommonFlow from "./mitra-pages/CommonFlow";
import Notification, { showNotification } from "../../../../components/ToastMessage/TotastMessage"

/* constants */
import { ACTIVE_TABS } from "../../constants/mitra.constants";
import { LOADER_KEYS } from "../../constants/common";
import { useAICreationSessionStore } from "store";
import InitialSwitch from "./mitra-pages/InitialSwitch";
import { getTranslatedIntroMessageApi } from "../../../../api/endpoints/ai";
import { bot_routes, FLOW_TYPES } from "../../../../configure";
import { compareFlowTypesEquality } from "../../utils/common_flow";

function MainPage() {
  const { t } = useTranslation("ai_creation_translation");
  const { t: tncTranslation } = useTranslation();
  const [activeTab, setActiveTab] = useState(ACTIVE_TABS.CONVERSATION);
  const [audioCache, setAudioCache] = useState({});
  const [isBotTalking, setIsBotTalking] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(
    useAICreationSessionStore.getState().getIsReadOnly() || false
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [acceptedTnc, setAcceptedTnc] = useState(
    sessionStorage.getItem("acceptedTnc") || "ONGOING"
  );
  const [introMessage, setIntroMessage] = useState(null);
  const [selectedFlowType, setSelectedFlowType] = useState(
    useAICreationSessionStore.getState().getSelectedFlowType() || null
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [userInput, setUserInput] = useState(
    useAICreationSessionStore.getState().getUserText() || []
  );

  const [chatHistory, setChatHistory] = useState(
    useAICreationSessionStore.getState().getChatHistory() || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState({
    [LOADER_KEYS.FETCH_OBJECTIVE_LIST]: false,
    [LOADER_KEYS.FETCH_ACTION_LIST]: false,
    [LOADER_KEYS.LOAD_DEFINITION_CHALLENGE]: false,
    [LOADER_KEYS.LOAD_SELECT_OBJECTIVE]: false,
    [LOADER_KEYS.LOAD_ACTION_ITEMS]: false,
    [LOADER_KEYS.LOAD_WEEKS_SELECTION]: false,
    [LOADER_KEYS.LOAD_TITLE_GENERATION]: false,
    [LOADER_KEYS.APPLICATION_RESET]: false,
    [LOADER_KEYS.LOAD_INTRO_MESSAGE]: true,
  });
  const [userDetail, setUserDetail] = useState({
    name: sessionStorage.getItem("name"),
    image: sessionStorage.getItem("image"),
    email: sessionStorage.getItem("email"),
  });
  const [errorText, setErrorText] = useState(
    useAICreationSessionStore.getState().getErrorText() || ""
  );

  const [currentPage, setCurrentPage] = useState(
    useAICreationSessionStore.getState().getCurrentPage() || {
      0: true,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
    }
  );

  const initialSwitchChatHistory = useAICreationSessionStore(
    state => state.initialSwitchChatHistory
  );

  const audioRef = useRef();
  const scrollContainerRef = useRef(null);

  const { setIsReadOnly: setIsReadOnlyStore, setUserText: setUserTextStore, setCurrentPage: setCurrentPageStore, setSelectedFlowType: setSelectedFlowTypeStore, setBotMessageName: setBotMessageNameStore } = useAICreationSessionStore.getState()

  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    let toastId = null;

    const checkNetworkSpeed = () => {
      if (connection) {
        const { effectiveType } = connection;
        
        if (
          effectiveType &&
          (effectiveType === "2g" || effectiveType === "3g") &&
          navigator.onLine
        ) {
          if (toastId) {
            toast.dismiss(toastId);
          }

          const message = tncTranslation("networkWarning");

          toastId = showNotification({
            message: message,
            type: "warning",
            options: {
              position: "top-center",
              style: { fontWeight: "bold", color: "#1D1616" },
            },
          });
        }
      }
    };

    const handleOffline = () => {
      if (toastId) {
        toast.dismiss(toastId);
      }

      toastId = toast.error(tncTranslation("offlineNetwork"), {
        position: "top-center",
        style: { fontWeight: "bold", color: "#fff" },
      });
    };

    const handleOnline = () => {
      if (toastId) {
        toast.dismiss(toastId);
      }

      toastId = toast.success(tncTranslation("onlineNetwork"), {
        position: "top-center",
        style: { fontWeight: "bold", color: "#1D1616" },
      });

      checkNetworkSpeed();
    };

    checkNetworkSpeed();
    connection?.addEventListener("change", checkNetworkSpeed);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      connection?.removeEventListener("change", checkNetworkSpeed);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [tncTranslation]);

  useEffect(() => {
    setUserDetail({
      name: sessionStorage.getItem("name"),
      image: sessionStorage.getItem("image"),
      email: sessionStorage.getItem("email"),
    });
  }, []);

  useEffect(() => {
    setIsReadOnlyStore(isReadOnly)
  }, [isReadOnly]);

  useEffect(() => {
    setUserTextStore(userInput)
  }, [userInput]);

  useEffect(() => {
    setCurrentPageStore(currentPage)
  }, [currentPage]);

  useEffect(() => {
    setSelectedFlowTypeStore(selectedFlowType)
  }, [selectedFlowType]);

  function handleSpeakerOn(messageToUse, audioId) {
    if (!messageToUse || !audioId) return;
    setIsBotTalking(true);
    const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage()
    const language = preferredLanguage.value || "en";

    handleAI4BharatTTSRequest(
      messageToUse,
      audioId,
      language,
      audioCache,
      setAudioCache,
      audioRef,
      setIsBotTalking
    );
  }

  function handleGoBack(key) {
    if (key <= 1) return;
    setIsReadOnly(true);
    setCurrentPage((prevValue) => ({
      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      [key - 1]: true,
    }));
  }

  function handleGoForward(key) {
    if (key >= 5) return;
    setIsReadOnly(true);
    setCurrentPage((prevValue) => ({
      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      [key + 1]: true,
    }));
  }

  function setCurrentPageValue(key) {
    if (key >= 5) return;
    setCurrentPage((prevValue) => ({
      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      [key + 1]: true,
    }));
  }

  function handleLoaderState(key, value) {
    setIsFetching((prevValue) => ({
      ...prevValue,
      [key]: value,
    }));
  }

  function getLoaderState(key) {
    if (key in isFetching) {
      return isFetching[key];
    }
    return false;
  }

  function handleSpeakerOff(audioId) {
    if (!audioId) return;
    setIsBotTalking(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  const handleScrollIntoView = () => {
    try {
      setTimeout(() => {
        if (scrollContainerRef?.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 0);
    } catch (error) {
      console.error({ error });
    }
  };

  const handleNewMIPClick = () => {
    setIsPopupOpen(true);
  };

  const handleConfirmClearStorage = () => {
    handleLoaderState(LOADER_KEYS.APPLICATION_RESET, true);
    clearExcept();
    setIsPopupOpen(false);
    window.location.reload();
  };

  const handleDiscardClearStorage = () => {
    setIsPopupOpen(false);
    setActiveTab(ACTIVE_TABS.CONVERSATION);
  };

  const togglePopup = () => {
    if(isPopupOpen) {
      setActiveTab(ACTIVE_TABS.CONVERSATION);
    }
    setIsPopupOpen(!isPopupOpen);
  };

  const handleAcceptTnC = () => {
    setAcceptedTnc(true);
    sessionStorage.setItem("acceptedTnc", "true");
  };

  const handleFlowTypeSelected = (flowType) => {
    setSelectedFlowType(flowType);
    if (compareFlowTypesEquality(flowType, FLOW_TYPES.MIP)) {
      // For MIP, move to DefineChallenge page
      setCurrentPage({
        0: false,
        1: true,
        2: false,
        3: false,
        4: false,
        5: false,
      });
    }
  };

  const handleIntroMessage = async () => {

    try {
      handleLoaderState(LOADER_KEYS.LOAD_INTRO_MESSAGE, true);
      const response = await getTranslatedIntroMessageApi({
        language: "en",
        company_bot__route: bot_routes.initial_switch_bot,
      })

      setIntroMessage(response?.[0]?.alt_introductory_message);
      setBotMessageNameStore(response?.[0]?.name);
    } catch (error) {
      handleLoaderState(LOADER_KEYS.LOAD_INTRO_MESSAGE, false);
      console.error({ error });
    } finally {
      handleLoaderState(LOADER_KEYS.LOAD_INTRO_MESSAGE, false);
    }
    
  }

  useEffect(() => {
    handleIntroMessage();
  }, []);

  

  useEffect(() => {
    const language = useAICreationSessionStore.getState().getPreferredLanguage() || {};
    setLanguage(language.value);
  }, []);

  function getCurrentPageView() {
    const components = [];

    const isInitialSwitchSection = currentPage["0"];
    const isDefineChallengeSection = currentPage["1"];
    const isSelectObjectiveSection = currentPage["2"];
    const isSelectActionItems = currentPage["3"];
    const isWeeksSelectionSection = currentPage["4"];
    const isTitleGenerationSection = currentPage["5"];

    const isCommonFlow = selectedFlowType && 
      (compareFlowTypesEquality(selectedFlowType, FLOW_TYPES.LFA) || 
       compareFlowTypesEquality(selectedFlowType, FLOW_TYPES.LCF) || 
       compareFlowTypesEquality(selectedFlowType, FLOW_TYPES.FREE_FLOW));

    components.push(
      <InitialSwitch 
        key="initial-switch" 
        handleLoaderState={handleLoaderState} 
        getLoaderState={getLoaderState} 
        introMessage={introMessage} 
        handleScrollIntoView={handleScrollIntoView}
        onFlowTypeSelected={handleFlowTypeSelected}
        isInitialSwitchSection={isInitialSwitchSection && !isCommonFlow}
        acceptedTnc={acceptedTnc}
      />
    );

    if (isCommonFlow) {
      // Render CommonFlow component for LFA, LCF, FREE_FLOW
      components.push(
        <CommonFlow
          key="common-flow"
          flowType={selectedFlowType}
          handleScrollIntoView={handleScrollIntoView}
        />
      );
      
      return components;
    }

    // MIP Flow - Show DefineChallenge if on page 1 or any later page
    if (
      isDefineChallengeSection ||
      isSelectObjectiveSection ||
      isSelectActionItems ||
      isWeeksSelectionSection ||
      isTitleGenerationSection
    ) {
      components.push(
        <StateMachineDefineChallenge
          key="first"
          handleLoaderState={handleLoaderState}
          getLoaderState={getLoaderState}
          setIsLoading={setIsLoading}
          setCurrentPageValue={setCurrentPageValue}
          isReadOnly={isReadOnly}
          userDetail={userDetail}
          handleGoForward={handleGoForward}
          isDefineChallengeSection={isDefineChallengeSection}
          handleScrollIntoView={handleScrollIntoView}
          scrollRef={scrollContainerRef}
        />
      );
    }

    // Show SelectObjective if on page 2 or any later page
    if (
      isSelectObjectiveSection ||
      isSelectActionItems ||
      isWeeksSelectionSection ||
      isTitleGenerationSection
    ) {
      components.push(
        <SelectObjective
          key="second"
          isBotTalking={isBotTalking}
          handleSpeakerOn={handleSpeakerOn}
          handleSpeakerOff={handleSpeakerOff}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleGoBack={handleGoBack}
          handleGoForward={handleGoForward}
          setCurrentPageValue={setCurrentPageValue}
          setChatHistory={setChatHistory}
          errorText={errorText}
          setErrorText={setErrorText}
          isReadOnly={isReadOnly}
          isSelectObjectiveSection={isSelectObjectiveSection}
          scrollContainerRef={scrollContainerRef}
          handleScrollIntoView={handleScrollIntoView}
          handleLoaderState={handleLoaderState}
          getLoaderState={getLoaderState}
        />
      );
    }

    // Show ActionItems if on page 3 or any later page
    if (
      isSelectActionItems ||
      isWeeksSelectionSection ||
      isTitleGenerationSection
    ) {
      components.push(
        <ActionItems
          key="third"
          isBotTalking={isBotTalking}
          handleSpeakerOn={handleSpeakerOn}
          handleSpeakerOff={handleSpeakerOff}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleGoBack={handleGoBack}
          handleGoForward={handleGoForward}
          setCurrentPageValue={setCurrentPageValue}
          setChatHistory={setChatHistory}
          errorText={errorText}
          setErrorText={setErrorText}
          isSelectActionItems={isSelectActionItems}
          handleScrollIntoView={handleScrollIntoView}
          handleLoaderState={handleLoaderState}
          getLoaderState={getLoaderState}
        />
      );
    }

    // Show WeeksSelection if on page 4 or any later page
    if (isWeeksSelectionSection || isTitleGenerationSection) {
      components.push(
        <WeeksSelection
          key="fourth"
          isBotTalking={isBotTalking}
          handleSpeakerOn={handleSpeakerOn}
          handleSpeakerOff={handleSpeakerOff}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setCurrentPageValue={setCurrentPageValue}
          handleGoBack={handleGoBack}
          handleGoForward={handleGoForward}
          setChatHistory={setChatHistory}
          chatHistory={chatHistory}
          isWeeksSelectionSection={isWeeksSelectionSection}
          handleScrollIntoView={handleScrollIntoView}
          handleLoaderState={handleLoaderState}
          getLoaderState={getLoaderState}
        />
      );
    }

    // Show TitleGeneration if on page 5
    if (isTitleGenerationSection) {
      components.push(
        <TitleGeneration
          key="fifth"
          isBotTalking={isBotTalking}
          handleSpeakerOn={handleSpeakerOn}
          handleSpeakerOff={handleSpeakerOff}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleGoBack={handleGoBack}
          handleScrollIntoView={handleScrollIntoView}
          isTitleGenerationSection={isTitleGenerationSection}
          handleLoaderState={handleLoaderState}
          getLoaderState={getLoaderState}
        />
      );
    }

    return components;
  }

  if (getLoaderState(LOADER_KEYS.APPLICATION_RESET) || getLoaderState(LOADER_KEYS.LOAD_INTRO_MESSAGE)) {
    return <ShowLoader showFirstLoader={true} loadingText={t("common.loadingText")} />;
  }

  return (
    <>
          {acceptedTnc === "ONGOING" && !isLoading && (
        <PrivacyPolicyPopup tncText={tncTranslation("mitraTncText")} onAccept={handleAcceptTnC} isGuestChat={false} />
      )}

      <Notification /> 

<div className="bg-[#F0F2F5]">
    <div className="container max-w-[1500px] h-full mx-auto py-3">


      <Header
        isHeroSection={false}
        isBackButton={true}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
   
  
      <main
        className={`w-full sm:[50%] h-[calc(100vh-200px)] md:h-[80vh] flex flex-col md:flex-row relative gap-10 sm:p-0 md:py-12 md:px-8 lg:px-16 xl:px-32 2xl:px-48 ${
          isMobile ? "bg-white mt-3" : "bg-[#F0F2F5]"
        }`}
      >
           
        <Sidebar
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isMobile={isMobile}
          handleNewMIPClick={handleNewMIPClick}
          isNewChatDisabled={(initialSwitchChatHistory || []).length === 0}
        />
        {activeTab === ACTIVE_TABS.CONVERSATION && (
          <ConversationWrapperCard
            scrollRef={scrollContainerRef}
          >
            {getCurrentPageView()}
          </ConversationWrapperCard>
        )}
        {activeTab === ACTIVE_TABS.FAQ && (
          <div className="flex-1 h-full overflow-hidden">
            <FAQ onBack={() => setActiveTab(ACTIVE_TABS.CONVERSATION)} />
          </div>
        )}
      </main>
      <Popup
        togglePopup={togglePopup}
        isOpen={isPopupOpen}
        headerText={t("startMipPopup.headerText")}
        bodyText={t("startMipPopup.bodyText")}
        confirmButtonText={t("startMipPopup.confirmButtonText")}
        discardButtonText={t("common.cancel")}
        handleDiscard={handleDiscardClearStorage}
        handleConfirm={handleConfirmClearStorage}
      />
    </div>
    <Footer />

    </div>
    </>

  );
}

export default MainPage;

export function ShowLoader({ showFirstLoader = true, loadingText = "" }) {
  const { t } = useTranslation("ai_creation_translation");
  return (
    <>
      <div className="login-load-spinner">
        <div className="login-div67">
          {showFirstLoader ? (
            <img
              className="first-loader"
              src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/loading%20animation.gif"
              alt={t("common.loadingText")}
            />
          ) : (
            <img
              className="first-loader"
              src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/second_loader.gif"
              alt={t("common.loadingText")}
            />
          )}
          {loadingText && loadingText !== "" && (
            <p className="loading-icon-text">{loadingText}</p>
          )}
        </div>
      </div>
    </>
  );
}

export function getNewLocalTime() {
  const now = new Date();

  const formattedDate = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });

  const [date, time] = formattedDate.split(", ");
  const [day, month, year] = date.split("/");
  const formattedDateTime = `${year}-${month}-${day} ${time}`;

  return formattedDateTime;
}

function clearExcept(keepKeys = ["accToken", "name", "image", "email"]) {
  // Clear localStorage
  Object.keys(localStorage).forEach((key) => {
    if (!keepKeys.includes(key)) localStorage.removeItem(key);
  });

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach((key) => {
    if (!keepKeys.includes(key)) sessionStorage.removeItem(key);
  });
}

export function clearMitraSessionStorage(avoidLogout = false) {
  // Clear the Zustand store and its persisted storage
  useAICreationSessionStore.persist.clearStorage();
  useAICreationSessionStore.getState().reset();
  
  // Then remove from sessionStorage
  sessionStorage.removeItem("aiCreationData");
}
