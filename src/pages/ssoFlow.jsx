/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { getSessionDetails, readElevateProfile, updateReflectionStatus } from "../services/api.service";
import { useLocation, useNavigate } from "react-router-dom";
import ROUTES from "../url";
import { BiLoader } from "react-icons/bi";
import "../components/custom-style.css"
import "../index.css"
import { clearFromStorage, getFromStorage, setInStorage } from "../services/storage_service";
import { setLanguage } from "../i18n";
import { sessionFlowName } from "./ShikshalokamVoiceChat/enum";



function SsoFlow({ type, variant }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    clearFromStorage();
  }, []);

  useEffect(() => {

    async function fetchProfileDetails(){
      const urlParams = new URLSearchParams(location.search);
      const accessToken = urlParams.get("accToken");
      const flow_type = urlParams.get("flow");
      const projectId = urlParams.get("projectId");
      const taskId = urlParams.get("taskId");

      if(!accessToken || accessToken === '') {
        navigate(-1);
        window.location.reload();
      }
      try {
        const data = await readElevateProfile(accessToken);
        if (data && data?.status.toLowerCase() === 'ok') {
          const profile_details = data?.profile_details;
          if(profile_details) {
            let session = await getSessionDetails();
            const statusRes = await updateReflectionStatus(projectId, "started", sessionFlowName.SsoFlow, accessToken);
            if (statusRes?.status !== 200) {
              if (projectId){
                clearFromStorage()
                navigate(-1)
              }
            }
            setInStorage('sso_accessToken', accessToken, flow_type, localStorage);
            setInStorage('ssoRerouteURL', profile_details.reroute_url, flow_type, localStorage);
            setInStorage('first_name', JSON.stringify(profile_details.first_name), flow_type, localStorage);
            setInStorage('company', JSON.stringify(profile_details.company), flow_type, localStorage);
            setInStorage('state', JSON.stringify(profile_details.state), flow_type, localStorage);
            setInStorage('flow', flow_type, flow_type, localStorage);
            setInStorage('route', JSON.stringify(profile_details.route), flow_type, localStorage);
            const hasAcc = profile_details.has_accepted_tnc;
            setInStorage('has_accepted_tnc', typeof hasAcc === 'string' ? hasAcc : JSON.stringify(hasAcc), flow_type, localStorage);
            setInStorage('access_token', JSON.stringify(accessToken), flow_type, localStorage);
            setInStorage('profileid', JSON.stringify(profile_details.profileid), flow_type, localStorage);
            setInStorage('sessionid', JSON.stringify(session.sessionid), flow_type, localStorage);
            setInStorage('isNewChatOpen', JSON.stringify(true), flow_type, localStorage);
            setInStorage('projectId', JSON.stringify(projectId), flow_type, localStorage);
            setInStorage('taskId', JSON.stringify(taskId), flow_type, localStorage);
            setLanguage(profile_details.route);
            navigate(ROUTES.SHIKSHALOKAM_HOME_PAGE);
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

    if(!getFromStorage('profileid')) {
      fetchProfileDetails();
    }
  }, []);

  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 justify-center h-screen">
      {isLoading&& 
        <div className="login-load-spinner">
          <div className="login-div67">
            <BiLoader className="login-rotate-loader login-loader-icon" />
          </div>
        </div> 
      }
    </div>
  );
}

export default SsoFlow;

/* eslint-disable react-hooks/exhaustive-deps */