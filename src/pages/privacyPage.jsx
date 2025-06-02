/* eslint-disable react-hooks/exhaustive-deps */
import "../style.css"
import { useTranslation } from "react-i18next";
import PrivacyPolicyPage from "../components/TnC/privacyPolicy";
import FormData from "../components/Form/FormData";
import { setLanguage } from "../i18n";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { languageList } from "./ShikshalokamVoiceChat/enum";
import { clearFromStorage } from "./ShikshalokamVoiceChat/voice-chat";


function PrivacyPage() {
    const navigate = useNavigate();
    const [userLanguage, setUserLanguage] = useState(
        JSON.parse(localStorage.getItem("local_route")) || languageList[0].value
    );
    
    const { t } = useTranslation();
    
    const handleLanguageChange = (e) => {
        setUserLanguage(e?.target?.value);
        setLanguage(e?.target?.value);
        localStorage.setItem('local_route', JSON.stringify(e?.target?.value));
    };

    return (
        <>
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
              src={t('pageLogo')}
              className="h-[100px] w-[200px] object-contain aspect-auto align-top object-[center_center] relative ml-0"
              alt="shikshalokam_logo"
            />
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
      <div className="flex justify-between w-full sm:hidden items-center p-2">
  <img
    src={t('pageLogo')}
    className="h-[80px] w-[100px] object-contain"
    alt="shikshalokam_logo"
  />
  <div className="w-[140px] flex justify-end p-2">
    <FormData
      layOut={2}
      labelName=""
      id="languageID"
      selectID="languageID"
      selectName="language"
      selectOptions={languageList}
      labelDivClass="text-left text-slate-700"
      selectValue={userLanguage}
      selectClassName="bg-white text-slate-600 rounded-3xl p-3 mt-0 outline outline-slate-300 outline-1 outline-offset min-w-0 w-full"
      selectOnChange={handleLanguageChange}
      isRequired={true}
    />
  </div>
</div>

        <div className="bg-slate-50 h-full sm:pt-6">
            <>
                <div className="text-center sm:text-2xl mt-[100px] text-md text-slate-700">
                    <div className="container max-w-full md mx-auto py-6">
                        <PrivacyPolicyPage tncText={t('tncText')} shouldShowAcceptDecline={false} 
                        onAccept={()=>{}} onDecline={()=>{}} />
                    </div>
                </div>
            </>
        </div>
      </div>
    </div>
        </>
    );
}

export default PrivacyPage;

/* eslint-disable react-hooks/exhaustive-deps */
