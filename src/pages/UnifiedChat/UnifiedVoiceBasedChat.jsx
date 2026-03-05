import "../../style.css"
import "../ShikshalokamVoiceChat/shikshaChatStyle.css"
import { ai4BharatASRApi } from "api/endpoints/ai"
import { BiLoader } from "react-icons/bi"
import { clearFromStorage, handleS3Upload } from "../../services/storage_service"
import { createMessage } from "../interview-voice"
import { EditStoryModal, PhotoUploadSection, StoryActionsContainer } from "./StoryActionsModule"
import { FaCircle } from "react-icons/fa6"
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa"
import { getFlowConfig } from "../../config/flowConfig"
import { getSessionDetailsApi } from "../../api/endpoints/chat"
import { getStoryAllMedia, getStoryBySessionAPI } from "api/endpoints"
import { LANGUAGE_ENUMS, PTM_CONVERSATION_STATUS_TYPE } from "../ShikshalokamVoiceChat/enum"
import { MdSend } from "react-icons/md"
import { savePTMQuestionApi } from "../../api/endpoints/ptm"
import { sessionFlowName } from "../../constants/session"
import { setLanguage } from "../../i18n"
import { showNotification } from "components/ToastMessage/TotastMessage"
import { TbReload } from "react-icons/tb"
import { useChatDataLocalStore, useSiteDataSessionStore } from "store"
import { useChatStorage, useUserStorage, useSiteStorage } from "hooks/useStorage"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import axiosInstance from "utils/axios"
import ChatMessage from "../ShikshalokamMegaPTM/ChatMessage"
import Header from "../ShikshalokamVoiceChat/shikshaChatHeader"
import PrivacyPolicyPopup from "components/TnC/privacyPolicyPopup"
import ROUTES from "../../url"
import SpeedNotification from "../ShikshalokamMegaPTM/SpeedNotification"
import Swal from "sweetalert2"
import useCustomMediaQuery from "hooks/useCustomMediaQuery"
import useSmartChatStorage from "hooks/useSmartChatStorage"
import useVoiceRecord from "../interview-text-voice/useVoiceRecord"

const UnifiedVoiceBasedChat = ({ flowType }) => {
  // useState hooks
  const [localChatHistory, setLocalChatHistory, removeLocalChatHistory] = useSmartChatStorage()
  const [chatHistory, setChatHistory] = useState(!!localChatHistory?.length ? localChatHistory : [])
  const [textMessage, setTextMessage] = useState("")
  const [asrAudio, setAsrAudio] = useState(null)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [reconText, setReconText] = useState("")
  const [audioCache, setAudioCache] = useState({})
  const [hasStartedListening, setHasStartedListening] = useState(false)
  const [trigger, setTrigger] = useState(false)
  const [hasStartedRecording, setHasStartedRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [sentences, setSentences] = useState([])
  const [isNextAllowed, setIsNextAllowed] = useState(true)
  const [isMute, setNotMute] = useState(true)
  const [hasOverRideId, setHasOverRideId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [intervalId, setIntervalId] = useState(null)
  const [fileErrorText, setFileErrorText] = useState("")
  const [visibleItemCount, setVisibleItemCount] = useState(10)
  const [storyData, setStoryData] = useState(null)
  const [files, setFiles] = useState([])
  const [showFileInput, setShowFileInput] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editorCopyChanges, setEditorCopyChanges] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPdfDownloading, setIsPdfDownloading] = useState(false)
  const [isEndStoryLoading, setIsEndStoryLoading] = useState(false)
  const [noStoryFound, setNoStoryFound] = useState(false)
  const [llmError, setLlmError] = useState("")
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [isTalking, setTalking] = useState(0)

  // Other hooks
  const { t } = useTranslation()
  const navigate = useNavigate()
  const audioRef = useRef()
  const textAreaRef = useRef(null)
  const lastBotMessageIndex = useRef(-1)
  const questionCounter = useRef(1)
  const endPageToScrollRef = useRef(null)
  const hasAutoPlayedStoryAudios = useRef(false)
  let isMobile = useCustomMediaQuery("(max-width: 500px)")
  const { recordings, HiddenRecorder } = useVoiceRecord()

  const accessToken = useChatDataLocalStore(state => state.accessToken)

  const acceptedTnc = useUserStorage()(state => state.has_accepted_tnc)
  const storageFlow = useChatStorage()(state => state.flow)
  const sessionId = useChatStorage()(state => state.sessionId)
  const profileId = useUserStorage()(state => state.profileId)
  const previousUrl = useSiteStorage()(state => state.previousUrl)

  const languageToUse = useSiteDataSessionStore(state => state.chatLanguage)
  const setLanguageToUse = useSiteDataSessionStore(state => state.setChatLanguage)
  const setHasSelectedLanguage = useSiteDataSessionStore(state => state.setHasSelectedLanguage)
  const { setIsNewChatOpen, setIsOldChatOpen, setSessionId, setChatBotClickedOn } = useChatStorage().getState()

  const { setAcceptedTnC } = useUserStorage().getState()

  // Other variable definitions
  // Get flow-specific configuration
  const flowConfig = getFlowConfig(flowType)
  const questions = flowConfig.questions
  const FLOW_ROUTE = flowConfig.apiRoute
  const storyActionsConfig = flowConfig.storyActions || {}
  const showCompletionPopup = flowConfig.showCompletionPopup !== false
  const botNameToDisplay = t("botName")
  let chatToAddLength = isMobile ? 10 : 10

  const isReplying = !hasStartedListening && chatHistory[chatHistory?.length - 1]?.source === "user" && !(chatHistory[chatHistory.length - 1].sequence >= Object.keys(questions).length)

  const allQuestionsCompleted = questionCounter.current === Object.keys(questions).length && chatHistory.length === Object.keys(questions).length * 2

  const formatTime = secs => {
    const minutes = Math.floor(secs / 60)
    const seconds = secs % 60
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  const narrateLastMessage = () => {
    try {
      const speakerButtons = document.querySelectorAll(".button-11.button-3")
      const lastSpeakerButton = speakerButtons[speakerButtons.length - 1]

      if (lastSpeakerButton) {
        lastSpeakerButton.click()
      }
    } catch (error) {
      console.error("Error narrating last message:", error)
    }
  }

  // ==================== INITIALIZATION PHASE ====================
  // Browser back button handler - runs on mount
  useEffect(() => {
    const handleBack = () => {
      showInterruptionPopup(true)
    }

    window.history.pushState({ isCustom: true }, "", window.location.href)

    window.addEventListener("popstate", handleBack)

    return () => {
      window.removeEventListener("popstate", handleBack)
    }
  }, [])

  useEffect(() => {
    if (isReplying) handleScrollToView()
  }, [isReplying])

  // Fetch story on mount to check if it already exists
  useEffect(() => {
    if (sessionId) {
      ;(async () => {
        const story_data = await getStoryBySessionAPI(sessionId)
        if (story_data && story_data?.length > 0 && story_data[0]) {
          setStoryData(story_data[0])
          const formatted_content = story_data[0].formatted_content
          const textBlocks = extractTextBlocks(formatted_content)
          setEditorCopyChanges(textBlocks)
          setNoStoryFound(false)
          setShowFileInput(true)
          setIsLoading(false)
        } else {
          setIsLoading(false)
          if (!llmError) {
            setNoStoryFound(true)
          }
        }
      })()
    }
  }, [])

  // Initialize questionCounter and send question on mount
  useEffect(() => {
    const last_question = chatHistory.filter(x => x?.source === "bot").sort((a, b) => b?.updated_at - a?.updated_at)[0]
    if (last_question?.sequence) {
      questionCounter.current = last_question?.sequence
    }
    if (!chatHistory[chatHistory.length - 1]?.source || chatHistory[chatHistory.length - 1]?.source !== "bot") {
      if (!(last_question?.sequence >= Object.keys(questions).length)) {
        sendQuestionToUser()
      }
    }
  }, [])

  // Set visible item count based on chat length
  useEffect(() => {
    setVisibleItemCount(chatToAddLength)
  }, [chatToAddLength])

  // ==================== UI/STATE MANAGEMENT ====================
  // Manage body overflow based on TNC acceptance
  useEffect(() => {
    if (acceptedTnc === false) {
      document.body.style.overflowY = "hidden"
    } else {
      document.body.style.overflowY = "auto"
    }

    return () => {
      document.body.style.overflowY = "auto"
    }
  }, [acceptedTnc])

  // Manage body overflow based on loading states
  useEffect(() => {
    if (isLoading || isEndStoryLoading) {
      document.body.style.overflowY = "hidden"
    } else {
      document.body.style.overflowY = "auto"
    }

    return () => {
      document.body.style.overflowY = "auto"
    }
  }, [isLoading, isEndStoryLoading])

  // Update audio muted state
  useEffect(() => {
    if (audioRef?.current) {
      if (isMute) {
        audioRef.current.muted = true
      } else {
        audioRef.current.muted = false
      }
    }
  }, [isMute])

  // ==================== CHAT FLOW MANAGEMENT ====================
  // Update local storage and bot message index when chatHistory changes
  useEffect(() => {
    setLocalChatHistory(chatHistory)
    lastBotMessageIndex.current = chatHistory?.length - 1
  }, [chatHistory])

  // Scroll to view when chatHistory length or acceptedTnc changes
  useEffect(() => {
    if (acceptedTnc === true) {
      handleScrollToView()
    }
  }, [chatHistory?.length, acceptedTnc])

  // Narrate last message when bot message is added and TNC is accepted
  useEffect(() => {
    if (!(questionCounter.current === Object.keys(questions).length && chatHistory.length === Object.keys(questions).length * 2)) {
      if (chatHistory[chatHistory.length - 1]?.source === "bot" && acceptedTnc) {
        setTimeout(() => {
          narrateLastMessage()
        }, 500)
      }
    }
    return () => {}
  }, [chatHistory, acceptedTnc])

  // Auto-play story audio when all questions are completed
  useEffect(() => {
    const allQuestionsCompleted = questionCounter.current === Object.keys(questions).length && chatHistory.length === Object.keys(questions).length * 2

    const shouldGenerateStory = storyActionsConfig.showPhotoUpload || storyActionsConfig.showEdit || storyActionsConfig.showDownload

    if (allQuestionsCompleted && shouldGenerateStory && acceptedTnc && !hasAutoPlayedStoryAudios.current && (showFileInput || storyData) && !llmError && !isLoading && !isEndStoryLoading) {
      hasAutoPlayedStoryAudios.current = true

      setTimeout(() => {
        try {
          const storySpeakerButtons = document.querySelectorAll(".button-11.button-3")

          const storyButtonIndex = chatHistory.length

          if (storySpeakerButtons[storyButtonIndex]) {
            storySpeakerButtons[storyButtonIndex].click()
          } else if (storySpeakerButtons.length > 0) {
            storySpeakerButtons[storySpeakerButtons.length - 1].click()
          }
          setTimeout(() => {
            handleScrollToView()
          }, 100)
        } catch (error) {
          console.error("Error auto-playing story audio:", error)
        }
      }, 800)
    }

    return () => {}
  }, [chatHistory.length, acceptedTnc, showFileInput, llmError, isLoading, isEndStoryLoading, questionCounter.current])

  // ==================== STORY MANAGEMENT ====================
  // Fetch media files for the story
  useEffect(() => {
    const fetchMedia = async () => {
      if (storyData && storyData?.id !== "") {
        const story_id = storyData?.id
        const tempMediaArr = []
        setIsImageUploading(true)

        const story_media = await getStoryAllMedia({
          data: {
            story: story_id,
          },
          token: accessToken,
        })

        for (let item of Object.values(story_media?.results || [])) {
          if (item.include_in_story) {
            tempMediaArr.push(item)
          }
        }
        setFiles(tempMediaArr)

        setIsImageUploading(false)
      }
    }

    fetchMedia()

    return () => {}
  }, [storyData])

  // Check and fetch story when questions are completed
  useEffect(() => {
    const checkAndFetchStory = async () => {
      const allQuestionsCompleted = questionCounter.current === Object.keys(questions).length && chatHistory.length === Object.keys(questions).length * 2

      if (allQuestionsCompleted) {
        const shouldGenerateStory = storyActionsConfig.showPhotoUpload || storyActionsConfig.showEdit || storyActionsConfig.showDownload

        if (shouldGenerateStory && noStoryFound && (!llmError || llmError === "")) {
          // Call end-story API to generate the story only when noStoryFound is true
          await callEndStory()
        } else if (!shouldGenerateStory && showCompletionPopup) {
          // Just show completion popup if no story actions needed
          showCompletionPopupFn()
        }
      }
    }

    checkAndFetchStory()
  }, [chatHistory, questionCounter.current, noStoryFound, llmError])

  // ==================== USER INPUT/RECORDING MANAGEMENT ====================
  // Manage recording timer when hasStartedRecording changes
  useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 500)
      setIntervalId(id)
    } else {
      clearInterval(intervalId)
      setSeconds(0)
    }

    return () => clearInterval(intervalId)
  }, [hasStartedRecording])

  // Adjust textarea height based on textMessage
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto"
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [textMessage])

  // Reset trigger and reconText
  useEffect(() => {
    try {
      if (!!trigger && !!reconText) {
        setReconText("")
        setTrigger(false)
      }
    } catch (error) {
      console.error({ error })
    }
  }, [reconText, trigger, recordings])

  // Handle TTS narration queue
  useEffect(() => {
    let unnarratedMessages = sentences.filter(x => !x?.isNarrated)
    let hasUnnarratedMessages = !!unnarratedMessages?.length
    let sourceLanguage = languageToUse

    if (isNextAllowed && hasUnnarratedMessages && !isLoading) {
      handleTTSRequest(unnarratedMessages[0].message, unnarratedMessages[0].id, sourceLanguage)
    }

    return () => {}
  }, [isNextAllowed, sentences, languageToUse, isLoading, acceptedTnc])

  // ==================== UTILITY/ERROR MANAGEMENT ====================
  // Clear fileErrorText after timeout
  useEffect(() => {
    const textErrorTime = setTimeout(() => {
      setFileErrorText("")
    }, 5000)

    return () => {
      clearTimeout(textErrorTime)
    }
  }, [fileErrorText])

  const sendQuestionToUser = async () => {
    try {
      const flow = storageFlow
      const selected_question = questions[`${questionCounter.current}`]
      const current_questions = selected_question.questions
      const question_to_use = current_questions[0]
      const question = question_to_use.title[languageToUse]

      const bot_messsage = {
        sequence: selected_question.sequence,
        translated_question: languageToUse !== "en" ? question_to_use?.title?.en : null,
        session: sessionId,
        flow: flow,
        profile_id: profileId,
        id: selected_question.id,
        msg: question.text,
        audio: question.audio,
        source: "bot",
        updated_at: Date.now(),
        question_id: question_to_use.variant_id,
        service: selected_question.service || null,
      }

      setChatHistory(prev => [...prev, bot_messsage])
      setChatBotClickedOn(true)
      setIsOldChatOpen(true)
      setSessionId(sessionId)
      setIsNewChatOpen(false)
      handleScrollToView()
    } catch (error) {
      console.error("Error sending question to user:", error)
      showNotification({
        message: t("errorSendingQuestion"),
        type: "error",
        options: {
          position: "top-center",
          autoClose: 6000,
          style: { fontWeight: "bold" },
        },
      })
    }
  }

  async function resetChatState(e) {
    if (e) {
      e.preventDefault()
    }
    setIsLoading(true)

    removeLocalChatHistory()
    setIsOldChatOpen(false)

    const session = await getSessionDetailsApi()
    setSessionId(session.sessionid)
    setChatBotClickedOn("")
    setIsLoading(false)
  }

  function showInterruptionPopup(wantToNavigateBack, executeCustomFunction) {
    Swal.fire({
      title: t("guestPopUpChanges"),
      showCancelButton: true,
      confirmButtonText: t("confirmChanges"),
      cancelButtonText: t("denyButton"),
    }).then(result => {
      if (result.isConfirmed) {
        if (executeCustomFunction) {
          executeCustomFunction()
        } else {
          if (wantToNavigateBack) {
            stopAllAudio()
            clearFromStorage()
            setLanguage(LANGUAGE_ENUMS.ENGLISH)
            setLanguageToUse(LANGUAGE_ENUMS.ENGLISH)
            setHasSelectedLanguage(false)

            if (previousUrl && previousUrl !== null && previousUrl !== undefined && previousUrl !== "") {
              window.location.href = previousUrl
            } else {
              // navigate(flowConfig.homePageRoute)
              window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_HOME_PAGE)
            }
          } else {
            resetChatState()
          }
        }
      } else {
        if (wantToNavigateBack) {
          window.history.pushState(null, "", window.location.href)
        }
      }
    })
  }

  function showCompletionPopupFn() {
    Swal.fire({
      title: t(flowConfig.completionMessageKey),
      showCancelButton: false,
      confirmButtonText: t(flowConfig.completionCTAKey),
      showCloseButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      imageUrl: "https://static-media.gritworks.ai/fe-images/PNG/Shikshalokam/check-mark.png",
      imageHeight: "100",
    }).then(result => {
      if (result.isConfirmed) {
        clearFromStorage()
        window.location.reload()
        setLanguageToUse(LANGUAGE_ENUMS.ENGLISH)
        setLanguage(LANGUAGE_ENUMS.ENGLISH)
        setHasSelectedLanguage(false)
        console.log("flowType", flowType)
        stopAllAudio()
        if (flowType === sessionFlowName.megaPTM) {
          window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_PTM_HOME_PAGE)
        } else if (flowType === sessionFlowName.YLC) {
          window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_YLC_HOME_PAGE)
        } else {
          window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_HOME_PAGE)
        }
      }
    })
  }

  // Fetch story data when all questions are completed

  const extractTextBlocks = formattedContent => {
    if (!formattedContent) return []
    const blocks = JSON.parse(formattedContent)
    if (!blocks || blocks?.length === 0) return []
    return blocks.filter(block => block.type === "paragraph")
  }

  // Call end-story API to generate the story
  const callEndStory = async (hasClickedOnRegenerate = false) => {
    const shouldGenerateStory = storyActionsConfig.showPhotoUpload || storyActionsConfig.showEdit || storyActionsConfig.showDownload

    if (!shouldGenerateStory) {
      return
    }

    const allQuestionsCompleted = questionCounter.current === Object.keys(questions).length && chatHistory.length === Object.keys(questions).length * 2

    if (!allQuestionsCompleted && !hasClickedOnRegenerate) {
      return
    }

    try {
      setIsLoading(true)
      setIsEndStoryLoading(true)

      const endStoryResponse = await axiosInstance({
        url: `/api/end-story/`,
        data: {
          session: sessionId,
          profile_id: profileId,
          stage: "COMPLETED",
          access_token: accessToken,
          flow: storageFlow,
          language: languageToUse,
        },
        method: "POST",
      })

      if (endStoryResponse?.data?.id) {
        setFiles([])
        setShowFileInput(true)
        setLlmError("")

        // Fetch the generated story
        const story_data = await getStoryBySessionAPI(sessionId)
        if (story_data && story_data?.length > 0 && story_data[0]) {
          setStoryData(story_data[0])
          const formatted_content = story_data[0].formatted_content
          const textBlocks = extractTextBlocks(formatted_content)
          setEditorCopyChanges(textBlocks)
          setNoStoryFound(false)
        }
      } else {
        setLlmError(endStoryResponse?.data?.error_message || t("storyGenerationError"))
      }
    } catch (error) {
      console.error("Error completing the story:", error)
      setLlmError(error?.response?.data?.error_message || t("storyGenerationError"))
    } finally {
      setIsEndStoryLoading(false)
      setIsLoading(false)
      setNoStoryFound(false)
    }
  }

  const handleScrollToView = () => {
    try {
      document?.querySelector("#last-chat-boundary")?.scrollIntoView({
        behavior: "smooth",
      })
    } catch (error) {
      console.error({ error })
    }
  }

  const handleOnInputText = e => {
    e.preventDefault()
    setTextMessage(e.target.value)

    if (e.target.value.trim() === "") {
      setHasStartedListening(false)
    }
  }

  const handleTTSRequest = async (_audio, id, sourceLanguage) => {
    try {
      async function handleSpeaking(cachedAudioUrl) {
        let audio = null
        if (cachedAudioUrl) {
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
          }
          audioRef.current = new Audio(cachedAudioUrl)
          audio = audioRef.current

          audio.onplay = () => {
            setIsNextAllowed(false)
          }
          audio.onended = () => {
            setSentences(prev => {
              let all_sentences = JSON.parse(JSON.stringify([...prev]))
              let index = prev.findIndex(x => x.id === id)
              if (index > -1) all_sentences[index].isNarrated = true
              return all_sentences
            })
            setIsNextAllowed(true)
            setHasOverRideId(null)
          }

          try {
            await audio.play()
          } catch (error) {
            console.error("Error playing audio:", error)
            setSentences(prev => {
              let all_sentences = JSON.parse(JSON.stringify([...prev]))
              let index = prev.findIndex(x => x.id === id)
              if (index > -1) all_sentences[index].isNarrated = true
              return all_sentences
            })
            setIsNextAllowed(true)
            setHasOverRideId(null)
          }
        }
      }
      let cachedAudioUrl = audioCache[id]
      if (isMute && !hasOverRideId) {
        setSentences(prev => {
          let all_sentences = JSON.parse(JSON.stringify([...prev]))
          return all_sentences.map(x => ({ ...x, isNarrated: true }))
        })
        setIsNextAllowed(true)
        setHasOverRideId(null)
        return
      }
      if (_audio?.length) {
        if (!cachedAudioUrl) {
          fetch(_audio)
            .then(res => res.text())
            .then(base64 => {
              cachedAudioUrl = `data:audio/mpeg;base64,${base64}`
              setAudioCache(prevCache => ({
                ...prevCache,
                [id]: cachedAudioUrl,
              }))
              handleSpeaking(cachedAudioUrl)
            })
            .catch(err => {
              console.error("Error fetching audio:", err)
            })
        } else {
          handleSpeaking(cachedAudioUrl)
        }
      }
    } catch (error) {
      console.error("Error in handleTTSRequest:", error)
      handleOnStopSpeaking()
    }
  }

  const isTyping = !!textMessage.trim()

  const handleOnSpeaking = async (audio, id) => {
    try {
      try {
        if (!!audioRef.current) await audioRef.current.pause()
      } catch (error) {
        console.error({ error })
      }

      setHasOverRideId(id)
      setIsNextAllowed(true)
      setSentences(prev => {
        return [
          {
            message: audio,
            isNarrated: false,
            id: id,
          },
        ]
      })
    } catch (error) {
      console.error({ error })
    }
  }

  const handleOnStopSpeaking = async () => {
    try {
      try {
        if (audioRef.current) await audioRef.current.pause()
      } catch (error) {
        console.error({ error })
      }
      setHasOverRideId(null)
      setSentences([])
      setIsNextAllowed(true)
    } catch (error) {
      console.error({ error })
    }
  }

  const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const rawData = audioBuffer.getChannelData(0)

    const rms = Math.sqrt(rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length)
    return rms < silenceThreshold
  }

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      handleOnStopSpeaking()
      setTextMessage("")
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          const options = {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 16000,
          }
          const recorder = new MediaRecorder(stream, options)
          setMediaRecorder(recorder)

          const localAudioChunks = []

          recorder.start()
          setHasStartedRecording(true)

          recorder.ondataavailable = event => {
            localAudioChunks.push(event.data)
          }

          recorder.onstop = async () => {
            if (localAudioChunks.length > 0) {
              const audioBlob = new Blob(localAudioChunks, {
                type: "audio/webm;codecs=opus",
              })
              const isSilent = await isSilentAudio(audioBlob, 0.02)

              if (!audioBlob || isSilent) {
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                })
                return
              }

              setIsFetchingData(true)
              let transcriptResult = ""
              let s3Url = await handleS3Upload(audioBlob, `${Date.now()}`, `chatbot/companychat/${sessionId}/`, null)
              if (!s3Url || s3Url === "") {
                transcriptResult = t("asrError")
              }
              setAsrAudio(s3Url)
              transcriptResult = await ai4BharatASRApi(s3Url, languageToUse, FLOW_ROUTE)
              if (!transcriptResult || transcriptResult === "") {
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                })
              } else {
                setTextMessage(transcriptResult)
              }
              setIsFetchingData(false)
            } else {
              console.warn("No audio chunks were recorded.")
              setIsFetchingData(false)
            }
          }
        })
        .catch(err => {
          console.error("Error accessing microphone:", err)
          setIsFetchingData(false)
        })
    } else {
      console.warn("getUserMedia not supported on your browser!")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setHasStartedRecording(false)
    }
  }

  function stopAllAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current.removeAttribute("src")
      audioRef.current.load()
      audioRef.current.muted = true
      audioRef.current.currentTime = 0
      setHasOverRideId(null)
      setSentences([])
      setIsNextAllowed(true)
      setNotMute(true)
      setHasStartedListening(false)
      setHasStartedRecording(false)
      setTextMessage("")
      setAsrAudio(null)
      setIntervalId(null)
      setSeconds(0)
      setMediaRecorder(null)
      if (textAreaRef.current) {
        textAreaRef.current.value = ""
        textAreaRef.current.style.height = "auto"
      }
      audioRef.current = null
    }
  }

  function handleAcceptTnC() {
    setAcceptedTnC(true)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <SpeedNotification />
      {languageToUse && !isLoading && !acceptedTnc && <PrivacyPolicyPopup tncText={t("tncText")} onAccept={handleAcceptTnC} useStaticText={false} />}
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
            {isEndStoryLoading && (
              <div className="div69 text-center">
                <h2 className="form-label label1 font-bold text-lg sm:text-2xl text-center">{t("storyLoaderHeading")}</h2>
                <label className="form-label label1 text-center">{t("storyLoader")}</label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Story Modal */}
      {storyActionsConfig.showEdit && <EditStoryModal isModalOpen={isModalOpen} closeModal={closeModal} storyData={storyData} editorCopyChanges={editorCopyChanges} setIsLoading={setIsLoading} isSaving={isSaving} setIsSaving={setIsSaving} access_token={accessToken} navigate={navigate} />}

      <div>
        <HiddenRecorder />
        <div className={`div33 div9`}>
          {storageFlow && (
            <>
              <div className="div10">
                <h3 className="h3-1">
                  {t(flowConfig?.introHeadingKey)}
                  <br />
                  {t(flowConfig?.introHeadingKey1)}
                </h3>
              </div>
              <ul className="div11 pb-6">{flowConfig?.introLines && flowConfig?.introLines.map((lineKey, index) => <li key={index}>{t(lineKey)}</li>)}</ul>
            </>
          )}
          {
            <ul className="div34">
              {chatHistory?.map((chat, i) => (
                <li key={i} className={`div34 div35 ${chat?.source === "user" ? "label1" : "label1"}`}>
                  <div className={`div36 ${chat?.source === "user" && "div37"}`}>
                    <ChatMessage
                      botNameToDisplay={botNameToDisplay}
                      userType={chat?.source}
                      message={`${chat?.msg}`}
                      name={t("userName")}
                      recording={chat?.recording}
                      hasAppendix={chat?.recording}
                      appendixURL={chat?.appendixURL}
                      isTalking={chat.source === "bot" && i === chatHistory.length - 1}
                      handleOnStopSpeaking={() => handleOnStopSpeaking()}
                      handleOnSpeaking={() => {
                        handleOnSpeaking(chat?.audio, chat?.updated_at)
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

          {/* LLM Error Display with Regenerate Button */}
          {llmError && llmError !== "" && (
            <>
              <p className="error-para">{llmError}</p>
              <div className="div20">
                <button
                  className="clickable-button"
                  onClick={async () => {
                    setIsLoading(true)
                    setIsEndStoryLoading(true)
                    await callEndStory(true)
                  }}
                  disabled={isLoading || isPdfDownloading}
                >
                  <div className="download-story-div">
                    <TbReload className="icon-1" />
                    <span className="div16" ref={endPageToScrollRef}>
                      {t("reDownloadStoryText")}
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Story Actions Section - Only show when all questions are completed */}
          {allQuestionsCompleted && showFileInput && storyData && !llmError && (
            <>
              {/* Photo Upload Section */}
              {storyActionsConfig.showPhotoUpload && (
                <PhotoUploadSection
                  storyData={storyData}
                  files={files}
                  setFiles={setFiles}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  access_token={accessToken}
                  botNameToDisplay={botNameToDisplay}
                  handleOnSpeaking={handleOnSpeaking}
                  handleOnStopSpeaking={handleOnStopSpeaking}
                  hasOverRideId={hasOverRideId}
                  isTalking={isTalking}
                  isStreamingComplete={true}
                  setNotMute={setNotMute}
                  navigate={navigate}
                  t={t}
                  flowConfig={flowConfig}
                />
              )}

              {/* Download and Edit Section */}
              {(storyActionsConfig.showDownload || storyActionsConfig.showEdit) && (
                <StoryActionsContainer
                  botNameToDisplay={botNameToDisplay}
                  handleOnSpeaking={handleOnSpeaking}
                  handleOnStopSpeaking={handleOnStopSpeaking}
                  hasOverRideId={hasOverRideId}
                  isTalking={isTalking}
                  isStreamingComplete={true}
                  setNotMute={setNotMute}
                  sessionid={sessionId}
                  openModal={openModal}
                  isLoading={isLoading}
                  isPdfDownloading={isPdfDownloading}
                  setIsLoading={setIsLoading}
                  setIsPdfDownloading={setIsPdfDownloading}
                  access_token={accessToken}
                  flowConfig={flowConfig}
                  showDownload={storyActionsConfig.showDownload}
                  showEdit={storyActionsConfig.showEdit}
                  t={t}
                />
              )}
            </>
          )}
        </div>

        {!allQuestionsCompleted && !isEndStoryLoading && (
          <form
            className="div39 form-1 sm:p-[10px_35px] p-[10px_25px]"
            onSubmit={async event => {
              event.stopPropagation()
              event.preventDefault()
              stopAllAudio()
              if (!hasStartedListening && !isFetchingData) {
                const last_question = chatHistory.filter(x => x.source === "bot").sort((a, b) => b.updated_at - a.updated_at)[0]
                const question = last_question.msg
                let status = PTM_CONVERSATION_STATUS_TYPE.IN_PROGRESS
                if (last_question.sequence === 1) {
                  status = PTM_CONVERSATION_STATUS_TYPE.STARTED
                } else if (last_question.sequence === Object.keys(questions).length) {
                  status = PTM_CONVERSATION_STATUS_TYPE.COMPLETED
                }
                const data = {
                  session: sessionId,
                  status: status,
                  flow: storageFlow,
                  profile_id: profileId,
                  id: last_question.question_id,
                  answer_id: `answer_${last_question.sequence}_${last_question.question_id}`,
                  sequence: last_question.sequence,
                  question: question,
                  translated_question: last_question?.translated_question?.text || null,
                  answer: textMessage,
                  language: languageToUse,
                  sent_at: new Date().toISOString(),
                  audio_url: asrAudio,
                  service: last_question.service || null,
                }
                savePTMQuestionApi(data)
                setChatHistory(prev => [
                  ...prev,
                  {
                    ...data,
                    ...createMessage({
                      msg: textMessage,
                      source: "user",
                      updated_at: Date.now(),
                    }),
                  },
                ])
                setTextMessage("")
                setAsrAudio(null)
                setHasStartedListening(false)
                setIsFetchingData(false)
                setHasStartedRecording(false)
                setSeconds(0)
                setIntervalId(null)
                setHasOverRideId(null)
                setIsNextAllowed(true)
                setTimeout(() => {
                  if (questionCounter.current < Object.keys(questions).length) {
                    questionCounter.current += 1
                    sendQuestionToUser()
                  }
                }, 2000)
              }
            }}
            autoComplete="off"
          >
            <div className="textarea-wrapper relative">
              <textarea
                id="textBoxID"
                className={`input-2 input-1 ${isFetchingData ? "min-h-[68px] sm:min-h-0 py-0" : ""}`}
                style={{ alignContent: isFetchingData ? "normal" : "center" }}
                onChange={handleOnInputText}
                placeholder={hasStartedRecording ? t("placeholder1") : isFetchingData ? t("placeholder2") : t("placeholder3")}
                name="message-box"
                value={textMessage}
                autoFocus={false}
                disabled={hasStartedRecording || isFetchingData}
                ref={textAreaRef}
                onInput={e => {
                  e.target.style.height = "auto"
                  const maxHeight = 150
                  if (e.target.scrollHeight > maxHeight) {
                    e.target.style.height = `${maxHeight}px`
                    e.target.style.overflowY = "scroll"
                  } else {
                    e.target.style.height = `${e.target.scrollHeight}px`
                    e.target.style.overflowY = "hidden"
                  }
                }}
                onFocus={() => {
                  setTimeout(() => {
                    handleScrollToView()
                    if (textAreaRef.current) {
                      textAreaRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                  }, 300)
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (e.shiftKey) {
                      e.preventDefault()
                      e.target.form.requestSubmit()
                      setTimeout(() => {
                        e.target.value = ""
                      }, 0)
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
                <button type="submit" disabled={hasStartedRecording || isFetchingData || isReplying} className="button-6 sm:ml-[1.3rem] ml-[0.8rem]">
                  <MdSend />
                </button>
              </div>
            ) : (
              <div className={`audio-recorder ${isFetchingData ? "button-container" : ""}`}>
                <button type="button" onClick={hasStartedRecording ? stopRecording : startRecording} disabled={isFetchingData || isReplying} className={`button-7 sm:ml-[1.3rem] ml-[0.8rem] ${hasStartedRecording ? "button-8" : "button-9"}`}>
                  {hasStartedRecording ? <FaRegStopCircle /> : <FaMicrophone />}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
      <div ref={endPageToScrollRef} id="last-chat-boundary" />
    </>
  )
}

export default UnifiedVoiceBasedChat
