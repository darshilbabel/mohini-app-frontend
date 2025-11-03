import { useEffect, useMemo } from "react";
import { LANGUAGE_ENUMS, sessionFlowName } from "pages/ShikshalokamVoiceChat/enum";

// Custom Hooks
import { useLanguage } from "../../hooks/useLanguage";
import { useAudio } from "../../hooks/useAudio";
import { useFlow } from "../../hooks/useFlow";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SESSION_USECASE_TYPE } from "constants/session";

// Components
import LanguageSelectionGrid from "../../components/LanguageSelectionGrid";
import Header from "../../components/Header";
import FlowSelection from "../../components/FlowSelection";
import LoadingSpinner from "../../components/LoadingSpinner";
import ROUTES from "url";
import { useStorage } from "hooks/useStorage";
import { STORE_NAME_CONSTANTS } from "store/constants";

// Styles
import "../../components/custom-style.css";
import "../../index.css";
import "./commonPageStyle.css";

function CommonHomePage({ usecaseType }) {

  const ptm_case = [SESSION_USECASE_TYPE.MEGA_PTM].some((x) => x === usecaseType);
  const ylc_case = [SESSION_USECASE_TYPE.YLC].some((x) => x === usecaseType);

  // Custom hooks
  const chatLanguage = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.chatLanguage)
  const flow = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.flow)
  const setFlow = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.setFlow)
  const hasSelectedLanguage = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.hasSelectedLanguage)
  const setChatLanguage = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.setChatLanguage)
  const { languageButtonSelect, handleLanguageChange } = useLanguage();
  const {
    audioRef,
    controllerRef,
    stopAudioTriggered,
    setStopAudioTriggered,
    stopAllAudio,
  } = useAudio();
  const { isLoading, setIsLoading, handleFlowSelection } = useFlow(usecaseType);

  const navigate = useNavigate();
  const setPreviousUrl = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.setPreviousUrl)

  const [searchParams] = useSearchParams();
  const urlLanguage = useMemo(() => searchParams.get("language"), [searchParams]);
  const urlFlow = useMemo(() => searchParams.get("flow"), [searchParams]);

  // Check if it's PTM use case
  const isPTMCase = ptm_case || ylc_case;
  const shouldShowLanguageGrid = !urlLanguage && !hasSelectedLanguage;
  const shouldShowFlowSelection = !urlFlow && !isPTMCase

  useEffect(() => {
    if (urlFlow && Object.values(sessionFlowName).includes(urlFlow)) {
      setFlow(urlFlow);
    }
  }, [urlFlow]);

  // Initialize language and flow processing
  useEffect(() => {
    if (chatLanguage) return;

    if (!urlLanguage && !languageButtonSelect) {
      setChatLanguage(LANGUAGE_ENUMS.ENGLISH);
    }
  }, [chatLanguage]);

  // Process language selection
  useEffect(() => {
    // Don't process if user hasn't selected a language (and no URL language) or if no flow is specified
    if ((!urlLanguage && !hasSelectedLanguage) || !urlFlow) {
      setIsLoading(false);
      return;
    }

    setPreviousUrl(window.location.href);

    if (ptm_case) {
      console.log("Navigating to PTM chat");
      return navigate(ROUTES.SHIKSHALOKAM_PTM_CHAT_PAGE);
    } else if (ylc_case) {
      console.log("Navigating to YLC chat");
      return navigate(ROUTES.SHIKSHALOKAM_YLC_CHAT_PAGE);
    }

    const flowRoutes = {
      [sessionFlowName.GuestMiStory]: ROUTES.SHIKSHALOKAM_GUEST_MI_STORY,
      [sessionFlowName.GuestDiscussion]: ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT,
      [sessionFlowName.ListeningActivity]: ROUTES.SHIKSHALOKAM_GUEST_LISTENING_CHAT,
    };

    const route = flowRoutes[urlFlow];
    if (route) {
      return navigate(route);
    }

  }, [chatLanguage, urlLanguage, urlFlow, hasSelectedLanguage]);

  useEffect(() => {
    handleLanguageChange(chatLanguage, audioRef, stopAllAudio, setStopAudioTriggered);
  }, [chatLanguage])

  const onFlowContinue = () => {
    return handleFlowSelection(stopAllAudio);
  };

  // Updated render conditions
  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 px-0">
      {/* Desktop Header */}
      <Header
        languageButtonSelect={languageButtonSelect}
        isDesktop={true}
      />

      {/* Main Content */}
      <div className="w-full px-0">
        {/* Mobile Header */}
        <Header
          languageButtonSelect={languageButtonSelect}
          isDesktop={false}
        />

        <div className="bg-slate-50 sm:pt-6 sm:h-[100%] flex flex-col justify-center mt-0 w-full">
          <div className="flex justify-end mr-6 relative block sm:hidden"></div>

          {shouldShowLanguageGrid ? (
            <LanguageSelectionGrid
              usecaseType={usecaseType}
            />
          ) : shouldShowFlowSelection ? (
            <FlowSelection
              audioRef={audioRef}
              stopAudioTriggered={stopAudioTriggered}
              setStopAudioTriggered={setStopAudioTriggered}
              controllerRef={controllerRef}
              onFlowContinue={onFlowContinue}
              setIsLoading={setIsLoading}
            />
          ) : null}
        </div>
      </div>

      {/* Loading Spinner */}
      <LoadingSpinner isVisible={isLoading} />
    </div>
  );
}

export default CommonHomePage;