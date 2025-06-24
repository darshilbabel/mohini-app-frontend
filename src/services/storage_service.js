import { sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";
import axiosInstance from "../utils/axios";

export const setInStorage = (key, value, currentFlow, storageName='') => {
  let storage;
  if (storageName && storageName !== '') {
    const isTemporary = storageName === 'sessionStorage';
    storage = isTemporary ? sessionStorage : localStorage;
  } else{
    const flow = currentFlow || sessionStorage.getItem('flow') || localStorage.getItem('flow');
    const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory];
    const isTemporary = flow && sessionFlows.includes(flow);
    storage = isTemporary ? sessionStorage : localStorage;
  }
  storage.setItem(key, value);
};
  
export const getFromStorage = (key, parseValue = false, storageName='') => {
  let storage;
  if (storageName && storageName !== '') {
    storage = storageName === 'sessionStorage' ? sessionStorage : localStorage;
  } else{
    const flow = sessionStorage.getItem('flow') || localStorage.getItem('flow');
    const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory];
    const isTemporary = flow && sessionFlows.includes(flow);
    storage = isTemporary ? sessionStorage : localStorage;
  }
  const value = storage.getItem(key);
  
  if (value && parseValue) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(`Error parsing value for key "${key}":`, e);
      return null;
    }
  }
  
  return value;
};
  
export const removeFromStorage = (key, removeFromAll=false, storageName='') => {
  if (removeFromAll) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
    return;
  }
  let storage;
  if (storageName && storageName !== '') {
    storage = storageName === 'sessionStorage' ? sessionStorage : localStorage;
  } else{
    const flow = sessionStorage.getItem('flow') || localStorage.getItem('flow');
    const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory];
    const isTemporary = flow && sessionFlows.includes(flow);
    storage = isTemporary ? sessionStorage : localStorage;
  }
  storage.removeItem(key);
};

export const handleS3Upload = async (file, fileName, folderStructure, storyData) => {
  try{
    const res = await axiosInstance.post("api/get-presigned-url/", {
      fileName: fileName,
      fileType: file.type,
      storyId: storyData?.id,
      folder_structure: folderStructure
    });
  
    const { uploadUrl, s3Url } = res.data;
  
    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "x-amz-acl": "public-read"
      },
      body: file,
    });
    return s3Url;
  } catch (error) {
      console.error("Error uploading to S3:", error);
    return '';
  }
    
}

export function clearFromStorage(removeFromAll=false, excludeKeys = []) {
  const keysToRemove = [
    'botName', 'chat-history', 'company', 'first_name', 'has_accepted_tnc', 'intro_message', 
    'isChatVisible', 'isNewChatOpen', 'isOldChatOpen', 'profileid', 'route', 'sessionid', 'showFileInput', 
    'showHomepage', 'state', 'access_token', 'flow', 'statemachine_length', 'selected_type', 
    'preferred_route', 'country', 'city', 'ip_city', 'ip_state', 'ip_country', 'llmError', 'lang_progress',
    'grit', 'device_id', 'defaultBotName', 'phoneNumber', 'english_first_name', 'hasSelectedLanguage'
  ];

  keysToRemove.forEach((key) => {
    if (!excludeKeys.includes(key)) {
      removeFromStorage(key, removeFromAll);
    }
  });
}