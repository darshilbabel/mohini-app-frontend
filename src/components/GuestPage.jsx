/* eslint-disable react-hooks/exhaustive-deps */
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import "./custom-style.css"
import "../index.css"
import ROUTES from "../url";
import { getIpLocation, getProfileDetails, getSessionDetails } from "../services/api.service";
import { BiLoader } from "react-icons/bi";
import { useEffect, useState } from "react";
import { setLanguage } from "../i18n";
import { languageList, sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";
import FormData from "./Form/FormData";
import { useTranslation } from "react-i18next";
import { loginApi } from "api/endpoints/auth";

function GuestPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userLanguage, setUserLanguage] = useState(
    JSON.parse(localStorage.getItem("local_route")) || languageList[0].value
  );

  const { t } = useTranslation();
  
  useEffect(() => {
    if (!localStorage.getItem("local_route")) {
      localStorage.setItem("local_route", JSON.stringify(languageList[0].value));
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

  function getUserFingerPrint() {
    try {
      const fingerprint =
        window.navigator.userAgent +
        window.navigator.language +
        window.screen.colorDepth +
        window.screen.pixelDepth +
        window.screen.width +
        window.screen.height;

      const storedUserId = localStorage.getItem('device_id');
      const newUserId = storedUserId || btoa(fingerprint);

      localStorage.setItem('device_id', newUserId);
    } catch (error) {
      console.error('Error handling user ID:', error);
    }
  }

  const handleLanguageChange = (e) => {
    setUserLanguage(e?.target?.value);
    setLanguage(e?.target?.value);
    localStorage.setItem('local_route', JSON.stringify(e?.target?.value));
  };

  const setFinalLanguage = async () => {
    const currentFlow = localStorage.getItem('flow');
    if(currentFlow && [sessionFlowName.GuestMiStory, sessionFlowName.GuestDiscussion].includes(currentFlow)){
      await initialSetup();
    }
    const lang = localStorage.getItem('preferred_route');

    if(lang){
      localStorage.setItem('route', lang);
      setLanguage(JSON.parse(lang));
    }
    else if(currentFlow && [sessionFlowName.GuestMiStory, sessionFlowName.GuestDiscussion].includes(currentFlow)){
      setLanguage(languageList[0].value);
    }
    getUserFingerPrint();
  }

  async function initialSetup() {
    try{
      const deviceId = localStorage.getItem('device_id')
      const customEmail = deviceId + "@shikshalokam.org"
      const currentFlow = localStorage.getItem('flow');
      const body = {
        email: customEmail,
        company: "shikshalokamstaging",
        password: "grit@123",
        latest_flow_used: currentFlow,
        other_params: {
          device_id: deviceId,
          city: localStorage.getItem('ip_city') || "",
          state: localStorage.getItem('ip_state') || "",
          country: localStorage.getItem('ip_country') || "",
        }
      }
      
      setIsLoading(true);
      const res = await getProfileDetails(body);
      
      if (res?.status === "error") {
        setIsLoading(false);
        return;
      }
  
      localStorage.setItem('profileid', JSON.stringify(res.id));
  
      let session = await getSessionDetails();
      localStorage.setItem('sessionid', JSON.stringify(session.sessionid));
  
      const response = await loginApi({
        email: customEmail,
        password: "grit@123",
      });
  
      if (!!response?.access_token) {
        localStorage.setItem('company', JSON.stringify(response?.company));
        localStorage.setItem('first_name', JSON.stringify(response?.first_name));
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

  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 justify-center h-screen">
      <div className="absolute top-6 right-6 min-w-[100px] max-w-fit hidden sm:block">
        <FormData
          layOut={2}
          labelName=""
          id="languageID"
          selectID="languageID"
          selectName="language"
          selectOptions={languageList}
          labelDivClass="text-left text-slate-700"
          selectValue={userLanguage}
          selectClassName="bg-white text-slate-600 rounded-3xl p-3 mt-0 outline outline-slate-300 outline-1 outline-offset min-w-max"
          selectOnChange={handleLanguageChange}
          isRequired={true}
        />
      </div>
      <div className="px-5 hidden sm:block">
          <div className="flex">
            <img
              src="https://static-media.gritworks.ai/fe-images/PNG/Shikshalokam/shikshagrahaLogo.png"
              className="h-[100px] w-[200px] object-contain aspect-auto align-top object-[center_center] relative ml-0"
              alt="shikshalokam_logo"
            />
          </div>
          <div className="flex flex-col items-center sm:mt-[150px]">
            <ol className="text-left sm:text-2xl text-md text-slate-700 list-decimal pl-5" 
              style={{ color: "#6eafaf" }}
            >
              <li>{t('start_chat')}</li>
              <li>{t('add_photos')}</li>
              <li>{t('download_report')}</li>
            </ol>
          </div>
      </div>
      <div className="">
        <div className="justify-center w-full flex sm:hidden">
          <div className="w-[100%]">
                <div className="flex p-2 mx-auto px-auto items-center justify-center">
                  <img
                    src="https://static-media.gritworks.ai/fe-images/PNG/Shikshalokam/shikshagrahaLogo.png"
                    className="h-[100px] w-[200px] object-contain aspect-auto align-top object-[center_center] relative ml-0"
                    alt="shikshalokam_logo"
                  />
              </div>
          </div>
        </div>
        <div className="bg-slate-50 h-full sm:pt-6">
            <div className="flex justify-end mr-6 relative block sm:hidden">
              <div className="absolute top-0 right-6 min-w-[100px] max-w-fit">
                <FormData
                  layOut={2}
                  labelName=""
                  id="languageID"
                  selectID="languageID"
                  selectName="language"
                  selectOptions={languageList}
                  labelDivClass="text-left text-slate-700"
                  selectValue={userLanguage}
                  selectClassName="bg-white text-slate-600 rounded-3xl p-3 mt-0 outline outline-slate-300 outline-1 outline-offset min-w-max"
                  selectOnChange={handleLanguageChange}
                  isRequired={true}
                />
              </div>
            </div>
            <div className="sm:hidden flex flex-col items-center mt-[150px]">
            <ol className="text-left sm:text-2xl text-md text-slate-700 list-decimal pl-5" 
              style={{ color: "#6eafaf" }}
            >
              <li>{t('start_chat')}</li>
              <li>{t('add_photos')}</li>
              <li>{t('download_report')}</li>
            </ol>
            </div>
            <>
              <div className="text-center sm:text-2xl text-md sm:mt-[150px] mt-[40px] text-slate-700">
                <b>{t('welcome_text')}</b>
              </div>
            </>
            <div className="p-2 text-center sm:mt-[60px]">
              <div className="flex flex-col mx-auto w-64">
                <button
                  id="demo"
                  className="w-full p-3 mt-6 mb-2 px-5 py-3 text-white rounded-md"
                  style={{backgroundColor: "#572E91"}}
                  onClick={async() => {
                    if(!localStorage.getItem('sessionid')){
                      setIsLoading(true);
                      localStorage.setItem('isNewChatOpen', JSON.stringify(true));
                      localStorage.setItem('flow', sessionFlowName.GuestMiStory);
                    }
                    await setFinalLanguage();
                    navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT);
                  }}
                >
                  {t('captureStoryText')}
                </button>
                <button
                  id="demo"
                  className="w-full p-3 mt-6 mb-2 px-5 py-3 text-white rounded-md"
                  style={{backgroundColor: "#572E91"}}
                  onClick={async () => {
                    if(!localStorage.getItem('sessionid')){
                      setIsLoading(true);
                      localStorage.setItem('isNewChatOpen', JSON.stringify(true));
                      const locationData = await getIpLocation();
                      if (locationData && locationData?.location) {
                        localStorage.setItem('ip_state', locationData?.location?.regionName);
                        localStorage.setItem('ip_city', locationData?.location?.city);
                        localStorage.setItem('ip_country', locationData?.location?.country);
                      }
                      localStorage.setItem('flow', sessionFlowName.GuestDiscussion);
                    } else {
                      localStorage.setItem('flow', sessionFlowName.LoginDiscussion);
                    }
                    await setFinalLanguage();
                    navigate(ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT);
                  }}
                >
                  {t('captureDiscussionText')}
                </button>
              </div>
            </div>
        </div>
      </div>
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

export default GuestPage;
