import { useEffect } from "react";
import { useLocalStorage } from "react-use";
import { useUserDispatcher } from "../../context/user";
import USER_ACTIONS from "../../context/user/user-actions";
import Cookies from "universal-cookie";
import getConfiguration, { company_list } from "../../configure";
import { Link } from "react-router-dom";
import { logoutApi } from "api/endpoints/auth";

const logout_api_url = `/api/logout/`;
const company_config = getConfiguration();
const cookies = new Cookies();

const Logout = () => {
  const [localUserData, setLocalUserData, removeUserLocalData] =
    useLocalStorage("grit", {});
  const userDispatcher = useUserDispatcher();
  const [companyData, setCompanyData, removeCompanyData] = useLocalStorage("companyData", {});
  const [isStoryFormedAfterCall, setIsStoryFormedAfterCall, removeIsStoryFormedAfterCall] = useLocalStorage("isStoryFormedAfterCall", {});
  const [isRecordButtonClicked, setIsRecordButtonClicked, removeIsRecordButtonClicked] = useLocalStorage("isRecordButtonClicked", {});

  useEffect(() => {
    async function logout() {
      try {
        await logoutApi();
        removeUserLocalData();
        userDispatcher({
          type: USER_ACTIONS.RESET,
          payload: {},
        });
        cookies.remove("profileid", {
          path: "/",
        });
        cookies.remove("accessToken", {
          path: "/",
        });
        cookies.remove("company", {
          path: "/",
        });
        cookies.remove("sessionid", {
          path: "/",
        });
        cookies.remove("route", {
          path: "/",
        });
        cookies.remove("first_name", {
          path: "/",
        });
        cookies.remove("interviewsessionid", {
          path: "/",
        });
        cookies.remove('temp_sessionid', {
          path: "/",
        });
        cookies.remove('first_name', {
          path: '/',
        })
        cookies.remove('messageid', {
          path: '/',
        })
        cookies.remove('company_slug', {
          path: '/',
        })
        cookies.remove("state", {
          path: "/",
        });
        cookies.remove("fName", {
          path: "/",
        });
        cookies.remove("location", {
          path: "/",
        });
        cookies.remove("org_associated", {
          path: "/",
        });
        cookies.remove("product_interested", {
          path: "/",
        });
        removeCompanyData();
        removeIsStoryFormedAfterCall();
        removeIsRecordButtonClicked();
        localStorage.removeItem('countdownTime');
        localStorage.removeItem('profileid');
        localStorage.removeItem('sessionid');
        localStorage.removeItem('route');
        localStorage.removeItem('countdownTime_times');
        localStorage.removeItem('chatbot_clickedOn?');
        localStorage.removeItem('isChatVisible');
        localStorage.removeItem('chat-history');
        localStorage.removeItem('isCallError');
        localStorage.removeItem('timerStart');
        localStorage.removeItem('botName');
        localStorage.removeItem('type');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('company');
        localStorage.removeItem('state');
        localStorage.removeItem('showHomepage');
        localStorage.removeItem('showFileInput');
        localStorage.removeItem('intro_message');
        localStorage.removeItem('isOldChatOpen');
        localStorage.removeItem('isNewChatOpen');
        localStorage.removeItem('model');
    

      } catch (error) {
        console.error({ error });

        removeUserLocalData();
        userDispatcher({
          type: USER_ACTIONS.RESET,
          payload: {},
        });
        cookies.remove("profileid", {
          path: "/",
        });
        cookies.remove("accessToken", {
          path: "/",
        });
        cookies.remove("company", {
          path: "/",
        });
        cookies.remove("sessionid", {
          path: "/",
        });
        cookies.remove("route", {
          path: "/",
        });
        cookies.remove("first_name", {
          path: "/",
        });
        cookies.remove("interviewsessionid", {
          path: "/",
        });
        cookies.remove('temp_sessionid', {
          path: "/",
        });
        cookies.remove('first_name', {
          path: '/',
        })
        cookies.remove('messageid', {
          path: '/',
        })
        cookies.remove('company_slug', {
          path: '/',
        })
        cookies.remove("state", {
          path: "/",
        });
        cookies.remove("fName", {
          path: "/",
        });
        cookies.remove("location", {
          path: "/",
        });
        cookies.remove("org_associated", {
          path: "/",
        });
        cookies.remove("product_interested", {
          path: "/",
        });
        removeCompanyData();
        removeIsStoryFormedAfterCall();
        removeIsRecordButtonClicked();
        localStorage.removeItem('countdownTime');
        localStorage.removeItem('profileid');
        localStorage.removeItem('sessionid');
        localStorage.removeItem('route');
        localStorage.removeItem('countdownTime_times');
        localStorage.removeItem('chatbot_clickedOn');
        localStorage.removeItem('isChatVisible');
        localStorage.removeItem('chat-history');
        localStorage.removeItem('isCallError');
        localStorage.removeItem('timerStart');
        localStorage.removeItem('showHomepage');
        localStorage.removeItem('showFileInput');
        localStorage.removeItem('intro_message');
        localStorage.removeItem('isOldChatOpen');
        localStorage.removeItem('isNewChatOpen');
        localStorage.removeItem('model');
        localStorage.removeItem('llmError');
      }
    }
    if (!!Object.keys(localUserData || {}).length) {
      logout();
    }
    return () => {};
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center text-2xl text-gray-600 font-semibold">
      <div className="p-2">
        <p className="text-center">{getLogoutText()}</p>
          <p className="text-center">
            <Link className="text-teal-500 underline py-4 block" to={company_config.reroute}>
              Go to Login
            </Link>
          </p>
      </div>
    </div>
  );
};

export default Logout;

const getLogoutText = () => {
  switch (getConfiguration().company_subdomain) {
    case company_list.shikshalokam:  
      return "Thank you, you have successfully attempted your session.";
    default:
      return "You have successfully logged out!";
  }
};
