/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { getProfileDetails, getSessionDetails } from "../services/api.service";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useUserDispatcher } from "../context/user";
import { useLocalStorage } from "react-use";
import USER_ACTIONS from "../context/user/user-actions";
import FormData from "./Form/FormData";
import ROUTES from "../url";
import { BiLoader } from "react-icons/bi";
import "./custom-style.css"
import "../index.css"
import { languageList, sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";
import i18n, { setLanguage } from '../i18n';
import { clearFromStorage } from "../pages/ShikshalokamVoiceChat/voice-chat";
import { useTranslation } from "react-i18next";

const cookies = new Cookies();
const login_api_url = `/api/login/`;

function Login({ type, variant }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [userLanguage, setUserLanguage] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const [pageLanguage, setPageLanguage] = useState(
    JSON.parse(localStorage.getItem("local_route")) || languageList[0].value
  );
  const [userState, setUserState] = useState({
    key: "",
    value: ""
  });
  const [userDistrict, setUserDistrict] = useState({
    key: "",
    value: ""
  });
  const [userBlock, setUserBlock] = useState({
    key: "",
    value: ""
  });
  const [phoneNumberField, setPhoneNumberField] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const userDispatcher = useUserDispatcher();
  const [, setLocalUserData] = useLocalStorage("grit", {});
  const [, , removeLocalChatHistory] =
  useLocalStorage("chat-history", []);

  const [stateLabelArray, setStateLabelArray] = useState([]);
  const [districtLabelArray, setDistrictLabelArray] = useState([]);
  const [blockLabelArray, setBlockLabelArray] = useState([]);

  const { t } = useTranslation();

  useEffect(() => {
    clearFromStorage()

  }, []);

  useEffect(()=>{
    getStateLabelValue()
  }, [])

  const handlePageLanguageChange = (e) => {
    setPageLanguage(e?.target?.value);
    setLanguage(e?.target?.value);
    localStorage.setItem('local_route', JSON.stringify(e?.target?.value));
  };

  const handleLanguageChange = (e) => {
    setUserLanguage(e.target.value);
    localStorage.setItem('preferred_route', JSON.stringify(e?.target?.value));
    // setLanguage(e.target.value)
  };

  const handlePhoneChange = (e) => {
    if (e?.target?.value?.length <= 10) {
      const numericInput = e?.target?.value?.replace(/[^0-9]/g, "");
      setPhoneNumberField(numericInput);
    }
  };

  const handleStateChange = (e) => {
    setUserState({
      key: e?.target?.selectedOptions[0]?.text,
      value: e?.target?.value
    });
    setDistrictLabelArray([])
    setBlockLabelArray([])
    getDistrictLabelValue(e?.target?.value)
    setUserDistrict({
      key: "",
      value: ""
    })
    setUserBlock({
      key: "",
      value: ""
    });
  };

  const handleDistrictChange = (e) => {
    setUserDistrict({
      key: e?.target?.selectedOptions[0]?.text,
      value: e?.target?.value
    });
    setBlockLabelArray([])
    getBlockLabelValue(e?.target?.value)
    setUserBlock({
      key: "",
      value: ""
    });
  };

  const handleBlockChange = (e) => {
    setUserBlock({
      key: e?.target?.selectedOptions[0]?.text,
      value: e?.target?.value
    });
  };

  const handleEmailChange = (e) => {
    setEmailId(e.target.value);
  };

  const handleNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const isValidIndianMobileNumber = (number) => {
    const regex = /^(?!.*(\d)(\1{9}))[6-9]\d{9}$/;
    return regex.test(number);
  };

  const getStateLabelValue = async () => {
    try {
      const response = await axiosInstance({
        url: 'api/get-location/',
        method: "GET",
      });
  
      const list = response?.data?.list;
  
      if (Array.isArray(list) && list.length > 0) {
        setStateLabelArray(
          list.map(item => ({
            label: item?.name || "",
            value: item?.id || ""
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const getDistrictLabelValue = async (id) => {
    try {

      if(!id) {
        setDistrictLabelArray([])
        return;
      }
      const response = await axiosInstance({
        url: `api/get-location/?parentId=${id}`,
        method: "GET",
      });
  
      const list = response?.data?.list;
  
      if (Array.isArray(list) && list.length > 0) {
        setDistrictLabelArray(
          list.map(item => ({
            label: item?.name || "",
            value: item?.id || ""
          }))
        );
      } else{
        setDistrictLabelArray([])
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const getBlockLabelValue = async (id) => {
    try {

      if(!id) {
        setBlockLabelArray([])
        return;
      }
      const response = await axiosInstance({
        url: `api/get-location/?parentId=${id}`,
        method: "GET",
      });
  
      const list = response?.data?.list;
  
      if (Array.isArray(list) && list.length > 0) {
        setBlockLabelArray(
          list.map(item => ({
            label: item?.name || "",
            value: item?.id || ""
          }))
        );
      } else{
        setBlockLabelArray([])
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };
  

  const submitForm = async (event) => {
    try{
      if (!event.target.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    
      event.preventDefault();
      setFieldError("");
  
      if (phoneNumberField && !isValidIndianMobileNumber(phoneNumberField)) {
        setFieldError("Please enter a valid phone number.");
        setTimeout(() => {
          setFieldError("");
        }, 10000);
        return;
      }
      const customEmail = phoneNumberField + "@shikshalokam.org"
      const currentFlow = localStorage.getItem('flow');
  
      const body = {
        first_name: firstName,
        email: phoneNumberField? customEmail : emailId,
        phone: phoneNumberField,
        preferred_route: userLanguage,
        company: "shikshalokamstaging",
        password: "grit@123",
        latest_flow_used: currentFlow,
        profile_address: [
          {
            state: userState?.key,
            block: userBlock?.key,
            district: userDistrict?.key,
          },
        ],
      };
  
      setIsLoading(true);
      const res = await getProfileDetails(body);
  
      if (res?.status === "error") {
        setLoginErrorMessage(res?.message.slice(2, -2));
        setIsLoading(false);
        return;
      }
      let session = await getSessionDetails();
      localStorage.setItem('profileid', JSON.stringify(res.id));
      localStorage.setItem('sessionid', JSON.stringify(session.sessionid));
      localStorage.setItem('isNewChatOpen', JSON.stringify(true));
  
      const response = await axiosInstance({
        url: login_api_url,
        method: "POST",
        data: {
          email: phoneNumberField? customEmail : emailId,
          password: "grit@123",
        },
      });
  
  
      if (!!response?.data?.access_token) {
        userDispatcher({
          type: USER_ACTIONS.LOGIN,
          payload: response?.data,
        });
        localStorage.setItem('first_name', JSON.stringify(response?.data?.first_name));
        localStorage.setItem('access_token', JSON.stringify(response?.data?.access_token));
        localStorage.setItem('company', JSON.stringify(response?.data?.company));
        localStorage.setItem('state', JSON.stringify(response?.data?.state));
        localStorage.setItem('flow', sessionFlowName.LoginMiStory);
        cookies.set("profileid", JSON.stringify(response?.data?.id), {
          path: "/",
        });
        cookies.set("access_token", response?.data?.access_token, {
          path: "/",
        });
        setLocalUserData(response?.data);
        // temp code (need to remove below later)
        const lang = localStorage.getItem('preferred_route');

        if(lang){
          localStorage.setItem('route', lang);
          setLanguage(JSON.parse(lang));
        }
        // temp code (need to remove above later)

        navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT);
      } else {
        navigate("/login");
        window.location.reload();
      }
  
      setIsLoading(false);
    } catch(e) {
      console.log("Error in submitForm", e)
      setIsLoading(false);
    }
    
  };

  const handleCheckboxChange = (e) => {
    setIsChecked(e?.target?.checked);
  };

  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 justify-center h-screen">
      <div className="absolute top-6 right-6 min-w-[100px] max-w-fit hidden sm:block">
        <FormData
          layOut={2}
          labelName=""
          id="pagelanguageID"
          selectID="pagelanguageID"
          selectName="language"
          selectOptions={languageList}
          labelDivClass="text-left text-slate-700"
          selectValue={pageLanguage}
          selectClassName="bg-white text-slate-600 rounded-3xl p-3 mt-0 outline outline-slate-300 outline-1 outline-offset min-w-max"
          selectOnChange={handlePageLanguageChange}
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
          <div className="mt-[40px]">
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
                  id="pagelanguageID"
                  selectID="pagelanguageID"
                  selectName="language"
                  selectOptions={languageList}
                  labelDivClass="text-left text-slate-700"
                  selectValue={pageLanguage}
                  selectClassName="bg-white text-slate-600 rounded-3xl p-3 mt-0 outline outline-slate-300 outline-1 outline-offset min-w-max"
                  selectOnChange={handlePageLanguageChange}
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
              <div className="text-center sm:text-2xl text-md  mt-[100px] text-slate-700">
                <b>{t('welcome_text')}</b>
              </div>
            </>
          <div className="p-2 text-center">
            <form id="myForm" onSubmit={submitForm}>
              <>
                <div className="text-left text-slate-700 mt-7 ml-[7%] md:ml-[18%]">
                  <b>{t('firstNameText')} *</b>
                </div>
                <div>
                  <input
                    className="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    name="first_name"
                    required
                    type="text"
                    value={firstName}
                    onChange={handleNameChange}
                    placeholder="First name"
                  />
                </div>
              </>
                <>
                  <FormData layOut={1} isRequired={true}  labelName={`${t('phoneNumberText')} *`} id="phnNumID" inputType="text" inputName="phoneNumber" placeholder={t('phoneNumberText')}
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    inputClass="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    inputOnChange={handlePhoneChange}
                    fieldError={fieldError}
                    inputValue = {phoneNumberField}
                  />
                  <FormData layOut={2} labelName={`${t('languageText')} *`} id="languageID" selectID="languageID" selectName="language"
                    selectOptions={languageList}
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    selectValue = {userLanguage}
                    selectClassName="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    selectOnChange={handleLanguageChange}
                    isRequired={true}
                  />
                  <FormData layOut={2} labelName={`${t('stateText')}  *`} id="stateNameID" selectID="stateNameID" selectName="stateName"
                    selectOptions={stateLabelArray}
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    selectValue = {userState?.value}
                    selectClassName="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    selectOnChange={handleStateChange}
                    isRequired={stateLabelArray?.length > 0 ? true : false}                 />
                  <FormData layOut={2} 
                    labelName={`${t('districtText')}${districtLabelArray?.length > 0 ? ' *' : ''}`}
                    id="districtNameID" selectID="districtNameID" selectName="districtName"
                    selectOptions={districtLabelArray}
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    selectValue = {userDistrict?.value}
                    selectClassName="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    selectOnChange={handleDistrictChange}
                    isRequired={districtLabelArray?.length > 0 ? true : false}
                  />
                  <FormData layOut={2} 
                    labelName={`${t('blockText')}${blockLabelArray?.length > 0 ? ' *' : ''}`}
                    id="blockNameID" selectID="blockNameID" selectName="blockName"
                    selectOptions={blockLabelArray}
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    selectValue = {userBlock?.value}
                    selectClassName="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    selectOnChange={handleBlockChange}
                    isRequired={blockLabelArray?.length > 0 ? true : false}
                  />
                  <div className="text-left text-slate-700 ml-[4%] md:ml-[18%] mt-6">
                    <label className="inline-block">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 border-2 border-slate-300 rounded-sm checked:bg-purple-600 checked:border-purple-600 focus:outline-none transition duration-300 transform scale-110 hover:scale-100 checked:scale-100 checked:transition-all align-middle"
                        required
                      />
                      <span className="text-slate-700 ml-2">
                        {t('tncText1')}{' '}
                      </span>
                      <button href="/terms-and-conditions"
                       className="text-purple-600 hover:underline whitespace-nowrap"
                       onClick={(e) => {
                        e.preventDefault();
                        navigate(ROUTES.TERMS_AND_CONDITIONS);
                       }}
                      >
                      {' '}{t('tncText2')}
                      </button>
                    </label>
                  </div>
                </>
              
              <div>
                <label
                  id="error-form"
                  className="text-rose-600 mt-1 ml-[18%] mb-0"
                ></label>
              </div>
              <div>
                {/* <a href="#" className="no-underline"> */}
                {(loginErrorMessage && loginErrorMessage !== '')&&(
                  <p className="text-red-500 font-bold text-sm">{loginErrorMessage}</p>
                )}
                <button
                  id="demo"
                  className=" p-3 mt-6 mb-2 px-5 py-3 text-white rounded-md"
                  style={{backgroundColor: "#572E91"}}
                  type="submit"
                >
                  {t('LetGetStartedBtn')}
                </button>
                {/* </a> */}
              </div>
            </form>
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

export default Login;

/* eslint-disable react-hooks/exhaustive-deps */
