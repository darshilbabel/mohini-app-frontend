import { getFromStorageSlice, setInStorageSlice } from "../services/storage_service";
import { sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";
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
  const { flow } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const selectedFlow = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.flow)

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
    handleFlowSelection,
  };
};