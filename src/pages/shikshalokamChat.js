import { useEffect, useState } from "react";
import { getIpLocation, getProfileDetails, getSessionDetails } from "../services/api.service";
import { languageList, sessionFlowName } from "./ShikshalokamVoiceChat/enum";
import ROUTES from "../url";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { setLanguage } from "../i18n";
import { BiLoader } from "react-icons/bi";
import { clearFromStorage, getFromStorage, removeFromStorage, setInStorage } from "../services/storage_service";
import ShikshalokamVoiceBasedChat from "./ShikshalokamVoiceChat/voice-chat";



function ShikshalokamChat({type, variant}) {
	const login_api_url = `/api/login/`;

	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [userId, setUserId] = useState(getFromStorage('device_id') || null);
	const [companyName, setCompanyName] = useState(getFromStorage('company') || null);
		  
	useEffect(() => {
		const tnc=getFromStorage("has_accepted_tnc");
		if (!tnc || tnc === "ONGOING") {
			clearFromStorage(true);
		}
		if (!getFromStorage("local_route")) {
			setInStorage("local_route", JSON.stringify(languageList[0].value), type);
		}
		// if(!getFromStorage('tempCode')){
		// 	removeFromStorage('previousUrl');
		// }
		if(getFromStorage('tempCode', false, 'localStorage')){
			const previousUrl = getFromStorage('previousUrl', false, 'localStorage');
			console.log('previousUrl chk', previousUrl);
			console.log('currentUrl chk', window.location.href);
			if(previousUrl && previousUrl !== '') {
				console.log('type chk', type);
				if(type === sessionFlowName.GuestDiscussion || type === sessionFlowName.GuestMiStory){
					console.log("Setting previousUrl in sessionStorage");
					setInStorage('previousUrl', previousUrl, type, 'sessionStorage');
				}
			}
		}
		removeFromStorage('tempCode', false, 'localStorage');
		removeFromStorage('previousUrl', false, 'localStorage');
		setInStorage("chatLanguage", JSON.stringify(getFromStorage("local_route", true, 'localStorage') || languageList[0].value), type);

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

			setInStorage('device_id', newUserId, type);
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
	  
		  setInStorage('profileid', JSON.stringify(res.id), type);
	  
		  let session = await getSessionDetails();
		  setInStorage('sessionid', JSON.stringify(session.sessionid), type);
	  
		  const response = await axiosInstance({
			url: login_api_url,
			method: "POST",
			data: {
			  email: customEmail,
			  password: "grit@123",
			},
		  });
	  
		  if (!!response?.data?.access_token) {
			setInStorage('company', JSON.stringify(response?.data?.company), type);
			setInStorage('first_name', JSON.stringify(response?.data?.first_name), type);
			setCompanyName(response?.data?.company);
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
		if(currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow)){
			await initialSetup();
		}
		if(currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow)){
			setLanguage(languageList[0].value);
		}
	}

	useEffect(()=>{
		const runSetup = async () => {
			if(!getFromStorage('sessionid')){
				clearFromStorage();
				setIsLoading(true);
				setInStorage('has_accepted_tnc', 'ONGOING', type);
				setInStorage('isNewChatOpen', JSON.stringify(true), type);
				const locationData = await getIpLocation();
				if (locationData && locationData?.location) {
				setInStorage('ip_state', locationData?.location?.regionName, type);
				setInStorage('ip_city', locationData?.location?.city, type);
				setInStorage('ip_country', locationData?.location?.country, type);
				}
				setInStorage('flow', type, type);
				await setFinalLanguage();
				getUserFingerPrint();
			}
			else if (getFromStorage('flow') && !([sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(getFromStorage('flow')))){
				clearFromStorage();
				window.location.reload();
			}
		};
		runSetup();
	}, [])

	return (
		<>
			{(companyName && !isLoading)&&
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
