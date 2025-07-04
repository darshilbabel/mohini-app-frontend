/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MdSend,
} from "react-icons/md";
import useVoiceRecord from "../interview-text-voice/useVoiceRecord";
import { createMessage } from "../interview-voice";
import axiosInstance from "../../utils/axios";
import { BiLoader } from "react-icons/bi";
import { ai4BharatASR, getAI4BharatAudio, getSessionDetails } from "../../services/api.service";
import MainHeader from "../ShikshalokamVoiceChat/shikshaChatHeader";
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa";
import "../../style.css"
import "../ShikshalokamVoiceChat/shikshaChatStyle.css"
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../i18n";
import Notification, { showNotification } from "../../components/ToastMessage/TotastMessage";
import { languageList, sessionFlowName } from "../ShikshalokamVoiceChat/enum";
import PrivacyPolicyPopup from "../../components/TnC/privacyPolicyPopup";
import { FaCircle } from "react-icons/fa6";
import { clearFromStorage, getFromStorage, handleS3Upload, removeFromStorage, setInStorage } from "../../services/storage_service";
import ChatMessage from "./ChatMessage";
import useCustomMediaQuery from "../../hooks/useCustomMediaQuery";
import SpeedNotification from "./SpeedNotification";
import useSmartChatStorage from "../../hooks/useSmartChatStorage";


const PTMVoiceBasedChat = () => {
  const audioRef = useRef();
  const textAreaRef = useRef(null);
  const lastBotMessageIndex = useRef(-1);
  const FLOW_ROUTE = 'mega_ptm';
 
  const [localChatHistory, setLocalChatHistory, removeLocalChatHistory] = useSmartChatStorage();
  const [chatHistory, setChatHistory] = useState(
    !!localChatHistory?.length ? localChatHistory : []
  );
  const [textMessage, setTextMessage] = useState("");
  const [asrAudio, setAsrAudio] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [reconText, setReconText] = useState("");
  const [audioCache, setAudioCache] = useState({});
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  const [hasStartedListening, setHasStartedListening] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const botNameToDisplay = "MegaPTM" // need to change this and get it from in18
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [isNextAllowed, setIsNextAllowed] = useState(true);
  const [isMute, setNotMute] = useState(true);
  const [appendix, setAppendix] = useState([]);
  const [hasOverRideId, setHasOverRideId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [langProgress, setLangProgress] = useState(getFromStorage('lang_progress', false) || null);
  const [isFetchingOldIntro, setIsFetchingOldIntro] = useState(false);
  const introMessageRef = useRef(null);
  const [showHomepage, setShowHomepage] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [shouldSendMessage, ] = useState(true);
  const [acceptedTnc, setAcceptedTnC] = useState(getFromStorage('has_accepted_tnc', false) || 'ONGOING');
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const { t } = useTranslation();


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

  let isMobile = useCustomMediaQuery('(max-width: 500px)');
  let chatToAddLength = isMobile? 10: 10;
  const [visibleItemCount, setVisibleItemCount] = useState(chatToAddLength);
  let isNewChatOpen = getFromStorage('isNewChatOpen', true);

  const isIntroPlayed = useRef(false);
  const [languageToUse, setLanguageToUse] = useState(() => {
    const savedLang =  getFromStorage('route', false);
    return savedLang ? JSON.parse(savedLang) : null;
  });

  const {
    recordings,
    HiddenRecorder,
  } = useVoiceRecord();

  const isShikshalokamPublicType = true;
 
  const shouldShowChatHistoryFeature = true;
  
  const navigate = useNavigate();




  useEffect(() => {
    if (isLoading  || acceptedTnc==="ONGOING") {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isLoading]);


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


  useEffect(() => {
    if(shouldShowChatHistoryFeature) {
      const isOldChatOpen = getFromStorage('isOldChatOpen', true);
      if(isOldChatOpen === true){
        setShowHomepage(false);
      } else if(isNewChatOpen === true){
        const showStartPage = getFromStorage('showHomepage', true);
        setShowHomepage(showStartPage !== null ? showStartPage : true);
      }
    } else{
      removeLocalChatHistory();
    }
  }, [isNewChatOpen]);


  
  async function ResetChat(e) {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);

    const currentFlow = getFromStorage('flow', false);

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
            let rerouteUrl = getFromStorage('previousUrl');
            stopAllAudio();
            clearFromStorage();
            setLanguage(languageList[0].value);
            setInStorage('local_route', JSON.stringify(languageList[0].value));
    
            if(rerouteUrl && rerouteUrl !== null && rerouteUrl !== undefined && rerouteUrl !== ""){
              window.location.href = rerouteUrl;
            } else {
              window.location.href = 'https://www.google.com';
            }
          } else {
            ResetChat();
          }
        }
      } else {
        if(wantToNavigateBack){
          window.history.pushState(null, "", window.location.href);
        }
      }
    })}
    </div>
  }


  useEffect(() => {
    let shouldPlay = false;
   if (!isLoading) {
      const currentFlow = getFromStorage('flow', false);
      
      if (
        currentFlow) {
        if(chatHistory.length > 0) {
          if( chatHistory[chatHistory.length - 1]?.source === "bot") {
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
         && !isLoading
      ) {
        shouldPlay = true;
      }
    }
    if (

      (shouldPlay) &&
       !isLoading &&
      isMute &&
      acceptedTnc && acceptedTnc !== "ONGOING"
    ) {
      const speakerButtons = document.querySelectorAll(".button-11.button-3");
      const lastSpeakerButton = speakerButtons[speakerButtons.length - 1];
  
      if (lastSpeakerButton) {
        lastSpeakerButton.click();
      }
    }
  }, [
    showHomepage,
    isLoading,
    chatHistory,
    isMute,
    acceptedTnc,    
  ]);


  useEffect(() => {
    
    setLocalChatHistory(chatHistory);
    lastBotMessageIndex.current = chatHistory?.length - 1;
  }, [chatHistory]);

  useEffect(() => {
    if(!isLoading && acceptedTnc!=="ONGOING"){
      endPageToScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLoading, acceptedTnc]);

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
  }, [ reconText, trigger, recordings]);

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
    const currentFlow = getFromStorage('flow', false);
    const handleBack = () => {
      if((acceptedTnc || acceptedTnc==="ONGOING") && currentFlow && 
      [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(currentFlow)){
        showGuestPopup(true)
      } 
    };

    window.history.pushState({ isCustom: true }, "", window.location.href);

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [navigate, acceptedTnc]);

  useEffect(() => {
    setInStorage('isChatVisible', JSON.stringify());

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
        
        let sortedResult = resp?.data?.results;

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
    } 
  }

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


  const handleTTSRequest = async (text, id, sourceLanguage) => {
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
        audio_result = await getAI4BharatAudio(text, sourceLanguage, FLOW_ROUTE);
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

  const isTyping = !!textMessage.trim();

  useEffect(() => {
    let unnarratedMessages = sentences.filter((x) => !x?.isNarrated);
    let hasUnnarratedMessages = !!unnarratedMessages?.length;
    let sourceLanguage = languageToUse;
    const tnc_status = getFromStorage('has_accepted_tnc', false);
    if (tnc_status === 'ONGOING') {
      return () => {};
    }
    if (isNextAllowed && hasUnnarratedMessages && !isLoading) {
      handleTTSRequest(
        unnarratedMessages[0].message,
        unnarratedMessages[0].id,
        sourceLanguage
      )
    }

    return () => {};
  }, [isNextAllowed, sentences, languageToUse, isLoading, acceptedTnc]);

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

  const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0);
  
    const rms = Math.sqrt(rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length);
    console.log("RMS (volume):", rms);
  
    return rms < silenceThreshold;
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
              const isSilent = await isSilentAudio(audioBlob, 0.02);

              if (!audioBlob || isSilent) {
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
              let s3Url = await handleS3Upload(audioBlob, `${getFromStorage('sessionid', true)}-${Date.now()}`, 'chatbot/companychat/', {id:null});
              if(!s3Url || s3Url === '') {
                transcriptResult = t('asrError');
              }
              setAsrAudio(s3Url);
              transcriptResult = await ai4BharatASR(s3Url, languageToUse, FLOW_ROUTE);
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

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setHasStartedRecording(false);
    }
  };


  function stopAllAudio(){
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }

  function handleAcceptTnC() {    
    setInStorage('has_accepted_tnc', true);
    setAcceptedTnC(true);
  }

  return (
    <>
    <SpeedNotification />
    <Notification />
      {(getFromStorage('route') && acceptedTnc==="ONGOING" && !isLoading && getFromStorage('flow', false) && 
        [sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false))
      )&& 
        <PrivacyPolicyPopup 
          tncText={t('tncText')}  
          onAccept={handleAcceptTnC} useStaticText={false}
        />
      }
      <></>
      <div className={`div27`}>
     
        <div className={isMobile? 'div30_a': 'div30'}>
          <MainHeader
            isMobileFirst={isMobile}
            showTheDots={false}
            content={
              
                <button
                  onClick={async (e) => {
                    if ([sessionFlowName.GuestDiscussion, sessionFlowName.GuestMiStory].includes(getFromStorage('flow', false))) {
                      showGuestPopup();
                    } else {
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
            }
          />
        </div>
      </div>
      {(isLoading)&& <div className="loader-load-spinner">
        <div className="div67">
          <BiLoader className="loader-rotate-loader loader-icon" />
          {isPdfDownloading&& 
            <div className="div68">
              <label className="form-label label1">{t('downloadLoader')}</label>
            </div>
          }
          
        </div>
      </div> }
  
      <div>
     
        <HiddenRecorder />
        <div
          className={`div33 div9`}
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
                      (chat.source === "bot") && (i === chatHistory.length - 1)
                    }
                    handleOnStopSpeaking={() => handleOnStopSpeaking()}
                    handleOnSpeaking={() =>{
                      handleOnSpeaking(chat?.msg, chat?.updated_at)}
                    }
                    isAnyPlaying={!!hasOverRideId}
                    isPlaying={hasOverRideId === chat?.updated_at}
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
                      handleOnStopSpeaking={() => handleOnStopSpeaking()}
                      handleOnSpeaking={() =>{
                        handleOnSpeaking(chatHistory[0]?.msg, chatHistory[0]?.updated_at)}
                      }
                      isAnyPlaying={!!hasOverRideId}
                      isPlaying={hasOverRideId === chatHistory[0]?.updated_at}
                      setNotMute={setNotMute}
                      chatId={chatHistory[0]?.updated_at}
                    />
                  </div>
                </div>
              )}
            </>
          }
    
          
        </div>

        {(!isLoading && (llmError==='' || !llmError) && 
         Array.isArray(chatHistory) &&
         chatHistory.some(item => item && Object.keys(item).length > 0)
        )&&       
          <form
            className="div39 form-1 sm:p-[10px_35px] p-[10px_25px]"
            onSubmit={(event)=>{
              if(!hasStartedListening && !isFetchingData){
                // next question + saving
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
                autoFocus={false}
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
                onFocus={() => {
                  setTimeout(() => {
                    handleScrollToView();
                    if (textAreaRef.current) {
                      textAreaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
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
            {(isTyping && !hasStartedListening && !isFetchingData) ? (
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
              <div className= {`audio-recorder ${isFetchingData ? 'button-container' : ''}`}>
                <button
                  type="button"
                  onClick={hasStartedRecording ? stopRecording : startRecording}
                  disabled={isFetchingData}
                  className={`button-7 sm:ml-[1.3rem] ml-[0.8rem] ${hasStartedRecording ? 'button-8' : 'button-9'}`}
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

export default PTMVoiceBasedChat;