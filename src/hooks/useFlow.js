import { getFromStorageSlice, setInStorageSlice } from "../services/storage_service";
import { sessionFlowName, sessionUsecaseType } from "../pages/ShikshalokamVoiceChat/enum";
import { STORE_NAME_CONSTANTS } from "store/constants";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useStorage } from "hooks/useStorage";
import ROUTES from "../url";
import useChatDataLocalStore from "store/slices/chatData/chatDataLocal";
import useSiteDataLocalStore from "store/slices/siteData/siteDataLocal";

export const useFlow = (usecaseType) => {
  const navigate = useNavigate();
  const { flow, language } = useParams();

  const [isLoading, setIsLoading] = useState(true);

  const setHasSelectedLanguage = useSiteDataLocalStore((state) => state.setHasSelectedLanguage)

  const selectedFlow = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.flow)
  const setSelectedFlow = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA).getState().setFlow

  // Parse URL params
  
  // Check if URL flow exists in our enum values
  const validFlows = Object.values(sessionFlowName);
  const mappedUrlFlow = validFlows.includes(flow) ? flow : null;

  // Auto-apply URL flow on mount
  useEffect(() => {
    if (mappedUrlFlow) {
      setSelectedFlow(mappedUrlFlow);
    }
  }, [mappedUrlFlow]);

  const ptm_case = [sessionUsecaseType.MEGA_PTM].some((x) => x === usecaseType);
  const ylc_case = [sessionUsecaseType.YLC].some((x) => x === usecaseType);

  const processLanguageButtonClick = (forceProcess = false) => {
    console.log("Process button clicked");
    const chatLanguage = useSiteDataLocalStore.getState().getChatLanguage();
    const hasSelectedLanguage = useSiteDataLocalStore.getState().getHasSelectedLanguage();
    // Check URL params
    const urlLanguage = language;
    const urlFlow = flow;
    const hasUrlParams = urlLanguage || urlFlow;
    
    // If both URL params exist, always process immediately
    if (urlLanguage && urlFlow) {
      forceProcess = true;
    }
    
    // If URL flow exists but no language was provided, and user just selected language
    if (urlFlow && !urlLanguage && forceProcess) {
      forceProcess = true;
    }
    
    if (!forceProcess && !hasUrlParams && (!hasSelectedLanguage || !selectedFlow || !chatLanguage)) {
      setIsLoading(false);
      return;
    }
    
    console.log("Process button allowed");
    setIsLoading(true);
    setHasSelectedLanguage(true);

    // setInStorageSlice("userPreference", true, "setHasSelectedLanguage");
    // setInStorageSlice("userPreference", chatLanguage, "setRoute");

    // Case for PTM
    if (ptm_case) {
      console.log("Navigating to PTM chat");
      return navigate(ROUTES.SHIKSHALOKAM_PTM_CHAT_PAGE);
    } else if (ylc_case) {
      console.log("Navigating to YLC chat");
      return navigate(ROUTES.SHIKSHALOKAM_YLC_CHAT_PAGE);
    }
    
    const currentFlow = selectedFlow || getFromStorageSlice("userPreference", "flow");
    const accessToken = useSiteDataLocalStore.getState().getAccessToken();
    // Set common storage items
    setInStorageSlice("userPreference", window.location.href, "setPreviousUrl");
    setInStorageSlice("userPreference", "xyz123", "setTempCode");
    setInStorageSlice("userPreference", currentFlow, "setFlow");
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

  const handleFlowSelection = async (stopAllAudio) => {
    setIsLoading(true);
    await stopAllAudio();

    // const flow = useChatDataSessionStore.getState().getFlow();

    let navigateUrl = undefined
    let replaceUrl = undefined

    setInStorageSlice("userPreference", window.location.href, "setPreviousUrl");
    setInStorageSlice("userPreference", "xyz123", "setTempCode");
    
    const previousUrl = getFromStorageSlice("userPreference", "previousUrl");
    if (!previousUrl) {
      return;
    }

    const accessToken = useSiteDataLocalStore.getState().getAccessToken();
    const flowRoutes = {
      [sessionFlowName.GuestDiscussion]: ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT,
      [sessionFlowName.GuestMiStory]: ROUTES.SHIKSHALOKAM_GUEST_MI_STORY,
    };

    const route = flowRoutes[selectedFlow];
    if (!route) {
      return;
    }

    if (accessToken) {
      useChatDataLocalStore.getState().setFlow(flow);
      replaceUrl = "/mohini" + route;
    } else {
      navigateUrl = route;
    }

    if (!replaceUrl && !navigateUrl) {
      return;
    }

    if (replaceUrl) {
      return window.location.replace(replaceUrl);
    }
    if (navigateUrl) {
      navigate(navigateUrl);
      window.location.reload();
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    setIsLoading,
    ptm_case,
    processLanguageButtonClick,
    handleFlowSelection,
  };
};