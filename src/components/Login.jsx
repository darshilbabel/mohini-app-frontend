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
import { languageList } from "../pages/ShikshalokamVoiceChat/enum";
import i18n, { setLanguage } from '../i18n';

const cookies = new Cookies();
const login_api_url = `/api/login/`;

function Login({ type, variant }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [userLanguage, setUserLanguage] = useState("");
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


  useEffect(() => {
    localStorage.removeItem('selected_type');
    localStorage.removeItem('isStoryFormedAfterCall');
    localStorage.removeItem('first_name');
    localStorage.removeItem('isChatVisible');
    localStorage.removeItem('type');
    localStorage.removeItem('variant');
    localStorage.removeItem('intro_message');
    localStorage.removeItem('isNewChatOpen');
    localStorage.removeItem('isOldChatOpen');
    localStorage.removeItem('showFileInput');
    localStorage.removeItem('company');
    localStorage.removeItem('state');
    removeLocalChatHistory();
    localStorage.removeItem('sessionid');
    localStorage.removeItem('profileid');
    localStorage.removeItem('access_token');
    localStorage.removeItem('route');
    localStorage.removeItem('botName');
    localStorage.removeItem('isRecordButtonClicked');
    localStorage.removeItem('grit');
    localStorage.removeItem('companyData');
    localStorage.removeItem('isCallError');
    localStorage.removeItem('timerStart');
    localStorage.removeItem('showHomepage');
    localStorage.removeItem('model');
    localStorage.removeItem('has_accepted_tnc');
    localStorage.removeItem('flow');
    localStorage.removeItem('statemachine_length');
    localStorage.removeItem('llmError');
    
    cookies.remove("profileid", {
      path: "/",
    });
    cookies.remove("access_token", {
      path: "/",
    });
    cookies.remove("company", {
      path: "/",
    });
    cookies.remove("sessionid", {
      path: "/",
    });
    cookies.remove('messageid', {
      path: '/',
    });
    cookies.remove('route', {
      path: '/',
    });
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

  }, []);

  useEffect(()=>{
    getStateLabelValue()
  }, [])

  const handleLanguageChange = (e) => {
    setUserLanguage(e.target.value);
    setLanguage(e.target.value)
  };

  const handleStateChange = (e) => {
    setUserState({
      key: e?.target?.selectedOptions[0]?.text,
      value: e?.target?.value
    });
    setDistrictLabelArray([])
    setBlockLabelArray([])
    getDistrictLabelValue(e?.target?.value)
  };

  const handleDistrictChange = (e) => {
    setUserDistrict({
      key: e?.target?.selectedOptions[0]?.text,
      value: e?.target?.value
    });
    setBlockLabelArray([])
    getBlockLabelValue(e?.target?.value)
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
    event.preventDefault();
    setFieldError("");

    if (phoneNumberField && !isValidIndianMobileNumber(phoneNumberField)) {
      setFieldError("Please enter a valid phone number.");
      setTimeout(() => {
        setFieldError("");
      }, 10000);
      return;
    }

    const body = {
      first_name: firstName,
      email: emailId,
      preferred_route: userLanguage,
      company: "shikshalokamstaging",
      password: "grit@123",
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
    localStorage.setItem('route', JSON.stringify(userLanguage));
    localStorage.setItem('sessionid', JSON.stringify(session.sessionid));
    localStorage.setItem('isNewChatOpen', JSON.stringify(true));

    const response = await axiosInstance({
      url: login_api_url,
      method: "POST",
      data: {
        email: emailId,
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
      localStorage.setItem('flow', 'login');
      cookies.set("profileid", JSON.stringify(response?.data?.id), {
        path: "/",
      });
      cookies.set("access_token", response?.data?.access_token, {
        path: "/",
      });
      setLocalUserData(response?.data);
      navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT);
    } else {
      navigate("/login");
      window.location.reload();
    }

    setIsLoading(false);
  };

  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 justify-center h-screen">
      <div className="px-5 hidden sm:block">
          <div className="flex">
            <img
              src="https://mohini-static.shikshalokam.org/fe-images/PNG/Shikshalokam/shikshalokam-logo.png"
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
        <div className="justify-center w-full flex sm:hidden">
          <div className="w-[100%]">
            
                <div className="flex p-2 mx-auto px-auto items-center justify-center">
                 <img
                  src="https://static-media.gritworks.ai/fe-images/PNG/Shikshalokam/shikshalokam_logo_pdf.png"
                  className="h-[60px] w-[auto] mt-6 mb-2 object-fill aspect-auto align-top object-[center_center] relative ml-2"
                  alt="grit_Logo"
                />
              </div>
          </div>
        </div>
        <div className="bg-slate-50 h-full sm:pt-6">

            <>
              <div className="text-center sm:text-2xl text-md pt-10 text-slate-700">
                <b>Welcome to ShikshaLokam!!</b>
              </div>
            </>
          <div className="p-2 text-center">
            <form id="myForm" onSubmit={submitForm}>
              <>
                <div className="text-left text-slate-700 mt-7 ml-[7%] md:ml-[18%]">
                  <b>First Name</b>
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
                  <FormData layOut={1} isRequired={true}  labelName="E-mail ID" id="emailID" inputType="email" inputName="email" placeholder="Email ID"
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    inputClass="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    inputOnChange={handleEmailChange}
                    inputValue = {emailId}
                  />
                  <FormData layOut={2} labelName="language" id="languageID" selectID="languageID" selectName="language"
                    selectOptions={languageList}
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    selectValue = {userLanguage}
                    selectClassName="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    selectOnChange={handleLanguageChange}
                  />
                  <FormData layOut={2} labelName="State" id="stateNameID" selectID="stateNameID" selectName="stateName"
                    selectOptions={stateLabelArray}
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    selectValue = {userState?.value}
                    selectClassName="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    selectOnChange={handleStateChange}
                    isRequired={stateLabelArray?.length > 0 ? true : false}                  />
                  <FormData layOut={2} labelName="District Name" id="districtNameID" selectID="districtNameID" selectName="districtName"
                    selectOptions={districtLabelArray}
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    selectValue = {userDistrict?.value}
                    selectClassName="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    selectOnChange={handleDistrictChange}
                    isRequired={districtLabelArray?.length > 0 ? true : false}
                  />
                  <FormData layOut={2} labelName="Block Name" id="blockNameID" selectID="blockNameID" selectName="blockName"
                    selectOptions={blockLabelArray}
                    labelDivClass="text-left text-slate-700 mt-6 ml-[7%] md:ml-[18%]"
                    selectValue = {userBlock?.value}
                    selectClassName="bg-white text-slate-600 rounded-md p-3 mt-1 outline outline-slate-300 outline-1 outline-offset w-[95%] md:w-[65%]"
                    selectOnChange={handleBlockChange}
                    isRequired={blockLabelArray?.length > 0 ? true : false}
                  />
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
                  className=" p-3 mt-6 mb-2 px-5 py-3 bg-mira-red-original hover:bg-mira-red-original text-white rounded-md"
                  style={{backgroundColor: "#c3234a"}}
                  type="submit"
                >
                  Let's Get Started
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
