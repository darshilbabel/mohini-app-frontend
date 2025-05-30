/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { getSessionDetails, readElevateProfile } from "../services/api.service";
import { useLocation, useNavigate } from "react-router-dom";
import ROUTES from "../url";
import { BiLoader } from "react-icons/bi";
import "../components/custom-style.css"
import "../index.css"
import { clearFromStorage, getFromStorage, setInStorage } from "./ShikshalokamVoiceChat/voice-chat";
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
      // const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjo5NiwibmFtZSI6Im5pc2h0aGEgYmlzd2FzIiwic2Vzc2lvbl9pZCI6MjkwNywib3JnYW5pemF0aW9uX2lkcyI6WyI5Il0sIm9yZ2FuaXphdGlvbl9jb2RlcyI6WyJteXMiXSwidGVuYW50X2NvZGUiOiJzaGlrc2hhZ3JhaGEiLCJvcmdhbml6YXRpb25zIjpbeyJpZCI6OSwibmFtZSI6Ik15c29yZSIsImNvZGUiOiJteXMiLCJkZXNjcmlwdGlvbiI6Ik15c29yZSBhIGNpdHkgaW4gSW5kaWFzIHNvdXRod2VzdGVybiBLYXJuYXRha2Egc3RhdGUgd2FzIHRoZSBjYXBpdGFsIG9mIHRoZSBLaW5nZG9tIG9mIE15c29yZSBmcm9tIDEzOTkgdG8gMTk0NyIsInN0YXR1cyI6IkFDVElWRSIsInJlbGF0ZWRfb3JncyI6bnVsbCwidGVuYW50X2NvZGUiOiJzaGlrc2hhZ3JhaGEiLCJtZXRhIjp7InRlcm1zIjpbeyJpZGVudGlmaWVyIjoibWlncmF0aW9uLWZyYW1ld29ya19ib2FyZF9jYnNlIiwibm9kZV9pZCI6Im1pZ3JhdGlvbi1mcmFtZXdvcmtfYm9hcmRfY2JzZSJ9LHsiaWRlbnRpZmllciI6Im1pZ3JhdGlvbi1mcmFtZXdvcmtfbWVkaXVtX2VuZ2xpc2giLCJub2RlX2lkIjoibWlncmF0aW9uLWZyYW1ld29ya19tZWRpdW1fZW5nbGlzaCJ9LHsiaWRlbnRpZmllciI6Im1pZ3JhdGlvbi1mcmFtZXdvcmtfZ3JhZGVsZXZlbF9ncmFkZTEwIiwibm9kZV9pZCI6Im1pZ3JhdGlvbi1mcmFtZXdvcmtfZ3JhZGVsZXZlbF9ncmFkZTEwIn0seyJpZGVudGlmaWVyIjoibWlncmF0aW9uLWZyYW1ld29ya19zdWJqZWN0X2hpbmRpIiwibm9kZV9pZCI6Im1pZ3JhdGlvbi1mcmFtZXdvcmtfc3ViamVjdF9oaW5kaSJ9LHsiaWRlbnRpZmllciI6Im1pZ3JhdGlvbi1mcmFtZXdvcmtfc3ViamVjdF9lbmdsaXNoIiwibm9kZV9pZCI6Im1pZ3JhdGlvbi1mcmFtZXdvcmtfc3ViamVjdF9lbmdsaXNoIn0seyJpZGVudGlmaWVyIjoibWlncmF0aW9uLWZyYW1ld29ya19zdWJqZWN0X21hdGhzIiwibm9kZV9pZCI6Im1pZ3JhdGlvbi1mcmFtZXdvcmtfc3ViamVjdF9tYXRocyJ9XSwiZnJhbWV3b3JrIjp7Im5vZGVfaWQiOiJtaWdyYXRpb24tZnJhbWV3b3JrIiwidmVyc2lvbktleSI6IjE3NDI4ODU3Njc4NDEifX0sImNyZWF0ZWRfYnkiOjEsInVwZGF0ZWRfYnkiOm51bGwsInJvbGVzIjpbeyJpZCI6MTUsInRpdGxlIjoibWVudGVlIiwibGFiZWwiOm51bGwsInVzZXJfdHlwZSI6MCwic3RhdHVzIjoiQUNUSVZFIiwib3JnYW5pemF0aW9uX2lkIjo3LCJ2aXNpYmlsaXR5IjoiUFVCTElDIiwidGVuYW50X2NvZGUiOiJzaGlrc2hhZ3JhaGEiLCJ0cmFuc2xhdGlvbnMiOm51bGx9LHsiaWQiOjMzLCJ0aXRsZSI6ImxlYXJuZXIiLCJsYWJlbCI6IkxlYXJuZXIiLCJ1c2VyX3R5cGUiOjAsInN0YXR1cyI6IkFDVElWRSIsIm9yZ2FuaXphdGlvbl9pZCI6NywidmlzaWJpbGl0eSI6IlBVQkxJQyIsInRlbmFudF9jb2RlIjoic2hpa3NoYWdyYWhhIiwidHJhbnNsYXRpb25zIjpudWxsfV19XX0sImlhdCI6MTc0ODUwNDg2MiwiZXhwIjoxNzQ4NTkxMjYyfQ.XhAxlzRB55PA8WqdCUHJEPB2UItnnqP-IfRMHC_ti9k'
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