import { useEffect, useState } from "react";
import { getProfileDetails } from "../services/api.service";
import { getSessionDetailsApi } from "../api/endpoints/chat";
import { getIpLocationApi } from "../api/endpoints/location";
import { languageList, sessionFlowName } from "./ShikshalokamVoiceChat/enum";
import ROUTES from "../url";
import { useNavigate } from "react-router-dom";
import { setLanguage } from "../i18n";
import { BiLoader } from "react-icons/bi";
import {
  clearFromStorage,
  getFromStorageSlice,
  removeFromStorage,
  setInStorageSlice,
} from "../services/storage_service";
import ShikshalokamVoiceBasedChat from "./ShikshalokamVoiceChat/voice-chat";
import { loginApi } from "api/endpoints/auth";

function ShikshalokamChat({ type, variant }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(
    getFromStorageSlice("userPreference", "device_id") || null
  );
  const [companyName, setCompanyName] = useState(
    getFromStorageSlice("userPreference", "company") || null
  );

  useEffect(() => {
    if (
      getFromStorageSlice(
        "userPreference",
        "accessToken",
        false,
        "localStorage"
      )
    )
      return;
    const tnc = getFromStorageSlice("userPreference", "has_accepted_tnc");
    if (!tnc || tnc === "ONGOING") {
      clearFromStorage(true, ["local_route"]);
    }
    if (!getFromStorageSlice("userPreference", "local_route")) {
      setInStorageSlice(
        "userPreference",
        languageList[0].value,
        "setLocalRoute",
        type
      );
    }
    // if(!getFromStorage('tempCode')){
    // 	removeFromStorage('previousUrl');
    // }
    if (
      getFromStorageSlice("userPreference", "tempCode", false, "localStorage")
    ) {
      const previousUrl = getFromStorageSlice(
        "userPreference",
        "previousUrl",
        false,
        "localStorage"
      );
      console.log("previousUrl chk", previousUrl);
      console.log("currentUrl chk", window.location.href);
      if (previousUrl && previousUrl !== "") {
        console.log("type chk", type);
        if (
          type &&
          [
            sessionFlowName.GuestDiscussion,
            sessionFlowName.GuestMiStory,
            sessionFlowName.ListeningActivity,
          ].includes(type)
        ) {
          console.log("Setting previousUrl in sessionStorage");
          setInStorageSlice(
            "userPreference",
            previousUrl,
            "setPreviousUrl",
            type,
            "sessionStorage"
          );
        }
      }
    }
    removeFromStorage("tempCode", false, "localStorage");
    removeFromStorage("previousUrl", false, "localStorage");
    setInStorageSlice(
      "userPreference",
      getFromStorageSlice(
        "userPreference",
        "local_route",
        false,
        "localStorage"
      ) || languageList[0].value,
      "setChatLanguage",
      type
    );
  }, []);

  function getUserFingerPrint() {
    if (
      getFromStorageSlice(
        "userPreference",
        "accessToken",
        false,
        "localStorage"
      )
    )
      return;

    try {
      const fingerprint =
        window.navigator.userAgent +
        window.navigator.language +
        window.screen.colorDepth +
        window.screen.pixelDepth +
        window.screen.width +
        window.screen.height;

      const storedUserId = getFromStorageSlice("userPreference", "device_id");
      const newUserId = storedUserId || btoa(fingerprint);

      setInStorageSlice("userPreference", newUserId, "setDeviceId", type);
      setUserId(newUserId);
    } catch (error) {
      console.error("Error handling user ID:", error);
      setUserId("guest_" + Date.now());
    }
  }

  async function initialSetup() {
    if (
      getFromStorageSlice(
        "userPreference",
        "accessToken",
        false,
        "localStorage"
      )
    )
      return;

    try {
      const deviceId = getFromStorageSlice("userPreference", "device_id");
      const customEmail = deviceId + "@shikshalokam.org";
      const currentFlow = getFromStorageSlice("userPreference", "flow");
      const body = {
        email: customEmail,
        company: "shikshalokamstaging",
        password: "grit@123",
        latest_flow_used: currentFlow,
        other_params: {
          device_id: deviceId,
          city: getFromStorageSlice("userPreference", "ip_city") || "",
          state: getFromStorageSlice("userPreference", "ip_state") || "",
          country: getFromStorageSlice("userPreference", "ip_country") || "",
        },
      };

      setIsLoading(true);
      const res = await getProfileDetails(body);

      if (res?.status === "error") {
        setIsLoading(false);
        return;
      }

      setInStorageSlice("userPreference", res.id, "setProfileid", type);

      let session = await getSessionDetailsApi();
      setInStorageSlice(
        "userPreference",
        session.sessionid,
        "setSessionid",
        type
      );

      const response = await loginApi({
        email: customEmail,
        password: "grit@123",
      });

      if (!!response?.access_token) {
        setInStorageSlice(
          "userPreference",
          response?.company,
          "setCompany",
          type
        );
        setInStorageSlice(
          "userPreference",
          response?.first_name,
          "setFirstName",
          type
        );
        setCompanyName(response?.company);
      } else {
        window.location.reload();
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error during initial setup:", error);
      navigate(ROUTES.SHIKSHALOKAM_HOME_PAGE);
      setIsLoading(false);
    }
  }

  const setFinalLanguage = async () => {
    if (
      getFromStorageSlice(
        "userPreference",
        "accessToken",
        false,
        "localStorage"
      )
    )
      return;

    const currentFlow = getFromStorageSlice("userPreference", "flow");
    if (
      currentFlow &&
      [
        sessionFlowName.GuestDiscussion,
        sessionFlowName.GuestMiStory,
        sessionFlowName.ListeningActivity,
      ].includes(currentFlow)
    ) {
      await initialSetup();
    }
    if (
      currentFlow &&
      [
        sessionFlowName.GuestDiscussion,
        sessionFlowName.GuestMiStory,
        sessionFlowName.ListeningActivity,
      ].includes(currentFlow)
    ) {
      const storedLanguage =
        getFromStorageSlice(
          "userPreference",
          "local_route",
          false,
          "localStorage"
        ) || languageList[0].value;
      setLanguage(storedLanguage);
    }
  };

  useEffect(() => {
    const runSetup = async () => {
      if (
        getFromStorageSlice(
          "userPreference",
          "accessToken",
          false,
          "localStorage"
        )
      )
        return;

      if (!getFromStorageSlice("userPreference", "sessionid")) {
        clearFromStorage(false, ["local_route"]);
        setIsLoading(true);
        setInStorageSlice(
          "userPreference",
          "ONGOING",
          "setHasAcceptedTnc",
          type
        );
        setInStorageSlice("userPreference", true, "setIsNewChatOpen", type);
        const locationData = await getIpLocationApi();
        if (locationData && locationData?.location) {
          setInStorageSlice(
            "userPreference",
            locationData?.location?.regionName,
            "setIpState",
            type
          );
          setInStorageSlice(
            "userPreference",
            locationData?.location?.city,
            "setIpCity",
            type
          );
          setInStorageSlice(
            "userPreference",
            locationData?.location?.country,
            "setIpCountry",
            type
          );
        }
        setInStorageSlice("userPreference", type, "setFlow", type);
        getUserFingerPrint();
        await setFinalLanguage();
      } else if (
        getFromStorageSlice("userPreference", "flow") &&
        ![
          sessionFlowName.GuestDiscussion,
          sessionFlowName.GuestMiStory,
          sessionFlowName.ListeningActivity,
        ].includes(getFromStorageSlice("userPreference", "flow"))
      ) {
        clearFromStorage(false, ["local_route"]);
        window.location.reload();
      }
    };
    runSetup();
  }, []);

  return (
    <>
      {companyName && !isLoading && (
        <>
          <ShikshalokamVoiceBasedChat
            type={"shikshalokam"}
            variant={"publicBot"}
          />
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

export default ShikshalokamChat;
