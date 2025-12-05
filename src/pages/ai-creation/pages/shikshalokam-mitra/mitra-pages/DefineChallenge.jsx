import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
/* hooks */
import useVoiceRecord from "../../text-voice/useVoiceRecord";
import { useAudio } from "../../../../../hooks/useAudio";
/* utils and api services */
import { clearMitraLocalStorage, ShowLoader } from "../MainPage";
import {
  getNewSessionID,
  saveUserChatsInDB,
} from "../../../../../api/endpoints/chat_flow";

import { getAI4BharatAudioApi } from "api/endpoints/ai";
import { handleS3Upload } from "../../../../../services/storage_service";
import { ai4BharatASRApi } from "api/endpoints/ai";

/* components */
import ChatBox from "./components/ChatBox";
import WelcomeCard from "./components/WelcomeCard";
import InitialConversationCard from "./components/InitialConversationCard";
import ChatWindow from "./components/ChatWindow";
import Notification, {
  showNotification,
} from "../../../../../components/ToastMessage/TotastMessage";
/* constants */
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants";
import { FIRST_BOT_MESSAGE } from "../../../constants/mitra-chat";

import { bot_routes } from "configure";
import { useAICreationSessionStore } from "store";
import { useSiteDataLocalStore } from "store";
import { API_ENDPOINTS } from "constants/urls";
import { apiClient } from "api/client";

const sessionRoute = "/guided_guest";


const wss_protocol =
  window.location.protocol === "https:" ? "wss://" : "wss://";

const { BOT, USER } = CONVERSATION_USER_TYPES;

const DefineChallenge = ({
  setIsLoading,
  setCurrentPageValue,
  isReadOnly,
  userDetail,
  handleGoForward,
  // startRecording,
  // stopRecording,
  // hasStartedRecording,
  isDefineChallengeSection = false,
  handleScrollIntoView,
  scrollRef,
}) => {
  const { t } = useTranslation("ai_creation_translation");
  const [profileToUse, setProfileToUse] = useState(
    useAICreationSessionStore.getState().getProfileId() || null
  );
  const lastBotMessageIndex = useRef(-1);
  let access_token = sessionStorage.getItem("accToken");

  const localChatHistory = useAICreationSessionStore.getState().getChatHistory();
  const [chatHistory, setChatHistory] = useState(
    !!localChatHistory?.length ? localChatHistory : []
  );
  const [chatSocket, setChatSocket] = useState(null);
  const [textMessage, setTextMessage] = useState("");
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [reconText, setReconText] = useState("");
  const [isStreamingComplete, setIsStreamingComplete] = useState(true);
  const [audioCache, setAudioCache] = useState({});
  const [hasStartedListening, setHasStartedListening] = useState(false);
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
  const [isChatVisible, setIsChatVisible] = useState(() => {
    const storedVisibility = useAICreationSessionStore.getState().getIsChatVisible()
    return storedVisibility !== null ? JSON.parse(storedVisibility) : false;
  });
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [isIntroLoading, setIsIntroLoading] = useState(false);
  const [isFetchingOldIntro, setIsFetchingOldIntro] = useState(false);

  const introMessageRef = useRef(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [shouldSendMessage] = useState(true);
  const [userName, setUserName] = useState(
    useAICreationSessionStore.getState().getFirstName() || null
  );
  const [useTextbox, setUseTextbox] = useState(false);
  const [shouldMoveForward, setShouldMoveForward] = useState("no");

  const [languageToUse, setLanguageToUse] = useState(
    useSiteDataLocalStore().getChatLanguage() || "en"
  );
  const textInputRef = useRef(null);

  const { recordings, HiddenRecorder } = useVoiceRecord();
  const [storyData, setStoryData] = useState(null);
  const [asrAudio, setAsrAudio] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const { stopAllAudio, audioRef } = useAudio();


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
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setHasStartedRecording(false);
    }
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
                  message: t("common.failedToCaptureSpeech"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold", width: "80%" },
                  },
                });
                return;
              }

              setIsFetchingData(true);
              let transcriptResult = "";
              const sessionId = useAICreationSessionStore.getState().getSession;

              let s3Url = await handleS3Upload(
                audioBlob,
                `${Date.now()}`,
                `chatbot/companychat/${sessionId}/`,
                storyData
              );
              if (!s3Url || s3Url === "") {
                transcriptResult = t("common.failedToCaptureSpeech");
              }
              setAsrAudio(s3Url);
              let storedRoute = sessionRoute;
              transcriptResult = await ai4BharatASRApi(
                s3Url,
                languageToUse,
                storedRoute
              );
              if (!transcriptResult || transcriptResult === "") {
                showNotification({
                  message: t("common.failedToCaptureSpeech"),
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

  const navigate = useNavigate();
  const {
    setSystemError: setSystemErrorStore,
    setProfileId: setProfileIdStore,
    setFirstName: setFirstNameStore,
    setCompany: setCompanyStore,
    setSession: setSessionStore,
    setChatHistory: setChatHistoryStore,
    setIsChatVisible: setIsChatVisibleStore,
    setIntroMessage: setIntroMessageStore,
    setBotName: setBotNameStore,
    setObjective: setObjectiveStore,
    setObjectiveSource: setObjectiveSourceStore,
    setChunks: setChunksStore,
    setSelectedObjective: setSelectedObjectiveStore,
    setHasClickedObjAddMore: setHasClickedObjAddMoreStore,
    setUserProblemStatement: setUserProblemStatementStore,
    setIntroEndContext: setIntroEndContextStore,
  } = useAICreationSessionStore.getState()


  function compareById(a, b) {
    return a.id - b.id;
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

  async function getCompanyChatApi(currentSession) {
    const resp = await apiClient.get(`/${API_ENDPOINTS.GET_COMPANY_CHAT}?session=${currentSession}`, {});
    return resp;
  }

  async function handleCompanyChatCall(currentSession) {
    const storedChatHistory = useAICreationSessionStore.getState().getChatHistory();
    if (storedChatHistory && storedChatHistory?.length >= 1) {
      return;
    }

    setIsLocalLoading(true);
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
            source: "bot",
            isNarrated: true,
            id: "intro_msg_id",
          },
        ]);

        newChatSessionDetail.push({
          msg: temp_intro,
          source: "bot",
          updated_at: "intro_msg_id",
        });

        introMessageRef.current = "";
      }

      sortedResult.forEach((chats) => {
        let messageToUse = chats?.message;
        if (chats?.translated_message && chats?.translated_message !== "") {
          messageToUse = chats?.translated_message;
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

      setChatHistory((prev) => {
        const existingMessages = new Set(prev.map((msg) => msg.msg));
        const filteredItems = newChatHistoryItems.filter(
          (item) => !existingMessages.has(item.msg)
        );
        return [...prev, ...filteredItems];
      });

      lastBotMessageIndex.current += newChatSessionDetail.length;
    } catch (error) {
      console.error("Error fetching company chat data:", error);
    } finally {
      setIsLocalLoading(false);
      setIsFetchingOldIntro(false);
    }
  }

  useEffect(() => {
    async function createUserProfile() {
      try {
        setIsLocalLoading(true);
        const headers = {
          "Content-Type": "application/json",
        };
        let body = {
          access_token: access_token,
        };

        const response = await apiClient.post(API_ENDPOINTS.CREATE_USER_PROFILE,
          body,
          { headers }
        );

        if (response && response?.status === 200) {
          const data = response?.data.profile_details;
          setProfileIdStore(data?.id)
          // localStorage.setItem("profileid", data?.id);
          setProfileToUse(data?.id);
          setFirstNameStore(data?.first_name)
          setCompanyStore(data?.company?.slug)
          setUserName(JSON.stringify(data?.first_name));
        } else {
          clearMitraLocalStorage();
          navigate(-1);
        }
      } catch (error) {
        console.error(error?.response?.data || error);
        clearMitraLocalStorage();
      } finally {
        setIsLocalLoading(false);
      }
    }

    if (!profileToUse && access_token) {
      createUserProfile();
      setShouldFetchIntro(true);
      setIsStreamingComplete(true);
    }
    const getSessionId = async () => {
      let sessionid = useAICreationSessionStore.getState().getSession();
      if (!sessionid) {
        let session = await getNewSessionID();
        setSessionStore(session)
      }

      const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || {};

      const language = preferredLanguage?.value || "en";
      // localStorage.setItem("route", JSON.stringify(language));
      sessionStorage.setItem("route", JSON.stringify(language) )
      setLanguageToUse(language);

      // let currentSession = getEncodedSessionStorage("session");
      // await handleCompanyChatCall(currentSession);
    };
    getSessionId();
  }, [access_token, profileToUse]);

  useEffect(() => {
    if (isFetchingOldIntro) {
      let temp_intro_message = useAICreationSessionStore.getState().getIntroMessage();
      introMessageRef.current = temp_intro_message;
    }
  }, [isFetchingOldIntro]);

  useEffect(() => {
    setShouldFetchIntro(true);
    setIsStreamingComplete(true);
    if (isDefineChallengeSection) handleScrollIntoView();
  }, []);

  const MakeSocketConnection = useCallback(
    (currentTextMessage, currentSocket) => {
      return new Promise((resolve, reject) => {
        try {
          if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            return resolve(chatSocket);
          } else if (
            currentSocket &&
            currentSocket.readyState === WebSocket.OPEN
          ) {
            return resolve(currentSocket);
          }
          let socket;

          let url = `${wss_protocol}${process.env.REACT_APP_WEBSOCKET_HOST}/ws/mitra/`;

          socket = new WebSocket(url);

          socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            const message = data["text"];

            if (message.source === "bot") {
              setIsStreamingComplete(false);
              const validation = message?.extra_content?.validation;
              const should_move_forward =
                message?.extra_content?.should_move_forward;
              const userProblemStatement =
                message?.extra_content?.problem_statement;
              setUserProblemStatementStore(userProblemStatement)
              if (message?.msg !== "") {
                setSentences((prevSentences) => {
                  let updatedSentences = [...prevSentences];

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
                      validation: validation || "",
                      shouldMoveForward: should_move_forward,
                      problemStatement: userProblemStatement || "",
                    });
                    lastBotMessageIndex.current = updatedSentences.length - 1;
                  }
                  return updatedSentences;
                });

                setChatHistory((prevChatHistory) => {
                  const updatedChatHistory = [...prevChatHistory];

                  if (
                    updatedChatHistory.length > 0 &&
                    updatedChatHistory[updatedChatHistory.length - 1]
                      ?.source === "bot"
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
                      validation: validation || "",
                      shouldMoveForward: should_move_forward,
                      problemStatement: userProblemStatement || "",
                    });
                  }
                  return updatedChatHistory;
                });
              }

              setShouldMoveForward(should_move_forward);
              // handleScrollToView();
            } else {
              setIsStreamingComplete(false);
            }

            if (message.finish_reason === "stop" && message.source === "bot") {
              // handleScrollToView();
              setTalking(0);
              setIsStreamingComplete(true);
              setChatHistory((prevState) => {
                const updatedChatHistory = prevState?.map((chat, index) => {
                  if (index === prevState?.length - 1) {
                    return {
                      ...chat,
                      shouldMoveForward: "yes",
                    };
                  }
                  return chat;
                });
                setChatHistoryStore(updatedChatHistory)
                return updatedChatHistory;
              });
            }
          };

          socket.onopen = () => {
            setChatSocket(socket);
            let profileid = useAICreationSessionStore.getState().getProfileId();
            let sessionid = useAICreationSessionStore.getState().getSession();
            let route = JSON.parse(sessionStorage.getItem("route"));
            if (sessionid) {
              socket.send(
                JSON.stringify({
                  type: "authenticate",
                  sessionid: sessionid,
                  profileid: profileid,
                  access_token: access_token,
                  route: route,
                })
              );
            }
            resolve(socket);
          };

          socket.onclose = (event) => {};

          socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            socket.close();
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
      return;
    }
    reconnectAttempts++;
    setTimeout(() => {
      MakeSocketConnection(currentTextMessage)
        .then((newSocket) => {
          reconnectAttempts = 0;
          if (currentTextMessage && currentTextMessage.trim() !== "") {
            handleSendMessage(null, newSocket);
          }
        })
        .catch((error) => {
          console.error("Reconnection Failed:", error);
        });
    }, 1000);
  }

  useEffect(() => {
    if (chatHistory?.length !== 0) {
      setIsChatVisibleStore(true)
      setIsChatVisible(true);
    }
  }, []);

  const setReadData = useCallback(async () => {
    let storedRoute = "/mitra-create";
    let data = await getTranslatedIntroMessage(storedRoute);
    let message = data[0]?.alt_introductory_message;

    if (
      message &&
      !!message?.trim() &&
      chatHistory[chatHistory?.length - 1]?.msg !== message
    ) {
      setIntroEndContextStore(message)
      saveUserChatsInDB(message, useAICreationSessionStore.getState().getSession(), "bot");

      setSentences((prevSentences) => [
        ...prevSentences,
        {
          message,
          source: "bot",
          isNarrated: false,
          id: new Date().valueOf(),
          validation: "",
          shouldMoveForward: "no",
          problemStatement: "",
        },
      ]);

      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        {
          msg: message,
          source: "bot",
          updated_at: new Date().valueOf(),
          validation: "",
          shouldMoveForward: "no",
          problemStatement: "",
        },
      ]);
    }
  }, [chatHistory, setChatHistory, setSentences]);

  useEffect(() => {
    const botName = useAICreationSessionStore.getState().getBotName();
    setBotNameToDisplay(botName);
  }, []);

  async function getCompanyDetail() {
    if (!profileToUse) return "shikshalokamstaging";
    const res = await apiClient.get(`${API_ENDPOINTS.PROFILE_USER}${profileToUse}/`, {});

    return res?.data?.company?.slug;
  }

  async function getTranslatedIntroMessage(storedRoute) {
    let translate_api_url = `${API_ENDPOINTS.BOT_VERNACULAR}?language=${languageToUse}&company_bot__route=${storedRoute}`;
    try {
      const response = await apiClient.get(translate_api_url, {});
      return response?.data?.results;
    } catch (error) {
      console.error("Error fetching AI4Bharat audio:", error);
      throw error;
    }
  }

  useEffect(() => {
    if (shouldMoveForward === "yes") {
      // setIsLoading(true);
      setCurrentPageValue(1);
    }
  }, [shouldMoveForward]);

  useEffect(() => {
    const fetchBotInfo = async () => {
      setIsIntroLoading(true);
      let companyName = await getCompanyDetail();
      try {
        const response = await apiClient.get(API_ENDPOINTS.GET_COMPANY_BOT, {
          params: {
            company__slug: companyName,
          },
        });
        const bots = response?.data?.results;

        if (bots) {
          let storedRoute = "/mitra-create";
          let selectedBot = bots.find((bot) => bot.route === storedRoute);
          if (!selectedBot) {
            selectedBot = bots[0] || { route: "/mitra-create" };
          }
          const botName = selectedBot?.name || "Bot";
          setBotNameStore(botName)
          setBotNameToDisplay(botName);
        }

        if (!shouldFetchIntro || chatHistory?.length) return;
        let storedRoute = "/mitra-create";

        if (languageToUse && bots && bots.length > 0) {
          let latestBot;
          for (const bot of bots) {
            if (bot.route === storedRoute) {
              latestBot = bot;
            } else if (
              !latestBot ||
              new Date(bot.created_at) > new Date(latestBot.created_at)
            ) {
              latestBot = bot;
            }
          }
          if (!latestBot) {
            handleFirstMessage("");
            return;
          }
          let firstName = useAICreationSessionStore.getState().getFirstName() || "";

          let data = await getTranslatedIntroMessage(storedRoute);
          setSystemErrorStore(data[0]?.error_message)
          let message = FIRST_BOT_MESSAGE;
          const botName = data[0]?.name || "Bot";
          // localStorage.setItem("botName", botName);
          setBotNameStore(botName)
          setBotNameToDisplay(botName);

          if (message && firstName) {
            const words = message.split(" ");
            words.splice(1, 0, firstName);
            message = words.join(" ");
          }

          if (
            message &&
            !!message?.trim() &&
            chatHistory[chatHistory?.length - 1]?.msg !== message
          ) {
            setIntroMessageStore(message)
            setSentences((prev) => [
              ...prev,
              {
                message: message,
                isNarrated: false,
                id: new Date().valueOf(),
              },
            ]);
          }
        }
      } catch (error) {
        console.error({ error });
      }
    };

    if (
      chatHistory?.length === 0 &&
      shouldFetchIntro &&
      // profileToUse &&
      languageToUse
    ) {
      fetchBotInfo().then(() => {
        setShouldFetchIntro(false);
        setIsIntroLoading(false);
      });
    }
    return () => {};
  }, [shouldFetchIntro, profileToUse, languageToUse, userName]);

  useEffect(() => {
    setChatHistoryStore(chatHistory)
    lastBotMessageIndex.current = chatHistory?.length - 1;
    // handleScrollToView();
  }, [chatHistory]);

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
      if (!!reconText) {
        setReconText("");
      }
    } catch (error) {
      console.error({ error });
    }
  }, [chatSocket, reconText, recordings]);

  useEffect(() => {
    if (audioRef?.current) {
      if (isMute) {
        audioRef.current.muted = true;
      } else {
        audioRef.current.muted = false;
      }
    }
  }, [isMute]);

  useEffect(() => {
    setIsChatVisibleStore(isChatVisible)
  }, [isChatVisible]);

  useEffect(() => {
    if (useTextbox && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [useTextbox]);

  const handleSendMessage = useCallback(
    async (event, currentSocket) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      localStorage.removeItem("llmError");
      try {
        const socket = await MakeSocketConnection(textMessage, currentSocket);

        setIsChatVisible(true);
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
          })
        );

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

  const handleAI4BharatTTSRequest = async (text, id, sourceLanguage) => {
    try {
      let cachedAudioUrl = audioCache[id];
      let audio_result = "";
      let audio;

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
        audio_result = await getAI4BharatAudioApi(text, sourceLanguage, bot_routes.mitra_create);
        if (audio_result?.length) {
          cachedAudioUrl = `data:audio/wav;base64,${audio_result}`;
          setAudioCache((prevCache) => ({
            ...prevCache,
            [id]: cachedAudioUrl,
          }));
        }
      }

      if (cachedAudioUrl) {
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
    }
  };

  const isTyping = !!textMessage.trim();

  useEffect(() => {
    let unnarratedMessages = sentences.filter((x) => !x?.isNarrated);
    let hasUnnarratedMessages = !!unnarratedMessages?.length;
    let sourceLanguage = languageToUse;

    if (isNextAllowed && hasUnnarratedMessages) {
      handleAI4BharatTTSRequest(
        unnarratedMessages[0].message,
        unnarratedMessages[0].id,
        sourceLanguage
      );
    }

    return () => {};
  }, [isNextAllowed, sentences, languageToUse]);

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
    if (isDefineChallengeSection) handleScrollIntoView();
    return () => {};
  }, [appendix, chatHistory]);

  const handleFirstMessage = ({ message, category }) => {
    try {
      if (category === "special") {
        return;
      }
      // handleScrollToView();
    } catch (error) {
      console.error({ error });
    }
  };

  const handleOnSpeaking = async (text, id, staticMsg) => {
    try {
      try {
        if (!!audioRef.current) await audioRef.current.pause();
      } catch (error) {
        console.error({ error });
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

  const isWelcomeScreen = useMemo(() => {
    return !!(
      chatHistory &&
      chatHistory.length === 1 &&
      chatHistory[0]?.source === BOT
    );
  }, [chatHistory]);

  return (
    <>
      {(isLocalLoading || isIntroLoading) && <ShowLoader />}
      <HiddenRecorder />
      <Notification />
      {isWelcomeScreen ? (
        <div>
          <WelcomeCard />
          <InitialConversationCard
            textInputRef={textInputRef}
            textMessage={textMessage}
            handleOnInputText={handleOnInputText}
            setUseTextbox={setUseTextbox}
            handleSendMessage={handleSendMessage}
            inputDisabled={isFetchingData || hasStartedRecording}
            hasStartedRecording={hasStartedRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            isFetchingData={isFetchingData}
            seconds={seconds}
          />
        </div>
      ) : (
        <div className={isDefineChallengeSection ? "flex flex-col h-full" : ""}>
          <ChatWindow
            isTalking={isTalking}
            handleOnSpeaking={handleOnSpeaking}
            handleOnStopSpeaking={handleOnStopSpeaking}
            botNameToDisplay={botNameToDisplay}
            isStreamingComplete={isStreamingComplete}
            setNotMute={setNotMute}
            userDetail={userDetail}
            chatHistory={chatHistory}
            isReadOnly={isReadOnly}
            hasStartedListening={hasStartedListening}
            hasOverRideId={hasOverRideId}
            isDefineChallengeSection={isDefineChallengeSection}
            scrollRef={scrollRef}
          />
          {isDefineChallengeSection && (
            <div className="mt-auto">
              <ChatBox
                textInputRef={textInputRef}
                textMessage={textMessage}
                handleOnInputText={handleOnInputText}
                setUseTextbox={setUseTextbox}
                handleSendMessage={handleSendMessage}
                disabled={isFetchingData || hasStartedRecording}
                hasStartedRecording={hasStartedRecording}
                startRecording={startRecording}
                stopRecording={stopRecording}
                isFetchingData={isFetchingData}
                seconds={seconds}
                isReadOnly={!isDefineChallengeSection}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DefineChallenge;

/* eslint-disable react-hooks/exhaustive-deps */

export const createMessage = ({
  updated_at = Date.now(),
  source = "bot" || "user",
  msg = "",
  validation = "",
}) => ({
  updated_at,
  source,
  msg,
  validation,
});
