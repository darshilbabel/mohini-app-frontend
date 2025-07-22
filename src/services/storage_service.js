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
    const isTemporary = flow && sessionFlows.includes(flow) && !(
      localStorage.getItem('projectId') ||
      sessionStorage.getItem('projectId')
    );
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
    const isTemporary = flow && sessionFlows.includes(flow) && !(
      localStorage.getItem('projectId') ||
      sessionStorage.getItem('projectId')
    );
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

// Helper for exponential backoff with jitter
// This function calculates a delay time for retries using exponential backoff strategy.
// The delay increases exponentially with each attempt (baseDelay * 2^attempt),
// and a random jitter (up to 1000ms) is added to help avoid retry storms when many clients retry at once.
// The delay is capped at maxDelay milliseconds.
function exponentialBackoff(attempt, baseDelay = 1000, maxDelay = 30000) {
  const expDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 1000;
  return expDelay + jitter;
}

// S3 upload with exponential backoff and retry logic
// This function uploads a file to S3 using a presigned URL, with retry logic for handling rate limiting (SlowDown) and network errors.
// On each failure, it waits for an exponentially increasing delay (with jitter) before retrying, up to maxRetries times.
// If the upload is successful, it returns the S3 URL. If all retries fail, it returns an empty string.
export const handleS3Upload = async (file, fileName, folderStructure, storyData, maxRetries = process.env.REACT_APP_S3_UPLOAD_RETRY_NUM) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get a new presigned URL for each attempt
      const res = await axiosInstance.post("api/get-presigned-url/", {
        fileName: fileName,
        fileType: file.type,
        storyId: storyData?.id,
        folder_structure: folderStructure
      });

      const { uploadUrl, s3Url } = res.data;

      // Attempt to upload the file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-amz-acl": "public-read"
        },
        body: file,
      });

      // If upload is successful, return the S3 URL
      if (uploadResponse.ok) {
        return s3Url;
      }

      // Handle S3 rate limiting (SlowDown)
      if (uploadResponse.status === 503) {
        const errorText = await uploadResponse.text();
        if (errorText.includes('SlowDown')) {
          if (attempt < maxRetries - 1) {
            const delay = exponentialBackoff(attempt);
            console.warn(`S3 rate limited (SlowDown), retrying in ${delay}ms... [attempt ${attempt + 1}]`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }

      // Throw error for other failed uploads
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    } catch (error) {
      // Retry on network errors or explicit SlowDown
      if (attempt < maxRetries - 1 && (error.message?.includes('SlowDown') || error.message === 'Failed to fetch')) {
        const delay = exponentialBackoff(attempt);
        console.warn(`Upload error, retrying in ${delay}ms... [attempt ${attempt + 1}]`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      // Log error and return empty string if all retries fail
      console.error("Error uploading to S3:", error);
      if (attempt === maxRetries - 1) return '';
    }
  }
  return '';
};

export function clearFromStorage(removeFromAll=false, excludeKeys = []) {
  const keysToRemove = [
    'botName', 'chat-history', 'company', 'first_name', 'has_accepted_tnc', 'intro_message', 
    'isChatVisible', 'isNewChatOpen', 'isOldChatOpen', 'profileid', 'route', 'sessionid', 'showFileInput', 
    'showHomepage', 'state', 'access_token', 'flow', 'statemachine_length', 'selected_type', 
    'preferred_route', 'country', 'city', 'ip_city', 'ip_state', 'ip_country', 'llmError', 'lang_progress',
    'grit', 'device_id', 'defaultBotName', 'phoneNumber', 'english_first_name', 'hasSelectedLanguage', 'chatLanguage',
    'projectId', 'taskId', 'sso_accessToken', 'ssoRerouteURL'
  ];

  keysToRemove.forEach((key) => {
    if (!excludeKeys.includes(key)) {
      removeFromStorage(key, removeFromAll);
    }
  });
}