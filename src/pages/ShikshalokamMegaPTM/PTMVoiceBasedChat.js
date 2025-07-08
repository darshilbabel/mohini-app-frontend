/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { MdSend } from "react-icons/md";
import useVoiceRecord from "../interview-text-voice/useVoiceRecord";
import { createMessage } from "../interview-voice";
import { BiLoader } from "react-icons/bi";
import {
  ai4BharatASR,
  getAI4BharatAudio,
  getSessionDetails,
  savePTMQuestion,
} from "../../services/api.service";
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa";
import "../../style.css";
import "../ShikshalokamVoiceChat/shikshaChatStyle.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../i18n";
import Notification, {
  showNotification,
} from "../../components/ToastMessage/TotastMessage";
import {
  languageList,
  PTM_CONVERSATION_STATUS_TYPE,
} from "../ShikshalokamVoiceChat/enum";
import PrivacyPolicyPopup from "../../components/TnC/privacyPolicyPopup";
import { FaCircle } from "react-icons/fa6";
import {
  clearFromStorage,
  getFromStorage,
  handleS3Upload,
  setInStorage,
} from "../../services/storage_service";
import ChatMessage from "./ChatMessage";
import useCustomMediaQuery from "../../hooks/useCustomMediaQuery";
import SpeedNotification from "./SpeedNotification";
import useSmartChatStorage from "../../hooks/useSmartChatStorage";
import questions from "./../../services/const/questions";
import ROUTES from "../../url";
import Header from "../ShikshalokamVoiceChat/shikshaChatHeader";

const PTMVoiceBasedChat = () => {
  const audioRef = useRef();
  const textAreaRef = useRef(null);
  const lastBotMessageIndex = useRef(-1);
  const FLOW_ROUTE = "/mega_ptm";
  const { t } = useTranslation();

  const [localChatHistory, setLocalChatHistory, removeLocalChatHistory] =
    useSmartChatStorage();
  const [chatHistory, setChatHistory] = useState(
    !!localChatHistory?.length ? localChatHistory : []
  );
  const [textMessage, setTextMessage] = useState("");
  const [asrAudio, setAsrAudio] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [reconText, setReconText] = useState("");
  const [audioCache, setAudioCache] = useState({});
  const [hasStartedListening, setHasStartedListening] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const botNameToDisplay = t("botName"); // need to change this and get it from in18
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [isNextAllowed, setIsNextAllowed] = useState(true);
  const [isMute, setNotMute] = useState(true);
  const [hasOverRideId, setHasOverRideId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTnc, setAcceptedTnC] = useState(
    getFromStorage("has_accepted_tnc", true)
  );
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const questionCounter = useRef(1);

  const endPageToScrollRef = useRef(null);

  const [fileErrorText, setFileErrorText] = useState("");

  let isMobile = useCustomMediaQuery("(max-width: 500px)");
  let chatToAddLength = isMobile ? 10 : 10;
  const [visibleItemCount, setVisibleItemCount] = useState(chatToAddLength);
  const [languageToUse, setLanguageToUse] = useState(() => {
    const savedLang = getFromStorage("local_route", false);
    return savedLang ? JSON.parse(savedLang) : null;
  });

  const { recordings, HiddenRecorder } = useVoiceRecord();

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isLoading]);

  useEffect(() => {
    setVisibleItemCount(chatToAddLength);
  }, [chatToAddLength]);

  useEffect(() => {}, [visibleItemCount]);

  useEffect(() => {
    const last_question = chatHistory
      .filter((x) => x?.source === "bot")
      .sort((a, b) => b?.updated_at - a?.updated_at)[0];
    if (last_question?.sequence) {
      questionCounter.current = last_question?.sequence;
    }
    if (
      !chatHistory[chatHistory.length - 1]?.source ||
      chatHistory[chatHistory.length - 1]?.source !== "bot"
    ) {
      if (!(last_question?.sequence >= Object.keys(questions).length)) {
        sendQuestionToUser();
      }
    }
  }, []);

  useEffect(() => {
    const textErrorTime = setTimeout(() => {
      setFileErrorText("");
    }, 5000);

    return () => {
      clearTimeout(textErrorTime);
    };
  }, [fileErrorText]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textMessage]);

  useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 500);
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
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const narrateLastMessage = () => {
    try {
      const speakerButtons = document.querySelectorAll(".button-11.button-3");
      const lastSpeakerButton = speakerButtons[speakerButtons.length - 1];

      if (lastSpeakerButton) {
        lastSpeakerButton.click();
      }
    } catch (error) {
      console.error("Error narrating last message:", error);
    }
  };

  useEffect(() => {
    if (
      !(
        questionCounter.current === Object.keys(questions).length &&
        chatHistory.length === Object.keys(questions).length * 2
      )
    ) {
      if (
        chatHistory[chatHistory.length - 1]?.source === "bot" &&
        acceptedTnc
      ) {
        setTimeout(() => {
          narrateLastMessage();
        }, 500);
      }
    }
    return () => {};
  }, [chatHistory, acceptedTnc]);

  const sendQuestionToUser = async () => {
    try {
      const profileId = getFromStorage("profileid", true);
      const flow = getFromStorage("flow", false);
      let sessionId = getFromStorage("sessionid", true);
      const selected_question = questions[`${questionCounter.current}`];
      const current_questions = selected_question.questions;
      const question_to_use = current_questions[0];
      const question = question_to_use.title[languageToUse];

      const bot_messsage = {
        sequence: selected_question.sequence,
        translated_question:
          languageToUse !== "en" ? question_to_use?.title?.en : null,
        session: sessionId,
        flow: flow,
        profile_id: profileId,
        id: selected_question.id,
        msg: question.text,
        audio: question.audio,
        source: "bot",
        updated_at: Date.now(),
        question_id: question_to_use.variant_id,
      };

      setChatHistory((prev) => [...prev, bot_messsage]);
      setInStorage("chatbot_clickedOn?", "true", flow);
      setInStorage("isOldChatOpen", JSON.stringify(true), flow);
      setInStorage("sessionid", JSON.stringify(sessionId), flow);
      setInStorage("isNewChatOpen", JSON.stringify(false), flow);
    } catch (error) {
      console.error("Error sending question to user:", error);
      showNotification({
        message: t("errorSendingQuestion"),
        type: "error",
        options: {
          position: "top-center",
          autoClose: 4000,
          style: { fontWeight: "bold" },
        },
      });
    }
  };
  async function resetChatState(e) {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);

    const currentFlow = getFromStorage("flow", false);

    removeLocalChatHistory();
    setInStorage("isOldChatOpen", JSON.stringify(false), currentFlow);

    const session = await getSessionDetails();
    setInStorage("sessionid", JSON.stringify(session.sessionid), currentFlow);
    setInStorage("chatbot_clickedOn?", "", currentFlow);
    setIsLoading(false);
  }

  function showInterruptionPopup(wantToNavigateBack, executeCustomFunction) {
    <div className="div-popup">
      {Swal.fire({
        title: t("guestPopUpChanges"),
        showCancelButton: true,
        confirmButtonText: t("confirmChanges"),
        cancelButtonText: t("denyButton"),
      }).then((result) => {
        if (result.isConfirmed) {
          if (executeCustomFunction) {
            executeCustomFunction();
          } else {
            if (wantToNavigateBack) {
              let rerouteUrl = getFromStorage("previousUrl");
              stopAllAudio();
              clearFromStorage();
              setLanguage(languageList[0].value);
              setInStorage(
                "local_route",
                JSON.stringify(languageList[0].value)
              );

              if (
                rerouteUrl &&
                rerouteUrl !== null &&
                rerouteUrl !== undefined &&
                rerouteUrl !== ""
              ) {
                window.location.href = rerouteUrl;
              } else {
                navigate(ROUTES.SHIKSHALOKAM_PTM_HOME_PAGE);
              }
            } else {
              resetChatState();
            }
          }
        } else {
          if (wantToNavigateBack) {
            window.history.pushState(null, "", window.location.href);
          }
        }
      })}
    </div>;
  }

  function showCompletionPopup() {
    <div className="div-popup">
      {Swal.fire({
        title: t("ptmCompletionMessage"),
        showCancelButton: true,
        confirmButtonText: t("ptmCompletionCTA"),
        showCloseButton: false,
        showCancelButton: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        imageUrl:
          "https://static-media.gritworks.ai/fe-images/PNG/Shikshalokam/check-mark.png",
        imageHeight: "100",
      }).then((result) => {
        if (result.isConfirmed) {
          clearFromStorage();
          setInStorage("local_route", JSON.stringify(languageList[0].value));
          setLanguage(languageList[0].value);
          stopAllAudio();
          navigate(ROUTES.SHIKSHALOKAM_PTM_HOME_PAGE);
        }
      })}
    </div>;
  }

  useEffect(() => {
    // if it's completed -> show guest popup with correct message -> remove option to chat
    // they can click on + to open new chat
    if (
      questionCounter.current === Object.keys(questions).length &&
      chatHistory.length === Object.keys(questions).length * 2
    ) {
      showCompletionPopup();
    }
  }, [chatHistory]);

  useEffect(() => {
    const handleBack = () => {
      showInterruptionPopup(true);
    };

    window.history.pushState({ isCustom: true }, "", window.location.href);

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  useEffect(() => {
    setLocalChatHistory(chatHistory);
    lastBotMessageIndex.current = chatHistory?.length - 1;
  }, [chatHistory]);

  useEffect(() => {
    if (acceptedTnc === true) {
      handleScrollToView();
    }
  }, [chatHistory?.length, acceptedTnc]);

  useEffect(() => {
    try {
      if (!!trigger && !!reconText) {
        setReconText("");
        setTrigger(false);
      }
    } catch (error) {
      console.error({ error });
    }
  }, [reconText, trigger, recordings]);

  useEffect(() => {
    if (audioRef?.current) {
      if (isMute) {
        audioRef.current.muted = true;
      } else {
        audioRef.current.muted = false;
      }
    }
  }, [isMute]);

  const handleScrollToView = () => {
    try {
      document?.querySelector("#last-chat-boundary")?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      console.error({ error });
    }
  };

  const handleOnInputText = (e) => {
    e.preventDefault();
    setTextMessage(e.target.value);

    if (e.target.value.trim() === "") {
      setHasStartedListening(false);
    }
  };

  const handleTTSRequest = async (_audio, id, sourceLanguage) => {
    try {
      async function handleSpeaking(cachedAudioUrl) {
        let audio = null;
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
      }
      let cachedAudioUrl = audioCache[id];
      if (isMute && !hasOverRideId) {
        setSentences((prev) => {
          let all_sentences = JSON.parse(JSON.stringify([...prev]));
          return all_sentences.map((x) => ({ ...x, isNarrated: true }));
        });
        setIsNextAllowed(true);
        setHasOverRideId(null);
        return;
      }
      if(_audio?.length){
      if (!cachedAudioUrl) {
        fetch(_audio)
          .then((res) => res.text())
          .then((base64) => {
            cachedAudioUrl = `data:audio/mpeg;base64,${base64}`;
            setAudioCache((prevCache) => ({
              ...prevCache,
              [id]: cachedAudioUrl,
            }));
            handleSpeaking(cachedAudioUrl);
          })
          .catch((err) => {
            console.error("Error fetching audio:", err);
          });
      } else {
        handleSpeaking(cachedAudioUrl);
      }}
    } catch (error) {
      console.error("Error in handleAI4BharatTTSRequest:", error);
      handleOnStopSpeaking();
    }
  };

  const isTyping = !!textMessage.trim();

  useEffect(() => {
    let unnarratedMessages = sentences.filter((x) => !x?.isNarrated);
    let hasUnnarratedMessages = !!unnarratedMessages?.length;
    let sourceLanguage = languageToUse;

    if (isNextAllowed && hasUnnarratedMessages && !isLoading) {
      handleTTSRequest(
        unnarratedMessages[0].message,
        unnarratedMessages[0].id,
        sourceLanguage
      );
    }

    return () => {};
  }, [isNextAllowed, sentences, languageToUse, isLoading, acceptedTnc]);

  const handleOnSpeaking = async (audio, id) => {
    try {
      try {
        if (!!audioRef.current) await audioRef.current.pause();
      } catch (error) {
        console.error({ error });
      }

      setHasOverRideId(id);
      setIsNextAllowed(true);
      setSentences((prev) => {
        return [
          {
            message: audio,
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
    return rms < silenceThreshold;
  };

  useEffect(() => {
    if (acceptedTnc === false) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [acceptedTnc]);

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
                    autoClose: 4000,
                    style: { fontWeight: "bold" },
                  },
                });
                return;
              }

              setIsFetchingData(true);
              let transcriptResult = "";
              let s3Url = await handleS3Upload(
                audioBlob,
                `${Date.now()}`,
                `chatbot/companychat/${getFromStorage("sessionid", true)}/`,
                null
              );
              if (!s3Url || s3Url === "") {
                transcriptResult = t("asrError");
              }
              setAsrAudio(s3Url);
              transcriptResult = await ai4BharatASR(
                s3Url,
                languageToUse,
                FLOW_ROUTE
              );
              if (!transcriptResult || transcriptResult === "") {
                showNotification({
                  message: t("asrError"),
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
          console.error("Error accessing microphone:", err);
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

  function stopAllAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current.muted = true;
      audioRef.current.currentTime = 0;
      setHasOverRideId(null);
      setSentences([]);
      setIsNextAllowed(true);
      setNotMute(true);
      setHasStartedListening(false);
      setHasStartedRecording(false);
      setTextMessage("");
      setAsrAudio(null);
      setIntervalId(null);
      setSeconds(0);
      setMediaRecorder(null);
      if (textAreaRef.current) {
        textAreaRef.current.value = "";
        textAreaRef.current.style.height = "auto";
      }
      audioRef.current = null;
    }
  }

  function handleAcceptTnC() {
    setInStorage("has_accepted_tnc", true);
    setAcceptedTnC(true);
  }
  const isReplying =
    !hasStartedListening &&
    chatHistory[chatHistory?.length - 1]?.source === "user" &&
    !(
      chatHistory[chatHistory.length - 1].sequence >=
      Object.keys(questions).length
    );
  return (
    <>
      <SpeedNotification />
      <Notification />
      {getFromStorage("local_route") && !isLoading && !acceptedTnc && (
        <PrivacyPolicyPopup
          tncText={t("tncText")}
          onAccept={handleAcceptTnC}
          useStaticText={false}
        />
      )}
      <></>
      <div className={isMobile ? "div30_a" : "div30"}>
        <Header
          isMobileFirst={isMobile}
          showTheDots={false}
          content={
            <div style={{ height: "30px" }}>
              <div className="div32" />
            </div>
          }
        />
      </div>
      {isLoading && (
        <div className="loader-load-spinner">
          <div className="div67">
            <BiLoader className="loader-rotate-loader loader-icon" />
          </div>
        </div>
      )}

      <div>
        <HiddenRecorder />
        <div className={`div33 div9`}>
          {
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
                        chat.source === "bot" && i === chatHistory.length - 1
                      }
                      handleOnStopSpeaking={() => handleOnStopSpeaking()}
                      handleOnSpeaking={() => {
                        handleOnSpeaking(chat?.audio, chat?.updated_at);
                      }}
                      isAnyPlaying={!!hasOverRideId}
                      isPlaying={hasOverRideId === chat?.updated_at}
                      setNotMute={setNotMute}
                      chatId={chat?.updated_at}
                      isStreamingComplete={true}
                    />
                  </div>
                  {isReplying && i === chatHistory.length - 1 ? (
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
        </div>

        {
          <form
            className="div39 form-1 sm:p-[10px_35px] p-[10px_25px]"
            onSubmit={async (event) => {
              event.stopPropagation();
              event.preventDefault();
              stopAllAudio();
              if (!hasStartedListening && !isFetchingData) {
                // next question + saving
                const last_question = chatHistory
                  .filter((x) => x.source === "bot")
                  .sort((a, b) => b.updated_at - a.updated_at)[0];
                const question = last_question.msg;
                let status = PTM_CONVERSATION_STATUS_TYPE.IN_PROGRESS;
                if (last_question.sequence === 1) {
                  status = PTM_CONVERSATION_STATUS_TYPE.STARTED;
                } else if (
                  last_question.sequence === Object.keys(questions).length
                ) {
                  status = PTM_CONVERSATION_STATUS_TYPE.COMPLETED;
                }
                const data = {
                  session: getFromStorage("sessionid", true),
                  status: status,
                  profile_id: getFromStorage("profileid", true),
                  id: last_question.question_id,
                  answer_id: `answer_${last_question.sequence}_${last_question.question_id}`,
                  sequence: last_question.sequence,
                  question: question,
                  translated_question:
                    last_question?.translated_question || null,
                  answer: textMessage,
                  language: languageToUse,
                  sent_at: new Date().toISOString(),
                  audio_url: asrAudio,
                  audio: last_question.audio,
                };
                savePTMQuestion(data);
                setChatHistory((prev) => [
                  ...prev,
                  {
                    ...data,
                    ...createMessage({
                      msg: textMessage,
                      source: "user",
                      updated_at: Date.now(),
                    }),
                  },
                ]);
                setTextMessage("");
                setAsrAudio(null);
                setHasStartedListening(false);
                setIsFetchingData(false);
                setHasStartedRecording(false);
                setSeconds(0);
                setIntervalId(null);
                setHasOverRideId(null);
                setIsNextAllowed(true);
                setTimeout(() => {
                  if (questionCounter.current < Object.keys(questions).length) {
                    questionCounter.current += 1;
                    sendQuestionToUser();
                  }
                }, 2000);
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
                  disabled={hasStartedRecording || isFetchingData || isReplying}
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
                  onClick={hasStartedRecording ? stopRecording : startRecording}
                  disabled={isFetchingData || isReplying}
                  className={`button-7 sm:ml-[1.3rem] ml-[0.8rem] ${
                    hasStartedRecording ? "button-8" : "button-9"
                  }`}
                >
                  {hasStartedRecording ? <FaRegStopCircle /> : <FaMicrophone />}
                </button>
              </div>
            )}
          </form>
        }
      </div>
      <div ref={endPageToScrollRef} id="last-chat-boundary" />
    </>
  );
};

export default PTMVoiceBasedChat;
