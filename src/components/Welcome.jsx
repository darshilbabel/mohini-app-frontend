/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import "./custom-style.css"
import "../index.css"
import ROUTES from "../url";
import { useEffect, useState } from "react";
import FormData from "./Form/FormData";
import { setLanguage } from "../i18n";
import { languageList } from "../pages/ShikshalokamVoiceChat/enum";
import { useTranslation } from "react-i18next";
import { clearFromStorage } from "../services/storage_service";

function WelcomePage() {
  const navigate = useNavigate();
  const [userLanguage, setUserLanguage] = useState(
    JSON.parse(localStorage.getItem("local_route")) || languageList[0].value
  );
  
  const { t } = useTranslation();
  
  useEffect(() => {
    if (!localStorage.getItem("local_route")) {
      localStorage.setItem("local_route", JSON.stringify(languageList[0].value));
    }
    clearFromStorage()
  }, []);

  const handleLanguageChange = (e) => {
    setUserLanguage(e?.target?.value);
    setLanguage(e?.target?.value);
    localStorage.setItem('local_route', JSON.stringify(e?.target?.value));
  };

  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 justify-center">
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
          <div>
            <div className="text-left sm:text-2xl text-md text-slate-700">
              <b>{t('welcome_heading1')}</b>
            </div>
            <p className="pt-4 pb-4">
              {t('welcome_paragraph1')}
            </p>
          </div>
        <img
          src="https://mohini-static.shikshalokam.org/fe-images/PNG/Shikshalokam/innovationpana-1@2x.png"
          width="500"
          height="900"
          className="center-img custom-login-image"
          alt=""
        />
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
          <div className="mt-[150px] sm:hidden">
            <div className="text-center sm:text-2xl text-md text-slate-700">
              <b>{t('welcome_heading1')}</b>
            </div>
            <p className="pt-4 pb-4 text-center">
              {t('welcome_paragraph1')}
            </p>
          </div>
            <>
              <div className="text-center sm:text-2xl sm:mt-[150px] text-md text-slate-700">
                <b>{t('welcome_text')}</b>
              </div>
            </>
            <div className="p-2 text-center sm:mt-[60px]">
              <div className="flex flex-col mx-auto w-64">
                <button
                  id="demo"
                  className="w-full p-3 mt-6 mb-2 px-5 py-3 text-white rounded-md"
                  style={{backgroundColor: "#572E91"}}
                  onClick={() => {
                    navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN);
                  }}
                >
                  {t('loginBtnText')}
                </button>
                <button
                  id="demo"
                  className="w-full p-3 mt-6 mb-2 px-5 py-3 text-white rounded-md"
                  style={{backgroundColor: "#572E91"}}
                  onClick={() => {
                    navigate(ROUTES.SHIKSHALOKAM_GUEST_PAGE);
                  }}
                >
                  {t('guestBtnText')}
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
