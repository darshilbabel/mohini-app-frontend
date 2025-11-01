import { useEffect, useState } from "react";
import { clearFromStorage } from "../../services/storage_service";
import useSiteDataLocalStore from "store/slices/siteData/siteDataLocal";
import { LANGUAGE_ENUMS } from "pages/ShikshalokamVoiceChat/enum";

// Custom Hooks
import { useLanguage } from "../../hooks/useLanguage";
import { useAudio } from "../../hooks/useAudio";
import { useFlow } from "../../hooks/useFlow";
import { useNavigation } from "../../hooks/useNavigation";

// Utils
import { STORAGE_KEYS, PTM_USE_CASES } from "../../utils/constants";
import { hasAccessToken } from "../../utils/helpers";

// Components
import LanguageSelectionGrid from "../../components/LanguageSelectionGrid";
import Header from "../../components/Header";
import FlowSelection from "../../components/FlowSelection";
import LoadingSpinner from "../../components/LoadingSpinner";

// Styles
import "../../components/custom-style.css";
import "../../index.css";
import "./commonPageStyle.css";

function CommonHomePage({ usecaseType }) {

  const chatLanguage = useSiteDataLocalStore((state) => state.chatLanguage)
  const flow = useSiteDataLocalStore((state) => state.flow)
  const hasSelectedLanguage = useSiteDataLocalStore((state) => state.hasSelectedLanguage)
  const setChatLanguage = useSiteDataLocalStore((state) => state.setChatLanguage)
  // Custom hooks
  const {
    // userLanguage,
    // setUserLanguage,
    languageButtonSelect, // can be migrated
    handleLanguageChange,
    setSelectedLanguage,
    // getDefaultLanguage,
  } = useLanguage(usecaseType);

  const {
    audioRef,
    controllerRef,
    stopAudioTriggered,
    setStopAudioTriggered,
    stopAllAudio,
  } = useAudio();

  const {
    isLoading,
    setIsLoading,
    processLanguageButtonClick,
    handleFlowSelection,
  } = useFlow(usecaseType);

  // Local state
  const [isLanguageProcessing, setIsLanguageProcessing] = useState(false);

  // Navigation hook
  useNavigation();

  // Check if it's PTM use case
  const isPTMCase = PTM_USE_CASES.some((x) => x === usecaseType);

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.get('language');
  const urlFlow = urlParams.get('flow');

  // Initialize language and flow processing
  useEffect(() => {
    if (chatLanguage) return;
    // setIsLoading(true);

    
    if (!urlLanguage && !languageButtonSelect) {
      // if (!userLanguage || userLanguage === null || userLanguage === "") {
      //   const defaultLang = chatLanguage || LANGUAGE_ENUMS.ENGLISH;
      setChatLanguage(LANGUAGE_ENUMS.ENGLISH);
      //   setUserLanguage(defaultLang);
      // }
      // setUserLanguage(userLanguage);

    }

    if (!hasAccessToken()) {
      clearFromStorage(true, [STORAGE_KEYS.HAS_SELECTED_LANGUAGE, STORAGE_KEYS.LOCAL_ROUTE]);
    }

    // initializeLanguageStorage(usecaseType);
  }, [chatLanguage]);

  // Process language selection
// Process language selection
  useEffect(() => {
    if (isLanguageProcessing) return;
    setIsLanguageProcessing(true);
    
    // If both URL params exist, auto-process immediately
    if (urlLanguage && urlFlow) {
      processLanguageButtonClick();
      return;
    }
    
    // If only language param exists, process it
    if (urlLanguage && !urlFlow) {
      processLanguageButtonClick();
      return;
    }
    
    // If only flow param exists, wait for language selection but don't auto-process
    if (!urlLanguage && urlFlow) {
      setIsLoading(false);
      return;
    }
    
    // Normal processing (no URL params)
    processLanguageButtonClick();
  }, [chatLanguage, isLanguageProcessing, urlLanguage, urlFlow]);

  // Event handlers
  // const onLanguageChange = (e) => {
  //   handleLanguageChange(
  //     e?.target?.value,
  //     audioRef,
  //     stopAllAudio,
  //     setStopAudioTriggered
  //   );
  // };

  useEffect(() => {
    handleLanguageChange(chatLanguage, audioRef, stopAllAudio, setStopAudioTriggered);
  }, [chatLanguage])

// Event handlers
  const onLanguageSelect = (language, forceProcess) => {
    setSelectedLanguage(language);
    // If URL flow exists, force process after language selection
    const shouldForceProcess = forceProcess || !!urlFlow;
    processLanguageButtonClick(shouldForceProcess);
  };

  const onFlowContinue = () => {
    return handleFlowSelection(stopAllAudio);
  };

  // Updated render conditions
  const shouldShowLanguageGrid = !urlLanguage && !hasSelectedLanguage;
  const shouldShowFlowSelection = !urlFlow && !isPTMCase && !flow;

  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 px-0">
      {/* Desktop Header */}
      <Header
        // userLanguage={chatLanguage}
        languageButtonSelect={languageButtonSelect}
        // onLanguageChange={onLanguageChange}
        isDesktop={true}
      />

      {/* Main Content */}
      <div className="w-full px-0">
        {/* Mobile Header */}
        <Header
          // userLanguage={userLanguage}
          languageButtonSelect={languageButtonSelect}
          // onLanguageChange={onLanguageChange}
          isDesktop={false}
        />

        <div className="bg-slate-50 sm:pt-6 sm:h-[100%] flex flex-col justify-center mt-0 w-full">
          <div className="flex justify-end mr-6 relative block sm:hidden"></div>

          {shouldShowLanguageGrid ? (
            <LanguageSelectionGrid
              usecaseType={usecaseType}
              onLanguageSelect={onLanguageSelect}
              setIsLanguageProcessing={setIsLanguageProcessing}
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