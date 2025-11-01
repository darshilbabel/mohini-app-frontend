/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import {
  readElevateProfile,
  updateReflectionStatus,
} from "../services/api.service";
import { getSessionDetailsApi } from "../api/endpoints/chat";
import { useLocation, useNavigate } from "react-router-dom";
import ROUTES from "../url";
import { BiLoader } from "react-icons/bi";
import "../components/custom-style.css";
import "../index.css";
import { clearFromStorage, setInStorage } from "../services/storage_service";
import { setLanguage } from "../i18n";
import { languageList, sessionFlowName } from "./ShikshalokamVoiceChat/enum";

function SsoFlow() {
  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   clearFromStorage();
  // }, []);

  useEffect(() => {
    setLanguage("en");
    setInStorage("local_route", JSON.stringify(languageList[0].value));
    async function fetchProfileDetails() {
      const urlParams = new URLSearchParams(location.search);
      const accessToken = urlParams.get("accToken");
      const flow_type = urlParams.get("flow");
      const projectId = urlParams.get("projectId");
      const taskId = urlParams.get("taskId");
      const sessionId = urlParams.get("sessionId");
      const languagePassed = urlParams.get("language");
      let rerouteRaw = urlParams.get("rerouteUrl") || "";
      if (rerouteRaw.startsWith('"') && rerouteRaw.endsWith('"')) {
        rerouteRaw = rerouteRaw.slice(1, -1);
      }
      const rerouteUrl = decodeURIComponent(rerouteRaw);

      if (!accessToken || accessToken === "") {
        navigate(-1);
        window.location.reload();
      }
      try {
        const data = await readElevateProfile(accessToken);
        if (data && data?.status.toLowerCase() === "ok") {
          const profile_details = data?.profile_details;
          if (profile_details) {
            if (!!projectId) {
              const statusRes = await updateReflectionStatus(
                projectId,
                "started",
                sessionFlowName.SsoFlow,
                accessToken
              );
              if (!!projectId && statusRes?.status !== 200) {
                clearFromStorage();
                navigate(-1);
              }
            }

            clearFromStorage(true);
            if (sessionId && sessionId !== "" && sessionId !== "null") {
              setInStorage(
                "sessionid",
                JSON.stringify(sessionId),
                flow_type,
                localStorage
              );
            } else {
              let session = await getSessionDetailsApi();
              setInStorage(
                "sessionid",
                JSON.stringify(session.sessionid),
                flow_type,
                localStorage
              );
            }
            if (
              languagePassed &&
              languagePassed !== "" &&
              languagePassed !== "null"
            ) {
              setInStorage(
                "route",
                JSON.stringify(languagePassed),
                flow_type,
                localStorage
              );
              setInStorage("local_route", JSON.stringify(languagePassed));
              setInStorage("hasSelectedLanguage", true);
              setLanguage(languagePassed);
            } else {
              setInStorage(
                "route",
                JSON.stringify(profile_details.route),
                flow_type,
                localStorage
              );
              setLanguage(profile_details.route);
            }

            setInStorage("ssoRerouteURL", rerouteUrl, flow_type, localStorage);
            setInStorage(
              "first_name",
              JSON.stringify(profile_details.first_name),
              flow_type,
              localStorage
            );
            setInStorage(
              "company",
              JSON.stringify(profile_details.company),
              flow_type,
              localStorage
            );
            setInStorage(
              "state",
              JSON.stringify(profile_details.state),
              flow_type,
              localStorage
            );
            setInStorage("flow", flow_type, flow_type, localStorage);
            const hasAcc = profile_details.has_accepted_tnc;
            setInStorage(
              "has_accepted_tnc",
              typeof hasAcc === "string" ? hasAcc : JSON.stringify(hasAcc),
              flow_type,
              localStorage
            );
            setInStorage(
              "accessToken",
              JSON.stringify(accessToken),
              flow_type,
              localStorage
            );
            setInStorage(
              "profileid",
              JSON.stringify(profile_details.profileid),
              flow_type,
              localStorage
            );
            setInStorage(
              "isNewChatOpen",
              JSON.stringify(true),
              flow_type,
              localStorage
            );
            setInStorage(
              "projectId",
              JSON.stringify(projectId),
              flow_type,
              localStorage
            );
            setInStorage(
              "taskId",
              JSON.stringify(taskId),
              flow_type,
              localStorage
            );
            // navigate(ROUTES.SHIKSHALOKAM_HOME_PAGE, {replace: true});
            window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_HOME_PAGE);
          } else {
            navigate(-1);
          }
        } else {
          navigate(-1);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate(-1);
      }
    }

    fetchProfileDetails();
  }, []);

  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 justify-center h-screen">
      <div className="login-load-spinner">
        <div className="login-div67">
          <BiLoader className="login-rotate-loader login-loader-icon" />
        </div>
      </div>
    </div>
  );
}

export default SsoFlow;

/* eslint-disable react-hooks/exhaustive-deps */
