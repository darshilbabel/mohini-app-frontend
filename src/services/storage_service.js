import { sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";
import axiosInstance from "../utils/axios";
import { useUserPreferenceLocalStore, useUserPreferenceSessionStore } from 'store';
import { STORAGE_TYPES } from "store/middleware/storage/storageFactory";
import useSiteDataLocalStore from "store/slices/siteData/siteDataLocal";
import { SLICES_STORE_MAP } from "../store";
import { useEffect } from "react";

export const setInStorage = (key, value, currentFlow, storageName='') => {

  const { flow: flow_local } = useUserPreferenceLocalStore.getState();
  const { flow: flow_session } = useUserPreferenceSessionStore.getState();
  const { projectId: projectId_local } = useUserPreferenceLocalStore.getState();
  const { projectId: projectId_session } = useUserPreferenceSessionStore.getState();

  let storage;
  if (storageName && storageName !== '') {
    const isTemporary = storageName === 'sessionStorage';
    storage = isTemporary ? sessionStorage : localStorage;
  } else {
    const flow = currentFlow || flow_local || flow_session;
    const projectId = projectId_local || projectId_session;
    const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory, sessionFlowName.ListeningActivity];
    const isTemporary = flow && sessionFlows.includes(flow) && !projectId;
    storage = isTemporary ? sessionStorage : localStorage;
  }
  storage.setItem(key, value);
};

/**
 * Sets a value in a storage slice
 * @param {string} sliceName - The name of the storage slice to update
 * @param {string} key - The key to set in the slice
 * @param {any} value - The value to set
 * @param {string} currentFlow - The current flow to determine storage type
 * @param {string|null} storageType - The type of storage ('sessionStorage' or 'localStorage'), or null for auto-detection
 */
export function setInStorageSlice(sliceName, value, funcName, currentFlow, storageType = null) {
  const SLICE_PATH = "store/slices";
  const LOCAL_STORAGE_SLICES = "persistent";
  const SESSION_STORAGE_SLICES = "session";

  try {

    let storage = null;

    const { flow: flow_local } = useUserPreferenceLocalStore.getState();
    const { flow: flow_session } = useUserPreferenceSessionStore.getState();
    const { projectId: projectId_local } = useUserPreferenceLocalStore.getState();
    const { projectId: projectId_session } = useUserPreferenceSessionStore.getState();

    if (typeof storageType == "string" && storageType !== "") {
      storage = storageType === 'sessionStorage' ? SESSION_STORAGE_SLICES : LOCAL_STORAGE_SLICES;
    }
    else {
      const flow = currentFlow || flow_local || flow_session;
      const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory, sessionFlowName.ListeningActivity];
      const isTemporary = flow && sessionFlows.includes(flow) && !projectId_local && !projectId_session;
      storage = isTemporary ? SESSION_STORAGE_SLICES : LOCAL_STORAGE_SLICES;
    }
    const module = require(`../${SLICE_PATH}/${storage}/${sliceName}.js`);
    const store = module.default.getState();
    console.log(store)
    console.log(funcName)
    store[funcName](value);
  } catch (error) {
    console.error(`Error loading storage slice ${sliceName}:`, error);
    throw error;
  }
}

/**
 * Gets a storage slice (Zustand store) based on the slice name and storage type
 * @param {string} sliceName - The name of the storage slice to retrieve (e.g., 'siteData', 'userPreference')
 * @param {string|null} storageType - The type of storage ('sessionStorage' or 'localStorage'), or null for auto-detection based on accessToken
 * @returns {Object} The Zustand store instance for the specified slice
 * @description
 * This function dynamically loads and returns a Zustand store slice. It determines whether to use
 * the Local or Session variant of the store based on:
 * - If storageType is provided: uses the specified storage type
 * - If storageType is null: checks for accessToken - uses Local storage if token exists, Session storage otherwise
 * The function constructs the module path as: store/slices/{sliceName}/{sliceName}{Local|Session}.js
 */
export const getStorageSlice = (sliceName, storageType = null, accessToken = undefined) => {
  const LOCAL_STORAGE_SLICES = "local";
  const SESSION_STORAGE_SLICES = "session";

  let storage = null;

  if (typeof storageType == "string" && storageType !== "") {
    storage = storageType === 'sessionStorage' ? SESSION_STORAGE_SLICES : LOCAL_STORAGE_SLICES;
  }
  else {
    storage = accessToken ? LOCAL_STORAGE_SLICES : SESSION_STORAGE_SLICES;
  }

  console.log("storage: ", SLICES_STORE_MAP[storage]);

  const slice = SLICES_STORE_MAP[storage][sliceName];
  return slice
}


  
export const getFromStorageSlice = (sliceName, key, parseValue = false, storageType = null) => {
  const SLICE_PATH = "store/slices";
  const LOCAL_STORAGE_SLICES = "persistent";
  const SESSION_STORAGE_SLICES = "session";

  const { flow: flow_local } = useUserPreferenceLocalStore.getState();
  const { flow: flow_session } = useUserPreferenceSessionStore.getState();
  const { projectId: projectId_local } = useUserPreferenceLocalStore.getState();
  const { projectId: projectId_session } = useUserPreferenceSessionStore.getState();

  let storage = null;
  
  if (typeof storageType == "string" && storageType !== "") {
    storage = storageType === 'sessionStorage' ? SESSION_STORAGE_SLICES : LOCAL_STORAGE_SLICES;
  }
  else {
    const flow = flow_local || flow_session;
    const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory, sessionFlowName.ListeningActivity];
    const isTemporary = flow && sessionFlows.includes(flow) && !projectId_local && !projectId_session;
    storage = isTemporary ? SESSION_STORAGE_SLICES : LOCAL_STORAGE_SLICES;
  }

  const module = require(`../${SLICE_PATH}/${storage}/${sliceName}.js`);
  const slice = module.default.getState();
  const value = slice[key];
  if (value && parseValue) {
    return JSON.parse(value);
  }
  return value;
}

export const getFromStorage = (key, parseValue = false, storageName='') => {
  const { flow: flow_local } = useUserPreferenceLocalStore.getState();
  const { flow: flow_session } = useUserPreferenceSessionStore.getState();

  let storage;
  if (storageName && storageName !== '') {
    storage = storageName === 'sessionStorage' ? sessionStorage : localStorage;
  } else{
    const flow = flow_local || flow_session;
    const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory, sessionFlowName.ListeningActivity];
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

  const { flow: flow_local } = useUserPreferenceLocalStore.getState();
  const { flow: flow_session } = useUserPreferenceSessionStore.getState();

  let storage;
  if (storageName && storageName !== '') {
    storage = storageName === 'sessionStorage' ? sessionStorage : localStorage;
  } else{
    const flow = flow_local || flow_session;
    const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory, sessionFlowName.ListeningActivity];
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
  try{
    const keysToRemove = [
      'botName', 'chat-history', 'company', 'first_name', 'has_accepted_tnc', 'intro_message', 
      'isChatVisible', 'isNewChatOpen', 'isOldChatOpen', 'profileid', 'route', 'sessionid', 'showFileInput', 
      'showHomepage', 'state', 'accessToken', 'flow', 'statemachine_length', 'selected_type', 
      'preferred_route', 'country', 'city', 'ip_city', 'ip_state', 'ip_country', 'llmError', 'lang_progress',
      'grit', 'device_id', 'defaultBotName', 'phoneNumber', 'english_first_name', 'hasSelectedLanguage', 'chatLanguage',
      'projectId', 'taskId', 'ssoRerouteURL'
    ];
    keysToRemove.forEach((key) => {
      if (!excludeKeys.includes(key)) {
        removeFromStorage(key, removeFromAll);
      }
    });
  } catch (error){
    console.error("Error while clearing: ", error);
  }
}


