/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MdAccountCircle,
  MdEdit,
  MdSend,
} from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import getConfiguration, { bot_routes, bot_websocket } from "../../configure";
import { useLocalStorage, useSessionStorage } from "react-use";
import useVoiceRecord, { default_wave_surfer_config } from "../interview-text-voice/useVoiceRecord";
import WaveSurferPlayer from "../interview-text-voice/voice-player";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CustomFormData from "../../components/Form/FormData";
import { useUserStore } from "../../context/user";
import { createMessage } from "../interview-voice";
import axiosInstance from "../../utils/axios";
import Cookies from "universal-cookie";
import DOMPurify from "dompurify";
import rehypeRaw from 'rehype-raw';
import InfiniteScroll from 'react-infinite-scroll-component';
import { BiLoader } from "react-icons/bi";
import { AiOutlineEye } from "react-icons/ai";
import { getSessionDetails } from "../../services/api.service";
import Sidebar from "./shikshaChatSidebar";
import MainHeader from "./shikshaChatHeader";
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2";
import { createAuthRequest, createStoryMedia, getStoryAllMedia, partialUpdateStoryById } from "../story/api.service";
import { GrGallery } from "react-icons/gr";
import { FiDownload } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import EditorJS from "@editorjs/editorjs";
import SimpleImage from "@editorjs/simple-image";
import Header from "@editorjs/header";
import Paragraph from '@editorjs/paragraph';
import List from "@editorjs/list";
import PdfDownloader from "../story/upload-content/pdfDownloader";
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa";
import "../../style.css"
import "./shikshaChatStyle.css"
import Swal from 'sweetalert2';
import { PrimaryButton } from "../../components/Buttons";
import { IoClose } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";
import ROUTES from "../../url";
import PrivacyPolicyPage from "../../components/TnC/privacyPolicy";
import { useTranslation } from "react-i18next";
import UploadImages from "./upload-images";
import { TbReload } from "react-icons/tb";
import { IoMdArrowRoundBack } from "react-icons/io";
import { setLanguage } from "../../i18n";
import Notification, { showNotification } from "../../components/ToastMessage/TotastMessage";
import { toast } from "react-toastify";
import { languageList, sessionFlowName } from "./enum";
import PrivacyPolicyPopup from "../../components/TnC/privacyPolicyPopup";
import { FaCircle } from "react-icons/fa6";


const cookies = new Cookies();
const company_bot_list_url = `/api/companybot/`;

const current_company_config = getConfiguration();

const wss_protocol = window.location.protocol === "https:" ? "wss://" : "ws://";

function useCustomMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      const isMatching = media.matches;
      
      setMatches(isMatching);

      const listener = () => setMatches(isMatching);
      media.addEventListener('change', listener);

      return () => media.removeEventListener('change', listener);
    }
  }, [query]);
  

  return matches;
}


const ShikshalokamVoiceBasedChat = ({ type="", variant="" }) => {
  const [profileToUse, setProfileToUse] = useState(getFromStorage('profileid', true) || null);
  const audioRef = useRef();
  const textAreaRef = useRef(null);
  const lastBotMessageIndex = useRef(-1);
  let access_token =  getFromStorage('accToken')
  let globalSessionID =  getFromStorage('sessionid', true)

  const isInitialLoadRef = useRef(true);
  const [storyMediaIdArray, ] = useState(null);

  const [searchParams] = useSearchParams();
  
  const [localChatHistory, setLocalChatHistory, removeLocalChatHistory] = useSmartChatStorage();
  const [chatHistory, setChatHistory] = useState(
    !!localChatHistory?.length ? localChatHistory : []
  );
  const [chatSocket, setChatSocket] = useState(null);
  const [textMessage, setTextMessage] = useState("");
  const [asrAudio, setAsrAudio] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [reconText, setReconText] = useState("");
  const [isStreamingComplete, setIsStreamingComplete] = useState(true);
  const [audioCache, setAudioCache] = useState({});
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const editorContainerRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editorCopyChanges, setEditorCopyChanges] = useState(null);
  const [hasStartedListening, setHasStartedListening] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [botNameToDisplay, setBotNameToDisplay] = useState('Bot')
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcript, ] = useState('');
  const [sentences, setSentences] = useState([]);
  const [isNextAllowed, setIsNextAllowed] = useState(true);
  const [isMute, setNotMute] = useState(true);
  const [isTalking, setTalking] = useState(0);
  const [appendix, setAppendix] = useState([]);
  const [hasOverRideId, setHasOverRideId] = useState(null);
  const [shouldFetchIntro, setShouldFetchIntro] = useState(false);
  const [hasFetchIntro, setHasFetchIntro] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(() => {
    const storedVisibility = getFromStorage('isChatVisible', false)
    return storedVisibility !== null ? JSON.parse(storedVisibility) : false;
  });
  const [chatTitle, setChatTitle] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [langProgress, setLangProgress] = useState(getFromStorage('lang_progress', false) || null);
  const [isIntroLoading, setIsIntroLoading] = useState(false);
  const [isFetchingOldIntro, setIsFetchingOldIntro] = useState(false);
  const [sessionTitleDetail, setSessionTitleDetail] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isResetCalled, setIsResetCalled] = useState(false);
  const introMessageRef = useRef(null);
  const [strandStep, setStrandStep] = useState(null);
  const [isEndStoryLoading, setIsEndStoryLoading] = useState(false);
  const [storyData, setStoryData] = useState(null);
  const [noStoryFound, setNoStoryFound] = useState(false);
  const [triggerDownload, setTriggerDownload] = useState(false);
  const [showHomepage, setShowHomepage] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showFileInput, setShowFileInput] = useState(null);
  const [shouldSendMessage, ] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stateMachineLength, setStateMachineLength] = useState(getFromStorage('statemachine_length', false) || 0);
  const isGuestFlow = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false));
  const [acceptedTnc, setAcceptedTnC] = useState(getFromStorage('has_accepted_tnc', false) || 'ONGOING');
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState(null);


  const { t } = useTranslation();

  const selectedLabel = {
    types: [
      {label:t('guidedReflection'), value:'normal'}, 
      {label:t('oneStepReflection'), value:'oneshot'}, 
    ]
 }; 

 const [selectedType, setSelectedType] = useState(getFromStorage('selected_type', true) || selectedLabel.types[0].value);

  const endPageToScrollRef = useRef(null);

  const [error, setError] = useState({
    response: "",
    status: 200,
  });
  const [llmError, setLlmError] = useState(getFromStorage('llmError', false) || "");
  const [files, setFiles] = useState([]);
  const [fileErrorText, setFileErrorText] = useState('');

  const fileExceedText = t('fileExceedText');
  const fileSizeText = t('fileSizeText');
  const completedStatusText = t('completedStatusText');
  const inProgressStatusText = t('inProgressStatusText');

  let isMobile = useCustomMediaQuery('(max-width: 500px)');
  let chatToAddLength = isMobile? 10: 10;
  const [visibleItemCount, setVisibleItemCount] = useState(chatToAddLength);
  let isNewChatOpen = getFromStorage('isNewChatOpen', true);

  const projectId = searchParams.get("projectId");
  const isIntroPlayed = useRef(false);
  const [languageToUse, setLanguageToUse] = useState(() => {
    const savedLang =  getFromStorage('route', false);
    return savedLang ? JSON.parse(savedLang) : null;
  });

  let params = new URL(document.location).searchParams;
  const code = params.get("code");
  const {
    recordings,
    HiddenRecorder,
  } = useVoiceRecord();

  const isShikshalokamPublicType = true;
 
  const shouldShowChatHistoryFeature = true;
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const navigate = useNavigate();

  const openModal = () => {
    
    setIsModalOpen(true);
  };

  useEffect(()=>{
    if(projectId){
      setInStorage('flow', sessionFlowName.Reflection, sessionFlowName.Reflection);
      const tnc_status = getFromStorage('has_accepted_tnc', false);
      if (!tnc_status) {
        setInStorage('has_accepted_tnc', "ONGOING", sessionFlowName.Reflection);
        setAcceptedTnC("ONGOING");
      }
      setInStorage('isNewChatOpen', JSON.stringify(true), sessionFlowName.Reflection);
      
      isNewChatOpen = true;
      
      
    } else if(!getFromStorage('flow', false)){
      // navigate(ROUTES.SHIKSHALOKAM_HOME_PAGE);
      navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN);

    }
  }, [projectId])

  useEffect(() => {
    if (isLoading || isEndStoryLoading || isModalOpen || acceptedTnc==="ONGOING") {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isLoading, isEndStoryLoading, isModalOpen]);

  useEffect(() => {
    async function createUserProfile() {
      try {
        setIsLoading(true);
        const headers = {
          "Content-Type": "application/json",
        };
        let body = {
          access_token: access_token,
        };

        const response = await axiosInstance.post(`/api/create-profile/`, body, { headers });
        
        if (response && response?.status === 200) {
          const data  = response?.data.profile_details;
          const preferredLanguage = getFromStorage('preferred_language', true) || '{}';
          const language = preferredLanguage.value || "en";
          setInStorage('route', JSON.stringify(language));
          setLanguageToUse((language || "en"));
          setLanguage((language || "en"))
          setInStorage('profileid', data?.id);
          setProfileToUse(data?.id)
          let sessionid = getFromStorage('sessionid', false);
          if (!sessionid) {
            let session = await getSessionDetails();
            setInStorage('sessionid', JSON.stringify(session.sessionid));
            globalSessionID = session?.sessionid;
          }
          setInStorage('isNewChatOpen', JSON.stringify(true));
          setInStorage('first_name', JSON.stringify(data?.first_name));
          setInStorage('company', JSON.stringify(data?.company?.slug));
          setInStorage('state', JSON.stringify(data?.profile_address[0]?.state));

        } else {
          navigate(ROUTES.EXIT_ROUTE)
          clearFromStorage()
          navigate(-1)
        }
      } catch (error) {
        console.error(error?.response?.data || error);
          clearFromStorage()
          navigate(-1)

      } finally {
      }
    }
    
    
    if (!profileToUse && access_token) {
      
      createUserProfile();
      setShouldFetchIntro(true);
      setIsStreamingComplete(true);
    }
  }, [access_token, profileToUse]);


  useEffect(()=>{
    
    async function fetchChatSession() {
      const response = await axiosInstance({
        url: `/api/chatsession?project_id=${projectId}`,
      })
      
      if (response?.status === 200 && response?.data?.results[0]?.session) {
        setInStorage('sessionid', JSON.stringify(response?.data?.results[0]?.session));

        globalSessionID = response?.data?.results[0]?.session

        setInStorage('isOldChatOpen', JSON.stringify(true));
        setInStorage('isNewChatOpen', JSON.stringify(false));

      }
    }

    if(projectId) {
      fetchChatSession()
    }
  
  }, [projectId])

  useEffect(()=>{
    setVisibleItemCount(chatToAddLength)
  }, [chatToAddLength])

  useEffect(()=>{
   
  }, [visibleItemCount])


  useEffect(() =>{
    if(isFetchingOldIntro){
      let temp_intro_message = getFromStorage('intro_message', false);
      introMessageRef.current = temp_intro_message;
    }
  },[isFetchingOldIntro])

  useEffect(()=>{
    
  }, [error])

  useEffect(()=>{
    const textErrorTime = setTimeout(()=>{
      setFileErrorText("")
    }, 5000);

    return ()=>{
      clearTimeout(textErrorTime);
    }
  },[fileErrorText])

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto"; 
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; 
    }
  }, [textMessage]);

  useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setSeconds(0);
    }

    return () => clearInterval(intervalId);
  }, [hasStartedRecording]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  async function callEndStory(hasClickedOnRegenerate=false) {
    let endStoryResponse;
    if ((isStreamingComplete && strandStep >= stateMachineLength) || hasClickedOnRegenerate) {
      try {
        setIsLoading(true);
        setIsEndStoryLoading(true);

        const sessionid =  getFromStorage('sessionid', true);
        const end_story_api_url = `/api/end-story/`;
        
        let sourceLanguage = getFromStorage('preferred_language', true)?.value || languageToUse;

        endStoryResponse = await axiosInstance({
          url: end_story_api_url,
          data: {
            session: sessionid,
            profile_id: profileToUse,
            stage: 'COMPLETED',
            access_token: access_token,
            flow: getFromStorage('flow', false),
            language: sourceLanguage
          },
          method: "POST",
        });

        if (endStoryResponse?.data?.id) {
          setFiles([]);
          setShowFileInput(true);
          removeFromStorage('llmError');
          window.location.reload();
        } else {
          setInStorage('llmError', endStoryResponse?.data?.error_message);
          setLlmError(endStoryResponse?.data?.error_message)
          setIsEndStoryLoading(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error completing the story:', error);
        setInStorage('llmError', error?.response?.data?.error_message);
        setLlmError(error?.response?.data?.error_message)
        setIsEndStoryLoading(false);
        setIsLoading(false);
      } finally {
        setNoStoryFound(false);
      }
    }
  }

    useEffect(()=>{
    if(isShikshalokamPublicType){
      setShouldFetchIntro(true);
      setIsStreamingComplete(true);
    }
  }, [isShikshalokamPublicType])

  useEffect(() => {
    if(shouldShowChatHistoryFeature) {
      const isOldChatOpen = getFromStorage('isOldChatOpen', true);
      if(isOldChatOpen === true){
        setShouldFetchIntro(true);
        setShowHomepage(false);
      } else if(isNewChatOpen === true){
        const showStartPage = getFromStorage('showHomepage', true);
        setShowHomepage(showStartPage !== null ? showStartPage : true);
      }
    } else{
      removeLocalChatHistory();
    }
  }, [isNewChatOpen]);

  useEffect(()=>{
    const isOldChatOpen = getFromStorage('isOldChatOpen', true)
    const flow = getFromStorage('flow', false)
    if(isOldChatOpen === true && (hasFetchIntro || [sessionFlowName.LoginMiStory, sessionFlowName.LoginDiscussion].includes(flow)) && chatHistory?.length === 0 && sentences?.length === 0) {
      handleChatSessionButtonClick({key: null})
    }
  }, [isNewChatOpen, hasFetchIntro, chatHistory, sentences])


  useEffect(() => {
    if (!!editorCopyChanges && isModalOpen && storyData) {
      const flow = getFromStorage('flow', false)
      let parsed_content = [];
      try {
        if (flow && [sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(flow)) {
          const challenges = storyData?.other_params?.challenges_faced || [];
          const solutions = storyData?.other_params?.solutions_discussed || [];
    
          parsed_content = [
            {
              type: "header",
              data: {
                text: t('challengesHeader'),
                level: 2,
                customId: "challenges"
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
                text: t('solutionsHeader'),
                level: 2,
                customId: "solutions"
              },
            },
            {
              type: "list",
              data: {
                style: "unordered",
                items: solutions.length > 0 ? solutions : [""],
              },
            }
          ];
        } else {
          parsed_content = editorCopyChanges.map(item => ({
            type: item.type,
            data: {
              text: item.data.text
            }
          }));
        }

    } catch (error) {
        parsed_content = [];
        
      }
      if (!document.getElementById('editorjs')) {
        return;
      }
      const _editor = new EditorJS({
        holder: "editorjs",
        placeholder: t('editorPlaceholder'),
        autofocus: true,
        hideToolbar: true, 
        tools: {
          header: {
            class: Header,
            inlineToolbar : false
          },
          list: {
            class: List,
            inlineToolbar: false,
            config: {
              defaultStyle: 'unordered'
            },
          }
        },
        onReady: () => {
          setEditor(_editor);
          const style = document.createElement("style");
          style.innerHTML = `
            /* Hide "+" button */
            .ce-toolbar__plus, .ce-toolbar__actions { display: none !important; }
        
            /* Hide block settings (Click to Tune) */
            .ce-popover, .ce-settings, .ce-settings__button { display: none !important; }
        
            /* Hide Drag handle */
            .ce-block--selected .ce-block__drag-handle { display: none !important; }
        
            /* Hide the inline toolbar */
            .ce-inline-toolbar { display: none !important; }
        
            /* Hide block selection outline */
            .ce-block--selected { outline: none !important; }
          `;
          document.head.appendChild(style);
          setTimeout(() => {
            document.querySelectorAll('.ce-header').forEach((el) => {
              const text = el.innerText.trim().toLowerCase();
              if (text === t('challengesHeader') || text === t('solutionsHeader')) {
                el.setAttribute('contenteditable', 'false');
                el.style.pointerEvents = 'none';
                el.style.color = '#555'; 
                el.style.fontWeight = 'bold'; 
              }
            });
          }, 300);
        },
        defaultBlock: "paragraph",
        data: {
          blocks: parsed_content.length > 0 ? parsed_content : [{ type: "paragraph", data: { text: "" } }],
        },
        onChange: async (api, event) => {
          
          setIsSaving(false);
        
          const savedData = await api.saver.save();
          const imageBlocks = savedData.blocks.filter(block => block.type === 'image');
          if(!isInitialLoadRef.current ){
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
                  partialUpdateMedia(storyFile?.id)
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

  const defaultEditorClick = (title, name, location) => {
    return (
      <>
        <div className="fixed inset-0 bg-white flex items-center justify-center p-4 max-sm:px-0 z-[100]">
          
          <div
            className="bg-gray-100 rounded-lg shadow-lg w-full h-full max-w-2xl p-[60px_0_0] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {(!projectId)&&<div className="absolute top-4 left-4 z-10">
              <button
                onClick={closeModal}
                className="text-2xl text-gray-700 hover:text-black flex items-center"
              >
                <IoMdArrowRoundBack />
              </button>
            </div>}
            <div className="overflow-y-auto h-full w-full">
              <div className="px-[73px] max-sm:px-[23px]">

                <h2 className="text-lg font-semibold text-black-700">
                  {t('editorHeading')}
                </h2>

                <div className="mt-4">
                  <h3 className="text-md font-semibold">{title}</h3>
                  <p className="text-gray-600 text-sm">
                    by {name}, {location}
                  </p>
                </div>

                <div className="mt-4 bg-gray-100 rounded-md h-60 overflow-y-auto text-sm">
                  <div id="editorjs" ref={editorContainerRef} className=""></div>
                </div>
                <div className="mt-4">
                  <UploadImages 
                    storyData={storyData} access_token={access_token} projectId={projectId} 
                    files={files} setFiles={setFiles} setIsLoading={setIsLoading}
                  />
                </div>
              </div>
              <div className="w-full flex justify-center py-4 px-[40px] bg-gray-100">
                <button
                  onClick={async () => {
                    try {
                      const outputData = await editor.save();
                      await partialUpdateStoryById({
                        setter: setStoryData,
                        loader: setIsSaving,
                        data: {
                          id: storyData?.id,
                          formatted_content: outputData?.blocks,
                          access_token: getFromStorage('accToken', false),
                          session: getFromStorage('sessionid', true),
                          flow: getFromStorage('flow', false)
                        },
                        token: access_token,
                      });
                      if(projectId){
                        await updateReflectionStatus();
                      } else{
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error("Saving failed: ", error);
                      if (projectId){
                        clearFromStorage();
                        navigate(-1);
                      }
                    }
                  }}
                  disabled={isLoading || isSaving}
                  className="w-full bg-[#212121] text-white py-2 rounded-md hover:bg-black disabled:opacity-50"
                >
                  {t('EditorConfirm')}
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
      (b) => b.type === 'header' && b.data.text.trim().toLowerCase() === headerText.toLowerCase()
    );
    if (idx !== -1 && blocks[idx + 1]?.type === 'list') {
      const items = blocks[idx + 1].data.items || [];
      return items.map(item => (typeof item === 'string' ? item : item?.content || ""));
    }
    return [];
  };
  
  

  const handleEditClick = () => {
    return (
      <>
        <div
          className="voice-chat-editor-overlay"
          onClick={closeModal}
        >
          <div
            className="voice-chat-editor-content"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <button
              onClick={closeModal}
              className="editor-content-button"
            >
              <IoClose className="icon-7" />
            </button>
            <div id="container-editor">
              <div
                className="container-editor-div"
              >
                <div id="editorjs" ref={editorContainerRef} className="editor-main-div">
                </div>
              </div>
            </div>
            <div className="editor-button-div">
            <PrimaryButton
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const outputData = await editor.save();
                  const flow = getFromStorage('flow', false);

                  let updatePayload = {
                    id: storyData?.id,
                    access_token: getFromStorage('accToken', false),
                    session: getFromStorage('sessionid', true),
                    flow,
                  };

                  if (flow && [sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(flow)) {
                    const blocks = outputData?.blocks || [];
            
                    const challenges = getListAfterHeaderText(t('challengesHeader'), blocks);
                    const solutions = getListAfterHeaderText(t('solutionsHeader'), blocks);
            
                    updatePayload = {
                      ...updatePayload,
                        ...storyData?.other_params,
                        other_params: {
                          ...(storyData?.other_params || {}),
                          challenges_faced: challenges,
                          solutions_discussed: solutions,
                        },
                        formatted_content: null
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
                    token: access_token,
                  });
                } catch (error) {
                  setIsLoading(false);
                  console.error("Saving failed: ", error);
                  if (projectId){
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

  async function updateReflectionStatus(){
    try{
      const flow = getFromStorage('flow', false);

      if(flow === sessionFlowName.LoginMiStory) return;

      const response = await axiosInstance.post('api/update-project-status/', {
        access_token: getFromStorage('accToken', false),
        project_id: projectId,
        flow: getFromStorage('flow', false)
      });

      if (response?.status === 200) {
        if (projectId){
          clearFromStorage()
          navigate(-1)

        }
      }
      
      return response;
    } catch (error) {
      if (projectId){
        clearFromStorage()
        navigate(-1)

      }
    }

  }

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
    if (isResetCalled && chatSocket && chatSocket.readyState === chatSocket.OPEN) {
      chatSocket.close();
    }
    const currentFlow = getFromStorage('flow', false);
    if (currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow)) {
      removeFromStorage('route');
      removeFromStorage('intro_message');

      setSelectedLanguage("en");
      setInStorage('lang_progress', null, currentFlow);
      removeFromStorage('has_accepted_tnc');
    } else{
      setInStorage('has_accepted_tnc', true, currentFlow);
    }
    removeLocalChatHistory();
    setInStorage('isOldChatOpen', JSON.stringify(false), currentFlow);
    setInStorage('isNewChatOpen', JSON.stringify(true), currentFlow);
    removeFromStorage('llmError');

    const session = await getSessionDetails();
    setInStorage('sessionid', JSON.stringify(session.sessionid), currentFlow);
    setInStorage('isChatVisible', JSON.stringify(false), currentFlow);
    setInStorage('chatbot_clickedOn?', '', currentFlow);
    setInStorage('showHomepage', true, currentFlow);
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
    
        if (!!code) {
          url = `${wss_protocol}${window.location.host}/ws/chat/company/`;
        } else {
            const base_url = `${wss_protocol}${process.env.REACT_APP_WEBSOCKET_HOST}`
            let currentFlow = getFromStorage('flow', false);
            if (currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(currentFlow)) {
              url = `${base_url+bot_websocket.shikshalokam_chaupal}`;
            } else if (selectedType === 'normal') {
              if (currentFlow && [sessionFlowName.LoginMiStory, sessionFlowName.GuestMiStory].includes(currentFlow)) {
                url = `${base_url+bot_websocket.normal}`;
              } else {
                url = `${base_url+bot_websocket.reflection}`;
              }
            } else {
              url = `${base_url+bot_websocket.oneshot}`;
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
                updatedSentences[updatedSentences.length - 1]?.source === "bot"
              ) {
                if (message?.msg) {
                  updatedSentences[updatedSentences.length - 1].message += message?.msg;
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
        
            setChatHistory((prevChatHistory) => {
              const updatedChatHistory = [...prevChatHistory];
        
              if (
                updatedChatHistory.length > 0 &&
                updatedChatHistory[updatedChatHistory.length - 1]?.source === "bot"
              ) {
                if (message?.msg) {
                  updatedChatHistory[updatedChatHistory.length - 1].msg += message?.msg;
                }
              } else {
                updatedChatHistory.push({
                  msg: message?.msg || "",
                  source: "bot",
                  updated_at: new Date().valueOf(),
                });
              }
              return updatedChatHistory;
            });
        
            if (isShikshalokamPublicType) {
              handleScrollToView();
            }
          } else{
            setIsStreamingComplete(false)
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
            let profileid = getFromStorage('profileid', false)
            let sessionid = getFromStorage('sessionid', true)
            let route = getFromStorage('route', true)
            let currentFlow = getFromStorage('flow', false);

            if((profileid || currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow)) && sessionid){
              socket.send(JSON.stringify({
                type: 'authenticate',
                sessionid: sessionid,
                profileid: profileid,
                projectid: searchParams.get("projectId"),
                access_token: access_token,
                route: route,
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
  }, [chatSocket]);

  let reconnectAttempts = 0;
  const maxReconnectAttempts = process.env.REACT_APP_WEBSOCKET_RETRY_NUM || 3;

  function retryConnection(currentTextMessage="") {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error("Max reconnection attempts reached. Stopping.");
      try {
        let chatHistory = getFromStorage('chat-history', true) || [];
        if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].source === "user") {
          chatHistory.pop();
          setInStorage("chat-history", JSON.stringify(chatHistory));
          console.log("🗑️ Removed last user message from localStorage.");
        }
      } catch (error) {
        console.error("⚠️ Error modifying localStorage:", error);
      }
      showConfirmationPopup();
      return;
    }
    reconnectAttempts++; 

    setTimeout(() => {
      MakeSocketConnection(currentTextMessage)
      .then((newSocket) => {
        reconnectAttempts = 0;
        isReconnectInProgress = false;
        if (currentTextMessage && currentTextMessage.trim() !== "") {
          handleSendMessage(null, newSocket)
        }
      })
      .catch((error) => {
        console.error("Reconnection Failed:", error);
      });
    }, 1000);
  }

  function showGuestPopup(wantToNavigateBack, executeCustomFunction) {
    <div className="div-popup">
    {Swal.fire({
      title: t('guestPopUpChanges'),
      showCancelButton: true,
      confirmButtonText: t('confirmChanges'),
      cancelButtonText: t('denyButton'),
    }).then((result) => {
      if (result.isConfirmed) {
        if (executeCustomFunction) {
          executeCustomFunction();
        } else {
          if(wantToNavigateBack){
            stopAllAudio();
            clearFromStorage();
            setLanguage(languageList[0].value);
            setInStorage('local_route', JSON.stringify(languageList[0].value));
            navigate(ROUTES.SHIKSHALOKAM_GUEST_PAGE)
          } else{
            if(
              getFromStorage('flow', false) && 
              [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false))
            ){
              removeFromStorage('botName');
            }
            ResetChat();
          }
        }
      } else {
        if(wantToNavigateBack){
          window.history.pushState(null, "", window.location.href);
        } else{
          // window.location.reload();
        }
      }
    })}
    </div>
  }

  function showConfirmationPopup() {
    <div className="div-popup">
    {Swal.fire({
      title: t('popUpChanges'),
      showCancelButton: true,
      confirmButtonText: t('confirmChanges'),
      cancelButtonText: t('denyButton'),
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      } else {
        if (projectId){
          clearFromStorage()
          navigate(-1)
        } else {
          ResetChat();
        }
      }
    })}
    </div>
  }

  useEffect(() => {
    let shouldPlay = false;
    if (showFileInput) {
      shouldPlay = true;
    } else if ((noStoryFound || noStoryFound === null) && !isIntroLoading && !isLoading && !isEndStoryLoading) {
      const currentFlow = getFromStorage('flow', false);
      
      if (
        currentFlow &&
        [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow)
      ) {
        if(chatHistory.length > 0) {
          if(isStreamingComplete && chatHistory[chatHistory.length - 1]?.source === "bot") {
            shouldPlay = true;
          }
        } else if (langProgress === 'IN_PROGRESS') {
          shouldPlay = false;
        }else {
          shouldPlay = true;
        }
      } else if (
        chatHistory &&
        chatHistory.length > 0 &&
        chatHistory[chatHistory.length - 1]?.source === "bot"
        && !isIntroLoading && !isLoading && !isEndStoryLoading
      ) {
        shouldPlay = true;
      }
    }
    if (
      isStreamingComplete &&
      (shouldPlay) &&
      !isEndStoryLoading && !isLoading && !isPdfDownloading &&
      isMute &&
      acceptedTnc && acceptedTnc !== "ONGOING" && !isIntroLoading && !isFetchingOldIntro
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
    noStoryFound
  ]);
  

  useEffect(()=>{
    if(chatHistory?.length!== 0){
      setInStorage('isChatVisible', true);
      setIsChatVisible(true);
    }
  }, [])

  useEffect(()=>{
    setInStorage('showFileInput', showFileInput);

  }, [showFileInput])

  useEffect(()=>{
    const botName = getFromStorage('botName', false)
    const defaultBotName = getFromStorage('defaultBotName', false);
    setBotNameToDisplay(botName?.trim() ? botName : defaultBotName);

  }, [])

    async function getStoryBySession(sessionID, accessToken){
      const res = await axiosInstance({
        url: `api/get-story/?session=${sessionID}`,
      })
      
      return res?.data?.results;
    }

  function extractTextBlocks(formattedContent) {
    if(!formattedContent) return [];
    const blocks = JSON.parse(formattedContent);
    if (!blocks || blocks?.length === 0) return [];
    return blocks.filter(block => block.type === 'paragraph');
  }

  useEffect(()=>{
    if (!globalSessionID) return;

    (async () => {
      const story_data = await getStoryBySession(globalSessionID, access_token);
      
      if (story_data && story_data?.length > 0 && story_data[0]) {
        setStoryData(story_data[0]);
        const formatted_content = story_data[0].formatted_content;
        
        const textBlocks = extractTextBlocks(formatted_content);
        setEditorCopyChanges(textBlocks);
        // setIsModalOpen(true);
        setNoStoryFound(false);
        setShowFileInput(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        if(!llmError) {
          setNoStoryFound(true);
        }
      }
    })();

  }, [access_token, globalSessionID])

  useEffect(() => {
    const fetchMedia = async () => {
      if (storyData && storyData?.id !== '') {
        const story_id = storyData?.id;
        const tempMediaArr = [];
        setIsImageUploading(true);
  
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
  }, [access_token, storyData]);

  async function getCompanyDetail(){
    if (!profileToUse) return "shikshalokamstaging";
    const res = await axiosInstance({
      url: `/api/profileuser/${profileToUse}/`,
    })
    
    return res?.data?.company?.slug;
  }

  async function getTranslatedIntroMessage(storedRoute){
    let translate_api_url = `api/bot_vernacular/?language=${languageToUse}&company_bot__route=${storedRoute}`;
    try {
      const response = await axiosInstance.get(translate_api_url);
      return response?.data?.results;
    } catch (error) {
      console.error('Error fetching AI4Bharat audio:', error);
      throw error;
    }

  }

  async function getSessionInfo(){
    let currentSession = getFromStorage('sessionid', true);
    let session_url = `api/chatsession/?session=${currentSession}`;
    try {
      const response = await axiosInstance.get(session_url);
      return response?.data?.results;
    } catch (error) {
      console.error('Error fetching AI4Bharat audio:', error);
      throw error;
    }

  }

  useEffect(() => {
    if(getFromStorage('intro_message', false) && !isLoading) {
      setInStorage('lang_progress', true);
      setLangProgress(true);
    }
  }, [isLoading])

  const fetchBotInfo = async () => {
      
    setIsIntroLoading(true);
    setIsLoading(true);
    let companyName = await getCompanyDetail();
    try {
      let storedRoute = bot_routes.reflection;
      let currentFlow = getFromStorage('flow', false);
      if (currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(currentFlow)) {
        storedRoute = bot_routes.shikshalokam_chaupal;
      } else if (selectedType === 'normal') {
        if (currentFlow && [sessionFlowName.LoginMiStory, sessionFlowName.GuestMiStory].includes(currentFlow)) {
          storedRoute=bot_routes.normal
        } 
      } else {
        storedRoute=bot_routes.oneshot
      }
      const response = await axiosInstance({
        url: company_bot_list_url,
        params: {
          company__slug: companyName,
          target_language: languageToUse,
          route: storedRoute
        },
      });
      const bots = response?.data?.results;

      if (bots) {
        let selectedBot = bots.find(bot => bot.route === storedRoute);
        if (!selectedBot) {
          selectedBot = bots[0] || { route: '/' };
        }
        setInStorage('statemachine_length', selectedBot?.statemachine_length);
        setStateMachineLength(selectedBot?.statemachine_length)
      }
     
      // if (!shouldFetchIntro || chatHistory?.length) return;
      if (languageToUse && bots && bots.length > 0) {
        let latestBot;
        for (const bot of bots) {
          if(isShikshalokamPublicType){
            if (bot.route === storedRoute){
              latestBot = bot
            }
          }
          else if (!latestBot || new Date(bot.created_at) > new Date(latestBot.created_at)) {
            latestBot = bot;
          }
        }
        if (!latestBot) {
          handleFirstMessage('');
          return;
        }
        
        let firstName = getFromStorage('first_name', false);
        if (firstName && firstName !== 'null' && firstName !== '') {
          firstName = JSON.parse(firstName);
        } else {
          firstName = '';
        }
        let data = await getTranslatedIntroMessage(storedRoute)
        let message = data[0]?.introductory_message;
        if (data && data[0]) {
          if(profileToUse && firstName && firstName !== 'null' && firstName !== '') {
            message = data[0]?.introductory_message;
          } else {
            message = data[0]?.alt_introductory_message;
          }
        }
        const botName = data[0]?.name || 'Bot';
        setInStorage('botName', botName);
        setInStorage('defaultBotName', data[0]?.default_name);

        setBotNameToDisplay(botName);
        const isOldChatOpen = getFromStorage('isOldChatOpen', true)
        if(isOldChatOpen) {
          let sessionInfo = await getSessionInfo();
          if(sessionInfo && sessionInfo.length>0) {
            setStrandStep(sessionInfo[0]?.current_step)
            if(sessionInfo[0]?.session_type) {
              setInStorage('selected_type', JSON.stringify(sessionInfo[0]?.session_type));
              setSelectedType(sessionInfo[0]?.session_type)
            }
          }
        }
        if (message && firstName) {
          const words = message.split(' ');
          words.splice(1, 0, firstName);
          message = words.join(' ');
        }
        if (
          message && !!message?.trim() && (chatHistory[chatHistory?.length - 1]?.msg !== message) && 
          !sentences.some((msg) => msg.message === message)
        ) {
          const isGuestFlow = currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow);
          setInStorage('intro_message', message);
          setSentences((prev) => [
            ...prev,
            {
              message: message,
              isNarrated: isGuestFlow? false: false,
                id: 'intro_msg_id',
              // id: new Date().valueOf(),
            },
          ]);
          if(isGuestFlow) {
            setHasOverRideId('intro_msg_id');
            setNotMute(false);
            setIsNextAllowed(true)
          }

        }
      }

    } catch (error) {
      console.error({ error });
      setIsLoading(false);
    } finally {
      setHasFetchIntro(true);
      setShouldFetchIntro(false);
      setIsLoading(false);
    }
  };

  useEffect(()=>{
    console.log("hasOverideId: ", hasOverRideId)
  }, [hasOverRideId])

  useEffect(() => {
    const current_flow = getFromStorage('flow', false);
    if (chatHistory?.length === 0 && shouldFetchIntro && isNewChatOpen && 
        (profileToUse || [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(current_flow))
      ) {
      fetchBotInfo().then(() => {
        setIsIntroLoading(false);
        if(!current_flow || current_flow !== sessionFlowName.LoginMiStory) {
          const currentSession = getFromStorage('sessionid', true);
          handleCompanyChatCall(currentSession);
        }
      });
    }
    
    return () => {};
  }, [access_token, shouldFetchIntro, profileToUse, languageToUse, isNewChatOpen]);

  useEffect(() => {
    
    setLocalChatHistory(chatHistory);
    lastBotMessageIndex.current = chatHistory?.length - 1;
    if (!showFileInput) handleScrollToView();
  }, [chatHistory]);

  useEffect(() => {
    if(!isLoading && showFileInput && acceptedTnc!=="ONGOING"){
      endPageToScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLoading, showFileInput, acceptedTnc]);

  useEffect(() => {
    if (
      !!recordings?.length &&
      chatHistory[chatHistory?.length - 1]?.source !== "bot"
    ) {
        
        setChatHistory((prev) => {
        prev[chatHistory?.length - 1] = {
          ...prev[chatHistory?.length - 1],
          recording: recordings[recordings?.length - 1],
        };
        return prev;
      });
    }
    return () => {};
  }, [recordings, chatHistory]);

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

  useEffect(() =>{
    setInStorage('showHomepage', JSON.stringify(showHomepage));
  }, [showHomepage])

  useEffect(() => {
    if(audioRef?.current){
      if(isMute){
        audioRef.current.muted = true
      }else{
        audioRef.current.muted = false
      }
    }
  }, [isMute])

  useEffect(() => {
    if (isStreamingComplete && stateMachineLength && strandStep >= stateMachineLength && noStoryFound && (!llmError || llmError==='')) {
      callEndStory();
    }
  }, [isStreamingComplete, strandStep, access_token, stateMachineLength, languageToUse, noStoryFound]);

  useEffect(()=>{
    const currentFlow = getFromStorage('flow', false);
    if(profileToUse && !projectId && !isEndStoryLoading && 
      !([sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow))
    ){
      setIsLoading(true);
      const titleTime = setTimeout(()=>{
        if(shouldShowChatHistoryFeature) showChatTitle();
      }, 4000);
  
      return ()=>{
        if (!noStoryFound) {
          setIsLoading(false);
        }
        clearTimeout(titleTime);
      }
    } else if(!isEndStoryLoading && !([sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow))) {
      setIsLoading(false);
    }
  },[profileToUse, projectId, isEndStoryLoading, noStoryFound])

  useEffect(() => {
    const currentFlow = getFromStorage('flow', false);
    const handleBack = () => {
      if((acceptedTnc || acceptedTnc==="ONGOING") && currentFlow && 
      [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow)){
        showGuestPopup(true)
      } else {
        setLanguage(languageList[0].value);
        setInStorage('local_route', JSON.stringify(languageList[0].value));
        stopAllAudio();
        // navigate(ROUTES.SHIKSHALOKAM_HOME_PAGE)
        if(projectId){
          navigate(-1);
        } else {
          navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN);
        }
      }
    };

    window.history.pushState(null, "", window.location.href);
    
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate, acceptedTnc]);

  useEffect(() => {
    setInStorage('isChatVisible', JSON.stringify(isChatVisible));

  }, [isChatVisible]);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let toastId = null; 

    const checkNetworkSpeed = () => {
      if (connection) {
        const { effectiveType, downlink } = connection;
        if (effectiveType && (effectiveType === "2g" || effectiveType === "3g") && navigator.onLine) {
          if (toastId) {
            toast.dismiss(toastId);
          }
          const message = t("networkWarning");
          toastId = showNotification({
            message: message,
            type: "warning",
            options: { position: "top-center", style: { fontWeight: "bold", color: "#1D1616" } },
          });
        }
      }
    };

    const handleOffline = () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
      toastId = toast.error(t('offlineNetwork'), { position: "top-center", style: { fontWeight: "bold", color: "#fff" } });
    };

    const handleOnline = () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
      toastId = toast.success(t('onlineNetwork'), { position: "top-center", style: { fontWeight: "bold", color: "#1D1616" } });
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


  const handleScrollToView = () => {
    if(acceptedTnc==="ONGOING") return;
    try {
      document?.querySelector("#last-chat-boundary")?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      console.error({ error });
    }
  };

  async function handleChatSessionButtonClick({key}){
    lastBotMessageIndex.current = -1;
    let key_num;
    let currentSession;
    if(key){
      key_num = key?.split('-').pop();
      currentSession = chatTitle[key_num]?.session;
      removeFromStorage('llmError');
      setInStorage('isOldChatOpen', JSON.stringify(true));
      setInStorage('isNewChatOpen', JSON.stringify(false));
      setInStorage('sessionid', JSON.stringify(currentSession));
      setInStorage('chat-history', JSON.stringify([]));

      window.location.reload()
    } else {
      currentSession = getFromStorage('sessionid', true);
      await fetchBotInfo()
      setIsIntroLoading(false);
      await handleCompanyChatCall(currentSession);
    }
  }

  const pdfDownloadSidebar = async (sessionid) => {
    try {
        setIsLoading(true);
        setIsPdfDownloading(true);
        
        
        const story = await getStoryBySession(sessionid, access_token);
        
        const story_media = story[0]?.story_media;
        const pdfMedia = story_media?.filter(media => media.media_type === 'application/pdf') || [];
        
        
        const pdfFileName = pdfMedia[0]?.name;
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
                const a = document.createElement('a');
                const url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = pdfFileName;
                document.body.appendChild(a);
                a.click();

                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Network response was not ok.');
            }

        } else {
            console.error('No PDF media found or invalid file URL.');
        }

    } catch (error) {
        setIsLoading(false);
        console.error('Error downloading file:', error);
    } finally {
        setIsPdfDownloading(false);
        setIsLoading(false);
    }
  }


  async function getCompanyChatApi(currentSession) {
    const resp = await axiosInstance({
      url: `/api/companychat/?session=${currentSession}`,
    });
    return resp
  }

  async function handleCompanyChatCall(currentSession) {  
    const storedChatHistory = getFromStorage('chat-history', true)
    if (storedChatHistory.length >= 1) {
      return;
    }

    setIsFetchingOldIntro(true);

    try {
        const resp = await getCompanyChatApi(currentSession);

        const newChatSessionDetail = [];
        
        let sortedResult = quickSort(resp?.data?.results, compareById);

        if (introMessageRef.current) {
            const temp_intro = introMessageRef.current;
            setSentences((prev) => [
                ...prev,
                {
                    message: temp_intro,
                    source: 'bot',
                    isNarrated: true,
                    id: 'intro_msg_id',
                },
            ]);

            newChatSessionDetail.push({
                msg: temp_intro,
                source: 'bot',
                updated_at: 'intro_msg_id',
            });

            introMessageRef.current = "";
        }

        sortedResult.forEach((chats) => {
            let messageToUse = chats?.message;
            if (chats?.translated_message && chats?.translated_message !== ''){
              messageToUse = chats?.translated_message;
            }
            if (chats?.id === "intro_msg_id" || messageToUse === introMessageRef.current) {
              return;
            }
            const chatMessage = {
                message: chats?.sender?.id === 1 ? messageToUse : chats?.message,
                source: chats?.sender?.id === 1 ? 'bot' : 'user',
                isNarrated: true,
                id: chats?.id,
            };

            setSentences((prev) => [
                ...prev,
                chatMessage,
            ]);

            newChatSessionDetail.push({
                msg: chats?.sender?.id === 1 ? messageToUse : chats?.message,
                source: chats?.sender?.id === 1 ? 'bot' : 'user',
                updated_at: chats?.id,
            });
        });

        const newChatHistoryItems = newChatSessionDetail.map((item) => ({
            msg: item.msg,
            source: item.source,
            updated_at: item.updated_at,
        }));
        
        setChatHistory((prev) => {
            const existingMessages = new Set(prev.map(msg => msg.msg));
            const filteredItems = newChatHistoryItems.filter(item => !existingMessages.has(item.msg));
            return [
                ...prev,
                ...filteredItems,
            ];
        });

        lastBotMessageIndex.current += newChatSessionDetail.length;
        
    } catch (error) {
        console.error('Error fetching company chat data:', error);
    } finally {
        setIsFetchingOldIntro(false);
        if(projectId) {
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
      const currentSessionID = getFromStorage('sessionid', true);
      const currentFlow = getFromStorage('flow', false);
      let sessionComplete;
      const TitleAndSession = [];
      const response = await axiosInstance({
        url: `/api/chatsession?profile=${profileToUse}&flow=${currentFlow}`,
      })
      
      if (response) {
        let sortedResult = quickSort(response?.data?.results, compareByIdDesc);
        sortedResult.forEach((sessionObj, index)=>{
          const status = sessionObj.session_status?.toLowerCase() === 'completed' ? t('completedStatusText'): t('inProgressStatusText');
          TitleAndSession.push({ session: sessionObj.session, title: sessionObj.title, sessionStatus: status });
          if (sessionObj.session === currentSessionID) {
            sessionComplete = sessionObj.session_status?.toLowerCase() === 'completed';
          }
        })
        setShowFileInput(sessionComplete === true);
        setSessionTitleDetail(TitleAndSession);
        setChatTitle([...TitleAndSession.slice(0, chatToAddLength)]);
      }
    } catch (error){
      
    } finally{
      setIsLoading(false);
    }

  }

  const fetchMoreData = () => {
    setTimeout(()=>{
      if (visibleItemCount < sessionTitleDetail.length) {
        setVisibleItemCount(prevCount => prevCount + chatToAddLength);
        setChatTitle(prevChatTitle => [
          ...prevChatTitle,
          ...sessionTitleDetail.slice(prevChatTitle.length, prevChatTitle.length + chatToAddLength)
        ]);
      }
    }, 1000)
  };

  function showScrollbarContent(){
    return(
      <div
        className={isMobile? 'div1': 'div2'}
      >
      <InfiniteScroll
        dataLength={visibleItemCount}
        next={fetchMoreData}
        hasMore={visibleItemCount < sessionTitleDetail?.length}
        loader={
          <div
            className={isMobile? 'div3': 'div4'}
          >
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
              className='div6'
              onClick={() => {
                handleChatSessionButtonClick({ key: `session-title-bttn-${index}` });
              }}
            >
              <span
                className="span1"
              >
                {item?.title}
              </span>
              <span
                className={`span2 ${(item?.sessionStatus === t('completedStatusText')) ? 'span3' :'span4'}`}
              >
                {item?.sessionStatus}
              </span>
            </div>

            {(item?.sessionStatus === t('completedStatusText'))&& <button
              className="span5"
              onClick={() => {
                

                pdfDownloadSidebar(item?.session)
              }}
            >
              <FiDownload />
            </button>}
            {(item?.sessionStatus !== t('completedStatusText'))&& <button
              className="span5"
            >
            </button>}
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
      setLlmError('');
      removeFromStorage('llmError');
      handleOnStopSpeaking()
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
            asr_audio: asrAudio
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
        
        setChatHistory((prevMessages) => {
          const lastMessage = prevMessages[prevMessages?.length - 1];
          lastMessage.msg += " " + sentence;
          return [...prevMessages];
        });
      } else {
        
        setChatHistory((prevMessages) => {
          return [
            ...prevMessages,
            createMessage({
              msg: sentence,
              source: "bot",
            }),
          ];
        });
      }
    },
    [chatHistory]
  );

  const handleMessagesForUser = useCallback((sentence) => {
      setChatHistory((prevMessages) => [
      ...prevMessages,
      createMessage({
        msg: sentence,
        source: "user",
      }),
    ]);
  }, []);

  async function getAI4BharatAudio(text, sourceLanguage = 'en', gender = 'female') {
    try {
      let storedRoute = '/'
      let currentFlow = getFromStorage('flow', false);
      if (currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(currentFlow)) {
        storedRoute=bot_routes.shikshalokam_chaupal
      } else if (selectedType === 'oneshot'){
        storedRoute = '/oneshot_bot';
      } else {
        if(currentFlow && [sessionFlowName.LoginMiStory, sessionFlowName.GuestMiStory].includes(currentFlow)){
          storedRoute = '/';
        } else {
          storedRoute = '/reflection';
        }
      }

      const response = await axiosInstance.post('api/text_to_speech/', {
        text: text,
        source_language: sourceLanguage,
        route: storedRoute
      });
      
      return response.data.audio;
    } catch (error) {
      console.error('Error fetching AI4Bharat audio:', error);
      throw error;
    }
  }


  const handleAI4BharatTTSRequest = async (text, id, sourceLanguage) => {
    try {
      if(id === 'intro_msg_id' && isIntroPlayed.current === true) {
        return;
      }
      if(id === 'intro_msg_id') {
        isIntroPlayed.current = true;
      }
      let cachedAudioUrl = audioCache[id];
      let audio_result = "";
      let audio;

      if (!sourceLanguage) {
        sourceLanguage = "en"
      }

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
        audio_result = await getAI4BharatAudio(text, sourceLanguage);
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
          console.error('Error playing audio:', error);
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
      console.error('Error in handleAI4BharatTTSRequest:', error);
      handleOnStopSpeaking()
    }
  };

  async function ai4BharatASR(base64, gender = 'female'){
    
    let sourceLanguage = languageToUse;
    let storedRoute = '/'
    let currentFlow = getFromStorage('flow', false);
    if (currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(currentFlow)) {
      storedRoute=bot_routes.shikshalokam_chaupal
    } else if (selectedType === 'oneshot'){
      storedRoute = '/oneshot_bot';
    } else {
      if(currentFlow && [sessionFlowName.LoginMiStory, sessionFlowName.GuestMiStory].includes(currentFlow)){
        storedRoute = '/';
      } else {
        storedRoute = '/reflection';
      }
    }
    try {
      const response = await axiosInstance.post('api/asr/', {
        s3Url: base64,
        source_language: sourceLanguage,
        gender: gender,
        route: storedRoute
      });
      
      return response.data.transcript;
    } catch (error) {
      console.error('Error fetching AI4Bharat audio:', error);
      return t('asrError');
    } 
  }


  const isTyping = !!textMessage.trim();

  useEffect(() => {
    let unnarratedMessages = sentences.filter((x) => !x?.isNarrated);
    let hasUnnarratedMessages = !!unnarratedMessages?.length;
    let sourceLanguage = languageToUse;
    if (isNextAllowed && hasUnnarratedMessages && !isLoading && !isEndStoryLoading) {
      handleAI4BharatTTSRequest(
        unnarratedMessages[0].message,
        unnarratedMessages[0].id,
        sourceLanguage
      )
    }

    return () => {};
  }, [isNextAllowed, sentences, languageToUse, isLoading, isEndStoryLoading]);

  useEffect(() => {
    if (
      !!appendix?.length &&
      chatHistory[chatHistory?.length - 1].source === "bot"
    ) {
        
        setChatHistory((prevMessages) => {
        const lastMessage = prevMessages[prevMessages?.length - 1];
        lastMessage.appendixURL = appendix;
        lastMessage.hasAppendix = true;
        return [...prevMessages];
      });
      setAppendix([]);
    }
    return () => {};
  }, [appendix, chatHistory]);

  useEffect(() => {
    const storedLanguage = (getFromStorage('route', false) && getFromStorage('route', true)) || null;
    if (storedLanguage && storedLanguage !== null) {
      setSelectedLanguage(storedLanguage);
    } else {
      const currentFlow = getFromStorage('flow', false);
      if (currentFlow && !([sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow))) {
        setInStorage("route", JSON.stringify("en"));
        setSelectedLanguage("en");
      }
    }
  }, []);

  const handleLanguageSelect = (language) => {
    if (chatHistory && chatHistory.length <= 1) {
      stopAllAudio()
      isIntroPlayed.current = false
      setIsLoading(true);
      removeFromStorage('chat-history')
      setInStorage('chat-history', JSON.stringify([]));
      removeFromStorage('intro_message');
      setChatHistory([]);
      setSentences([]);
      setInStorage("route", JSON.stringify(language));
      setInStorage('lang_progress', "IN_PROGRESS");
      setLangProgress("IN_PROGRESS");
      // setIsNextAllowed(true);
      setAudioCache({});
      setLanguageToUse(language);
      setLanguage(language);
      setShouldFetchIntro(true);
      // window.location.reload();
    }
  };

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

  const handleOnSpeaking = async (text, id, staticMsg, hasClickedOnSpeaker=false) => {
    try {
      try {
        if (!!audioRef.current) await audioRef.current.pause();
      } catch (error) {
        console.error({ error });
      }
      if(id === 'intro_msg_id') {
        isIntroPlayed.current = false;
      }
      setHasOverRideId(id);
      setIsNextAllowed(true);
      const messageToPlay = staticMsg? staticMsg: chatHistory.find((message) => message.updated_at === id);
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
        if(audioRef.current) await audioRef.current.pause();
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

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      handleOnStopSpeaking()
      setTextMessage('')
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const options = {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 16000
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
              const audioBlob = new Blob(localAudioChunks, { type: 'audio/webm;codecs=opus' });
              
              if (!audioBlob) {
                showNotification({
                  message: t('asrError'),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 4000,
                    style: { fontWeight: "bold" },
                  },
                });
                return;
              }

              setIsFetchingData(true);
              let transcriptResult = '';
              let s3Url = await handleS3Upload(audioBlob, `${getFromStorage('sessionid', true)}-${Date.now()}`, 'chatbot/companychat/');
              if(!s3Url || s3Url === '') {
                transcriptResult = t('asrError');
              }
              setAsrAudio(s3Url);
              transcriptResult = await ai4BharatASR(s3Url);
              if (!transcriptResult || transcriptResult === '') {
                showNotification({
                  message: t('asrError'),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 4000,
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
          console.error('Error accessing microphone:', err);
          setIsFetchingData(false);
        });
    } else {
      console.warn("getUserMedia not supported on your browser!");
    }
  };
  
  const containsSignificantAudio = (audioBuffer, threshold = 0.3) => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const channelData = [];
  
    for (let i = 0; i < numOfChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }
  
    for (let i = 0; i < channelData[0].length; i++) {
      for (let channel = 0; channel < numOfChannels; channel++) {
        if (Math.abs(channelData[channel][i]) > threshold) {
          return true; 
        }
      }
    }
  
    return false; 
  };
  
  const convertToWav = async (audioBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioData = new Uint8Array(reader.result);
  
        try {
          const buffer = await audioContext.decodeAudioData(audioData.buffer);
          
          if (!containsSignificantAudio(buffer)) {
            resolve(null);
          } else {
            const wavData = bufferToWave(buffer, buffer.length);
            const wavBlob = new Blob([wavData], { type: 'audio/wav' });
            resolve(wavBlob);
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(audioBlob);
    });
  };
  const bufferToWave = (abuffer, len) => {
    const numOfChannels = abuffer.numberOfChannels;
    const sampleRate = abuffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    const byteRate = sampleRate * numOfChannels * (bitDepth / 8);
    const blockAlign = numOfChannels * (bitDepth / 8);
    const wavLength = 44 + len * blockAlign;
    const buffer = new ArrayBuffer(wavLength);
    const view = new DataView(buffer);
  
    let offset = 0;
    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i) & 0xff);
      }
      offset += str.length;
    };
  
    writeString('RIFF');
    view.setUint32(offset, wavLength - 8, true); 
    offset += 4;
    writeString('WAVE'); 
  
    writeString('fmt ');
    view.setUint32(offset, 16, true); 
    offset += 4;
    view.setUint16(offset, format, true);
    offset += 2;
    view.setUint16(offset, numOfChannels, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, byteRate, true);
    offset += 4;
    view.setUint16(offset, blockAlign, true);
    offset += 2;
    view.setUint16(offset, bitDepth, true); 
    offset += 2;
  
    writeString('data');
    view.setUint32(offset, len * blockAlign, true);
    offset += 4;
  
    for (let i = 0; i < len; i++) {
      for (let channel = 0; channel < numOfChannels; channel++) {
        const sample = abuffer.getChannelData(channel)[i];
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
  
    return view;
  };
  
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setHasStartedRecording(false);
    }
  };

  function downloadPdf(){
    let storedState = getFromStorage('state', false);
    let storedCompany = getFromStorage('company', false);
    let current_company = storedCompany? JSON.parse(storedCompany) : null;
    let currentState = storedState? JSON.parse(storedState) : null;
    if (!currentState) {
      currentState = cookies.get('state');
    }
    if(!current_company){
      current_company = cookies.get('company');
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

  const handleSelectedTypeNameChanges = (e)=>{
    let { value } = e?.target;
    function changeSelectedValue(value, e) {
      if(value==="") value = selectedLabel?.types[0]?.value;
      setInStorage('selected_type', JSON.stringify(value));
      ResetChat(e); 
    }
    if ([sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false))) {
      showGuestPopup(false, () => changeSelectedValue(value, e));
    } else {
      changeSelectedValue(value, e);
    }
  }

  function stopAllAudio(){
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }

  const convertHeifToJpg = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
  
    const response = await axiosInstance.post("api/image-converter/", formData, {
      responseType: "blob", 
    });
  
    const convertedBlob = response.data;
  
    const originalName = file.name.split('.').slice(0, -1).join('.');
    const jpgFile = new File([convertedBlob], `${originalName}.jpg`, { type: "image/jpeg" });
  
    return jpgFile;
  };
  
  const handleS3Upload = async (file, fileName, folderStructure) => {
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
    };
  
    const maxFileSize = 50 * 1024 * 1024;
    const allowedExtensions = ["jpeg", "jpg", "png", "svg", "webp", "heif", "heic"];
  
    const uploadPromises = filesArray.map(async (file) => {
      if (file.size > maxFileSize) {
        setFileErrorText(fileSizeText);
        throw new Error("File size exceeds limit");
      }
  
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
  
      console.log("In promise for file:", fileName);
  
      if (!allowedExtensions.includes(fileExtension)) {
        setFileErrorText(t("fileTypeErrorText"));
        throw new Error("Invalid file type");
      }
  
      try {

        if (["heic", "heif"].includes(fileExtension)) {
          file = await convertHeifToJpg(file);
        }
        
        const s3Url = await handleS3Upload(file, fileName, 'chatbot/storymedia/');
  
        const formData = {
          file_url: s3Url,
          story: story_id,
          name: fileName,
          media_type: file.type,
          include_in_story: true,
          access_token,
          flow: getFromStorage('flow', false),
          session: getFromStorage('sessionid', true),
        };
  
        const uploadedFile = await uploadImage(formData, setError, projectId, navigate, setIsLoading, access_token, setFiles);
        return uploadedFile;
  
      } catch (error) {
        console.error({ error });
        if (projectId) {
          clearFromStorage();
          navigate(-1);
        }
        setIsLoading(false);
        return null;
      }
    });
    
    try{
      const uploadedFiles = await Promise.allSettled(uploadPromises);
      const validFiles = uploadedFiles
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);
  
      setFiles([...currentFiles, ...validFiles]);
    } catch (e) {
      console.error("Upload handling error", e);
    } 
  };

  function handleAcceptTnC() {    
    setInStorage('has_accepted_tnc', true);
    setAcceptedTnC(true);
  }

  function handleDeclineTnC() {
    setInStorage('has_accepted_tnc', false);
    setAcceptedTnC(false);
    navigate(ROUTES.SHIKSHALOKAM_HOME_PAGE)
  }

  return (
    <>
      {(acceptedTnc==="ONGOING" && !isLoading && getFromStorage('flow', false) && 
        [sessionFlowName.Reflection].includes(getFromStorage('flow', false))
      )&& 
        <PrivacyPolicyPopup tncText={t('tncText')} onAccept={handleAcceptTnC} />
      }
      {(acceptedTnc==="ONGOING" && !isLoading && getFromStorage('flow', false) && 
        [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false))
      )&& 
        <PrivacyPolicyPopup 
          tncText="**उपयोग की शर्तें और नियम**<br/><br/>स्वागत है! कृपया हमारे प्लेटफॉर्म का उपयोग करने से पहले इन शर्तों और नियमों को ध्यानपूर्वक पढ़ें। सामग्री अपलोड करके और बोट के साथ इंटरैक्ट करके, आप नीचे उल्लिखित नियमों का पालन करने के लिए सहमति देते हैं। इनका पालन न करने पर प्रतिबंधित उपयोग या कानूनी परिणाम हो सकते हैं।<br/><br/><h4 style='font-weight: bold'>1. प्लेटफॉर्म का उद्देश्य</h4>हमारा प्लेटफॉर्म उपयोगकर्ताओं को यह करने की अनुमति देता है:<br/>- विशिष्ट कार्यों या उद्देश्यों के लिए चित्र अपलोड करना।<br/>- बोट के साथ इंटरैक्ट करके सहायता प्राप्त करना, जानकारी प्रदान करना, या कार्य पूरा करना।<br/><br/><h4 style='font-weight: bold'>2. उपयोगकर्ता की जिम्मेदारियाँ</h4>प्लेटफॉर्म का उपयोग करते समय, आप सहमति देते हैं कि आप:<br/>- केवल सही और संबंधित चित्र अपलोड करेंगे जो कार्य के लिए आवश्यक हैं।<br/>- झूठी, भ्रामक या अनुपयुक्त सामग्री साझा करने से बचेंगे।<br/>- सुनिश्चित करेंगे कि सभी चित्र और संवाद लागू कानूनों और नैतिक मानकों के अनुरूप हों।<br/>- बोट और प्लेटफॉर्म के साथ सम्मानपूर्वक व्यवहार करेंगे, अपशब्दों का उपयोग करने या हानिकारक गतिविधियों में संलिप्त होने से बचेंगे।<br/><br/><h4 style='font-weight: bold'>3. निषिद्ध क्रियाएँ</h4>उपयोगकर्ताओं को सख्त रूप से निम्नलिखित कार्यों से रोका गया है:<br/>- बिना उचित अनुमति के अवैध, अश्लील या कॉपीराइट सामग्री अपलोड करना।<br/>- ऐसी चित्रों या सामग्री को साझा करना जो आपत्तिजनक, हानिकारक या दूसरों के अधिकारों का उल्लंघन करती हो।<br/>- प्लेटफॉर्म का उपयोग करके किसी व्यक्ति या संस्था को उत्पीड़ित करना, धोखाधड़ी करना या हानि पहुँचाना।<br/><br/><h4 style='font-weight: bold'>4. निगरानी और प्रवर्तन</h4>आपके द्वारा बोट के साथ किए गए इंटरैक्शन, अपलोड किए गए चित्र एवं इंटरेक्शन के बाद बोट द्वारा बनाई गई रिपोर्ट एडमिनिस्ट्रेटर या प्रोग्राम मैनेजर के साथ साझा किया जा सकता है। प्रोग्राम मैनेजर या एडमिनिस्ट्रेटर इसका उपयोग सावधानी एवं समझदारी से केवल प्रोग्राम के लिए और उसके दायरे में ही प्रयोग करेंगे । एक सुरक्षित और सम्मानजनक वातावरण बनाए रखने के लिए:<br/>- प्लेटफॉर्म पर अपलोड किए गए चित्रों और चैट इंटरैक्शन की निगरानी कर सकता है ताकि यह सुनिश्चित किया जा सके कि इन शर्तों का पालन हो रहा है।<br/>- किसी भी उल्लंघन के परिणामस्वरूप प्लेटफॉर्म से तत्काल निलंबन या स्थायी प्रतिबंध हो सकता है।<br/>- गंभीर कदाचार के मामलों में कानूनी कार्रवाई की जा सकती है।<br/><br/><h4 style='font-weight: bold'>5. अस्वीकरण</h4>प्लेटफॉर्म और बोट उपयोगकर्ताओं को सहायता देने के उपकरण हैं। हालांकि हम सटीकता और सुरक्षा बनाए रखने की कोशिश करते हैं, हम निम्नलिखित के लिए उत्तरदायी नहीं हैं:<br/>- उपयोगकर्ताओं द्वारा प्लेटफॉर्म का दुरुपयोग।<br/>- उपयोगकर्ताओं द्वारा अपलोड की गई झूठी या अनुपयुक्त सामग्री के परिणामस्वरूप कार्यों के लिए।<br/>- हमारे नियंत्रण से बाहर की तकनीकी समस्याओं के लिए।<br/><br/><h4 style='font-weight: bold'><h4 style='font-weight: bold'>6. शर्तों की स्वीकृति</h4>इस प्लेटफॉर्म का उपयोग करके, आप यह स्वीकार करते हैं कि आपने इन शर्तों और नियमों को पढ़ा, समझा और सहमति दी है। यदि आप सहमत नहीं हैं, तो कृपया सेवा का उपयोग न करें।<br/>सभी उपयोगकर्ताओं के लिए एक सुरक्षित और उत्पादक वातावरण सुनिश्चित करने के लिए धन्यवाद।"
          onAccept={handleAcceptTnC} useStaticText={true}
        />
      }
      <></>
      <div className={`div27 ${isOpen&& ' div70'} ${(projectId)&& ' div21'}`}>
        <div className={`div28 ${isOpen ? "div29" : ""}`}>
          {(isShikshalokamPublicType && getFromStorage('flow', false) && 
            !([sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false))))&& 
            <Sidebar
              isOpen={isOpen}
              toggle={setIsOpen}
              isMobileFirst={true}
              showScrollbarContent={!isGuestFlow&& showScrollbarContent}
              resetChat={ResetChat}
              setIsResetCalled={setIsResetCalled}
              languageToUse={languageToUse}
              stopAllAudio={stopAllAudio}
              showGuestPopup={
                (
                  getFromStorage('flow', false) && 
                  [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false))
                )&& showGuestPopup
              }
            />}
        </div>
        {isOpen && (
          <div
            className="div7"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
        <div className={isMobile? 'div30_a': 'div30'}>
          <MainHeader
            isMobileFirst={isMobile}
            showTheDots={false}
            content={
              <>
                {([sessionFlowName.LoginMiStory, sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false)))&& 
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
                    if ([sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false))) {
                      showGuestPopup();
                    } else {
                      setIsResetCalled(true);
                      await ResetChat(e)
                    }
                  }}
                  className="div32"
                >
                  <div
                    className="div8"
                  >
                    +
                  </div>
                  {/* <GoPlusCircle className="text-3xl mr-1  text-black-400"  /> */}
                </button>
              </>
            }
          />
        </div>
      </div>
      {(isLoading || isIntroLoading || isEndStoryLoading)&& <div className="loader-load-spinner">
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
                {(getFromStorage('flow', false) && 
                    [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(getFromStorage('flow', false))
                  )?
                    t('reportLoaderHeading') : t('storyLoaderHeading')
                }
              </h2>
              <label className="form-label label1 text-center">
                {(getFromStorage('flow', false) && 
                    [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(getFromStorage('flow', false))
                  )?
                    t('reportLoader') : t('storyLoader')
                }
              </label>
            </div>
          }
        </div>
      </div> }
      {(storyData && isModalOpen)&& 
        handleEditClick()
      }
      <div className={`${projectId? 'div72' : isOpen? 'div71': ''}`}>
      {(projectId)&& 
        <>
            <button
              onClick={(e) => {
                if (projectId){
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
          className={`${projectId? 'div33-a': 'div33'} div9`}
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
        
                <div className={`div36 ${chat?.source === "user"&& 'div37'}`}>
                  <ChatMessage
                    botNameToDisplay={botNameToDisplay}
                    userType={chat?.source}
                    message={`${chat?.msg}`}
                    name={t("userName")}
                    recording={chat?.recording}
                    hasAppendix={chat?.recording}
                    appendixURL={chat?.appendixURL}
                    isTalking={
                      (chat.source === "bot") && !isStreamingComplete && (i === chatHistory.length - 1)
                    }
                    handleOnStopSpeaking={() => handleOnStopSpeaking()}
                    handleOnSpeaking={() =>{
                      handleOnSpeaking(chat?.msg, chat?.updated_at)}
                    }
                    isAnyPlaying={!!hasOverRideId || isTalking}
                    isPlaying={hasOverRideId === chat?.updated_at}
                    isStreamingComplete={isStreamingComplete}
                    setNotMute={setNotMute}
                    chatId={chat?.updated_at}
                  />
                  </div>
                  {!hasStartedListening && chatHistory[chatHistory?.length - 1].source === "user" &&
                  i === chatHistory?.length - 1 ? (
                    <div className="div57">
                      <div className="div58">
                        <div>{t('replyMsg')}</div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </li>
              ))}
            </ul>
          }
          {(showHomepage)&&
            <>
              {(getFromStorage('flow', false))&&<>
                <div className="div10" >
                  <h3 className="h3-1">
                    {t('homepageHeading')}
                    <br/>
                    {t('homepageHeading1')}
                  </h3>
                </div>
                <ul className="div11" >
                  <li>{t('homepageList')}</li>
                  <li>{t('homepageList1')}</li>
                  <li>{t('homepageList2')}</li>
                </ul>
              </>}
              {(!projectId && (!profileToUse || !getFromStorage('first_name', false) || getFromStorage('first_name', false) === 'null' || getFromStorage('first_name', false)==='') && !access_token)&& 
                <div className="div13" >
                  <ChatMessage 
                    botNameToDisplay={botNameToDisplay}
                    userType="bot"
                    message={t('languageQuestion')}
                    isTalking={false}
                    handleOnStopSpeaking={() => handleOnStopSpeaking()}
                    handleOnSpeaking={(message, updatedAt, staticMessage) =>{
                      const message_to_use = t('languageQuestion')
                      handleOnSpeaking(message_to_use, "language-img-id",
                        {msg: message_to_use, updated_at: "language-img-id", source:"bot"}
                      )}
                    }
                    isAnyPlaying={!!hasOverRideId || isTalking}
                    isPlaying={hasOverRideId === "language-img-id"}
                    isStreamingComplete={isStreamingComplete}
                    setNotMute={setNotMute}
                    chatId={"language-img-id"}
                    isStaticMessage={true}
                  />
                  <div className="flex flex-wrap">
                    {languageList.map((lang) => (
                      <div
                        key={lang.value}
                        className={`div14 flex items-center justify-center p-0 ${
                          languageToUse === lang.value ? "bg-[#d5eafd] text-white" : ""
                        }`}
                      >
                        <button
                          className="div16 text-center w-full h-full"
                          disabled={languageToUse === lang.value || chatHistory?.length > 1}
                          onClick={() => handleLanguageSelect(lang.value)}
                        >
                          {lang.label}
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              }
              {chatHistory?.length > 0 && (
                <div className="div26">
                  <div className="div36 div12" >
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
                      handleOnSpeaking={() =>{
                        handleOnSpeaking(chatHistory[0]?.msg, chatHistory[0]?.updated_at)}
                      }
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
          }
          {(isStreamingComplete && showFileInput && !showHomepage && !isEndStoryLoading &&
            !isLoading && !isPdfDownloading && storyData?.id !== '') && (
            <>
              <div className="div13" >
                <ChatMessage 
                  botNameToDisplay={botNameToDisplay}
                  userType="bot"
                  message={t('evidence')}
                  isTalking={false}
                  handleOnStopSpeaking={() => handleOnStopSpeaking()}
                  handleOnSpeaking={(message, updatedAt, staticMessage) =>{
                    const message_to_use = t('evidence')
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
                            onClick={() => partialUpdateMedia(file?.id, false, access_token, setIsLoading)}
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

              <div className="div19">
                <ChatMessage 
                  botNameToDisplay={botNameToDisplay}
                  userType="bot"
                  message={
                    (getFromStorage('flow', false) && 
                      [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(getFromStorage('flow', false))
                    )?
                    t('reportText') : t('storyText')
                  }
                  isTalking={false}
                  handleOnStopSpeaking={() => handleOnStopSpeaking()}
                  handleOnSpeaking={(message, updatedAt, staticMessage) =>{
                    const message_to_use = (getFromStorage('flow', false) && 
                    [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(getFromStorage('flow', false))
                  )?
                  t('reportText') : t('storyText')
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
                {(!projectId)&& <div className="div20">
                  <button
                    className="clickable-button"
                    onClick={()=>{
                      const sessionToUse = getFromStorage('sessionid', true);
                      if (sessionToUse) {
                        pdfDownloadSidebar(sessionToUse);
                      }
                    }}
                    disabled={isLoading || isPdfDownloading}
                  >
                    <div className="download-story-div">
                      <FiDownload className="icon-1" />
                      <span className="div16" ref={endPageToScrollRef}>
                        {(getFromStorage('flow', false) && 
                          [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(getFromStorage('flow', false))
                        )?
                          t('downloadReportText') : t('downloadStoryText')
                        }
                      </span>
                    </div>
                  </button>

                  {triggerDownload && isPdfDownloading && !isLoading && downloadPdf()}
                </div>}
                <div className="div20">
                  <button
                    className="clickable-button"
                    onClick={openModal}
                    disabled={isLoading || isPdfDownloading}
                  >
                    <div className="download-story-div">
                      <MdEdit className="icon-1" />
                      <span className="div16" ref={endPageToScrollRef}>
                        {(getFromStorage('flow', false) && 
                          [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(getFromStorage('flow', false))
                        )?
                          t('editReportText') : t('editStoryText')
                        }
                      </span>
                    </div>
                  </button>
                </div>
                {(projectId)&& <div className="div20">
                  <button
                    className="clickable-button"
                    onClick={async ()=>{
                      if(projectId){
                        setIsLoading(true);
                        await updateReflectionStatus();
                      } else{
                        window.location.reload()
                      }
    
                    }}
                    disabled={isLoading || isPdfDownloading}
                  >
                    <div className="download-story-div">
                      <AiOutlineEye className="icon-1" />
                      <span className="div16" ref={endPageToScrollRef}>
                      {t('viewStoryText')}
                      </span>
                    </div>
                  </button>
                </div>}
              </div>
            </>
          )}
          {(llmError && llmError!=='')&&
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
                      {(getFromStorage('flow', false) && 
                          [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(getFromStorage('flow', false))
                        )?
                          t('reDownloadReportText') : t('reDownloadStoryText')
                      }
                      </span>
                    </div>
                  </button>

                  {triggerDownload && isPdfDownloading && !isLoading && downloadPdf()}
                </div>
            </>
            }
          <div id="last-chat-boundary" className="div38" />
        </div>
        <Notification />

        {((!showFileInput || showFileInput===null) && !isLoading &&!isEndStoryLoading && (llmError==='' || !llmError) && 
         Array.isArray(chatHistory) &&
         chatHistory.some(item => item && Object.keys(item).length > 0)
        )&&       
          <form
            className="div39 form-1"
            onSubmit={(event)=>{
              if(!hasStartedListening && !isFetchingData){
                handleSendMessage(event);
              }
            }}
            autoComplete="off"
          >
            <div
              className="textarea-wrapper relative"
            >
              <textarea
                id="textBoxID"
                className={`input-2 input-1 ${(isFetchingData) ? "min-h-[68px] sm:min-h-0 py-0" : ""}`}
                style={{ alignContent: isFetchingData? "normal" : "center" }}
                onChange={handleOnInputText}
                placeholder={hasStartedRecording? 
                  t('placeholder1'): 
                  isFetchingData? t('placeholder2'): t('placeholder3')
                }
                name="message-box"
                value={textMessage}
                autoFocus={true}
                disabled={hasStartedRecording || isFetchingData}
                ref={textAreaRef}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  const maxHeight = 150;
                  if (e.target.scrollHeight > maxHeight) {
                    e.target.style.height = `${maxHeight}px`;
                    e.target.style.overflowY = 'scroll';
                  } else {
                    e.target.style.height = `${e.target.scrollHeight}px`;
                    e.target.style.overflowY = 'hidden';
                  }
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
            {(isTyping && !hasStartedListening && !isFetchingData) ? (
              <div className="button-container">
                <button
                  type="submit"
                  disabled={hasStartedRecording || isFetchingData}
                  className="button-6"
                >
                  <MdSend />
                </button>
              </div>
            ) : (
              <div className= {`audio-recorder ${isFetchingData ? 'button-container' : ''}`}>
                {/* {hasStartedRecording && (
                  <button
                    type="button"
                    onClick={() => {
                      stopRecording();
                    }}
                    className="div40"
                  >
                    {t('cancel')}
                  </button>
                )} */}

                <button
                  type="button"
                  onClick={hasStartedRecording ? stopRecording : startRecording}
                  disabled={isFetchingData}
                  className={`button-7 ${hasStartedRecording ? 'button-8' : 'button-9'}`}
                >
                  
                  {hasStartedRecording ? <FaRegStopCircle /> : <FaMicrophone />}
                </button>                
              </div>
            )}
          </form>
        }
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
  appendixURL,
  isTalking,
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
      {(userType === "bot")&& <div className="div42">
        <div
          className={`${
            userType === "bot" ? "div43" : "div44"
          } div45`}
        >
          <MdAccountCircle />
        </div>
        <div className="div46">
          {userType === "bot" ? (
            (isPlaying) ? (
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
                  handleOnSpeaking(message, chat?.updated_at, staticMessage, true);
                }}
                disabled={!isStreamingComplete}
              >
                <HiMiniSpeakerXMark />
              </button>
            )
          ) : null}
        </div>
      </div>}
      <div className={`${userType==='user'? 'div47': 'div48'}`}>
        <div
          className={`div36 ${(userType==='user')&& 'div37'}`}
        >
          {(userType === "user")&& <div
          className={`div49`}
        >
          <MdAccountCircle />
        </div>}
          {userType === "bot" ? botNameToDisplay : name}
        </div>
        {!!message && !!recording && (
          <div
            className={` ${
              userType === "bot" ? "div53" : "div54"
            } div50`}
          >
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
            <ReactMarkdown  children={sanitizedContent} remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} className="prose max-w-none"
            />
        </div>
      </div>
    </div>
  );
}

/* eslint-disable react-hooks/exhaustive-deps */


export function clearFromStorage() {
  const keysToRemove = [
    'botName', 'chat-history', 'company', 'first_name', 'has_accepted_tnc', 'intro_message', 
    'isChatVisible', 'isNewChatOpen', 'isOldChatOpen', 'profileid', 'route', 'sessionid', 'showFileInput', 
    'showHomepage', 'state', 'access_token', 'flow', 'statemachine_length', 'selected_type', 
    'preferred_route', 'country', 'city', 'ip_city', 'ip_state', 'ip_country', 'llmError', 'lang_progress',
    'grit', 'device_id', 'defaultBotName'
  ];

  keysToRemove.forEach((key) => {
    removeFromStorage(key);
  });
}


export async function handleFileUpload(e, storyData, files, setFileErrorText, fileSizeText, access_token, setFiles, setError, projectId, setIsLoading, navigate, t) {
    
  const story_id = storyData?.id;
  if (!story_id || story_id === '') return;
  const selectedFiles = Array.from(e.target.files); 
  const maxFileSize = 50 * 1024 * 1024; 
  const currentFiles = [...files];  

  const uploadPromises = selectedFiles.map((uploadedFile) => {
    if (uploadedFile.size > maxFileSize) {
      setFileErrorText(fileSizeText);
      setIsLoading(false);
      return Promise.resolve();
    }
    const fileName = uploadedFile?.name;
    const allowedExtensions = ["jpeg", "jpg", "png", "svg", "webp", "heif", "heic"];
    const mediaTypes = {
      "jpeg": "image/jpeg",
      "jpg": "image/jpeg",
      "png": "image/png",
      "svg": "image/svg+xml",
      "webp": "image/webp",
      "heif": "image/heif",
      "heic": "image/heic"
    };
    const fileExtension = fileName ? fileName.split('.').pop().toLowerCase() : '';

    if (!allowedExtensions.includes(fileExtension)) {
      setFileErrorText(t("fileTypeErrorText"));
      setIsLoading(false);
      return Promise.resolve();
    }
    
    const mediaType = mediaTypes[fileExtension] || null;
    

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("story", story_id);
    formData.append("name", fileName);
    formData.append("mediaType", mediaType);
    formData.append('include_in_story', true);
    formData.append('access_token', access_token);
    formData.append('flow',getFromStorage('flow', false));
    formData.append('session', getFromStorage('sessionid', true));
    formData.append("media_type", mediaType);

    return uploadImage(formData, setError, projectId, navigate, setIsLoading, access_token, setFiles);
  });

  return Promise.all(uploadPromises).then((uploadedFiles) => {
    const validFiles = uploadedFiles.filter(Boolean);
    setFiles([...currentFiles, ...validFiles]);
  });
}

const uploadImage = (formData, setError, projectId, navigate, setIsLoading, access_token, setFiles) => {
  return new Promise((resolve, reject) => {
    try {
      createStoryMedia({
        setter: (uploadedFile) => {
          setFiles((prevFiles) => [...prevFiles, uploadedFile]);
        },
        errorHandler: (err) => {
          if (projectId){
            clearFromStorage()
            navigate(-1)

          }
          setError(err);
          setIsLoading(false);
          reject(err); 
        },
        data: formData,
        loader: setIsLoading,
        token: access_token,
      });
    } catch (error) {
      console.error({ error });
      if (projectId){
        clearFromStorage()
        navigate(-1)

      }
        setIsLoading(false);
      reject(error);
    }
  });
}

export const partialUpdateMedia = (partialUpdateId, include_in_story=false, access_token, setIsLoading, setFiles) => {
  try {
    const formData = new FormData();
    formData.append('include_in_story', include_in_story);
    formData.append('flow',getFromStorage('flow', false));
    formData.append('access_token', access_token);
    formData.append('session', getFromStorage('sessionid', true));

    createAuthRequest({
      setter: () => {
        window.location.reload()
      },
      loader: setIsLoading,
      data: formData,
      token: access_token,
      method: 'PATCH',
      url: `/api/storymedia/${partialUpdateId}/`,
    });
  } catch (error) {
    console.error({
      error,
    });
  }
};

export const setInStorage = (key, value, currentFlow) => {
  const flow = currentFlow || sessionStorage.getItem('flow') || localStorage.getItem('flow');
  const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory];
  const isTemporary = flow && sessionFlows.includes(flow);

  const storage = isTemporary ? sessionStorage : localStorage;
  storage.setItem(key, value);
};

export const getFromStorage = (key, parseValue = false) => {
  const flow = sessionStorage.getItem('flow') || localStorage.getItem('flow');
  const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory];
  const isTemporary = flow && sessionFlows.includes(flow);
  const storage = isTemporary ? sessionStorage : localStorage;
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

export const removeFromStorage = (key) => {
  const flow = sessionStorage.getItem('flow') || localStorage.getItem('flow');
  const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory];
  const isTemporary = flow && sessionFlows.includes(flow);

  const storage = isTemporary ? sessionStorage : localStorage;
  storage.removeItem(key);
};

export const useSmartChatStorage = () => {
  const flow = sessionStorage.getItem('flow') || localStorage.getItem('flow');
  const sessionFlows = [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory];
  const isTemporary = flow && sessionFlows.includes(flow);

  const [sessionValue, setSessionValue] = useSessionStorage("chat-history", []);
  const [localValue, setLocalValue, removeLocalValue] = useLocalStorage("chat-history", []);

  const removeVal = () => {
    if (isTemporary) {
      sessionStorage.removeItem("chat-history");
      setSessionValue([]); // Update state after removing
    } else {
      localStorage.removeItem("chat-history");
      setLocalValue([]); // Update state after removing
    }
  };

  if (isTemporary) {
    return [sessionValue, setSessionValue, removeVal];
  } else {
    return [localValue, setLocalValue, removeVal];
  }
};
