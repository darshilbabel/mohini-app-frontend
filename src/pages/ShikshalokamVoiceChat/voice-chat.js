import "../../style.css"
import "./shikshaChatStyle.css"
import { AiOutlineEye } from "react-icons/ai";
import { BiLoader } from "react-icons/bi";
import { bot_routes, bot_websocket } from "../../configure";
import { clearFromStorage, handleS3Upload, removeFromStorage, getStorageSlice } from "../../services/storage_service";
import { createAuthRequest, createStoryMedia, getStoryAllMedia, partialUpdateStoryById } from "../story/api.service";
import { createMessage } from "../interview-voice";
import { createUserProfileApi } from "api/endpoints/user";
import { FaCircle } from "react-icons/fa6";
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { getChatSessionApi } from "api/endpoints/chat";
import { getSessionDetails, updateReflectionStatus } from "../../services/api.service";
import { GrGallery } from "react-icons/gr";
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import { LANGUAGE_ENUMS, languageList, sessionFlowName } from "./enum";
import { MdAccountCircle, MdEdit, MdSend, } from "react-icons/md";
import { PrimaryButton } from "../../components/Buttons";
import { RxCross2 } from "react-icons/rx";
import { setLanguage } from "../../i18n";
import { STORE_NAME_CONSTANTS } from "store/constants";
import { TbReload } from "react-icons/tb";
import { toast } from "react-toastify";
import { updateReflectionStatusApi, getAI4BharatAudioApi, ai4BharatASRApi } from "api/endpoints";
import { useAudio } from "hooks/useAudio";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useChatDataSessionStore } from 'store';
import { useConfirmationPopup } from "hooks/useConfirmationPopup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStorage } from "hooks/useStorage";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../utils/axios";
import Cookies from "universal-cookie";
import CustomFormData from "../../components/Form/FormData";
import DOMPurify from "dompurify";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import InfiniteScroll from "react-infinite-scroll-component";
import List from "@editorjs/list";
import MainHeader from "./shikshaChatHeader";
import Notification, { showNotification } from "../../components/ToastMessage/TotastMessage";
import PdfDownloader from "../story/upload-content/pdfDownloader";
import PrivacyPolicyPopup from "../../components/TnC/privacyPolicyPopup";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import ROUTES from "../../url";
import Sidebar from "./shikshaChatSidebar";
import UploadImages from "./upload-images";
import useCustomMediaQuery from "hooks/useCustomMediaQuery";
import useSmartChatStorage from "hooks/useSmartChatStorage";
import useUserDataLocalStore from "store/slices/userData/userDataLocal";
import useVoiceRecord, { default_wave_surfer_config } from "../interview-text-voice/useVoiceRecord";
import WaveSurferPlayer from "../interview-text-voice/voice-player";
import { getCompanyBotApi } from "api/endpoints/chat";


const cookies = new Cookies();
const company_bot_list_url = `/api/companybot/`;

// TODO: After testing, revert this to the original code
// const wss_protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
const wss_protocol = "wss://"

const ShikshalokamVoiceBasedChat = ({ type="", variant="" }) => {
  // ========== useState Hooks ==========
  const [storyMediaIdArray, ] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);
  const [textMessage, setTextMessage] = useState("");
  const [asrAudio, setAsrAudio] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [reconText, setReconText] = useState("");
  const [isStreamingComplete, setIsStreamingComplete] = useState(true);
  const [audioCache, setAudioCache] = useState({});
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [editor, setEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editorCopyChanges, setEditorCopyChanges] = useState(null);
  const [hasStartedListening, setHasStartedListening] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [botNameToDisplay, setBotNameToDisplay] = useState("Bot");
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [isNextAllowed, setIsNextAllowed] = useState(true);
  const [isMute, setNotMute] = useState(true);
  const [isTalking, setTalking] = useState(0);
  const [appendix, setAppendix] = useState([]);
  const [hasOverRideId, setHasOverRideId] = useState(null);
  const [shouldFetchIntro, setShouldFetchIntro] = useState(false);
  const [hasFetchIntro, setHasFetchIntro] = useState(false);
  const [chatTitle, setChatTitle] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isIntroLoading, setIsIntroLoading] = useState(false);
  const [isFetchingOldIntro, setIsFetchingOldIntro] = useState(false);
  const [sessionTitleDetail, setSessionTitleDetail] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isResetCalled, setIsResetCalled] = useState(false);
  const [strandStep, setStrandStep] = useState(null);
  const [isEndStoryLoading, setIsEndStoryLoading] = useState(false);
  const [storyData, setStoryData] = useState(null);
  const [noStoryFound, setNoStoryFound] = useState(false);
  const [triggerDownload, setTriggerDownload] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [shouldSendMessage, ] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [ssoNavigationTriggered, setSsoNavigationTriggered] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileErrorText, setFileErrorText] = useState('');
  // const [selectedType, setSelectedType] = useState(getFromStorageSlice("userPreference", "selected_type") || 'normal');
  const [companySlug, setCompanySlug] = useState("");
  const [error, setError] = useState({ response: "", status: 200, });
  const [visibleItemCount, setVisibleItemCount] = useState(10);
  const [showHomepage, setShowHomepage] = useState(false);

  // ========== useRef Hooks ==========
  const textAreaRef = useRef(null);
  const lastBotMessageIndex = useRef(-1);
  const isInitialLoadRef = useRef(true);
  const editorContainerRef = useRef(null);
  const endPageToScrollRef = useRef(null);
  const isIntroPlayed = useRef(false);
  // const introMessageRef = useRef(null);

  // ========== Other Hooks ==========
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [chatHistory, setChatHistory, removeChatHistory] = useSmartChatStorage();

  const accessToken = useUserDataLocalStore((state) => state.access_token);

	const isOldChatOpen = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.isOldChatOpen);
  const acceptedTnc = useStorage(STORE_NAME_CONSTANTS.USER_DATA)((state) => state.has_accepted_tnc);
  const botName = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.botName);
  const chatLanguage = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.chatLanguage);
  const companyName = useStorage(STORE_NAME_CONSTANTS.USER_DATA)((state) => state.companyName);
  // const defaultBotName = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.defaultBotName);
  const firstName = useStorage(STORE_NAME_CONSTANTS.USER_DATA)((state) => state.firstName);
  const introMessage = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.introMessage);
  // const isChatVisible = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.isChatVisible);
  const isNewChatOpen = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.isNewChatOpen);
  const langProgress = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.langProgress);
  const languageToUse = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.chatLanguage);
  const preferredLanguage = useStorage(STORE_NAME_CONSTANTS.USER_DATA)((state) => state.preferredLanguage);
  const previousUrl = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.previousUrl);
  const profileId = useStorage(STORE_NAME_CONSTANTS.USER_DATA)((state) => state.profileId);
  const projectIdStore = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.projectId);
  const selectedType = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.selectedType);
  const sessionId = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.sessionId);
  const setChatLanguage = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.setChatLanguage);
  const setIntroMessage = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.setIntroMessage);
  const setLangProgress = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.setLangProgress);
  const setStorageFlow = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.setFlow);
  // const showHomepage = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.showHomepage);
  const userState = useStorage(STORE_NAME_CONSTANTS.USER_DATA)((state) => state.state);
  const ssoRerouteURL = useStorage(STORE_NAME_CONSTANTS.SITE_DATA)((state) => state.ssoRerouteURL);
  const stateMachineLength = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.stateMachineLength);
  const storageFlow = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.flow);
  const taskId = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA)((state) => state.taskId);
  const profileToUse = useStorage(STORE_NAME_CONSTANTS.USER_DATA)((state) => state.profileId);

  // chat data actions
  const {
    setChatbotClickedOn,
    setIsChatVisible,
    setIsNewChatOpen,
    setIsOldChatOpen,
    setSelectedType,
    // setShowHomepage,
    setBotName,
    setDefaultBotName,
    setStateMachineLength,
    setSessionId,
  } = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA).getState();

  // user data actions
	const {
    setAcceptedTnC,
    setCompanyName,
    setFirstName,
    setState,
  } = useStorage(STORE_NAME_CONSTANTS.USER_DATA).getState();
  const { llmError, setLlmError } = useStorage(STORE_NAME_CONSTANTS.CHAT_DATA).getState();
  const { setProfileId: setProfileToUse } = useStorage(STORE_NAME_CONSTANTS.USER_DATA).getState();

  const { recordings, HiddenRecorder, } = useVoiceRecord();

  const navigate = useNavigate();

  const projectId = useMemo(() => projectIdStore || searchParams.get("projectId"), [projectIdStore, searchParams]);

  const { showGuestPopup, showConfirmationPopup } = useConfirmationPopup();
  const { stopAllAudio, audioRef } = useAudio();

  // ========== useCallback Hooks ==========
  const handleChatSessionButtonClick = useCallback(async ({ key }) => {
    lastBotMessageIndex.current = -1;
    let key_num;
    let currentSession;
    if (key) {
      /** String representation of array index that can be converted to number */
      key_num = parseInt(key?.split("-").pop());
      if(isNaN(key_num)) return
      currentSession = chatTitle[key_num]?.session;
      // removeFromStorage("llmError");
      setIsOldChatOpen(true);
      setIsNewChatOpen(false);
      setSessionId(currentSession);
      setChatHistory([]);
      window.location.reload();
    } else {
      currentSession = sessionId;
      try{
        await fetchBotInfo()
        await handleCompanyChatCall(currentSession);
      }
      catch(error){
        setIsIntroLoading(false);
      }
      setIsIntroLoading(false);
    }
  }, [chatTitle]);

  // ========== Variable Definitions ==========
  // const { access_token } =  getStorageSlice(STORE_NAME_CONSTANTS.USER_DATA, 'localStorage').getState();
  const { showFileInput, setShowFileInput } = useChatDataSessionStore.getState();
  const selectedLabel = {
    types: [
      {label:t('guidedReflection'), value:'normal'}, 
      {label:t('oneStepReflection'), value:'oneshot'}, 
    ]
  };
  const fileExceedText = t('fileExceedText');
  const fileSizeText = t('fileSizeText');
  let isMobile = useCustomMediaQuery('(max-width: 500px)');
  let chatToAddLength = isMobile? 10: 10;

  const isShikshalokamPublicType = true;
  const shouldShowChatHistoryFeature = true;
  const isSpecialFlow = useMemo(() => {
    if (!storageFlow) return false;
    return [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory].includes(storageFlow);
  }, [storageFlow])
  const shouldFetchChatSession = useMemo(() => {
    return storageFlow && [sessionFlowName.Reflection].includes(storageFlow);
  }, [storageFlow]);

  // SECTION 1: Lifecycle & Browser Events
  /**
   * * Network monitoring - sets up listeners for online/offline events and network speed
   * * Runs once on component mount
   */
  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    let toastId = null;

    const checkNetworkSpeed = () => {
      if (connection) {
        const { effectiveType, downlink } = connection;
        if (
          effectiveType &&
          (effectiveType === "2g" || effectiveType === "3g") &&
          navigator.onLine
        ) {
          if (toastId) {
            toast.dismiss(toastId);
          }
          const message = t("networkWarning");
          toastId = showNotification({
            message: message,
            type: "warning",
            options: {
              position: "top-center",
              style: { fontWeight: "bold", color: "#1D1616" },
            },
          });
        }
      }
    };

    const handleOffline = () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
      toastId = toast.error(t("offlineNetwork"), {
        position: "top-center",
        style: { fontWeight: "bold", color: "#fff" },
      });
    };

    const handleOnline = () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
      toastId = toast.success(t("onlineNetwork"), {
        position: "top-center",
        style: { fontWeight: "bold", color: "#1D1616" },
      });
      checkNetworkSpeed();
    };

    checkNetworkSpeed();
    connection?.addEventListener("change", checkNetworkSpeed);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      connection?.removeEventListener("change", checkNetworkSpeed);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  /**
   * * Browser back button handling - manages navigation on browser back
   * * Depends on navigate and acceptedTnc
   */
  useEffect(() => {
    const currentFlow = storageFlow;
    const handleBack = () => {
      console.log("History length:", window.history.length);
      console.log("Can go back 1?", window.history.length > 1);
      console.log("Can go back 3?", window.history.length > 3);
      if((acceptedTnc || acceptedTnc==="ONGOING") && currentFlow && 
      [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory, sessionFlowName.SsoFlow].includes(currentFlow)){
        if(ssoNavigationTriggered && accessToken){
          console.log("isnide navigate happens")
          navigate(-2)
        } else{
          showGuestPopup(navigateBack, stayOnPage)
        }
    } else {
        setLanguage(languageList[0].value);
        setChatLanguage(languageList[0].value);
        stopAllAudio();
      if(accessToken) {
          clearFromStorage(true);
          navigateSsoFlow(ssoRerouteURL);
        } else {
          navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN);
        }
      }
    };
    // Check if we already pushed a custom state
    if (!window.history.state?.isCustom) {
      console.log("shouldPushState is true so pushing state now.");
      window.history.pushState({ isCustom: true }, "", window.location.href);
    }

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate, acceptedTnc]);

  // SECTION 2: Initial Configuration
  /**
   * * Initialize visible item count for chat history pagination
   * * Runs when chatToAddLength changes
   */
  useEffect(()=>{
    setVisibleItemCount(chatToAddLength)
  }, [chatToAddLength])

  /**
   * * Initialize bot name display
   * * Runs once on component mount
   */
  useEffect(()=>{
    if (botName && botName?.trim()) {
      setBotNameToDisplay(botName);
    }
  }, [botName])

  /**
   * * Initialize chat history state - set isNewChatOpen if chat history exists
   * * Runs once on component mount
   */
  useEffect(()=>{
    if(chatHistory?.length!== 0){
      setIsNewChatOpen(true);
    }
  }, []);

  /**
   * * Initialize language selection for guest flows
   * * Runs once on component mount
   */
  useEffect(() => {
    const handleLanguageSelect = (language) => {
      if (chatHistory && chatHistory.length <= 1) {
        stopAllAudio();
        isIntroPlayed.current = false;
        setIsLoading(true);
        removeFromStorage("chat-history");
        setChatHistory([]);
        removeFromStorage("intro_message");
        setChatHistory([]);
        setSentences([]);
        setLangProgress("IN_PROGRESS");
        setAudioCache({});
        setLanguage(language);

        const isTncAccepted = acceptedTnc;
        if(isTncAccepted && isTncAccepted !== 'ONGOING') {
          setIsLoading(false);
          setAcceptedTnC(true);
          setShouldFetchIntro(true);
        } else {
          setIsLoading(false);
        }
      }
    };
    if (chatLanguage && storageFlow && !accessToken) {
      setIsLoading(true);
      handleLanguageSelect(chatLanguage);
      removeFromStorage('chatLanguage');
    }
  }, []);

  // SECTION 3: User Profile & Authentication
  /**
   * * Create user profile when accessToken is available and profileToUse is not set
   * * Sets up user data, session, and initial configuration
   * * Depends on accessToken and profileToUse
   */
  useEffect(() => {
    async function createUserProfile() {
      try {
        setIsLoading(true);

        const response = await createUserProfileApi({
          access_token: accessToken,
        });

        if (response) {
          const data  = response.profile_details;
          const preferredLanguage = preferredLanguage || {};
          const language = preferredLanguage.value || LANGUAGE_ENUMS.ENGLISH;
          setStorageFlow(type);
          setChatLanguage(language || LANGUAGE_ENUMS.ENGLISH);
          setLanguage(language || LANGUAGE_ENUMS.ENGLISH)
          setProfileToUse(data?.id);
          if (!sessionId) {
            let session = await getSessionDetails();
            setSessionId(session.sessionid);
          }
          setFirstName(data?.first_name);
          setCompanyName(data?.company?.slug);
          setState(data?.profile_address[0]?.state);
          setIsNewChatOpen(true);
        } else {
          navigate(ROUTES.EXIT_ROUTE);
          clearFromStorage();
          navigate(-1);
        }
      } catch (error) {
        console.error(error);
        clearFromStorage();
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    }
    
    
    if (!profileToUse && accessToken) {
      
      createUserProfile();
      setShouldFetchIntro(true);
      setIsStreamingComplete(true);
    }
  }, [accessToken, profileToUse]);

  /**
   * *Fetch chat session based on projectId for Reflection flow
   * *Works based on change on project id
   */
  useEffect(() => {
    async function fetchChatSession() {
      let response = null
      response = await getChatSessionApi({ projectId, sessionId }).then(res => res.data);
      if(!response) return;
      if (response.results.length === 0) return;
      setSessionId(response.results[0].session);
      setIsOldChatOpen(true);
      setIsNewChatOpen(false);
    }

    if (!shouldFetchChatSession) return;
    fetchChatSession();
  }, [projectId, shouldFetchChatSession]);

  // SECTION 4: Session & Chat Configuration
  /**
   * *Set up public type configuration
   * *Triggers intro fetching for public type flows
   */
  useEffect(() => {
    if (isShikshalokamPublicType) {
      setShouldFetchIntro(true);
      setIsStreamingComplete(true);
    }
  }, [isShikshalokamPublicType]);

  /**
   * *Handle chat history feature visibility and homepage state
   * *Manages new/old chat open states
   */
  useEffect(() => {
    if(shouldShowChatHistoryFeature) {
      if(isOldChatOpen === true){
        setShouldFetchIntro(true);
        setShowHomepage(false);
      } else if(isNewChatOpen === true){
        // setShowHomepage(showHomepage !== null ? showHomepage : true);
        setShowHomepage(true);
      }
    } else {
      removeChatHistory();
    }
  }, [isOldChatOpen, isNewChatOpen]);

  /**
   * *Handle old chat open scenario - fetch chat session when conditions are met
   */
  useEffect(()=>{
    if(isOldChatOpen === true && (hasFetchIntro || !accessToken) && chatHistory?.length === 0 && sentences?.length === 0) {
      handleChatSessionButtonClick({key: null})
    }
  }, [isOldChatOpen, hasFetchIntro, chatHistory, sentences]);

  // SECTION 5: Language & Bot Setup
  /**
   * *Fetch bot info and intro message when conditions are met
   * *Sets up bot configuration, intro message, and triggers company chat call
   */
  useEffect(() => {
    if (chatHistory?.length === 0 && shouldFetchIntro && isNewChatOpen && 
        (profileToUse || [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory].includes(storageFlow))
      ) {
      setIsIntroLoading(true);
      fetchBotInfo().then(() => {
        if (!storageFlow || ![sessionFlowName.LoginMiStory].includes(storageFlow)) {
          handleCompanyChatCall(sessionId);
        }
      }).finally(() => {
        setIsIntroLoading(false);
      });      
    }

    return () => {};
  }, [accessToken, shouldFetchIntro, profileToUse, languageToUse, isNewChatOpen, storageFlow, introMessage]);

  /**
   * *Set language progress when intro message is loaded
   */
  useEffect(() => {
    if(introMessage && !isLoading) {
      setLangProgress(true);
    }
  }, [isLoading, introMessage])

  // SECTION 6: Story & Media Management
  /**
   * *Fetch story by sessionId
   * *Loads story data and sets up editor content
   */
  useEffect(()=>{
    if (!sessionId) return;

    async function fetchStory() {
      const story_data = await getStoryBySession(sessionId, accessToken);
      if (story_data && story_data?.length > 0 && story_data[0]) {
        setStoryData(story_data[0]);
        const formatted_content = story_data[0].formatted_content;
        const textBlocks = extractTextBlocks(formatted_content);
        setEditorCopyChanges(textBlocks);
        setNoStoryFound(false);
        setShowFileInput(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        if(!llmError) {
          setNoStoryFound(true);
        }
      }
    }

    fetchStory();
  }, [sessionId])

  /**
   * *Fetch media for story when storyData is available
   */
  useEffect(() => {
    const fetchMedia = async () => {
      if (storyData && storyData?.id !== '') {
        if(accessToken || accessToken) {
          openModal()
        }
        const story_id = storyData?.id;
        const tempMediaArr = [];
        setIsImageUploading(true);

        // TODO: This part needs to be optimized
        await getStoryAllMedia({
          setter: (data) => {
            for (let item of Object.values(data?.results || [])) {
              if (item.include_in_story) {
                tempMediaArr.push(item);
              }
            }
            setFiles(tempMediaArr);
          },
          data: {
            story: story_id,
          },
        });

        setIsImageUploading(false);
      }
    };

    fetchMedia();

    return () => {};
  }, [accessToken, storyData]);

  /**
   * *Call end story when all conditions are met
   * *Triggers story completion process
   */
  useEffect(() => {
    if (
      isStreamingComplete &&
      stateMachineLength &&
      strandStep >= stateMachineLength &&
      noStoryFound &&
      (!llmError || llmError === "") &&
      acceptedTnc &&
      acceptedTnc !== "ONGOING"
    ) {
      callEndStory();
    }
  }, [isStreamingComplete, strandStep, accessToken, stateMachineLength, languageToUse, noStoryFound]);

  /**
   * *Show chat title for guest users after delay
   * *Manages loading state for title display
   */
  useEffect(()=>{
    const currentFlow = storageFlow;
    if(profileToUse && !accessToken && !isEndStoryLoading && 
      !([sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory].includes(currentFlow))
    ){
      setIsLoading(true);
      const titleTime = setTimeout(() => {
        if (shouldShowChatHistoryFeature) showChatTitle();
      }, 4000);

      return () => {
        if (!noStoryFound) {
          setIsLoading(false);
        }
        clearTimeout(titleTime);
      };
    } else if (
      !isEndStoryLoading &&
      ![
        sessionFlowName.GuestDiscussion,
        sessionFlowName.ListeningActivity,
        sessionFlowName.GuestMiStory,
      ].includes(currentFlow)
    ) {
      setIsLoading(false);
    }
  },[profileToUse, accessToken, isEndStoryLoading, noStoryFound])

  // SECTION 7: UI State Management
  /**
   * *Control body overflow based on loading and modal states
   */
  useEffect(() => {
    if (
      isLoading ||
      isEndStoryLoading ||
      isModalOpen ||
      acceptedTnc === "ONGOING"
    ) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isLoading, isEndStoryLoading, isModalOpen]);

  /**
   * *Auto-dismiss file error text after 5 seconds
   */
  useEffect(() => {
    const textErrorTime = setTimeout(() => {
      setFileErrorText("");
    }, 5000);

    return () => {
      clearTimeout(textErrorTime);
    };
  }, [fileErrorText]);

  /**
   * *Recording timer - tracks recording duration
   */
  useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setSeconds(0);
    }

    return () => clearInterval(intervalId);
  }, [hasStartedRecording]);

  /**
   * *Adjust textarea height based on content
   */
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textMessage]);

  // SECTION 8: Chat History & Messages
  /**
   * *Update chat history and scroll to view
   * *Manages chat history state and scrolling behavior
   */
  useEffect(() => {
    // setChatHistory(chatHistory);
    lastBotMessageIndex.current = chatHistory?.length - 1;
    if (!showFileInput) handleScrollToView();
  }, [chatHistory]);

  /**
   * *Scroll to end page when file input is shown
   */
  useEffect(() => {
    if (!isLoading && showFileInput && acceptedTnc !== "ONGOING") {
      endPageToScrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading, showFileInput, acceptedTnc]);

  /**
   * *Update chat history with recordings when available
   */
  useEffect(() => {
    if (
      !!recordings?.length &&
      chatHistory[chatHistory?.length - 1]?.source !== "bot"
    ) {
      const updatedChatHistory = [...chatHistory];
      updatedChatHistory[chatHistory?.length - 1] = {
        ...updatedChatHistory[chatHistory?.length - 1],
        recording: recordings[recordings?.length - 1],
      };
      setChatHistory(updatedChatHistory);
    }
    return () => {};
  }, [recordings, chatHistory]);

  /**
   * *Handle appendix URL attachment to chat messages
   */
  useEffect(() => {
    if (
      !!appendix?.length &&
      chatHistory[chatHistory?.length - 1].source === "bot"
    ) {
      const lastMessage = chatHistory[chatHistory?.length - 1];
      lastMessage.appendixURL = appendix;
      lastMessage.hasAppendix = true;
      setChatHistory([...chatHistory]);
      setAppendix([]);
    }
    return () => {};
  }, [appendix, chatHistory]);

  /**
   * *Handle reconText and trigger reset
   */
  useEffect(() => {
    try {
      if (!!trigger && !!reconText) {
        setReconText("");
        setTrigger(false);
      }
    } catch (error) {
      console.error({ error });
    }
  }, [chatSocket, reconText, trigger, recordings]);

  // SECTION 9: Audio & TTS Management
  /**
   * *Control audio mute state
   */
  useEffect(() => {
    if (audioRef?.current) {
      if (isMute) {
        audioRef.current.muted = true;
      } else {
        audioRef.current.muted = false;
      }
    }
  }, [isMute]);

  /**
   * *Auto-play audio for bot messages
   * *Handles automatic audio playback when conditions are met
   */
  useEffect(() => {
    let shouldPlay = false;
    if (showFileInput) {
      shouldPlay = true;
    } else if ((noStoryFound || noStoryFound === null) && !isIntroLoading && !isLoading && !isEndStoryLoading) {
      const currentFlow = storageFlow;
      
      if (
        currentFlow &&
        [
          sessionFlowName.GuestDiscussion,
          sessionFlowName.ListeningActivity,
          sessionFlowName.GuestMiStory,
        ].includes(currentFlow)
      ) {
        if (chatHistory.length > 0) {
          if (
            isStreamingComplete &&
            chatHistory[chatHistory.length - 1]?.source === "bot"
          ) {
            shouldPlay = true;
          }
        } else if (langProgress === "IN_PROGRESS") {
          shouldPlay = false;
        } else {
          shouldPlay = true;
        }
      } else if (
        chatHistory &&
        chatHistory.length > 0 &&
        chatHistory[chatHistory.length - 1]?.source === "bot" &&
        !isIntroLoading &&
        !isLoading &&
        !isEndStoryLoading
      ) {
        shouldPlay = true;
      }
    }
    if (
      isStreamingComplete &&
      shouldPlay &&
      !isEndStoryLoading &&
      !isLoading &&
      !isPdfDownloading &&
      isMute &&
      acceptedTnc &&
      acceptedTnc !== "ONGOING" &&
      !isIntroLoading &&
      !isFetchingOldIntro
    ) {
      const speakerButtons = document.querySelectorAll(".button-11.button-3");
      const lastSpeakerButton = speakerButtons[speakerButtons.length - 1];

      if (lastSpeakerButton) {
        lastSpeakerButton.click();
      }
    }
  }, [
    isStreamingComplete,
    showFileInput,
    showHomepage,
    isEndStoryLoading,
    isLoading,
    isPdfDownloading,
    storyData,
    chatHistory,
    isMute,
    acceptedTnc,
    isIntroLoading,
    noStoryFound,
  ]);

  /**
   * *Handle TTS requests for unnarrated messages
   * *Processes and plays audio for messages that haven't been narrated
   */
  useEffect(() => {
    let unnarratedMessages = sentences.filter((x) => !x?.isNarrated);
    let hasUnnarratedMessages = !!unnarratedMessages?.length;
    let sourceLanguage = languageToUse;
    if (acceptedTnc === 'ONGOING') {
      return () => {};
    }
    if (
      isNextAllowed &&
      hasUnnarratedMessages &&
      !isLoading &&
      !isEndStoryLoading
    ) {
      handleAI4BharatTTSRequest(
        unnarratedMessages[0].message,
        unnarratedMessages[0].id,
        sourceLanguage
      );
    }

    return () => {};
  }, [
    isNextAllowed,
    sentences,
    languageToUse,
    isLoading,
    isEndStoryLoading,
    acceptedTnc,
  ]);

  /**
   * *Debug logging for hasOverRideId changes
   */
  useEffect(() => {
    console.log("hasOverideId: ", hasOverRideId);
  }, [hasOverRideId]);

  // SECTION 10: Editor Management
  /**
   * *Initialize EditorJS when modal opens with story data
   * *Sets up the editor with appropriate content based on flow type
   */
  useEffect(() => {
    if (!!editorCopyChanges && isModalOpen && storyData) {
      const flow = storageFlow
      let parsed_content = [];
      try {
        if (storageFlow && [sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(storageFlow)) {
          const challenges = storyData?.other_params?.challenges_faced || [];
          const solutions = storyData?.other_params?.solutions_discussed || [];

          parsed_content = [
            {
              type: "header",
              data: {
                text: t("challengesHeader"),
                level: 2,
                customId: "challenges",
              },
            },
            {
              type: "list",
              data: {
                style: "unordered",
                items: challenges.length > 0 ? challenges : [""],
              },
            },
            {
              type: "header",
              data: {
                text: t("solutionsHeader"),
                level: 2,
                customId: "solutions",
              },
            },
            {
              type: "list",
              data: {
                style: "unordered",
                items: solutions.length > 0 ? solutions : [""],
              },
            },
          ];
        } else if (storageFlow && [sessionFlowName.ListeningActivity].includes(flow)) {
          const questionAnswers = storyData?.other_params?.question_answers || [];
          
          parsed_content = [];
          questionAnswers.forEach((qa, index) => {
            // Add question header
            parsed_content.push({
              type: "header",
              data: {
                text: `Q${index + 1}: ${qa.question}`,
                level: 3,
                customId: `question-${index}`,
              },
            });

            parsed_content.push({
              type: "paragraph",
              data: {
                text: qa.answer || "",
              },
            });

            if (index < questionAnswers.length - 1) {
              parsed_content.push({
                type: "paragraph",
                data: {
                  text: "​",
                },
                readonly: true,
              });
            }
          });
        } else {
          parsed_content = editorCopyChanges.map((item) => ({
            type: item.type,
            data: {
              text: item.data.text,
            },
          }));
        }
      } catch (error) {
        parsed_content = [];
      }

      if (!document.getElementById("editorjs")) {
        return;
      }

      const _editor = new EditorJS({
        holder: "editorjs",
        placeholder: t("editorPlaceholder"),
        autofocus: true,
        hideToolbar: true,
        tools: {
          header: {
            class: Header,
            inlineToolbar: false,
          },
          list: {
            class: List,
            inlineToolbar: false,
            config: {
              defaultStyle: "unordered",
            },
          },
        },
        onReady: () => {
          setEditor(_editor);
          const style = document.createElement("style");
          style.innerHTML = `
            .ce-toolbar__plus, .ce-toolbar__actions { display: none !important; }
            .ce-popover, .ce-settings, .ce-settings__button { display: none !important; }
            .ce-block--selected .ce-block__drag-handle { display: none !important; }
            .ce-inline-toolbar { display: none !important; }
            .ce-block--selected { outline: none !important; }
            
            /* Style for spacer blocks */
            .spacer-block {
              min-height: 0.75rem !important;
              background: transparent !important;
              border: none !important;
              pointer-events: none !important;
              user-select: none !important;
              cursor: default !important;
              margin: 0.5rem 0 !important;
              position: relative;
            }
            
            .spacer-block .ce-paragraph {
              pointer-events: none !important;
              user-select: none !important;
              outline: none !important;
              cursor: default !important;
              opacity: 0 !important;
              min-height: 0.75rem !important;
            }
            
            .spacer-block::before {
              content: '';
              display: block;
              width: 100%;
              height: 1px;
              background-color: #e5e7eb;
              position: absolute;
              top: 50%;
              left: 0;
              transform: translateY(-50%);
            }
            
            /* Add visual separation after answer paragraphs */
            .answer-paragraph {
              margin-bottom: 0.5rem !important;
              padding-bottom: 0.5rem !important;
            }
            
            /* Question header styling */
            .question-header {
              color: #374151 !important;
              font-weight: bold !important;
              margin-top: 2rem !important;
              margin-bottom: 1rem !important;
            }
            
            .question-header:first-child {
              margin-top: 0 !important;
            }
            
            /* Non-deletable block styling */
            .non-deletable {
              position: relative;
            }
            
            .non-deletable::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              pointer-events: none;
              z-index: 1;
            }
          `;
          document.head.appendChild(style);
          setTimeout(() => {
            const blocks = document.querySelectorAll(".ce-block");

            blocks.forEach((block, blockIndex) => {
              const headerEl = block.querySelector(".ce-header");
              const paragraphEl = block.querySelector(".ce-paragraph");

              if (headerEl) {
                const text = headerEl.innerText.trim().toLowerCase();

                if (
                  text === t("challengesHeader").toLowerCase() ||
                  text === t("solutionsHeader").toLowerCase() ||
                  (text.startsWith("q") && text.includes(":"))
                ) {
                  headerEl.setAttribute("contenteditable", "false");
                  headerEl.style.pointerEvents = "none";
                  headerEl.style.color = "#374151";
                  headerEl.style.fontWeight = "bold";

                  if (text.startsWith("q") && text.includes(":")) {
                    headerEl.classList.add("question-header");

                    block.classList.add("non-deletable");
                    block.setAttribute("data-readonly", "true");

                    const preventDeletion = (e) => {
                      if (e.key === "Backspace" || e.key === "Delete") {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }
                    };

                    block.addEventListener("keydown", preventDeletion, true);
                    headerEl.addEventListener("keydown", preventDeletion, true);

                    block.addEventListener(
                      "contextmenu",
                      (e) => {
                        e.preventDefault();
                        return false;
                      },
                      true
                    );

                    block.style.userSelect = "none";
                    block.style.webkitUserSelect = "none";
                    block.style.mozUserSelect = "none";
                    block.style.msUserSelect = "none";
                  }
                }
              } else if (paragraphEl) {
                const paragraphText =
                  paragraphEl.textContent || paragraphEl.innerText || "";
                const isEmpty =
                  !paragraphText.trim() ||
                  paragraphText === "​" ||
                  paragraphText === " ";

                const prevBlock = block.previousElementSibling;
                const prevPrevBlock = prevBlock?.previousElementSibling;

                const isPrevBlockAnswer =
                  prevBlock?.querySelector(".ce-paragraph");
                const isPrevPrevBlockQuestion = prevPrevBlock
                  ?.querySelector(".ce-header")
                  ?.innerText.toLowerCase()
                  .startsWith("q");

                if (isEmpty && isPrevBlockAnswer && isPrevPrevBlockQuestion) {
                  block.classList.add("spacer-block");
                  paragraphEl.setAttribute("contenteditable", "false");
                  paragraphEl.style.pointerEvents = "none";
                  paragraphEl.style.userSelect = "none";
                  paragraphEl.style.cursor = "default";

                  const preventInteraction = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  };

                  block.addEventListener("click", preventInteraction, true);
                  block.addEventListener("mousedown", preventInteraction, true);
                  block.addEventListener(
                    "focus",
                    (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.target.blur) e.target.blur();
                      return false;
                    },
                    true
                  );
                  block.addEventListener("keydown", preventInteraction, true);
                  block.addEventListener("keyup", preventInteraction, true);
                  block.addEventListener("input", preventInteraction, true);

                  block.style.userSelect = "none";
                  block.style.webkitUserSelect = "none";
                  block.style.mozUserSelect = "none";
                  block.style.msUserSelect = "none";
                } else if (
                  isPrevBlockAnswer === false &&
                  prevBlock
                    ?.querySelector(".ce-header")
                    ?.innerText.toLowerCase()
                    .startsWith("q")
                ) {
                  paragraphEl.classList.add("answer-paragraph");
                }
              }
            });
          }, 500);
        },
        defaultBlock: "paragraph",
        data: {
          blocks:
            parsed_content.length > 0
              ? parsed_content
              : [{ type: "paragraph", data: { text: "" } }],
        },
        onChange: async (api, event) => {
          setIsSaving(false);
          const savedData = await api.saver.save();

          const filteredBlocks = savedData.blocks.filter((block, index) => {
            if (block.type === "paragraph") {
              const isEmpty =
                !block.data.text.trim() ||
                block.data.text === "​" ||
                block.data.text === " ";
              return !isEmpty;
            }
            return true;
          });

          const imageBlocks = filteredBlocks.filter(
            (block) => block.type === "image"
          );
          if (!isInitialLoadRef.current) {
            if (storyMediaIdArray?.length !== imageBlocks?.length) {
              for (let i = 0; i < storyMediaIdArray?.length; i++) {
                const storyFile = storyMediaIdArray[i];
                let fileFound = false;
                for (let j = 0; j < imageBlocks?.length; j++) {
                  if (storyFile?.file === imageBlocks[j]?.data?.url) {
                    fileFound = true;
                    break;
                  }
                }
                if (!fileFound) {
                  partialUpdateMedia(storyFile?.id);
                }
              }
            }
          }
        },
      });
    }

    return () => {
      if (!!Object.keys(editor || {})?.length) editor.destroy();
    };
  }, [editorCopyChanges, isModalOpen, storyData]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  async function callEndStory(hasClickedOnRegenerate = false) {
    let endStoryResponse;
    if (
      (isStreamingComplete && strandStep >= stateMachineLength) ||
      hasClickedOnRegenerate
    ) {
      try {
        setIsLoading(true);
        setIsEndStoryLoading(true);

        const end_story_api_url = `/api/end-story/`;
        
        let sourceLanguage = preferredLanguage?.value || languageToUse;

        endStoryResponse = await axiosInstance({
          url: end_story_api_url,
          data: {
            session: sessionId,
            profile_id: profileToUse,
            stage: 'COMPLETED',
            access_token: accessToken,
            flow: storageFlow,
            language: sourceLanguage
          },
          method: "POST",
        });

        if (endStoryResponse?.data?.id) {
          setFiles([]);
          setShowFileInput(true);
          removeFromStorage("llmError");
          window.location.reload();
        } else {
          setLlmError(endStoryResponse?.data?.error_message);
          setIsEndStoryLoading(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error completing the story:", error);
        setLlmError(error?.response?.data?.error_message);
        setIsEndStoryLoading(false);
        setIsLoading(false);
      } finally {
        setNoStoryFound(false);
      }
    }
  }

  useEffect(() => {
    if (isShikshalokamPublicType) {
      setShouldFetchIntro(true);
      setIsStreamingComplete(true);
    }
  }, [isShikshalokamPublicType]);

  useEffect(() => {
    if (!!editorCopyChanges && isModalOpen && storyData) {
      const flow = storageFlow
      let parsed_content = [];
      try {
        if (storageFlow && [sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(storageFlow)) {
          const challenges = storyData?.other_params?.challenges_faced || [];
          const solutions = storyData?.other_params?.solutions_discussed || [];

          parsed_content = [
            {
              type: "header",
              data: {
                text: t("challengesHeader"),
                level: 2,
                customId: "challenges",
              },
            },
            {
              type: "list",
              data: {
                style: "unordered",
                items: challenges.length > 0 ? challenges : [""],
              },
            },
            {
              type: "header",
              data: {
                text: t("solutionsHeader"),
                level: 2,
                customId: "solutions",
              },
            },
            {
              type: "list",
              data: {
                style: "unordered",
                items: solutions.length > 0 ? solutions : [""],
              },
            },
          ];
        } else if (storageFlow && [sessionFlowName.ListeningActivity].includes(flow)) {
          const questionAnswers = storyData?.other_params?.question_answers || [];
          
          parsed_content = [];
          questionAnswers.forEach((qa, index) => {
            // Add question header
            parsed_content.push({
              type: "header",
              data: {
                text: `Q${index + 1}: ${qa.question}`,
                level: 3,
                customId: `question-${index}`,
              },
            });

            parsed_content.push({
              type: "paragraph",
              data: {
                text: qa.answer || "",
              },
            });

            if (index < questionAnswers.length - 1) {
              parsed_content.push({
                type: "paragraph",
                data: {
                  text: "​",
                },
                readonly: true,
              });
            }
          });
        } else {
          parsed_content = editorCopyChanges.map((item) => ({
            type: item.type,
            data: {
              text: item.data.text,
            },
          }));
        }
      } catch (error) {
        parsed_content = [];
      }

      if (!document.getElementById("editorjs")) {
        return;
      }

      const _editor = new EditorJS({
        holder: "editorjs",
        placeholder: t("editorPlaceholder"),
        autofocus: true,
        hideToolbar: true,
        tools: {
          header: {
            class: Header,
            inlineToolbar: false,
          },
          list: {
            class: List,
            inlineToolbar: false,
            config: {
              defaultStyle: "unordered",
            },
          },
        },
        onReady: () => {
          setEditor(_editor);
          const style = document.createElement("style");
          style.innerHTML = `
            .ce-toolbar__plus, .ce-toolbar__actions { display: none !important; }
            .ce-popover, .ce-settings, .ce-settings__button { display: none !important; }
            .ce-block--selected .ce-block__drag-handle { display: none !important; }
            .ce-inline-toolbar { display: none !important; }
            .ce-block--selected { outline: none !important; }
            
            /* Style for spacer blocks */
            .spacer-block {
              min-height: 0.75rem !important;
              background: transparent !important;
              border: none !important;
              pointer-events: none !important;
              user-select: none !important;
              cursor: default !important;
              margin: 0.5rem 0 !important;
              position: relative;
            }
            
            .spacer-block .ce-paragraph {
              pointer-events: none !important;
              user-select: none !important;
              outline: none !important;
              cursor: default !important;
              opacity: 0 !important;
              min-height: 0.75rem !important;
            }
            
            .spacer-block::before {
              content: '';
              display: block;
              width: 100%;
              height: 1px;
              background-color: #e5e7eb;
              position: absolute;
              top: 50%;
              left: 0;
              transform: translateY(-50%);
            }
            
            /* Add visual separation after answer paragraphs */
            .answer-paragraph {
              margin-bottom: 0.5rem !important;
              padding-bottom: 0.5rem !important;
            }
            
            /* Question header styling */
            .question-header {
              color: #374151 !important;
              font-weight: bold !important;
              margin-top: 2rem !important;
              margin-bottom: 1rem !important;
            }
            
            .question-header:first-child {
              margin-top: 0 !important;
            }
            
            /* Non-deletable block styling */
            .non-deletable {
              position: relative;
            }
            
            .non-deletable::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              pointer-events: none;
              z-index: 1;
            }
          `;
          document.head.appendChild(style);
          setTimeout(() => {
            const blocks = document.querySelectorAll(".ce-block");

            blocks.forEach((block, blockIndex) => {
              const headerEl = block.querySelector(".ce-header");
              const paragraphEl = block.querySelector(".ce-paragraph");

              if (headerEl) {
                const text = headerEl.innerText.trim().toLowerCase();

                if (
                  text === t("challengesHeader").toLowerCase() ||
                  text === t("solutionsHeader").toLowerCase() ||
                  (text.startsWith("q") && text.includes(":"))
                ) {
                  headerEl.setAttribute("contenteditable", "false");
                  headerEl.style.pointerEvents = "none";
                  headerEl.style.color = "#374151";
                  headerEl.style.fontWeight = "bold";

                  if (text.startsWith("q") && text.includes(":")) {
                    headerEl.classList.add("question-header");

                    block.classList.add("non-deletable");
                    block.setAttribute("data-readonly", "true");

                    const preventDeletion = (e) => {
                      if (e.key === "Backspace" || e.key === "Delete") {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }
                    };

                    block.addEventListener("keydown", preventDeletion, true);
                    headerEl.addEventListener("keydown", preventDeletion, true);

                    block.addEventListener(
                      "contextmenu",
                      (e) => {
                        e.preventDefault();
                        return false;
                      },
                      true
                    );

                    block.style.userSelect = "none";
                    block.style.webkitUserSelect = "none";
                    block.style.mozUserSelect = "none";
                    block.style.msUserSelect = "none";
                  }
                }
              } else if (paragraphEl) {
                const paragraphText =
                  paragraphEl.textContent || paragraphEl.innerText || "";
                const isEmpty =
                  !paragraphText.trim() ||
                  paragraphText === "​" ||
                  paragraphText === " ";

                const prevBlock = block.previousElementSibling;
                const prevPrevBlock = prevBlock?.previousElementSibling;

                const isPrevBlockAnswer =
                  prevBlock?.querySelector(".ce-paragraph");
                const isPrevPrevBlockQuestion = prevPrevBlock
                  ?.querySelector(".ce-header")
                  ?.innerText.toLowerCase()
                  .startsWith("q");

                if (isEmpty && isPrevBlockAnswer && isPrevPrevBlockQuestion) {
                  block.classList.add("spacer-block");
                  paragraphEl.setAttribute("contenteditable", "false");
                  paragraphEl.style.pointerEvents = "none";
                  paragraphEl.style.userSelect = "none";
                  paragraphEl.style.cursor = "default";

                  const preventInteraction = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  };

                  block.addEventListener("click", preventInteraction, true);
                  block.addEventListener("mousedown", preventInteraction, true);
                  block.addEventListener(
                    "focus",
                    (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.target.blur) e.target.blur();
                      return false;
                    },
                    true
                  );
                  block.addEventListener("keydown", preventInteraction, true);
                  block.addEventListener("keyup", preventInteraction, true);
                  block.addEventListener("input", preventInteraction, true);

                  block.style.userSelect = "none";
                  block.style.webkitUserSelect = "none";
                  block.style.mozUserSelect = "none";
                  block.style.msUserSelect = "none";
                } else if (
                  isPrevBlockAnswer === false &&
                  prevBlock
                    ?.querySelector(".ce-header")
                    ?.innerText.toLowerCase()
                    .startsWith("q")
                ) {
                  paragraphEl.classList.add("answer-paragraph");
                }
              }
            });
          }, 500);
        },
        defaultBlock: "paragraph",
        data: {
          blocks:
            parsed_content.length > 0
              ? parsed_content
              : [{ type: "paragraph", data: { text: "" } }],
        },
        onChange: async (api, event) => {
          setIsSaving(false);
          const savedData = await api.saver.save();

          const filteredBlocks = savedData.blocks.filter((block, index) => {
            if (block.type === "paragraph") {
              const isEmpty =
                !block.data.text.trim() ||
                block.data.text === "​" ||
                block.data.text === " ";
              return !isEmpty;
            }
            return true;
          });

          const imageBlocks = filteredBlocks.filter(
            (block) => block.type === "image"
          );

          if (!isInitialLoadRef.current) {
            if (storyMediaIdArray?.length !== imageBlocks?.length) {
              for (let i = 0; i < storyMediaIdArray?.length; i++) {
                const storyFile = storyMediaIdArray[i];
                let fileFound = false;
                for (let j = 0; j < imageBlocks?.length; j++) {
                  if (storyFile?.file === imageBlocks[j]?.data?.url) {
                    fileFound = true;
                    break;
                  }
                }
                if (!fileFound) {
                  partialUpdateMedia(storyFile?.id);
                }
              }
            }
          }
        },
      });
    }

    return () => {
      if (!!Object.keys(editor || {})?.length) editor.destroy();
    };
  }, [editorCopyChanges, isModalOpen, storyData]);

  const navigateBack = () => {
    let rerouteUrl = previousUrl;
    stopAllAudio();
    if(accessToken) {
      clearFromStorage(true);
      navigateSsoFlow(ssoRerouteURL);
      return;
    }
    clearFromStorage();
    setLanguage(languageList[0].value);
    setChatLanguage(languageList[0].value);
    // navigate(ROUTES.SHIKSHALOKAM_GUEST_PAGE)
    // navigate("/", { replace: true });
    if(rerouteUrl && rerouteUrl !== null && rerouteUrl !== undefined && rerouteUrl !== ""){
      window.location.href = rerouteUrl;
    } else {
      window.location.href = 'https://www.google.com';
    }

  }

  function navigateSsoFlow (rerouteURL){
    navigate(-2);
    if(rerouteURL){

    } else {
      navigate(-2);
    }
  }


  function stayOnPage (){
    window.history.pushState(null, "", window.location.href);
  }

  const getQuestionAnswersFromBlocks = (blocks) => {
    const questionAnswers = [];
    let currentQuestion = null;

    const filteredBlocks = blocks.filter((block) => {
      if (block.type === "paragraph") {
        const text = block.data.text || "";
        const isEmpty = !text.trim() || text === "​" || text === " ";
        return !isEmpty;
      }
      return true;
    });

    filteredBlocks.forEach((block, index) => {
      if (block.type === "header" && block.data.text.startsWith("Q")) {
        if (currentQuestion) {
          questionAnswers.push(currentQuestion);
        }

        const questionText = block.data.text.replace(/^Q\d+:\s*/, "");
        currentQuestion = { question: questionText, answer: "" };
      } else if (block.type === "paragraph" && currentQuestion) {
        currentQuestion.answer = block.data.text || "";
        questionAnswers.push(currentQuestion);
        currentQuestion = null;
      }
    });

    if (currentQuestion) {
      questionAnswers.push(currentQuestion);
    }

    return questionAnswers;
  };

  const defaultEditorClick = (title, name, location) => {
    stopAllAudio();
    return (
      <>
        <div className="fixed inset-0 bg-white flex items-center justify-center p-0 max-sm:px-0 z-[100]">
          <div
            className="bg-gray-100 rounded-lg shadow-lg w-full h-full max-w-2xl p-[30px_0_0] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto h-full w-full">
              <div className="px-[73px] max-sm:px-[23px]">
                <h2 className="text-lg font-semibold text-black-700">
                  {t("editorHeading")}
                </h2>

                <div className="mt-4">
                  <h3 className="text-md font-semibold">{title}</h3>
                  <p className="text-gray-600 text-sm">
                    {name}, {location}
                  </p>
                </div>

                <div className="mt-4 h-60 overflow-y-auto">
                  <div
                    id="editorjs"
                    ref={editorContainerRef}
                    className=""
                  ></div>
                </div>

                <div className="mt-4">
                  <UploadImages 
                    storyData={storyData} 
                    access_token={accessToken} 
                    files={files} 
                    setFiles={setFiles} 
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    handleMultipleUploads={handleMultipleUploads}
                    fileErrorText={fileErrorText}
                    setFileErrorText={setFileErrorText}
                    showImages={false}
                  />
                </div>
              </div>
              <div className="w-full flex justify-center py-4 px-[40px] bg-gray-100">
                <button
                  onClick={async () => {
                    try {
                      const outputData = await editor.save();
                      let updatePayload = {
                        id: storyData?.id,
                        token: accessToken,
                        session: sessionId,
                        flow: storageFlow,
                        formatted_content: outputData?.blocks,
                      };
                      await partialUpdateStoryById({
                        setter: setStoryData,
                        loader: setIsLoading,
                        data: updatePayload,
                      });
                      if([sessionFlowName.GuestMiStory, sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity].includes(storageFlow) && accessToken){
                        setIsLoading(true);
                         await updateReflectionStatus(
                          projectId, "completed", sessionFlowName.SsoFlow, accessToken
                        );
                        clearFromStorage(false);
                        console.log("History length:", window.history.length);
                        console.log(
                          "Can go back 1?",
                          window.history.length > 1
                        );
                        console.log(
                          "Can go back 3?",
                          window.history.length > 3
                        );
                        setSsoNavigationTriggered(true);
                        const message = { type: "MItra", name: "MItra" };
                        setTimeout(() => {
                          window.postMessage(message, "*");
                          console.log("Postmessage called");
                        }, 500);

                        console.log("navigating from the condtion to -3");
                        navigate(-3, { replace: true });

                        return;
                      } else {
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error("Saving failed: ", error);
                      if (accessToken){
                        clearFromStorage();
                        navigate(-1);
                      }
                    }
                  }}
                  disabled={isLoading || isSaving}
                  className="w-full bg-[#212121] text-white py-2 rounded-md hover:bg-black disabled:opacity-50"
                >
                  {t("EditorConfirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const getListAfterHeaderText = (headerText, blocks) => {
    const idx = blocks.findIndex(
      (b) =>
        b.type === "header" &&
        b.data.text.trim().toLowerCase() === headerText.toLowerCase()
    );
    if (idx !== -1 && blocks[idx + 1]?.type === "list") {
      const items = blocks[idx + 1].data.items || [];
      return items.map((item) =>
        typeof item === "string" ? item : item?.content || ""
      );
    }
    return [];
  };

  const handleEditClick = () => {
    return (
      <>
        <div className="voice-chat-editor-overlay" onClick={closeModal}>
          <div
            className="voice-chat-editor-content"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button onClick={closeModal} className="editor-content-button">
              <IoClose className="icon-7" />
            </button>
            <div id="container-editor">
              <div className="container-editor-div">
                <div
                  id="editorjs"
                  ref={editorContainerRef}
                  className="editor-main-div"
                ></div>
              </div>
            </div>
            <div className="editor-button-div">
            <PrimaryButton
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const outputData = await editor.save();
                  const flow = storageFlow;

                  let updatePayload = {
                    id: storyData?.id,
                    access_token: accessToken,
                    session: sessionId,
                    flow,
                  };

                    if (
                      flow &&
                      [
                        sessionFlowName.LoginDiscussion,
                        sessionFlowName.GuestDiscussion,
                      ].includes(flow)
                    ) {
                      const blocks = outputData?.blocks || [];
                      const challenges = getListAfterHeaderText(
                        t("challengesHeader"),
                        blocks
                      );
                      const solutions = getListAfterHeaderText(
                        t("solutionsHeader"),
                        blocks
                      );

                      updatePayload = {
                        ...updatePayload,
                        ...storyData?.other_params,
                        other_params: {
                          ...(storyData?.other_params || {}),
                          challenges_faced: challenges,
                          solutions_discussed: solutions,
                        },
                        formatted_content: null,
                      };
                    } else if (
                      flow &&
                      [sessionFlowName.ListeningActivity].includes(flow)
                    ) {
                      const blocks = outputData?.blocks || [];
                      const questionAnswers =
                        getQuestionAnswersFromBlocks(blocks);

                      updatePayload = {
                        ...updatePayload,
                        ...storyData?.other_params,
                        other_params: {
                          ...(storyData?.other_params || {}),
                          question_answers: questionAnswers,
                        },
                        formatted_content: null,
                      };
                    } else {
                      updatePayload = {
                        ...updatePayload,
                        formatted_content: outputData?.blocks,
                      };
                    }

                  await partialUpdateStoryById({
                    setter: setStoryData,
                    loader: setIsSaving,
                    data: updatePayload,
                    token: accessToken,
                  });
                } catch (error) {
                  setIsLoading(false);
                  console.error("Saving failed: ", error);
                  if (accessToken){
                    clearFromStorage()
                    navigate(-1)
                  }
                } finally {
                  window.location.reload()
                }
              }}
              disabled={isLoading || isSaving}
            >
              {t('saveChanges')}

            </PrimaryButton>
            </div>
          </div>
        </div>
      </>
    );
  };

  const handleDownloadClick = () => {
    setIsLoading(true);
    setIsPdfDownloading(true);
    setTriggerDownload(true);
  };

  const handleDownloadStop = () => {
    setTriggerDownload(false);
    setIsLoading(false);
    setIsPdfDownloading(false);
    window.location.reload();
  };

  async function ResetChat(e) {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    if (
      isResetCalled &&
      chatSocket &&
      chatSocket.readyState === chatSocket.OPEN
    ) {
      chatSocket.close();
    }
    const currentFlow = storageFlow;
  
    removeChatHistory();
    setIsOldChatOpen(false);
    setIsNewChatOpen(true);
    removeFromStorage('llmError');

    const session = await getSessionDetails();
    setSessionId(session.sessionid);
    setIsChatVisible(false);
    setChatbotClickedOn('');
    setShowHomepage(true)

    window.location.reload();
  }

  let isReconnectInProgress = false;
  
  const MakeSocketConnection = useCallback((currentTextMessage, currentSocket) => {
    return new Promise((resolve, reject) => {
      try{
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
          return resolve(chatSocket);
        } else if(currentSocket && currentSocket.readyState === WebSocket.OPEN) {
          return resolve(currentSocket);
        }
        let socket;
    
        let url;
    
        if (!!searchParams.get("code")) {
          // NOTE: revert this code after testing
          // url = `${wss_protocol}${window.location.host}/ws/chat/company/`;
          url = `${wss_protocol}${process.env.REACT_APP_WEBSOCKET_HOST}/ws/chat/company/`
        } else {
            const base_url = `${wss_protocol}${process.env.REACT_APP_WEBSOCKET_HOST}`;
            const currentFlow = storageFlow;
            
            const websocketConfig = {
              [sessionFlowName.GuestDiscussion]: bot_websocket.shikshalokam_chaupal,
              [sessionFlowName.LoginDiscussion]: bot_websocket.shikshalokam_chaupal,
              [sessionFlowName.ListeningActivity]: bot_websocket.listening_activity,
            };
            
            const normalTypeConfig = {
              normal: {
                [sessionFlowName.LoginMiStory]: bot_websocket.normal,
                [sessionFlowName.GuestMiStory]: bot_websocket.guest_normal,
              },
              oneshot: {
                [sessionFlowName.LoginMiStory]: bot_websocket.oneshot,
                [sessionFlowName.GuestMiStory]: bot_websocket.guest_oneshot,
              }
            };
            
            const selectedTypeConfig = normalTypeConfig[selectedType];
            if (websocketConfig[currentFlow]) {
              url = `${base_url}${websocketConfig[currentFlow]}`;
            } else if (selectedTypeConfig && selectedTypeConfig[currentFlow]) {
              url = `${base_url}${selectedTypeConfig[currentFlow]}`;
            }
          }
          socket = new WebSocket(url);

          socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            const message = data["text"];

            if (message.source === "bot") {
              setIsStreamingComplete(false);

              setSentences((prevSentences) => {
                const updatedSentences = [...prevSentences];

                if (
                  updatedSentences.length > 0 &&
                  updatedSentences[updatedSentences.length - 1]?.source ===
                    "bot"
                ) {
                  if (message?.msg) {
                    updatedSentences[updatedSentences.length - 1].message +=
                      message?.msg;
                  }
                } else {
                  updatedSentences.push({
                    message: message?.msg || "",
                    source: "bot",
                    isNarrated: false,
                    id: new Date().valueOf(),
                  });
                  lastBotMessageIndex.current = updatedSentences.length - 1;
                }
                return updatedSentences;
              });

              const updatedChatHistory = [...chatHistory];
              if (
                updatedChatHistory.length > 0 &&
                updatedChatHistory[updatedChatHistory.length - 1]?.source ===
                  "bot"
              ) {
                if (message?.msg) {
                  updatedChatHistory[updatedChatHistory.length - 1].msg +=
                    message?.msg;
                }
              } else {
                updatedChatHistory.push({
                  msg: message?.msg || "",
                  source: "bot",
                  updated_at: new Date().valueOf(),
                });
              }
              setChatHistory(updatedChatHistory);

              if (isShikshalokamPublicType) {
                handleScrollToView();
              }
            } else {
              setIsStreamingComplete(false);
            }

            if (message.finish_reason === "stop" && message.source === "bot") {
              setStrandStep(message?.step);
              handleScrollToView();
              setTalking(0);
              setIsStreamingComplete(true);
            }
          };

        socket.onopen = () => {
          setChatSocket(socket);
          isReconnectInProgress = false;
          reconnectAttempts = 0;
          if (isShikshalokamPublicType){
            let profileid = profileId
            let sessionid = sessionId
            let route = chatLanguage
            let currentFlow = storageFlow;

            if((profileid || currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory].includes(currentFlow)) && sessionid){
              socket.send(JSON.stringify({
                type: 'authenticate',
                sessionid: sessionid,
                profileid: profileid,
                projectid: projectId || "",
                taskid: searchParams.get("taskId") || taskId,
                access_token: accessToken,
                route: route,
                bot_route: getSessionRoute(),
                flow_name: currentFlow
              }));
            }
          }
          resolve(socket);
        };
        socket.onclose = (event) => {
          console.warn("WebSocket closed:", event);
          if (event.code !== 1000 && !isReconnectInProgress) { 
            console.error("Unexpected WebSocket closure. Retrying...");
            isReconnectInProgress = true; 
            retryConnection(currentTextMessage);
          }
        };
        
        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          socket.close();
            isReconnectInProgress = true; 
            retryConnection(currentTextMessage);
            reject(error);
          };

          return () => {
            if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
              chatSocket.close();
            }
          };
        } catch (error) {
          console.error("Error establishing WebSocket connection:", error);
          reject(error);
        }
      });
    },
    [chatSocket]
  );

  let reconnectAttempts = 0;
  const maxReconnectAttempts = process.env.REACT_APP_WEBSOCKET_RETRY_NUM || 3;

  function retryConnection(currentTextMessage = "") {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error("Max reconnection attempts reached. Stopping.");
      try {
        let chat_history = [...chatHistory] || [];
        if (
          chat_history.length > 0 &&
          chat_history[chat_history.length - 1].source === "user"
        ) {
          chat_history.pop();
          setChatHistory(chat_history);
          console.log("🗑️ Removed last user message from storage.");
        }
      } catch (error) {
        console.error("⚠️ Error modifying storage:", error);
      }
      showConfirmationPopup(() => {
        if (accessToken){
          clearFromStorage()
          navigate(-1)
        } else {
          ResetChat();
        }
      });
      return;
    }
    reconnectAttempts++;

    setTimeout(() => {
      MakeSocketConnection(currentTextMessage)
        .then((newSocket) => {
          reconnectAttempts = 0;
          isReconnectInProgress = false;
          if (currentTextMessage && currentTextMessage.trim() !== "") {
            handleSendMessage(null, newSocket);
          }
        })
        .catch((error) => {
          console.error("Reconnection Failed:", error);
        });
    }, 1000);
  }

  async function getStoryBySession(sessionID){
    const res = await axiosInstance({
      url: `api/get-story/?session=${sessionID}`,
    })
    
    return res?.data?.results;
  }

  function extractTextBlocks(formattedContent) {
    if (!formattedContent) return [];
    const blocks = JSON.parse(formattedContent);
    if (!blocks || blocks?.length === 0) return [];
    return blocks.filter((block) => block.type === "paragraph");
  }


  async function getTranslatedIntroMessage(storedRoute) {
    let translate_api_url = `api/bot_vernacular/?language=${languageToUse}&company_bot__route=${storedRoute}`;
    try {
      const response = await axiosInstance.get(translate_api_url);
      return response?.data?.results;
    } catch (error) {
      console.error("Error fetching AI4Bharat audio:", error);
      throw error;
    }
  }

  async function getSessionInfo(){
    let currentSession = sessionId;
    try {
      const response = await getChatSessionApi({ sessionId: currentSession });
      return response?.data?.results;
    } catch (error) {
      console.error("Error fetching AI4Bharat audio:", error);
      throw error;
    }
  }

  const getSessionRoute = () => {
    const currentFlow = storageFlow;
    console.log("Current Flow:", currentFlow);
    console.log(
      "Is the flow equal",
      currentFlow === sessionFlowName.ListeningActivity
    );

    // Configuration mapping flow names to bot routes
    const flowToRouteMap = {
      [sessionFlowName.GuestDiscussion]: bot_routes.shikshalokam_chaupal,
      [sessionFlowName.LoginDiscussion]: bot_routes.shikshalokam_chaupal,
      [sessionFlowName.ListeningActivity]: bot_routes.listening_activity,
    };

    const typeBasedRouteMap = {
      normal: {
        [sessionFlowName.LoginMiStory]: bot_routes.normal,
        [sessionFlowName.GuestMiStory]: bot_routes.guest_normal,
      },
      oneshot: {
        [sessionFlowName.LoginMiStory]: bot_routes.oneshot,
        [sessionFlowName.GuestMiStory]: bot_routes.guest_oneshot,
      },
    };

    // Check direct flow mapping first
    if (currentFlow && flowToRouteMap[currentFlow]) {
      return flowToRouteMap[currentFlow];
    }

    // Check type-based mapping
    const routeMap = selectedType === "normal" 
      ? typeBasedRouteMap.normal 
      : typeBasedRouteMap.oneshot;

    if (currentFlow && routeMap[currentFlow]) {
      return routeMap[currentFlow];
    }

    // Default route
    return bot_routes.reflection;
  };

  const handleIntroMessage = async () => {
    let data = await getTranslatedIntroMessage(storageFlow)
    let message = data[0]?.introductory_message;
    if (data && data[0]) {
      if (
        profileToUse &&
        firstName &&
        firstName !== "null" &&
        firstName !== ""
      ) {
        message = data[0]?.introductory_message;
      } else {
        message = data[0]?.alt_introductory_message;
      }
    }
    const botName = data[0]?.name || "Bot";

    setBotName(botName);
    setDefaultBotName(data[0]?.default_name);
    setBotNameToDisplay(botName);

    if(isOldChatOpen) {
      let sessionInfo = await getSessionInfo();
      if(sessionInfo && sessionInfo.length>0) {
        setStrandStep(sessionInfo[0]?.current_step)
        if(sessionInfo[0]?.session_type) {
          setSelectedType(sessionInfo[0]?.session_type)
        }
      }
    }
    if (message && firstName) {
      const words = message.split(" ");
      words.splice(1, 0, firstName);
      message = words.join(" ");
    }
    if (message && !!message?.trim() &&
      chatHistory[chatHistory?.length - 1]?.msg !== message &&
      !sentences.some((msg) => msg.message === message)
    ) {
        const isGuestFlow = !accessToken
        setIntroMessage(message)
        setSentences((prev) => [
          ...prev,
          {
            message: message,
            isNarrated: isGuestFlow ? false : false,
            id: "intro_msg_id",
          },
        ]);
        if (isGuestFlow) {
          setHasOverRideId("intro_msg_id");
          setNotMute(false);
          setIsNextAllowed(true);
        }
      }
  }

  const fetchBotInfo = async () => {
    if(!languageToUse) return;

    setIsIntroLoading(true);
    if (!isSpecialFlow) {
      setIsLoading(true);
    }

    try {
      let storedRoute = getSessionRoute();
      const response = await getCompanyBotApi({
        company__slug: companySlug,
        target_language: languageToUse,
        route: storedRoute,
      });
      const bots = response?.results;

      if (!bots || bots.length === 0) {
        handleScrollToView();
        return;
      }

      // Set state machine length from selected bot
      const selectedBot = bots.find((bot) => bot.route === storedRoute) || bots[0] || { route: "/" };
      if (selectedBot?.statemachine_length) {
        setStateMachineLength(selectedBot.statemachine_length);
      }

      // Find the latest bot based on flow type
      const latestBot = bots.find((bot) => bot.route === storedRoute);
      if (!latestBot) {
        handleScrollToView();
        return;
      }
        
      await handleIntroMessage();
    } catch (error) {
      console.error({ error });
      setIsLoading(false);
    } finally {
      setHasFetchIntro(true);
      setShouldFetchIntro(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("hasOverideId: ", hasOverRideId);
  }, [hasOverRideId]);



  // ========== Function Definitions ==========
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    
    setIsModalOpen(true);
  };

  const handleScrollToView = () => {
    if (acceptedTnc === "ONGOING") return;
    try {
      document?.querySelector("#last-chat-boundary")?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      console.error({ error });
    }
  };

  const pdfDownloadSidebar = async (sessionid) => {
    try {
        setIsLoading(true);
        setIsPdfDownloading(true);
        
        
        const story = await getStoryBySession(sessionid, accessToken);
        
        const story_media = story[0]?.story_media;
        const pdfMedia = story_media?.filter(media => media.media_type === 'application/pdf') || [];
        
        
        const pdfFileName = story[0]?.title+".pdf";
        const fileUrl = pdfMedia[0]?.public_url;

      if (fileUrl && pdfFileName) {
        const response = await fetch(fileUrl);

        if (response.ok) {
          const reader = response.body.getReader();
          const chunks = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }

          const blob = new Blob(chunks);
          const a = document.createElement("a");
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = pdfFileName;
          document.body.appendChild(a);
          a.click();

          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          console.error("Network response was not ok.");
        }
      } else {
        console.error("No PDF media found or invalid file URL.");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error downloading file:", error);
    } finally {
      setIsPdfDownloading(false);
      setIsLoading(false);
    }
  };

  async function getCompanyChatApi(currentSession) {
    const resp = await axiosInstance({
      url: `/api/companychat/?session=${currentSession}`,
    });
    return resp;
  }

  async function handleCompanyChatCall(currentSession) {
    const storedChatHistory = chatHistory;
    if (storedChatHistory.length >= 1) {
      return;
    }

    console.log("handleCompanyChatCall");
    setIsFetchingOldIntro(true);

    try {
      const resp = await getCompanyChatApi(currentSession);

      const newChatSessionDetail = [];

      let sortedResult = quickSort(resp?.data?.results, compareById);

      console.log("introMessage: ", introMessage);

      if (introMessage) {
        setSentences((prev) => [
          ...prev,
          {
            message: introMessage,
            source: "bot",
            isNarrated: true,
            id: "intro_msg_id",
          },
        ]);

        newChatSessionDetail.push({
          msg: introMessage,
          source: "bot",
          updated_at: "intro_msg_id",
        });

        // NOTE: This might cause an error
        // introMessageRef.current = "";
      }

      sortedResult.forEach((chats) => {
        let messageToUse = chats?.message;
        if (chats?.translated_message && chats?.translated_message !== "") {
          messageToUse = chats?.translated_message;
        }
        if (chats?.id === "intro_msg_id" || messageToUse === introMessage) {
          return;
        }
        const chatMessage = {
          message: chats?.sender?.id === 1 ? messageToUse : chats?.message,
          source: chats?.sender?.id === 1 ? "bot" : "user",
          isNarrated: true,
          id: chats?.id,
        };

        setSentences((prev) => [...prev, chatMessage]);

        newChatSessionDetail.push({
          msg: chats?.sender?.id === 1 ? messageToUse : chats?.message,
          source: chats?.sender?.id === 1 ? "bot" : "user",
          updated_at: chats?.id,
        });
      });

        const newChatHistoryItems = newChatSessionDetail.map((item) => ({
            msg: item.msg,
            source: item.source,
            updated_at: item.updated_at,
        }));

        const existingMessages = new Set(chatHistory.map(msg => msg.msg));
        const filteredItems = newChatHistoryItems.filter(item => !existingMessages.has(item.msg));

      console.log("filteredItems: ", filteredItems);
      const updatedChatHistory = [...chatHistory, ...filteredItems];
      setChatHistory(updatedChatHistory);

      lastBotMessageIndex.current += newChatSessionDetail.length;
    } catch (error) {
      console.error("Error fetching company chat data:", error);
    } finally {
        setIsFetchingOldIntro(false);
        if(accessToken) {
          setIsLoading(false);
        }
    }
  }

  function compareById(a, b) {
    return a.id - b.id;
  }

  function compareByIdDesc(a, b) {
    return b.id - a.id;
  }

  function quickSort(arr, compare) {
    if (arr?.length <= 1) {
      return arr;
    }

    const pivot = arr[0];
    const left = [];
    const right = [];

    for (let i = 1; i < arr?.length; i++) {
      if (compare(arr[i], pivot) < 0) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }

    return [...quickSort(left, compare), pivot, ...quickSort(right, compare)];
  }

  async function showChatTitle(){
    try{
      const currentSessionID = sessionId;
      const currentFlow = storageFlow;
      let sessionComplete;
      const TitleAndSession = [];
      const response = await getChatSessionApi({
        profile: profileToUse,
        flow: currentFlow,
      });

      if (response) {
        let sortedResult = quickSort(response?.data?.results, compareByIdDesc);
        sortedResult.forEach((sessionObj, index) => {
          const status =
            sessionObj.session_status?.toLowerCase() === "completed"
              ? t("completedStatusText")
              : t("inProgressStatusText");
          TitleAndSession.push({
            session: sessionObj.session,
            title: sessionObj.title,
            sessionStatus: status,
          });
          if (sessionObj.session === currentSessionID) {
            sessionComplete =
              sessionObj.session_status?.toLowerCase() === "completed";
          }
        });
        setShowFileInput(sessionComplete === true);
        setSessionTitleDetail(TitleAndSession);
        setChatTitle([...TitleAndSession.slice(0, chatToAddLength)]);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  const fetchMoreData = () => {
    setTimeout(() => {
      if (visibleItemCount < sessionTitleDetail.length) {
        setVisibleItemCount((prevCount) => prevCount + chatToAddLength);
        setChatTitle((prevChatTitle) => [
          ...prevChatTitle,
          ...sessionTitleDetail.slice(
            prevChatTitle.length,
            prevChatTitle.length + chatToAddLength
          ),
        ]);
      }
    }, 1000);
  };

  function showScrollbarContent() {
    return (
      <div className={isMobile ? "div1" : "div2"}>
        <InfiniteScroll
          dataLength={visibleItemCount}
          next={fetchMoreData}
          hasMore={visibleItemCount < sessionTitleDetail?.length}
          loader={
            <div className={isMobile ? "div3" : "div4"}>
              <BiLoader className="rotate-loader loader-icon" />
            </div>
          }
          scrollableTarget="shikshaScrollableDiv"
        >
          {chatTitle.map((item, index) => (
            <div
              key={`session-title-bttn-${index}`}
              className="chat-title-div div5"
            >
              <div
                className="div6"
                onClick={() => {
                  handleChatSessionButtonClick({
                    key: `session-title-bttn-${index}`,
                  });
                }}
              >
                <span className="span1">{item?.title}</span>
                <span
                  className={`span2 ${
                    item?.sessionStatus === t("completedStatusText")
                      ? "span3"
                      : "span4"
                  }`}
                >
                  {item?.sessionStatus}
                </span>
              </div>

              {item?.sessionStatus === t("completedStatusText") && (
                <button
                  className="span5"
                  onClick={() => {
                    pdfDownloadSidebar(item?.session);
                  }}
                >
                  <FiDownload />
                </button>
              )}
              {item?.sessionStatus !== t("completedStatusText") && (
                <button className="span5"></button>
              )}
            </div>
          ))}
        </InfiniteScroll>
      </div>
    );
  }

  const handleSendMessage = useCallback(
    async (event, currentSocket) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      setLlmError("");

      // NOTE: This might cause an error
      // removeFromStorage('llmError');

      handleOnStopSpeaking();
      try {
        const socket = await MakeSocketConnection(textMessage, currentSocket);
        setIsChatVisible(true);
        setShowHomepage(false);
        setNotMute(true);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        if (!textMessage.trim()) return;

        handleMessagesForUser(textMessage);
        socket.send(
          JSON.stringify({
            text: textMessage,
            context: "",
            asr_audio: asrAudio,
          })
        );
        setAsrAudio(null);
        handleScrollToView();
        setTextMessage("");
      } catch (error) {
        console.error("WebSocket connection failed:", error);
      }
    },
    [textMessage, MakeSocketConnection]
  );

  const handleOnInputText = (e) => {
    e.preventDefault();
    setTextMessage(e.target.value);

    if (e.target.value.trim() === "") {
      setIsRecognizing(false);
      setHasStartedListening(false);
    }
  };

  const handleMessagesForBot = useCallback(
    (sentence) => {
      if (isRecognizing || hasStartedListening || !shouldSendMessage) return;

      const lastMessage = chatHistory[chatHistory?.length - 1];
      if (lastMessage?.msg === sentence && lastMessage?.source === "bot") {
        return;
      }

      if (chatHistory[chatHistory?.length - 1]?.source === "bot") {
        const lastMessage = chatHistory[chatHistory?.length - 1];
        lastMessage.msg += " " + sentence;
        setChatHistory([...chatHistory]);
      } else {
        setChatHistory([
          ...chatHistory,
          createMessage({
            msg: sentence,
            source: "bot",
          }),
        ]);
      }
    },
    [chatHistory]
  );

  const handleMessagesForUser = (sentence) => {
    setChatHistory((prev) => [
      ...prev,
      createMessage({
        msg: sentence,
        source: "user",
      }),
    ]);
  };

  const handleAI4BharatTTSRequest = async (text, id, sourceLanguage) => {
    try {
      if (id === "intro_msg_id" && isIntroPlayed.current === true) {
        return;
      }
      if (id === "intro_msg_id") {
        isIntroPlayed.current = true;
      }
      let cachedAudioUrl = audioCache[id];
      let audio_result = "";
      let audio;

      if (!sourceLanguage) {
        sourceLanguage = "en";
      }

      let storedRoute = getSessionRoute();

      if (!hasOverRideId) {
        handleMessagesForBot(text);
      }

      if (isMute && !hasOverRideId) {
        setSentences((prev) => {
          let all_sentences = JSON.parse(JSON.stringify([...prev]));
          return all_sentences.map((x) => ({ ...x, isNarrated: true }));
        });
        setIsNextAllowed(true);
        setHasOverRideId(null);
        return;
      }

      if (!cachedAudioUrl) {
        audio_result = await getAI4BharatAudioApi(
          text,
          sourceLanguage,
          storedRoute
        );
        if (audio_result?.length) {
          cachedAudioUrl = `data:audio/wav;base64,${audio_result}`;
          setAudioCache((prevCache) => ({
            ...prevCache,
            [id]: cachedAudioUrl,
          }));
        }
      }

      if (cachedAudioUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        audioRef.current = new Audio(cachedAudioUrl);
        audio = audioRef.current;

        audio.onplay = () => {
          setIsNextAllowed(false);
        };

        audio.onended = () => {
          setSentences((prev) => {
            let all_sentences = JSON.parse(JSON.stringify([...prev]));
            let index = prev.findIndex((x) => x.id === id);
            if (index > -1) all_sentences[index].isNarrated = true;
            return all_sentences;
          });
          setIsNextAllowed(true);
          setHasOverRideId(null);
        };

        try {
          await audio.play();
        } catch (error) {
          console.error("Error playing audio:", error);
          setSentences((prev) => {
            let all_sentences = JSON.parse(JSON.stringify([...prev]));
            let index = prev.findIndex((x) => x.id === id);
            if (index > -1) all_sentences[index].isNarrated = true;
            return all_sentences;
          });
          setIsNextAllowed(true);
          setHasOverRideId(null);
        }
      }
    } catch (error) {
      console.error("Error in handleAI4BharatTTSRequest:", error);
      handleOnStopSpeaking();
    }
  };

  const isTyping = !!textMessage.trim();


  // useEffect(() => {
  //   const storedLanguage = getFromStorageSlice("userPreference", "route") || null;
  //   if (storedLanguage && storedLanguage !== null) {
  //   } else {
  //     const currentFlow = storageFlow;
  //     if (currentFlow && !([sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory].includes(currentFlow))) {
  //       setInStorageSlice("userPreference", "en", "setRoute", type);
  //     }
  //   }
  // }, []);

  

  const handleFirstMessage = ({ message, category }) => {
    try {
      if (category === "special") {
        window.location.reload();
        return;
      }
      handleScrollToView();
    } catch (error) {
      console.error({ error });
    }
  };

  const handleOnSpeaking = async (
    text,
    id,
    staticMsg,
    hasClickedOnSpeaker = false
  ) => {
    try {
      try {
        if (!!audioRef.current) await audioRef.current.pause();
      } catch (error) {
        console.error({ error });
      }
      if (id === "intro_msg_id") {
        isIntroPlayed.current = false;
      }
      setHasOverRideId(id);
      setIsNextAllowed(true);
      const messageToPlay = staticMsg
        ? staticMsg
        : chatHistory.find((message) => message.updated_at === id);
      setSentences((prev) => {
        return [
          {
            message: messageToPlay?.msg,
            isNarrated: false,
            id: id,
          },
        ];
      });
    } catch (error) {
      console.error({ error });
    }
  };

  const handleOnStopSpeaking = async () => {
    try {
      try {
        if (audioRef.current) await audioRef.current.pause();
      } catch (error) {
        console.error({ error });
      }
      setHasOverRideId(null);
      setSentences([]);
      setIsNextAllowed(true);
    } catch (error) {
      console.error({ error });
    }
  };

  const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0);

    const rms = Math.sqrt(
      rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length
    );
    console.log("RMS (volume):", rms);

    return rms < silenceThreshold;
  };

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      handleOnStopSpeaking();
      setTextMessage("");
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const options = {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 16000,
          };
          const recorder = new MediaRecorder(stream, options);
          setMediaRecorder(recorder);

          const localAudioChunks = [];

          recorder.start();
          setHasStartedRecording(true);

          recorder.ondataavailable = (event) => {
            localAudioChunks.push(event.data);
          };

          recorder.onstop = async () => {
            if (localAudioChunks.length > 0) {
              const audioBlob = new Blob(localAudioChunks, {
                type: "audio/webm;codecs=opus",
              });
              const isSilent = await isSilentAudio(audioBlob, 0.02);

              if (!audioBlob || isSilent) {
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                });
                return;
              }

              setIsFetchingData(true);
              let transcriptResult = '';
              let s3Url = await handleS3Upload(audioBlob, `${Date.now()}`, `chatbot/companychat/${sessionId}/`, storyData);              if(!s3Url || s3Url === '') {
                transcriptResult = t('asrError');
              }
              setAsrAudio(s3Url);
              let storedRoute = getSessionRoute();
              transcriptResult = await ai4BharatASRApi(
                s3Url,
                languageToUse,
                storedRoute
              );
              if (!transcriptResult || transcriptResult === "") {
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                });
              } else {
                setTextMessage(transcriptResult);
              }
              setIsFetchingData(false);
            } else {
              console.warn("No audio chunks were recorded.");
              setIsFetchingData(false);
            }
          };
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err);
          setIsFetchingData(false);
        });
    } else {
      console.warn("getUserMedia not supported on your browser!");
    }
  };

  // const containsSignificantAudio = (audioBuffer, threshold = 0.3) => {
  //   const numOfChannels = audioBuffer.numberOfChannels;
  //   const channelData = [];

  //   for (let i = 0; i < numOfChannels; i++) {
  //     channelData.push(audioBuffer.getChannelData(i));
  //   }

  //   for (let i = 0; i < channelData[0].length; i++) {
  //     for (let channel = 0; channel < numOfChannels; channel++) {
  //       if (Math.abs(channelData[channel][i]) > threshold) {
  //         return true;
  //       }
  //     }
  //   }

  //   return false;
  // };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setHasStartedRecording(false);
    }
  };

  function downloadPdf() {
    let current_company = companyName ? companyName : null;
    let currentState = userState ? userState : null;
    if (!currentState) {
      currentState = cookies.get("state");
    }
    if (!current_company) {
      current_company = cookies.get("company");
    }

    return (
      <>
        <PdfDownloader
          key={new Date().getTime()}
          storyData={storyData}
          isShikshalokam={true}
          downloadTriggered={triggerDownload}
          handleDownloadStop={handleDownloadStop}
          storyMediaArr={files}
          currentState={currentState}
          current_company={current_company}
        />
      </>
    );
  }

  const handleSelectedTypeNameChanges = (e) => {
    let { value } = e?.target;
    function changeSelectedValue(value, e) {
      if (value === "") value = selectedLabel?.types[0]?.value;
      setSelectedType(value);
      ResetChat(e);
    }
    if ([sessionFlowName.GuestMiStory].includes(storageFlow)) {
      showGuestPopup(() => changeSelectedValue(value, e), stayOnPage);
    } else {
      changeSelectedValue(value, e);
    }
  };

  const convertHeifToJpg = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosInstance.post(
      "api/image-converter/",
      formData,
      {
        responseType: "blob",
      }
    );

    const convertedBlob = response.data;

    const originalName = file.name.split(".").slice(0, -1).join(".");
    const jpgFile = new File([convertedBlob], `${originalName}.jpg`, {
      type: "image/jpeg",
    });

    return jpgFile;
  };

  const handleMultipleUploads = async (e, storyData) => {
    const filesArray = Array.from(e.target.files);
    const currentFiles = [...files];

    if (currentFiles?.length + filesArray.length > 10) {
      setFileErrorText(fileExceedText);
      return;
    }

    const story_id = storyData?.id;
    if (!story_id) {
      return;
    }

    const maxFileSize = 50 * 1024 * 1024;
    const allowedExtensions = [
      "jpeg",
      "jpg",
      "png",
      "svg",
      "webp",
      "heif",
      "heic",
    ];

    const uploadPromises = filesArray.map(async (file) => {
      if (file.size > maxFileSize) {
        setFileErrorText(fileSizeText);
        setIsLoading(false);
        throw new Error("File size exceeds limit");
      }

      const fileName = file.name;
      const fileExtension = fileName.split(".").pop().toLowerCase();
      console.log("fileName: ", fileName);
      console.log("fileExtension: ", fileExtension);

      console.log("In promise for file:", fileName);

      if (!allowedExtensions.includes(fileExtension)) {
        setFileErrorText(t("fileTypeErrorText"));
        setIsLoading(false);
        throw new Error("Invalid file type");
      }

      try {
        if (["heic", "heif"].includes(fileExtension)) {
          file = await convertHeifToJpg(file);
        }

        const s3Url = await handleS3Upload(
          file,
          fileName,
          "chatbot/storymedia/",
          storyData
        );

        const formData = {
          file_url: s3Url,
          story: story_id,
          name: fileName,
          media_type: file.type,
          include_in_story: true,
          access_token: accessToken,
          flow: storageFlow,
          session: sessionId,
        };
  
        const uploadedFile = await uploadImage(formData, setError, navigate, setIsLoading, setFiles);
        return uploadedFile;
      } catch (error) {
        console.error({ error });
        if (accessToken) {
          clearFromStorage();
          navigate(-1);
        } else if([sessionFlowName.SsoFlow].includes(storageFlow) && accessToken) {
          clearFromStorage(true);
          navigateSsoFlow(ssoRerouteURL);
        }
        setIsLoading(false);
        return null;
      }
    });

    try {
      const uploadedFiles = await Promise.allSettled(uploadPromises);
      const validFiles = uploadedFiles
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);

      setFiles([...currentFiles, ...validFiles]);
    } catch (e) {
      console.error("Upload handling error", e);
    }
  };

  function handleAcceptTnC() {    
    setAcceptedTnC(true);
    if(isSpecialFlow) {
      setShouldFetchIntro(true);
    }
  }

  return (
    <>
      {(acceptedTnc==="ONGOING" && !isLoading && storageFlow && 
        [sessionFlowName.Reflection].includes(storageFlow)
      )&& 
        <PrivacyPolicyPopup tncText={t('tncText')} onAccept={handleAcceptTnC} />
      }

      {(chatLanguage && acceptedTnc==="ONGOING" && !isLoading && storageFlow && 
        [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory].includes(storageFlow)
      )&& 
        <PrivacyPolicyPopup 
          tncText={t('tncText')}  
          onAccept={handleAcceptTnC} useStaticText={false}
        />
      }
      <></>
      <div className={`div27 ${isOpen && " div70"}`}>
        <div className={`div28 ${isOpen ? "div29" : ""}`}>
          {(isShikshalokamPublicType && storageFlow && 
            !([sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory].includes(storageFlow)))&& 
            <Sidebar
              isOpen={isOpen}
              toggle={setIsOpen}
              isMobileFirst={true}
              showScrollbarContent={accessToken && showScrollbarContent}
              resetChat={ResetChat}
              setIsResetCalled={setIsResetCalled}
              languageToUse={languageToUse}
              stopAllAudio={stopAllAudio}
              showGuestPopup={(isSpecialFlow && !accessToken) ? () => showGuestPopup(() => {
                if (isSpecialFlow) removeFromStorage('botName');
                ResetChat();
              }, stayOnPage): undefined}
            />}
        </div>
        {isOpen && (
          <div className="div7" onClick={() => setIsOpen(false)}></div>
        )}
        <div className={isMobile ? "div30_a" : "div30"}>
          <MainHeader
            isMobileFirst={isMobile}
            showTheDots={false}
            content={
              <>
                {([sessionFlowName.LoginMiStory, sessionFlowName.GuestMiStory].includes(storageFlow)) && 
                  <CustomFormData layOut={2} selectID="selectedTypeID" selectName="selectedType"
                    selectOptions={selectedLabel.types}  
                    selectValue = {selectedType}
                    selectClassName="div31"
                    selectOnChange={handleSelectedTypeNameChanges}
                    showDefaultDropdownText={false}
                  />
                }
                <button
                  onClick={async (e) => {
                    if (isSpecialFlow) {
                      showGuestPopup(() => {
                        if (isSpecialFlow) removeFromStorage('botName');
                        ResetChat();
                      }, stayOnPage);
                    } else {
                      setIsResetCalled(true);
                      await ResetChat(e);
                    }
                  }}
                  className="div32"
                >
                  <div className="div8">+</div>
                </button>
              </>
            }
          />
        </div>
      </div>
      {(isLoading || isIntroLoading || isEndStoryLoading || isFetchingOldIntro)&& <div className="loader-load-spinner">
        <div className="div67">
          <BiLoader className="loader-rotate-loader loader-icon" />
          {isPdfDownloading&& 
            <div className="div68">
              <label className="form-label label1">{t('downloadLoader')}</label>
            </div>
          }
          {isEndStoryLoading&& 
            <div className="div69 text-center">
              <h2 className="form-label label1 font-bold text-lg sm:text-2xl text-center">
                {
                  (storageFlow &&
                    [sessionFlowName.ListeningActivity].includes(storageFlow)
                  )
                    ? t('feedbackLoaderHeading')
                  :
                  (storageFlow && 
                    [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(storageFlow)
                  )?
                    t('reportLoaderHeading') : 
                  (storageFlow && 
                    [sessionFlowName.GuestMiStory].includes(storageFlow)
                  )?
                    t('storyGuestLoaderHeading') : t('storyLoaderHeading')
                }
              </h2>
              <label className="form-label label1 text-center">
                {(storageFlow && 
                    [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.LoginDiscussion].includes(storageFlow)
                  )?
                    t('reportLoader') : t('storyLoader')
                }
              </label>
            </div>
          }
        </div>
      </div> }
     {storyData && isModalOpen && (() => {
        const flow = storageFlow;
        const accessToken = accessToken;
        return [sessionFlowName.GuestMiStory, sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity].includes(flow) && accessToken
          ? defaultEditorClick(
              storyData?.title,
              firstName,
              storyData?.location
            )
          : handleEditClick();
      })()}
      <div className={`${accessToken ? 'div72' : isOpen? 'div71': ''}`}>
      {(storageFlow && [sessionFlowName.Reflection].includes(storageFlow)) && 
        <>
            <button
              onClick={(e) => {
                if (accessToken){
                  clearFromStorage()
                  navigate(-1)
                }
              }}
              className="button-13"
            >
              <div
              >
                {t('doLater')}
              </div>
            </button>
          </>
        }
        <HiddenRecorder />
        <div
          className={`${accessToken? 'div33-a': 'div33'} div9`}
        >
          {(!showHomepage)&&
            <ul className="div34">
              {chatHistory?.map((chat, i) => (
                <li
                  key={i}
                  className={`div34 div35 ${
                    chat?.source === "user" ? "label1" : "label1"
                  }`}
                >
                  <div
                    className={`div36 ${chat?.source === "user" && "div37"}`}
                  >
                    <ChatMessage
                      botNameToDisplay={botNameToDisplay}
                      userType={chat?.source}
                      message={`${chat?.msg}`}
                      name={t("userName")}
                      recording={chat?.recording}
                      hasAppendix={chat?.recording}
                      appendixURL={chat?.appendixURL}
                      isTalking={
                        chat.source === "bot" &&
                        !isStreamingComplete &&
                        i === chatHistory.length - 1
                      }
                      handleOnStopSpeaking={() => handleOnStopSpeaking()}
                      handleOnSpeaking={() => {
                        handleOnSpeaking(chat?.msg, chat?.updated_at);
                      }}
                      isAnyPlaying={!!hasOverRideId || isTalking}
                      isPlaying={hasOverRideId === chat?.updated_at}
                      isStreamingComplete={isStreamingComplete}
                      setNotMute={setNotMute}
                      chatId={chat?.updated_at}
                    />
                  </div>
                  {!hasStartedListening &&
                  chatHistory[chatHistory?.length - 1].source === "user" &&
                  i === chatHistory?.length - 1 ? (
                    <div className="div57">
                      <div className="div58">
                        <div>{t("replyMsg")}</div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </li>
              ))}
            </ul>
          }
          {showHomepage && (
            <>
              {(storageFlow) && (() => {
                const isListening = [sessionFlowName.ListeningActivity].includes(storageFlow);
                const prefix = isListening ? 'la_' : '';

                  return (
                    <>
                      <div className="div10">
                        <h3 className="h3-1">
                          {t(`${prefix}homepageHeading`)}
                          <br />
                          {t(`${prefix}homepageHeading1`)}
                        </h3>
                      </div>
                      <ul className="div11">
                        <li>{t(`${prefix}homepageList`)}</li>
                        <li>{t(`${prefix}homepageList1`)}</li>
                        <li>{t(`${prefix}homepageList2`)}</li>
                      </ul>
                    </>
                  );
                })()}

              {chatHistory?.length > 0 && (
                <div className="div26">
                  <div className="div36 div12">
                    <ChatMessage
                      botNameToDisplay={botNameToDisplay}
                      userType={chatHistory[0]?.source}
                      message={`${chatHistory[0]?.msg}`}
                      name={t("userName")}
                      recording={chatHistory[0]?.recording}
                      hasAppendix={chatHistory[0]?.recording}
                      appendixURL={chatHistory[0]?.appendixURL}
                      isTalking={false}
                      handleOnStopSpeaking={() => handleOnStopSpeaking()}
                      handleOnSpeaking={() => {
                        handleOnSpeaking(
                          chatHistory[0]?.msg,
                          chatHistory[0]?.updated_at
                        );
                      }}
                      isAnyPlaying={!!hasOverRideId || isTalking}
                      isPlaying={hasOverRideId === chatHistory[0]?.updated_at}
                      isStreamingComplete={isStreamingComplete}
                      setNotMute={setNotMute}
                      chatId={chatHistory[0]?.updated_at}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {(isStreamingComplete && showFileInput && !showHomepage && !isEndStoryLoading &&
            !isLoading && !isPdfDownloading && storyData?.id !== '' && !(
              [sessionFlowName.GuestMiStory].includes(storageFlow) && accessToken
            )) && (
            <>
              {!([sessionFlowName.ListeningActivity].includes(storageFlow))&&
                <div className="div13" >
                  <ChatMessage 
                    botNameToDisplay={botNameToDisplay}
                    userType="bot"
                    message={
                      (() => {
                        const flow = storageFlow;
                        return flow && [sessionFlowName.GuestMiStory].includes(flow)
                          ? t('evidenceStory')
                          : t('evidence');
                      })()
                    }
                    isTalking={false}
                    handleOnStopSpeaking={() => handleOnStopSpeaking()}
                    handleOnSpeaking={() =>{
                      const flow = storageFlow;
                      const message_to_use = flow && [sessionFlowName.GuestMiStory].includes(flow)
                        ? t('evidenceStory')
                        : t('evidence');
                      handleOnSpeaking(message_to_use, "upload-img-id",
                        {msg: message_to_use, updated_at: "upload-img-id", source:"bot"}
                      )}
                    }
                    isAnyPlaying={!!hasOverRideId || isTalking}
                    isPlaying={hasOverRideId === "upload-img-id"}
                    isStreamingComplete={isStreamingComplete}
                    setNotMute={setNotMute}
                    chatId={"upload-img-id"}
                    isStaticMessage={true}
                  />
                  <div className="div14">
                    <label className="clickable-label" htmlFor="file-upload">
                      <GrGallery className="icon-1" />
                      <span className="div16">
                        {t('upload')}
                      </span>
                      <input 
                        id="file-upload"
                        type="file" 
                        accept="image/jpeg, image/png, image/svg+xml, image/webp, image/heif, image/heic" 
                        // multiple
                        onChange={(e) => {
                          setIsLoading(true);
                          handleMultipleUploads(e, storyData)
                        }}
                        onClick={(e) => {
                          if (files?.length >= 10) {
                            setFileErrorText(fileExceedText);
                          } else {
                            setFileErrorText('');
                          }
                        }}
                        disabled={isLoading || isImageUploading || (fileErrorText !== '' && fileErrorText !== fileSizeText && fileErrorText === fileExceedText)}
                        className="div17"
                      />
                    </label>
                  </div>
                  
                  <div className="div18">
                        <p className="li-message">
                          {t('photosLimitMsg')}
                        </p>
                      </div>
                  <>
                    {isImageUploading && (  
                      <div className="div18">
                        <p className="li-3">
                          {t('uploadLoadMsg')}
                        </p>
                      </div>
                    )}
                  </>
                  {files?.length > 0 ? (
                    <div className="div18">
                      <h4 className="h4-1">{t('uploadedFiles')}:</h4>
                      <ul>
                        {fileErrorText && (
                          <li className="li-1">
                            {fileErrorText}
                          </li>
                        )}
                        {files.map((file, index) => (
                          <li key={index} className="li-2">
                            {file.name.slice(0, 20)}
                            {file.name.length > 20 && '...'} 
                            <button 
                              className="button-1" 
                              onClick={() => partialUpdateMedia(file?.id, false, setIsLoading)}
                            >
                              <RxCross2 />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ):
                  (<div className="div18">
                      <ul>
                        {fileErrorText && (
                          <li className="li-1">
                            {fileErrorText}
                          </li>
                        )}
                      </ul>
                    </div>)
                  }

                </div>
              }

              <div className="div19">
                <ChatMessage 
                  botNameToDisplay={botNameToDisplay}
                  userType="bot"
                  message={
                    (storageFlow && 
                      [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(storageFlow)
                    )?
                    t('reportText') : (storageFlow && 
                      [sessionFlowName.ListeningActivity].includes(storageFlow)
                    ) ? t('reportFeedbackText'): t('storyText')
                  }
                  isTalking={false}
                  handleOnStopSpeaking={() => handleOnStopSpeaking()}
                  handleOnSpeaking={(message, updatedAt, staticMessage) =>{
                    const message_to_use = (storageFlow && 
                    [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(storageFlow)
                  )?
                  t('reportText') : (storageFlow && !accessToken) ? t('reportFeedbackText'): t('storyText')
                    handleOnSpeaking(message_to_use, "download-story-id",
                      {msg: message_to_use, updated_at: "download-story-id", source:"bot"}
                    )}
                  }
                  isAnyPlaying={!!hasOverRideId || isTalking}
                  isPlaying={hasOverRideId === "download-story-id"}
                  isStreamingComplete={isStreamingComplete}
                  setNotMute={setNotMute}
                  chatId={"download-story-id"}
                  isStaticMessage={true}
                />
                {(!projectId) && <div className="div20">
                  <button
                    className="clickable-button"
                    onClick={()=>{
                      if (sessionId) {
                        pdfDownloadSidebar(sessionId);
                      }
                    }}
                    disabled={isLoading || isPdfDownloading}
                  >
                    <div className="download-story-div">
                      <FiDownload className="icon-1" />
                      <span className="div16" ref={endPageToScrollRef}>
                        {(storageFlow && !accessToken) ?
                          t('downloadReportText') : t('downloadStoryText')
                        }
                      </span>
                    </div>
                  </button>

                      {triggerDownload &&
                        isPdfDownloading &&
                        !isLoading &&
                        downloadPdf()}
                    </div>
                  }
                  <div className="div20">
                    <button
                      className="clickable-button"
                      onClick={openModal}
                      disabled={isLoading || isPdfDownloading}
                    >
                      <div className="download-story-div">
                        <MdEdit className="icon-1" />
                        <span className="div16" ref={endPageToScrollRef}>
                          {(storageFlow && !accessToken) ?
                            t('editReportText') : t('editStoryText')
                          }
                        </span>
                      </div>
                    </button>
                  </div>
                  {projectId && (
                    <div className="div20">
                      <button
                        className="clickable-button"
                        onClick={async () => {
                          if (projectId) {
                            setIsLoading(true);
                            await updateReflectionStatusApi(projectId);
                          } else {
                            window.location.reload();
                          }
                        }}
                        disabled={isLoading || isPdfDownloading}
                      >
                        <div className="download-story-div">
                          <AiOutlineEye className="icon-1" />
                          <span className="div16" ref={endPageToScrollRef}>
                            {t("viewStoryText")}
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          {llmError && llmError !== "" && (
            <>
                <p className="error-para">{llmError}</p>
                <div className="div20">
                  <button
                    className="clickable-button"
                    onClick={async ()=>{
                        setIsLoading(true);
                        setIsEndStoryLoading(true);
                        await callEndStory(true);
                    }}
                    disabled={isLoading || isPdfDownloading}
                  >
                    <div className="download-story-div">
                      <TbReload className="icon-1" />
                      <span className="div16" ref={endPageToScrollRef}>
                      {(storageFlow && !accessToken) ?
                          t('reDownloadReportText') : t('reDownloadStoryText')
                      }
                      </span>
                    </div>
                  </button>

                {triggerDownload &&
                  isPdfDownloading &&
                  !isLoading &&
                  downloadPdf()}
              </div>
            </>
          )}
          <div id="last-chat-boundary" className="div38" />
        </div>
        <Notification />

        {(!showFileInput || showFileInput === null) &&
          !isLoading &&
          !isEndStoryLoading &&
          (llmError === "" || !llmError) &&
          Array.isArray(chatHistory) &&
          chatHistory.some((item) => item && Object.keys(item).length > 0) && (
            <form
              className="div39 form-1 sm:p-[10px_35px] p-[10px_25px]"
              onSubmit={(event) => {
                if (!hasStartedListening && !isFetchingData) {
                  handleSendMessage(event);
                }
              }}
              autoComplete="off"
            >
              <div className="textarea-wrapper relative">
                <textarea
                  id="textBoxID"
                  className={`input-2 input-1 ${
                    isFetchingData ? "min-h-[68px] sm:min-h-0 py-0" : ""
                  }`}
                  style={{ alignContent: isFetchingData ? "normal" : "center" }}
                  onChange={handleOnInputText}
                  placeholder={
                    hasStartedRecording
                      ? t("placeholder1")
                      : isFetchingData
                      ? t("placeholder2")
                      : t("placeholder3")
                  }
                  name="message-box"
                  value={textMessage}
                  autoFocus={false}
                  disabled={hasStartedRecording || isFetchingData}
                  ref={textAreaRef}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    const maxHeight = 150;
                    if (e.target.scrollHeight > maxHeight) {
                      e.target.style.height = `${maxHeight}px`;
                      e.target.style.overflowY = "scroll";
                    } else {
                      e.target.style.height = `${e.target.scrollHeight}px`;
                      e.target.style.overflowY = "hidden";
                    }
                  }}
                  onFocus={() => {
                    setTimeout(() => {
                      handleScrollToView();
                      if (textAreaRef.current) {
                        textAreaRef.current.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }
                    }, 300);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (e.shiftKey) {
                        e.preventDefault();
                        e.target.form.requestSubmit();
                        setTimeout(() => {
                          e.target.value = "";
                        }, 0);
                      } else {
                      }
                    }
                  }}
                />
                {hasStartedRecording && (
                  <div className="absolute bottom-3 right-3 flex items-center space-x-1 text-red-600 text-sm font-medium pointer-events-none">
                    <FaCircle className="text-red-500 animate-pulse text-xs" />
                    <span>{formatTime(seconds)}</span>
                  </div>
                )}
              </div>
              {isTyping && !hasStartedListening && !isFetchingData ? (
                <div className="button-container">
                  <button
                    type="submit"
                    disabled={hasStartedRecording || isFetchingData}
                    className="button-6 sm:ml-[1.3rem] ml-[0.8rem]"
                  >
                    <MdSend />
                  </button>
                </div>
              ) : (
                <div
                  className={`audio-recorder ${
                    isFetchingData ? "button-container" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={
                      hasStartedRecording ? stopRecording : startRecording
                    }
                    disabled={isFetchingData}
                    className={`button-7 sm:ml-[1.3rem] ml-[0.8rem] ${
                      hasStartedRecording ? "button-8" : "button-9"
                    }`}
                  >
                    {hasStartedRecording ? (
                      <FaRegStopCircle />
                    ) : (
                      <FaMicrophone />
                    )}
                  </button>
                </div>
              )}
            </form>
          )}
      </div>
    </>
  );
};

export default ShikshalokamVoiceBasedChat;

function ChatMessage({
  userType,
  message,
  name,
  recording,
  handleOnSpeaking,
  handleOnStopSpeaking,
  isPlaying,
  botNameToDisplay,
  isStreamingComplete,
  setNotMute,
  chat,
  staticMessage,
  chatId,
}) {
  let sanitizedContent = DOMPurify.sanitize(message);
  return (
    <div className="div41">
      {userType === "bot" && (
        <div className="div42">
          <div className={`${userType === "bot" ? "div43" : "div44"} div45`}>
            <MdAccountCircle />
          </div>
          <div className="div46">
            {userType === "bot" ? (
              isPlaying ? (
                <button
                  className={`button-10 button-3`}
                  onClick={handleOnStopSpeaking}
                  disabled={!isStreamingComplete}
                >
                  <HiMiniSpeakerWave />
                </button>
              ) : (
                <button
                  className={`button-11 button-3`}
                  onClick={() => {
                    setNotMute(false);
                    handleOnSpeaking(
                      message,
                      chat?.updated_at,
                      staticMessage,
                      true
                    );
                  }}
                  disabled={!isStreamingComplete}
                >
                  <HiMiniSpeakerXMark />
                </button>
              )
            ) : null}
          </div>
        </div>
      )}
      <div className={`${userType === "user" ? "div47" : "div48"}`}>
        <div className={`div36 ${userType === "user" && "div37"}`}>
          {userType === "user" && (
            <div className={`div49`}>
              <MdAccountCircle />
            </div>
          )}
          {userType === "bot" ? botNameToDisplay : name}
        </div>
        {!!message && !!recording && (
          <div className={` ${userType === "bot" ? "div53" : "div54"} div50`}>
            <WaveSurferPlayer
              url={recording?.result}
              {...default_wave_surfer_config}
            />
          </div>
        )}
        <div
          className={` ${
            userType === "bot" ? "div53" : "div54"
          } div52 custom-voice-chat-chats`}
          id={chatId}
        >
          <ReactMarkdown
            children={sanitizedContent}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            className="prose max-w-none"
          />
        </div>
      </div>
    </div>
  );
}

const uploadImage = (formData, setError, navigate, setIsLoading, setFiles) => {
  const accessToken = useUserDataLocalStore.getState().getAccessToken();
  return new Promise((resolve, reject) => {
    try {
      createStoryMedia({
        setter: (uploadedFile) => {
          setFiles((prevFiles) => [...prevFiles, uploadedFile]);
        },
        errorHandler: (err) => {
          if (accessToken){
            clearFromStorage();
            navigate(-1);
          }
          setError(err);
          setIsLoading(false);
          reject(err);
        },
        data: formData,
        loader: setIsLoading,
        token: accessToken,
      });
    } catch (error) {
      console.error({ error });
      if (accessToken){
        clearFromStorage()
        navigate(-1)

      }
      setIsLoading(false);
      reject(error);
    }
  });
};

export const partialUpdateMedia = (partialUpdateId, include_in_story=false, setIsLoading, setFiles) => {
  try {
    const formData = new FormData();
    const accessToken = useUserDataLocalStore.getState().getAccessToken();
    const sessionId = getStorageSlice(STORE_NAME_CONSTANTS.CHAT_DATA).getState().getSessionId();
    const storageFlow = getStorageSlice(STORE_NAME_CONSTANTS.CHAT_DATA).getState().getFlow();

    formData.append('include_in_story', include_in_story);
    formData.append('flow',storageFlow);
    formData.append('access_token', accessToken);
    formData.append('session', sessionId);

    createAuthRequest({
      setter: () => {
        window.location.reload();
      },
      loader: setIsLoading,
      data: formData,
      token: accessToken,
      method: 'PATCH',
      url: `/api/storymedia/${partialUpdateId}/`,
    });
  } catch (error) {
    console.error({
      error,
    });
  }
};
