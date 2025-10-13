import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getFromStorage, setInStorage } from "../services/storage_service";
import ROUTES from "../url";
import { sessionFlowName, sessionUsecaseType } from "../pages/ShikshalokamVoiceChat/enum";

export const useFlow = (usecaseType) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse URL params
  const urlParams = new URLSearchParams(location.search);
  const urlFlow = urlParams.get('flow');
  
  // Check if URL flow exists in our enum values
  const validFlows = Object.values(sessionFlowName);
  const mappedUrlFlow = validFlows.includes(urlFlow) ? urlFlow : null;
  
  const [selectedFlow, setSelectedFlow] = useState(
    mappedUrlFlow || getFromStorage("flow", false) || null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Auto-apply URL flow on mount
  useEffect(() => {
    if (mappedUrlFlow) {
      setInStorage('flow', mappedUrlFlow);
      setSelectedFlow(mappedUrlFlow);
    }
  }, [mappedUrlFlow]);

  const ptm_case = [sessionUsecaseType.MEGA_PTM].some((x) => x === usecaseType);
  const ylc_case = [sessionUsecaseType.YLC].some((x) => x === usecaseType);

  const processLanguageButtonClick = (langToUse, forceProcess = false) => {
    console.log("Process button clicked");
    
    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlLanguage = urlParams.get('language');
    const urlFlow = urlParams.get('flow');
    const hasUrlParams = urlLanguage || urlFlow;
    
    // If both URL params exist, always process immediately
    if (urlLanguage && urlFlow) {
      forceProcess = true;
    }
    
    // If URL flow exists but no language was provided, and user just selected language
    if (urlFlow && !urlLanguage && forceProcess) {
      forceProcess = true;
    }
    
    if (!forceProcess && !hasUrlParams && (!getFromStorage("hasSelectedLanguage") || !selectedFlow || !langToUse)) {
      setIsLoading(false);
      return;
    }
    
    console.log("Process button allowed");
    setIsLoading(true);
    setInStorage("hasSelectedLanguage", true);
    setInStorage("route", JSON.stringify(langToUse));

    // Case for PTM
    if (ptm_case) {
      console.log("Navigating to PTM chat");
      return navigate(ROUTES.SHIKSHALOKAM_PTM_CHAT_PAGE);
    } else if (ylc_case) {
      console.log("Navigating to YLC chat");
      return navigate(ROUTES.SHIKSHALOKAM_YLC_CHAT_PAGE);
    }
    
    const currentFlow = selectedFlow || getFromStorage("flow");
    const accessToken = getFromStorage("accessToken", true);
    console.log("Current flow:", currentFlow, "Access token:", accessToken);
    // Set common storage items
    setInStorage("previousUrl", window.location.href);
    setInStorage("tempCode", "xyz123");
    setInStorage("flow", currentFlow);
    // Navigate based on flow - handle both authenticated and guest users
    if (currentFlow === sessionFlowName.GuestMiStory) {
      if (accessToken) {
        return window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_GUEST_MI_STORY);
      } else {
        navigate(ROUTES.SHIKSHALOKAM_GUEST_MI_STORY);
        return;
      }
    }
    
    if (currentFlow === sessionFlowName.GuestDiscussion) {
      if (accessToken) {
        return window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT);
      } else {
        navigate(ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT);
        return;
      }
    }

    if (currentFlow === sessionFlowName.ListeningActivity) {
      if (accessToken) {
        return window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_GUEST_LISTENING_CHAT);
      } else {
        navigate(ROUTES.SHIKSHALOKAM_GUEST_LISTENING_CHAT);
        return;
      }
    }
    
    setIsLoading(false);
  };

  const handleFlowSelection = async (flow, stopAllAudio) => {
    setIsLoading(true);
    await stopAllAudio();
    
    if (flow === sessionFlowName.GuestDiscussion) {
      setInStorage("previousUrl", window.location.href);
      setInStorage("tempCode", "xyz123");
      if (getFromStorage("previousUrl")) {
        if (getFromStorage("accessToken", true)) {
          setInStorage("flow", flow);
          return window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT);
        } else {
          navigate(ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT);
          window.location.reload();
        }
      }
    } else if (flow === sessionFlowName.GuestMiStory) {
      setInStorage("previousUrl", window.location.href);
      setInStorage("tempCode", "xyz123");
      if (getFromStorage("previousUrl")) {
        if (getFromStorage("accessToken", true)) {
          setInStorage("flow", flow);
          return window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_GUEST_MI_STORY);
        } else {
          navigate(ROUTES.SHIKSHALOKAM_GUEST_MI_STORY);
          window.location.reload();
        }
      }
    }
    setIsLoading(false);
  };

  return {
    selectedFlow,
    setSelectedFlow,
    isLoading,
    setIsLoading,
    ptm_case,
    processLanguageButtonClick,
    handleFlowSelection,
  };
};