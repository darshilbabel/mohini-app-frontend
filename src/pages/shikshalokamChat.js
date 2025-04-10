import { useEffect, useState } from "react";
import Login from "../components/Login";
import { getIpLocation, getProfileDetails, getSessionDetails } from "../services/api.service";
import { languageList, sessionFlowName } from "./ShikshalokamVoiceChat/enum";
import ROUTES from "../url";
import ShikshalokamVoiceBasedChat, { clearFromStorage } from "./ShikshalokamVoiceChat/voice-chat";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { setLanguage } from "../i18n";



function ShikshalokamChat({type, variant}) {
	const login_api_url = `/api/login/`;

	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [userId, setUserId] = useState(localStorage.getItem('device_id') || null);
		  
	useEffect(() => {
		if (!localStorage.getItem("local_route")) {
			localStorage.setItem("local_route", JSON.stringify(languageList[0].value));
		}
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
			setUserId(newUserId);
		} catch (error) {
			console.error('Error handling user ID:', error);
			setUserId('guest_' + Date.now());
		}
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
	  
		  const response = await axiosInstance({
			url: login_api_url,
			method: "POST",
			data: {
			  email: customEmail,
			  password: "grit@123",
			},
		  });
	  
		  if (!!response?.data?.access_token) {
			localStorage.setItem('company', JSON.stringify(response?.data?.company));
			localStorage.setItem('first_name', JSON.stringify(response?.data?.first_name));
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

	const setFinalLanguage = async () => {
		const currentFlow = localStorage.getItem('flow');
		if(currentFlow && [sessionFlowName.GuestDiscussion].includes(currentFlow)){
			await initialSetup();
		}
		if(currentFlow && [sessionFlowName.GuestDiscussion].includes(currentFlow)){
			setLanguage(languageList[0].value);
		}
		getUserFingerPrint();
	}

	useEffect(()=>{
		const runSetup = async () => {
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
				await setFinalLanguage();
			}
			else if (localStorage.getItem('flow') && !([sessionFlowName.GuestDiscussion].includes(localStorage.getItem('flow')))){
				clearFromStorage();
				window.location.reload();
			}
		};
		runSetup();
	}, [])

	return (
		<>
			{(userId && !isLoading)&&
				<>
					<ShikshalokamVoiceBasedChat type={'shikshalokam'} variant={'publicBot'}/>
				</>
			}
		</>
	);
}

export default ShikshalokamChat;
