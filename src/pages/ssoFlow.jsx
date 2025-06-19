/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { getSessionDetails, readElevateProfile } from "../services/api.service";
import { useLocation, useNavigate } from "react-router-dom";
import ROUTES from "../url";
import { BiLoader } from "react-icons/bi";
import "../components/custom-style.css"
import "../index.css"
import { clearFromStorage, getFromStorage, setInStorage } from "../services/storage_service";
import { setLanguage } from "../i18n";



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

      if(!accessToken || accessToken === '') {
        navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN);
        window.location.reload();
      }
      try {
        const data = await readElevateProfile(accessToken);
        console.log(data)
        if (data && data?.status.toLowerCase() === 'ok') {
          const profile_details = data?.profile_details;
          if(profile_details) {
            let session = await getSessionDetails();
            setInStorage('first_name', JSON.stringify(profile_details.first_name));
            setInStorage('company', JSON.stringify(profile_details.company));
            setInStorage('state', JSON.stringify(profile_details.state));
            setInStorage('flow', profile_details.flow);
            setInStorage('route', JSON.stringify(profile_details.route));
            setInStorage('has_accepted_tnc', JSON.stringify(profile_details.has_accepted_tnc));
            setInStorage('access_token', JSON.stringify(accessToken));
            setInStorage('profileid', JSON.stringify(profile_details.profileid));
            setInStorage('sessionid', JSON.stringify(session.sessionid));
            setInStorage('isNewChatOpen', JSON.stringify(true));
            setLanguage(profile_details.route);
            navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT);
          } else {
            navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN);
            window.location.reload();
          }
        } else {
          navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN);
          window.location.reload();
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN);
        window.location.reload();
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