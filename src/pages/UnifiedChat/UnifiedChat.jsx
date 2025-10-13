import { useEffect, useState } from "react";
import { getSessionDetails } from "../../services/api.service";
import { languageList, sessionFlowName } from "../ShikshalokamVoiceChat/enum";
import { useNavigate } from "react-router-dom";
import { setLanguage } from "../../i18n";
import { BiLoader } from "react-icons/bi";
import {
  clearFromStorage,
  getFromStorage,
  removeFromStorage,
  setInStorage,
} from "../../services/storage_service";
import UnifiedVoiceBasedChat from "./UnifiedVoiceBasedChat";
import { getFlowConfig } from "../../config/flowConfig";

function UnifiedChat({ type }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const flowConfig = getFlowConfig(type);

  useEffect(() => {
    const tnc = getFromStorage("has_accepted_tnc");
    if (!tnc) {
      clearFromStorage(true, ["local_route"]);
    }
    if (!getFromStorage("local_route")) {
      setInStorage("local_route", JSON.stringify(languageList[0].value), type);
    }

    if (getFromStorage("tempCode", false, "localStorage")) {
      const previousUrl = getFromStorage("previousUrl", false, "localStorage");
      if (previousUrl && previousUrl !== "") {
        setInStorage("previousUrl", previousUrl, type, "sessionStorage");
      }
    }
    removeFromStorage("tempCode", false, "localStorage");
    removeFromStorage("previousUrl", false, "localStorage");
    setInStorage(
      "chatLanguage",
      JSON.stringify(
        getFromStorage("local_route", true, "localStorage") ||
          languageList[0].value
      ),
      type
    );
  }, [type]);

  function getUserFingerPrint() {
    try {
      const fingerprint =
        window.navigator.userAgent +
        window.navigator.language +
        window.screen.colorDepth +
        window.screen.pixelDepth +
        window.screen.width +
        window.screen.height;

      const storedUserId = getFromStorage("device_id");
      const newUserId = storedUserId || btoa(fingerprint);

      setInStorage("device_id", newUserId, type);
    } catch (error) {
      console.error("Error handling user ID:", error);
    }
  }

  async function initialSetup() {
    try {
      setIsLoading(true);
      const profile_id = process.env.REACT_APP_PROFILE_ID;
      setInStorage("profileid", JSON.stringify(profile_id), type);

      const { sessionid } = await getSessionDetails();
      setInStorage("sessionid", JSON.stringify(sessionid), type);

      setIsLoading(false);
    } catch (error) {
      console.error("Error during initial setup:", error);
      navigate(flowConfig.homePageRoute);
      setIsLoading(false);
    }
  }

  const setFinalLanguage = async () => {
    const currentFlow = getFromStorage("flow");
    if (currentFlow && currentFlow === type) {
      await initialSetup();
    }
    if (currentFlow && currentFlow === type) {
      const storedLanguage =
        getFromStorage("local_route", true, "localStorage") ||
        languageList[0].value;
      setLanguage(storedLanguage);
    }
  };

  useEffect(() => {
    const runSetup = async () => {
      if (!!!getFromStorage("sessionid")) {
        clearFromStorage(false, ["local_route"]);
        setIsLoading(true);
        setInStorage("has_accepted_tnc", false, type);
        setInStorage("isNewChatOpen", JSON.stringify(true), type);
        setInStorage("flow", type, type);
        await setFinalLanguage();
        getUserFingerPrint();
      }
    };
    runSetup();
  }, [type]);

  return (
    <>
      {!isLoading && (
        <>
          <UnifiedVoiceBasedChat flowType={type} variant={"publicBot"} />
        </>
      )}
      {isLoading && (
        <div className="loader-load-spinner">
          <div className="div67">
            <BiLoader className="loader-rotate-loader loader-icon" />
          </div>
        </div>
      )}
    </>
  );
}

export default UnifiedChat;
