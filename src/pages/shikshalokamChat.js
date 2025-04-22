import { useEffect, useState } from "react";
import Login from "../components/Login";
import { getIpLocation, getProfileDetails, getSessionDetails } from "../services/api.service";
import { languageList, sessionFlowName } from "./ShikshalokamVoiceChat/enum";
import ROUTES from "../url";
import ShikshalokamVoiceBasedChat, { clearFromStorage, getFromStorage, setInStorage } from "./ShikshalokamVoiceChat/voice-chat";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { setLanguage } from "../i18n";
import { BiLoader } from "react-icons/bi";



function ShikshalokamChat({type, variant}) {
	const login_api_url = `/api/login/`;

	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [userId, setUserId] = useState(getFromStorage('device_id') || null);
		  
	useEffect(() => {
		if (!getFromStorage("local_route")) {
			setInStorage("local_route", JSON.stringify(languageList[0].value), sessionFlowName.GuestDiscussion);
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

			const storedUserId = getFromStorage('device_id');
			const newUserId = storedUserId || btoa(fingerprint);

			setInStorage('device_id', newUserId, sessionFlowName.GuestDiscussion);
			setUserId(newUserId);
		} catch (error) {
			console.error('Error handling user ID:', error);
			setUserId('guest_' + Date.now());
		}
	}

	async function initialSetup() {
		try{
		  const deviceId = getFromStorage('device_id')
		  const customEmail = deviceId + "@shikshalokam.org"
		  const currentFlow = getFromStorage('flow');
		  const body = {
			email: customEmail,
			company: "shikshalokamstaging",
			password: "grit@123",
			latest_flow_used: currentFlow,
			other_params: {
			  device_id: deviceId,
			  city: getFromStorage('ip_city') || "",
			  state: getFromStorage('ip_state') || "",
			  country: getFromStorage('ip_country') || "",
			}
		  }
		  
		  setIsLoading(true);
		  const res = await getProfileDetails(body);
		  
		  if (res?.status === "error") {
			setIsLoading(false);
			return;
		  }
	  
		  setInStorage('profileid', JSON.stringify(res.id), sessionFlowName.GuestDiscussion);
	  
		  let session = await getSessionDetails();
		  setInStorage('sessionid', JSON.stringify(session.sessionid), sessionFlowName.GuestDiscussion);
	  
		  const response = await axiosInstance({
			url: login_api_url,
			method: "POST",
			data: {
			  email: customEmail,
			  password: "grit@123",
			},
		  });
	  
		  if (!!response?.data?.access_token) {
			setInStorage('company', JSON.stringify(response?.data?.company), sessionFlowName.GuestDiscussion);
			setInStorage('first_name', JSON.stringify(response?.data?.first_name), sessionFlowName.GuestDiscussion);
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
		const currentFlow = getFromStorage('flow');
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
			if(!getFromStorage('sessionid')){
				clearFromStorage();
				setIsLoading(true);
				setInStorage('has_accepted_tnc', 'ONGOING', sessionFlowName.GuestDiscussion);
				setInStorage('isNewChatOpen', JSON.stringify(true), sessionFlowName.GuestDiscussion);
				const locationData = await getIpLocation();
				if (locationData && locationData?.location) {
				setInStorage('ip_state', locationData?.location?.regionName, sessionFlowName.GuestDiscussion);
				setInStorage('ip_city', locationData?.location?.city, sessionFlowName.GuestDiscussion);
				setInStorage('ip_country', locationData?.location?.country, sessionFlowName.GuestDiscussion);
				}
				setInStorage('flow', sessionFlowName.GuestDiscussion, sessionFlowName.GuestDiscussion);
				await setFinalLanguage();
			}
			else if (getFromStorage('flow') && !([sessionFlowName.GuestDiscussion].includes(getFromStorage('flow')))){
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
			{(isLoading)&& 
				<div className="loader-load-spinner">
					<div className="div67">
						<BiLoader className="loader-rotate-loader loader-icon" />
					</div>
				</div>
			}
		</>
	);
}

export default ShikshalokamChat;
