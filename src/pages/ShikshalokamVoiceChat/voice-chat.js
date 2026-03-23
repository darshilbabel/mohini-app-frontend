import "../../style.css"
import "./shikshaChatStyle.css"
import { AiOutlineEye } from "react-icons/ai"
import { API_ENDPOINTS } from "../../constants/urls"
import { BiLoader } from "react-icons/bi"
import { bot_routes } from "../../configure"
import { buildWebSocketUrl } from "../../utils/helpers"
import { clearFromStorage, handleS3Upload } from "../../services/storage_service"
import { createMessage } from "../interview-voice"
import { createStoryMediaApi, getStoryAllMedia, partialUpdateStoryById } from "api/endpoints/story"
import { createUserProfileApi, getProfileUserApi } from "api/endpoints/user"
import { FaCircle } from "react-icons/fa6"
import { FaMicrophone, FaRegStopCircle } from "react-icons/fa"
import { FiDownload } from "react-icons/fi"
import { getChatSessionApi, getCompanyBotApi } from "api/endpoints/chat"
import { getSessionDetails } from "../../services/api.service"
import { getTranslatedIntroMessageApi } from "api/endpoints/ai"
import { GrGallery } from "react-icons/gr"
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2"
import { LANGUAGE_ENUMS, languageList } from "./enum"
import { MdAccountCircle, MdEdit, MdSend } from "react-icons/md"
import { RxCross2 } from "react-icons/rx"
import { sessionFlowName } from "../../constants/session"
import { setLanguage } from "../../i18n"
import { TbReload } from "react-icons/tb"
import { toast } from "react-toastify"
import { updateReflectionStatusApi, getAI4BharatAudioApi, ai4BharatASRApi, updateStoryMediaApi, getStoryBySessionAPI, endStoryApi } from "api/endpoints"
import { useAudio } from "hooks/useAudio"
import { useCallback, useEffect, useRef, useState, useMemo } from "react"
import { useChatStorage, useUserStorage, useSiteStorage } from "hooks/useStorage"
import { useChatWebhook } from "hooks/useChatWebhook"
import { useConfirmationPopup } from "hooks/useConfirmationPopup"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useSiteDataSessionStore, useChatDataSessionStore } from "store"
import { useTranslation } from "react-i18next"
import axiosInstance from "../../utils/axios"
import Cookies from "universal-cookie"
import CustomFormData from "../../components/Form/FormData"
import DOMPurify from "dompurify"
import EditorJS from "@editorjs/editorjs"
import env from "../../utils/env"
import Header from "@editorjs/header"
import InfiniteScroll from "react-infinite-scroll-component"
import List from "@editorjs/list"
import MainHeader from "./shikshaChatHeader"
import Notification, { showNotification } from "../../components/ToastMessage/TotastMessage"
import PdfDownloader from "../story/upload-content/pdfDownloader"
import PrivacyPolicyPopup from "../../components/TnC/privacyPolicyPopup"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import ReportEditor from "components/ReportEditor"
import ROUTES from "../../url"
import Sidebar from "./shikshaChatSidebar"
import Swal from "sweetalert2"
import UploadImages from "./upload-images"
import useCustomMediaQuery from "hooks/useCustomMediaQuery"
import useSmartChatStorage from "hooks/useSmartChatStorage"
import useUserDataLocalStore from "store/slices/userData/userDataLocal"
import useVoiceRecord, { default_wave_surfer_config } from "../interview-text-voice/useVoiceRecord"
import WaveSurferPlayer from "../interview-text-voice/voice-player"
import { getChatsFromDB } from "../../api/endpoints/chat_flow"

const cookies = new Cookies()

// TODO: After testing, revert this to the original code
// const wss_protocol = window.location.protocol === "https:" ? "wss://" : "ws://"

const ShikshalokamVoiceBasedChat = ({ type = "", variant = "" }) => {
  // ========== useState Hooks ==========
  const [appendix, setAppendix] = useState([])
  const [asrAudio, setAsrAudio] = useState([])
  const [audioCache, setAudioCache] = useState({})
  const [botNameToDisplay, setBotNameToDisplay] = useState("Bot")
  const [chatTitle, setChatTitle] = useState([])
  const [companySlug, setCompanySlug] = useState("")
  const [editor, setEditor] = useState(null)
  const [editorCopyChanges, setEditorCopyChanges] = useState(null)
  const [error, setError] = useState({ response: "", status: 200 })
  const [fileErrorText, setFileErrorText] = useState("")
  const [files, setFiles] = useState([])
  // const [hasFetchIntro, setHasFetchIntro] = useState(false)
  const [hasOverRideId, setHasOverRideId] = useState(null)
  const [hasStartedListening, setHasStartedListening] = useState(false)
  const [hasStartedRecording, setHasStartedRecording] = useState(false)
  const [intervalId, setIntervalId] = useState(null)
  const [isFetchingData, setIsFetchingData] = useState(false)
  // const [isFetchingOldIntro, setIsFetchingOldIntro] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  // const [isIntroLoading, setIsIntroLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMute, setNotMute] = useState(true)
  const [isNextAllowed, setIsNextAllowed] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isPdfDownloading, setIsPdfDownloading] = useState(false)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [isResetCalled, setIsResetCalled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isStreamingComplete, setIsStreamingComplete] = useState(true)
  const [isTalking, setTalking] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [noStoryFound, setNoStoryFound] = useState(false)
  const [reconText, setReconText] = useState("")
  const [seconds, setSeconds] = useState(0)
  const [sentences, setSentences] = useState([])
  const [sessionTitleDetail, setSessionTitleDetail] = useState(null)
  const [shouldFetchIntro, setShouldFetchIntro] = useState(false)
  const [shouldSendMessage] = useState(true)
  const [ssoNavigationTriggered, setSsoNavigationTriggered] = useState(false)
  const [storyData, setStoryData] = useState(null)
  const [storyMediaIdArray] = useState(null)
  const [textMessage, setTextMessage] = useState("")
  const [trigger, setTrigger] = useState(false)
  const [triggerDownload, setTriggerDownload] = useState(false)
  const [visibleItemCount, setVisibleItemCount] = useState(10)

  // ========== useRef Hooks ==========
  const inputWrapperRef = useRef(null)
  const textAreaRef = useRef(null)
  const lastBotMessageIndex = useRef(-1)
  const isInitialLoadRef = useRef(true)
  const editorContainerRef = useRef(null)
  const endPageToScrollRef = useRef(null)
  const isIntroPlayed = useRef(false)
  const mediaStreamRef = useRef(null)

  const companyBotSignalRef = useRef(new AbortController())
  const companyChatSignalRef = useRef(new AbortController())
  const storySignalRef = useRef(new AbortController())
  const mediaSignalRef = useRef(new AbortController())

  // ========== Other Hooks ==========
  const [chatHistory, setChatHistory, removeChatHistory, getChatHistory] = useSmartChatStorage()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()

  const accessToken = useUserDataLocalStore(state => state.access_token)

  const acceptedTnc = useUserStorage()(state => state.has_accepted_tnc)
  const botName = useChatStorage()(state => state.botName)
  const chatLanguage = useSiteDataSessionStore(state => state.chatLanguage)
  const companyName = useUserStorage()(state => state.companyName)
  const firstName = useUserStorage()(state => state.firstName)
  const introMessage = useChatStorage()(state => state.introMessage)
  const isNewChatOpen = useChatStorage()(state => state.isNewChatOpen)
  const isOldChatOpen = useChatStorage()(state => state.isOldChatOpen)
  const langProgress = useChatStorage()(state => state.langProgress)
  const languageToUse = useSiteDataSessionStore(state => state.chatLanguage)
  const preferredLanguage = useUserStorage()(state => state.preferredLanguage)
  const previousUrl = useSiteStorage()(state => state.previousUrl)
  // const profileId = useUserStorage()(state => state.profileId)
  const profileToUse = useUserStorage()(state => state.profileId)
  const projectIdStore = useChatStorage()(state => state.projectId)
  const selectedType = useChatStorage()(state => state.selectedType)
  const sessionId = useChatStorage()(state => state.sessionId)
  const setChatLanguage = useSiteDataSessionStore(state => state.setChatLanguage)
  const setHasSelectedLanguage = useSiteDataSessionStore(state => state.setHasSelectedLanguage)
  const setLangProgress = useChatStorage()(state => state.setLangProgress)
  const setStorageFlow = useChatStorage()(state => state.setFlow)
  const setStrandStep = useChatDataSessionStore(state => state.setStrandStep)
  const showHomepage = useChatStorage()(state => state.showHomepage)
  const ssoRerouteURL = useSiteStorage()(state => state.ssoRerouteURL)
  const stateMachineLength = useChatStorage()(state => state.stateMachineLength)
  const storageFlow = useChatStorage()(state => state.flow)
  const strandStep = useChatDataSessionStore(state => state.strandStep)
  const taskId = useChatStorage()(state => state.taskId)
  const userState = useUserStorage()(state => state.state)
  const ipCity = useUserStorage()(state => state.ipCity)
  const ipState = useUserStorage()(state => state.ipState)
  const ipZipCode = useUserStorage()(state => state.ipZipCode)
  const ipFetched = useUserStorage()(state => state.ipFetched)
  const showFileInput = useChatDataSessionStore(state => state.showFileInput)

  // chat data actions
  const { setShowHomepage, setBotName, setChatbotClickedOn, setDefaultBotName, setIntroMessage, setIsChatVisible, setIsNewChatOpen, setIsOldChatOpen, setSelectedType, setSessionId, setStateMachineLength } = useChatStorage().getState()
  const { setShowFileInput } = useChatDataSessionStore.getState()

  // user data actions
  const { setAcceptedTnC, setCompanyName, setFirstName, setState } = useUserStorage().getState()
  const { llmError, setLlmError, llmErrorType, setLlmErrorType } = useChatStorage().getState()        
  const { setProfileId: setProfileToUse } = useUserStorage().getState()

  const endStoryMutation = useMutation({ mutationFn: (data) => endStoryApi(data) })

  const { data: companyBotData } = useQuery({
    queryKey: [API_ENDPOINTS.GET_COMPANY_BOT, companySlug, getSessionRoute(), languageToUse, accessToken],
    queryFn: () => getCompanyBotApi({ company_slug: companySlug, route: getSessionRoute(), target_language: languageToUse }),
    enabled: !!(languageToUse && chatHistory?.length === 0 && shouldFetchIntro && isNewChatOpen && (profileToUse || isSpecialFlow)),
  })

  const { data: introMessageData, isLoading: isIntroMessageLoading } = useQuery({
    queryKey: [API_ENDPOINTS.BOT_VERNACULAR, getSessionRoute(), languageToUse],
    queryFn: () => getTranslatedIntroMessageApi({
      language: languageToUse,
      company_bot__route: getSessionRoute(),
    }),
    enabled: !!(companyBotData && languageToUse && companyBotData?.results?.length > 0),
  })

  const { data: chatSessionData } = useQuery({
    queryKey: [API_ENDPOINTS.GET_COMPANY_CHAT, sessionId],
    queryFn: () => getChatsFromDB(sessionId),
    enabled: !!sessionId,
  })

  const { recordings, HiddenRecorder } = useVoiceRecord()

  const navigate = useNavigate()

  const { showGuestPopup, showConfirmationPopup } = useConfirmationPopup()
  const { stopAllAudio, audioRef } = useAudio()

  const onFinalReconnectAttempt = useCallback(() => {
    function onYesButtonClick() {
      try {
        let chat_history = getChatHistory()
        if (Array.isArray(chat_history)) {
          chat_history = chat_history.filter((chat, index) => !(index === chat_history.length - 1 && chat.source === "user"))
        }
        setChatHistory(chat_history)

        if (chat_history?.length === 1) {
          setShowHomepage(true)
        }

        window.location.reload()
      } catch (error) {
        console.error("Error cleaning chat history before reload:", error)
        window.location.reload()
      }
    }

    function onNoButtonClick() {
      if (accessToken) {
        clearFromStorage()
        navigate(-1)
      } else {
        resetChat()
      }
    }

    showConfirmationPopup(onYesButtonClick, onNoButtonClick)
  }, [])

  const onWebSocketClose = useCallback(event => {
    console.log("closed", event)
  }, [])

  const onWebSocketError = useCallback(error => {
    console.log("error", error)
  }, [])

  const onWebSocketOpen = useCallback(() => {
    const chat_history = getChatHistory()

    if (chat_history.filter(chat => chat.source === "user").length < 1) return

    sendSocketMessage({
      type: "authenticate",
      sessionid: sessionId,
      profileid: profileToUse,
      projectid: projectIdStore || searchParams.get("projectId") || "",
      taskid: searchParams.get("taskId") || taskId,
      access_token: accessToken,
      route: chatLanguage,
      bot_route: getSessionRoute(),
      flow_name: storageFlow,
      address: {
        ipCity,
        ipState,
        ipZipCode,
      },
    })
  }, [sessionId, profileToUse, projectIdStore, searchParams, taskId, accessToken, chatLanguage, storageFlow, ipFetched])

  const onWebSocketMessage = useCallback(event => {
    const data = JSON.parse(event.data)
    const message = data["text"]
    if (message.source === "bot") {
      setIsStreamingComplete(false)
      setSentences(prevSentences => {
        const updatedSentences = [...prevSentences]
        const lastSentence = updatedSentences[updatedSentences.length - 1]

        if (lastSentence?.source === "bot") {
          if (message?.msg) {
            lastSentence.message += message?.msg
          }
        } else {
          updatedSentences.push({
            message: message?.msg || "",
            source: "bot",
            isNarrated: false,
            id: new Date().valueOf(),
          })
          lastBotMessageIndex.current = updatedSentences.length - 1
        }
        return updatedSentences
      })
      handleScrollToView()
    } else {
      setIsStreamingComplete(true)
    }

    if (message.source === "user") {
      const chat_history = getChatHistory()
      const updated_chat_history = chat_history.map(chat => {
        if (!chat.received && chat.msg === message.msg) {
          return { ...chat, received: true }
        }
        return chat
      })
      setChatHistory(updated_chat_history)
    }

    if (message.finish_reason === "stop" && message.source === "bot") {
      setStrandStep(message?.step)
      handleScrollToView()
      setTalking(0)
      setIsStreamingComplete(true)
    }
  }, [])

  const {
    sendMessage: sendSocketMessage,
    connect: connectToWebSocket,
    isConnected: isSocketConnected,
    // isFreshConnection,
  } = useChatWebhook(
    buildWebSocketUrl({
      searchParams,
      storageFlow,
      selectedType,
    }),
    {
      onOpen: onWebSocketOpen,
      onMessage: onWebSocketMessage,
      onClose: onWebSocketClose,
      onError: onWebSocketError,
      onFinalReconnectAttempt,
      autoConnect: false,
      reconnectAttempts: env.WEBSOCKET_RETRY_NUM(),
    }
  )

  const isShikshalokamPublicType = true
  const shouldShowChatHistoryFeature = true
  const maxReconnectAttempts = env.WEBSOCKET_RETRY_NUM()

  // ========== useMemo Hooks ==========

  const projectId = useMemo(() => projectIdStore || searchParams.get("projectId"), [projectIdStore, searchParams])

  const isSpecialFlow = useMemo(() => {
    if (!storageFlow) return false
    return [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory, sessionFlowName.ParentPerceptionSurvey].includes(storageFlow)
  }, [storageFlow])

  const shouldFetchChatSession = useMemo(() => {
    return storageFlow && [sessionFlowName.Reflection].includes(storageFlow)
  }, [storageFlow])

  const isInitialising = useMemo(() => {
    console.log("state_tracker", "sessionId", sessionId, "chatHistory", chatHistory)
    return !sessionId || chatHistory?.length === 0
  }, [sessionId, chatHistory])

  // ========================================================================
  // SECTION: Helper Functions (Must be defined before callbacks that use them)
  // These helper functions are used by callbacks and must be defined first
  // ========================================================================

  /**
   * Adds user messages to chat history
   * Creates and appends user message to conversation
   */
  const handleMessagesForUser = sentence => {
    const chat_history = [
      ...chatHistory,
      createMessage({
        msg: sentence,
        source: "user",
      }),
    ]
    setChatHistory(chat_history)

    return chat_history
  }

  async function partialMediaUpdate(updateId, include_in_story = false) {
    try {
      setIsLoading(true)
      const formData = {
        include_in_story: include_in_story,
        flow: storageFlow,
        access_token: accessToken,
        session: sessionId,
      }
      await updateStoryMediaApi({ token: accessToken, data: formData, mediaId: updateId, partialUpdate: true })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onEditorSave() {
    try {
      setIsLoading(true)
      setIsSaving(true)
      const outputData = await editor.save()
      const flow = storageFlow

      let updatePayload = {
        id: storyData?.id,
        access_token: accessToken,
        session: sessionId,
        flow,
      }

      if (flow && [sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(flow)) {
        const blocks = outputData?.blocks || []
        const challenges = getListAfterHeaderText(t("challengesHeader"), blocks)
        const solutions = getListAfterHeaderText(t("solutionsHeader"), blocks)

        updatePayload = {
          ...updatePayload,
          ...storyData?.other_params,
          other_params: {
            ...(storyData?.other_params || {}),
            challenges_faced: challenges,
            solutions_discussed: solutions,
          },
          formatted_content: null,
        }
      } else if (flow && [sessionFlowName.ListeningActivity].includes(flow)) {
        const blocks = outputData?.blocks || []
        const questionAnswers = getQuestionAnswersFromBlocks(blocks)

        updatePayload = {
          ...updatePayload,
          ...storyData?.other_params,
          other_params: {
            ...(storyData?.other_params || {}),
            question_answers: questionAnswers,
          },
          formatted_content: null,
        }
      } else {
        updatePayload = {
          ...updatePayload,
          formatted_content: outputData?.blocks,
        }
      }

      const result = await partialUpdateStoryById({
        token: accessToken,
        data: updatePayload,
        storyId: updatePayload.id,
      })
      setStoryData(result)
      setIsSaving(false)
    } catch (error) {
      setIsLoading(false)
      setIsSaving(false)
      console.error("Saving failed: ", error)
      if (accessToken) {
        clearFromStorage()
        navigate(-1)
      }
    } finally {
      window.location.reload()
    }
  }

  /**
   * Stops audio playback and resets TTS state
   * Clears sentences queue and allows next audio to play
   */
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

  /**
   * Transforms chat data from API into sentences and chat history format
   * @param {Object} chat - Chat object from API
   * @param {string} introMessage - The intro message to skip duplicates
   * @returns {Object|null} Transformed message object or null if should be skipped
   */
  const transformChatMessage = (chat, introMessage) => {
    // Skip intro message duplicates
    if (chat?.id === "intro_msg_id" || chat?.message === introMessage) {
      return null
    }

    // Use translated message if available
    const messageToUse = chat?.translated_message && chat?.translated_message !== "" ? chat?.translated_message : chat?.message

    const isBot = chat?.sender?.id === 1

    return {
      sentence: {
        message: isBot ? messageToUse : chat?.message,
        source: isBot ? "bot" : "user",
        isNarrated: true,
        id: chat?.id,
      },
      chatHistory: {
        msg: isBot ? messageToUse : chat?.message,
        source: isBot ? "bot" : "user",
        updated_at: chat?.id,
      },
    }
  }

  /**
   * Comparison functions for sorting by ID
   */
  function compareById(a, b) {
    return a.id - b.id
  }

  function compareByIdDesc(a, b) {
    return b.id - a.id
  }

  /**
   * Quick sort implementation for sorting arrays
   * @param {Array} arr - Array to sort
   * @param {Function} compare - Comparison function
   * @returns {Array} Sorted array
   */
  function quickSort(arr, compare) {
    if (arr?.length <= 1) {
      return arr
    }

    const pivot = arr[0]
    const left = []
    const right = []

    for (let i = 1; i < arr?.length; i++) {
      if (compare(arr[i], pivot) < 0) {
        left.push(arr[i])
      } else {
        right.push(arr[i])
      }
    }

    return [...quickSort(left, compare), pivot, ...quickSort(right, compare)]
  }

  /**
   * Sends user message through WebSocket connection
   * Handles message submission, WebSocket connection, and UI updates
   */
  function handleSendMessage(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    setLlmError("")
    handleOnStopSpeaking()
    setIsChatVisible(true)
    setShowHomepage(false)
    setNotMute(true)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    console.log(textMessage, "textMessage")

    if (!textMessage.trim()) return

    const chat_history = handleMessagesForUser(textMessage)
    if (chat_history.filter(chat => chat.source === "user").length === 1 || !isSocketConnected) {
      connectToWebSocket()
      sendSocketMessage({
        type: "authenticate",
        sessionid: sessionId,
        profileid: profileToUse,
        projectid: projectIdStore || searchParams.get("projectId") || "",
        taskid: searchParams.get("taskId") || taskId,
        access_token: accessToken,
        route: chatLanguage,
        bot_route: getSessionRoute(),
        flow_name: storageFlow,
        address: {
          ipCity,
          ipState,
          ipZipCode,
        },
      })
    }
    sendSocketMessage({
      text: textMessage,
      context: "",
      asr_audio: asrAudio && asrAudio.length > 0 ? asrAudio.join(',') : null
    })
    setAsrAudio([])

    handleScrollToView()
    setTextMessage("")
  }

  // ========================================================================
  // SECTION: Message & Chat Handling Callbacks
  // These callbacks manage sending messages and fetching chat history
  // ========================================================================

  /**
   * Fetches company chat history for the current session
   * Transforms and batches chat messages to avoid duplicates
   */
  const handleCompanyChatCall = useCallback(async () => {
    try {
      const storedChatHistory = chatHistory
      if (storedChatHistory.length >= 1) {
        return
      }

      // setIsFetchingOldIntro(true)

      try {
        companyChatSignalRef.current = new AbortController()
        const sortedResult = quickSort(Array.isArray(chatSessionData?.results) ? chatSessionData.results : [], compareById)

        const intro_message = introMessage
        

        // Collect all new sentences and chat history items
        const newSentences = []
        const newChatHistoryItems = []

        // Use Set with IDs for reliable duplicate detection
        const existingChatIds = new Set(chatHistory.map(msg => msg.updated_at))

        // Add intro message if it exists and not already in history
        if (intro_message && !existingChatIds.has("intro_msg_id")) {
          newSentences.push({
            message: intro_message,
            source: "bot",
            isNarrated: true,
            id: "intro_msg_id",
          })

          newChatHistoryItems.push({
            msg: intro_message,
            source: "bot",
            updated_at: "intro_msg_id",
            received: true,
          })
        }

        // Process all chat messages
        sortedResult.forEach(chat => {
          const transformed = transformChatMessage(chat, intro_message)
          if (!transformed) {
            return // Skip duplicates
          }

          // Only add if not already in chat history
          if (!existingChatIds.has(transformed.chatHistory.updated_at)) {
            newSentences.push(transformed.sentence)
            newChatHistoryItems.push(transformed.chatHistory)
          }
        })

        // Batch state updates - update all at once
        if (newSentences.length > 0) {
          setSentences(prev => [...prev, ...newSentences])
        }

        if (newChatHistoryItems.length > 0) {
          setChatHistory([...chatHistory, ...newChatHistoryItems])
          lastBotMessageIndex.current += newChatHistoryItems.length
        }
      } catch (error) {
        console.error("Error fetching company chat data:", error)
      } finally {
        if (accessToken) {
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Error fetching company chat data:", error)
    } finally {
      // setIsFetchingOldIntro(false)
      if (accessToken) {
        setIsLoading(false)
      }
    }
  }, [introMessage, sessionId, chatSessionData])

  /**
   * Handles chat session button clicks from sidebar
   * Loads selected chat session or fetches intro for new session
   */
  const handleChatSessionButtonClick = useCallback(
    async ({ key }) => {
      lastBotMessageIndex.current = -1
      let key_num
      let currentSession
      if (key) {
        /** String representation of array index that can be converted to number */
        key_num = parseInt(key?.split("-").pop())
        if (isNaN(key_num)) return
        currentSession = chatTitle[key_num]?.session
        setLlmError("")
        setIsOldChatOpen(true)
        setIsNewChatOpen(false)
        setSessionId(currentSession)
        setChatHistory([])
        window.location.reload()
      } else {
        try {
          await handleCompanyChatCall()
        } catch (error) {
          console.error(error)
        }
      }
    },
    [sessionId, introMessage, handleCompanyChatCall]
  )

  /**
   * Adds bot messages to chat history during streaming
   * Prevents duplicate messages and manages message state
   */
  const handleMessagesForBot = useCallback(
    sentence => {
      if (isRecognizing || hasStartedListening || !shouldSendMessage) return

      const lastMessage = chatHistory[chatHistory?.length - 1]
      if (lastMessage?.msg === sentence && lastMessage?.source === "bot") {
        return
      }

      if (chatHistory[chatHistory?.length - 1]?.source === "bot") {
        const lastMessage = chatHistory[chatHistory?.length - 1]
        lastMessage.msg += " " + sentence
        setChatHistory([...chatHistory])
      } else {
        setChatHistory([
          ...chatHistory,
          createMessage({
            msg: sentence,
            source: "bot",
            received: true,
          }),
        ])
      }
    },
    [chatHistory]
  )

  useEffect(() => {
    if (chatHistory.length > 1) {
      setShowHomepage(false)
      setIsOldChatOpen(true)
      setIsNewChatOpen(false)
    } else {
      setShowHomepage(true)
    }
  }, [chatHistory])

  // ========================================================================
  // SECTION: Variable Definitions
  // ========================================================================
  // const { access_token } =  getStorageSlice(STORE_NAME_CONSTANTS.USER_DATA, 'localStorage').getState();
  const selectedLabel = {
    types: [
      { label: t("guidedReflection"), value: "normal" },
      { label: t("oneStepReflection"), value: "oneshot" },
    ],
  }
  const fileExceedText = t("fileExceedText")
  const fileSizeText = t("fileSizeText")
  let isMobile = useCustomMediaQuery("(max-width: 500px)")
  let chatToAddLength = isMobile ? 10 : 10

  useEffect(() => {
    if (!introMessageData || introMessageData?.length === 0) return

    let message = introMessageData[0]?.introductory_message
    if (profileToUse && firstName && firstName !== "null" && firstName !== "") {
      message = introMessageData[0]?.introductory_message
    } else {
      message = introMessageData[0]?.alt_introductory_message
    }
    const botName = introMessageData[0]?.name || "Bot"

    setBotName(botName)
    setDefaultBotName(introMessageData[0]?.default_name)
    setBotNameToDisplay(botName)

    if (isOldChatOpen) {
      getSessionInfo().then(sessionInfo => {
        if (sessionInfo && sessionInfo.length > 0) {
          setStrandStep(sessionInfo[0]?.current_step)
          if (sessionInfo[0]?.session_type) {
            setSelectedType(sessionInfo[0]?.session_type)
          }
        }
      })
    }
    if (message && firstName) {
      const words = message.split(" ")
      words.splice(1, 0, firstName)
      message = words.join(" ")
    }
    if (message && !!message?.trim() && chatHistory[chatHistory?.length - 1]?.msg !== message && !sentences.some(msg => msg.message === message)) {
      setIntroMessage(message)
      setSentences(prev => [
        ...prev,
        {
          message: message,
          isNarrated: false,
          id: "intro_msg_id",
        },
      ])
      if (isSpecialFlow) {
        setHasOverRideId("intro_msg_id")
        setNotMute(false)
        setIsNextAllowed(true)
      }
    }

    setShouldFetchIntro(false)
    setIsLoading(false)
  }, [introMessageData])


  useEffect(() => {
    if (!companyBotData) return

    const bots = companyBotData?.results
    let storedRoute = getSessionRoute()

    if (!bots || bots.length === 0) {
      handleScrollToView()
      return
    }

    const selectedBot = bots.find(bot => bot.route === storedRoute) || bots[0] || { route: "/" }
    if (selectedBot?.statemachine_length) {
      setStateMachineLength(selectedBot.statemachine_length)
    }

    // Find the latest bot based on flow type
    const latestBot = bots.find(bot => bot.route === storedRoute)
    if (!latestBot) {
      handleScrollToView()
    }

    if (!storageFlow || ![sessionFlowName.LoginMiStory].includes(storageFlow)) {
      handleCompanyChatCall()
    }

  }, [companyBotData, introMessage, chatSessionData])

  // ========================================================================
  // SECTION: Lifecycle & Browser Events (Execution Order: 1 - On Mount)
  // These effects run once when component mounts and set up event listeners
  // ========================================================================

  /**
   * Network monitoring - detects online/offline status and connection speed
   * Shows toast notifications for network changes
   */
  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    let toastId = null

    const checkNetworkSpeed = () => {
      if (connection) {
        const { effectiveType, downlink } = connection
        if (effectiveType && (effectiveType === "2g" || effectiveType === "3g") && navigator.onLine) {
          if (toastId) {
            toast.dismiss(toastId)
          }
          const message = t("networkWarning")
          toastId = showNotification({
            message: message,
            type: "warning",
            options: {
              position: "top-center",
              style: { fontWeight: "bold", color: "#1D1616" },
            },
          })
        }
      }
    }

    const handleOffline = () => {
      if (toastId) {
        toast.dismiss(toastId)
      }
      toastId = toast.error(t("offlineNetwork"), {
        position: "top-center",
        style: { fontWeight: "bold", color: "#fff" },
      })
    }

    const handleOnline = () => {
      if (toastId) {
        toast.dismiss(toastId)
      }
      toastId = toast.success(t("onlineNetwork"), {
        position: "top-center",
        style: { fontWeight: "bold", color: "#1D1616" },
      })
      checkNetworkSpeed()
    }

    checkNetworkSpeed()
    connection?.addEventListener("change", checkNetworkSpeed)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      connection?.removeEventListener("change", checkNetworkSpeed)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  /**
   * Browser back button handling - intercepts browser navigation
   * Shows guest popup for special flows or navigates to previous page
   */
  useEffect(() => {
    const currentFlow = storageFlow
    const handleBack = () => {
      console.log("History length:", window.history.length)
      console.log("Can go back 1?", window.history.length > 1)
      console.log("Can go back 3?", window.history.length > 3)
      if ((acceptedTnc || acceptedTnc === "ONGOING") && currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory, sessionFlowName.SsoFlow, sessionFlowName.ParentPerceptionSurvey].includes(currentFlow)) {
        if (ssoNavigationTriggered && accessToken) {
          console.log("isnide navigate happens")
          navigate(-2)
        } else {
          showGuestPopup(navigateBack, stayOnPage)
        }
      } else {
        setLanguage(languageList[0].value)
        setChatLanguage(languageList[0].value)
        stopAllAudio()
        if (accessToken) {
          clearFromStorage()
          navigateSsoFlow(ssoRerouteURL)
        } else {
          navigate(ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN)
        }
      }
    }
    // Check if we already pushed a custom state
    if (!window.history.state?.isCustom) {
      console.log("shouldPushState is true so pushing state now.")
      window.history.pushState({ isCustom: true }, "", window.location.href)
    }

    window.addEventListener("popstate", handleBack)

    return () => {
      window.removeEventListener("popstate", handleBack)
    }
  }, [navigate, acceptedTnc])

  // ========================================================================
  // SECTION: Initial Configuration (Execution Order: 2 - On Mount & Specific Deps)
  // These effects initialize component state and configuration on mount
  // ========================================================================

  /**
   * Initialize visible item count for chat history pagination
   * Sets initial number of visible chat sessions
   */
  useEffect(() => {
    setVisibleItemCount(chatToAddLength)
  }, [chatToAddLength])

  /**
   * Initialize bot name display from storage
   * Updates bot name when available in storage
   */
  useEffect(() => {
    if (botName && botName?.trim()) {
      setBotNameToDisplay(botName)
    }
  }, [botName])

  useEffect(() => {
    if (!profileToUse) {
      setCompanySlug("shikshalokamstaging")
      return
    }

    getProfileUserApi(profileToUse, accessToken).then(profile => setCompanySlug(profile?.company?.slug))
  }, [profileToUse])

  /**
   * Initialize new chat state based on existing chat history
   * Sets isNewChatOpen flag if chat history is present
   */
  useEffect(() => {
    if (chatHistory?.length !== 0) {
      setIsNewChatOpen(true)
    }
  }, [])

  /**
   * Initialize language selection for guest flows on mount
   * Handles language change and TnC acceptance for guest users
   */
  useEffect(() => {
    const handleLanguageSelect = language => {
      if (chatHistory && !chatHistory.length) {
        stopAllAudio()
        isIntroPlayed.current = false
        // setIsLoading(true)
        setIntroMessage(null)
        setChatHistory([])
        setSentences([])
        setLangProgress("IN_PROGRESS")
        setAudioCache({})
        setLanguage(language)

        const isTncAccepted = acceptedTnc
        if (isTncAccepted && isTncAccepted !== "ONGOING") {
          setIsLoading(false)
          setAcceptedTnC(true)
          setShouldFetchIntro(true)
        } else {
          // setIsLoading(false)
        }
      }
    }
    if (chatLanguage && storageFlow) {
      // setIsLoading(true)
      handleLanguageSelect(chatLanguage)
    }
  }, [chatLanguage, storageFlow])

  // ========================================================================
  // SECTION: User Profile & Authentication (Execution Order: 3 - On Token Available)
  // These effects handle user authentication and profile creation
  // ========================================================================

  /**
   * Create user profile for authenticated users
   * Fetches user details, creates session, and initializes user-specific data
   */
  useEffect(() => {
    async function createUserProfile() {
      try {
        setIsLoading(true)

        const response = await createUserProfileApi({
          access_token: accessToken,
        })

        if (response) {
          const data = response.profile_details
          const preferredLanguage = preferredLanguage || {}
          let language = LANGUAGE_ENUMS.ENGLISH
          if (preferredLanguage) {
            language = preferredLanguage.value
          } else if (languageToUse) {
            language = languageToUse
          }
          setStorageFlow(type)
          setChatLanguage(language)
          setLanguage(language)
          setProfileToUse(data?.id)
          if (!sessionId) {
            let session = await getSessionDetails()
            setSessionId(session.sessionid)
          }
          setFirstName(data?.first_name)
          setCompanyName(data?.company?.slug)
          setState(data?.profile_address[0]?.state)
          setIsNewChatOpen(true)
        } else {
          navigate(ROUTES.EXIT_ROUTE)
          clearFromStorage()
          navigate(-1)
        }
      } catch (error) {
        console.error(error)
        clearFromStorage()
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }

    if (!profileToUse && accessToken) {
      createUserProfile()
      setShouldFetchIntro(true)
      setIsStreamingComplete(true)
    }
  }, [accessToken, profileToUse])

  /**
   * Fetch chat session for Reflection flow based on projectId
   * Retrieves existing session for project-based reflections
   */
  useEffect(() => {
    async function fetchChatSession() {
      let response = null
      response = await getChatSessionApi({ projectId, sessionId }).then(res => res.data)
      if (!response) return
      if (response.results.length === 0) return
      setSessionId(response.results[0].session)
      setIsOldChatOpen(true)
      setIsNewChatOpen(false)
    }

    if (!shouldFetchChatSession) return
    fetchChatSession()
  }, [projectId, shouldFetchChatSession])

  // ========================================================================
  // SECTION: Session & Chat Configuration (Execution Order: 4 - After Auth)
  // These effects manage session state, chat visibility, and bot configuration
  // ========================================================================

  /**
   * Set up public type configuration and trigger intro fetch
   * Enables intro message fetching for public/guest flows
   */
  useEffect(() => {
    if (isShikshalokamPublicType) {
      setShouldFetchIntro(true)
      setIsStreamingComplete(true)
    }
  }, [isShikshalokamPublicType])

  /**
   * Handle chat history feature visibility and homepage display
   * Controls homepage vs chat view based on new/old chat state
   */
  useEffect(() => {
    if (shouldShowChatHistoryFeature) {
      if (isOldChatOpen === true) {
        setShouldFetchIntro(true)
        setShowHomepage(false)
      } else if (isNewChatOpen === true) {
        setShowHomepage(true)
      }
    } else {
      removeChatHistory()
    }
  }, [isOldChatOpen, isNewChatOpen])

  /**
   * Fetch chat session when old chat is opened
   * Loads existing conversation when user selects from history
   */
    useEffect(() => {
      if (isOldChatOpen === true && introMessage && isSpecialFlow && chatHistory?.length === 0 && sentences?.length === 0) {
        handleChatSessionButtonClick({ key: null })
      }
    }, [isOldChatOpen, introMessage, chatHistory, sentences])


  // ========================================================================
  // SECTION: Language & Bot Setup (Execution Order: 5 - When Profile Ready)
  // These effects fetch bot information and set up language-specific configuration
  // ========================================================================

  /**
   * Set language progress to complete when intro message loads
   * Marks language selection as complete after successful load
   */
  useEffect(() => {
    if (introMessage && !isLoading) {
      setLangProgress(true)
    }
  }, [isLoading, introMessage])

  // ========================================================================
  // SECTION: Story & Media Management (Execution Order: 6 - When Session Ready)
  // These effects handle story creation, media uploads, and completion
  // ========================================================================

  /**
   * Fetch story content by session ID
   * Retrieves story data and prepares editor content blocks
   */
  useEffect(() => {
    if (!sessionId) return

    async function fetchStory() {
      try {
        storySignalRef.current = new AbortController()
        const story_data = await getStoryBySessionAPI(sessionId, storySignalRef.current.signal)

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
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") {
          return
        }
        console.error(error)
      }
    }

    fetchStory()

    return () => {
      storySignalRef.current.abort()
    }
  }, [sessionId])

  /**
   * Fetch media files associated with story
   * Loads images and media items included in the story
   */
  useEffect(() => {
    const fetchMedia = async () => {
      if (storyData && storyData?.id !== "") {
        if (accessToken || accessToken) {
          openModal()
        }
        const story_id = storyData?.id
        const tempMediaArr = []
        setIsImageUploading(true)

        try {
          mediaSignalRef.current = new AbortController()
          const data = await getStoryAllMedia({
            data: {
              story: story_id,
            },
            signal: mediaSignalRef.current.signal
          })

          for (let item of Object.values(data?.results || [])) {
            if (item.include_in_story) {
              tempMediaArr.push(item)
            }
          }
          setFiles(tempMediaArr)
          setIsImageUploading(false)
        } catch (error) {
          console.error("Error fetching story media:", error)
          setIsImageUploading(false)
        }
      }
    }

    fetchMedia()

    return () => {
      mediaSignalRef.current.abort()
    }
  }, [accessToken, storyData])

  /**
   * Trigger story completion when conversation reaches end
   * Calls end-story API when all state machine steps complete
   */
  useEffect(() => {
    if (storageFlow && [sessionFlowName.ParentPerceptionSurvey].includes(storageFlow)) {
      return
    }
    // if (sentences.filter(sent => !sent.isNarrated).length > 0) return
    if (!endStoryMutation.isPending  && isStreamingComplete && stateMachineLength && strandStep >= stateMachineLength && noStoryFound && (!llmError || llmError === "") && acceptedTnc && acceptedTnc !== "ONGOING") {
      callEndStory()
    }
  }, [isStreamingComplete, accessToken, stateMachineLength, languageToUse, noStoryFound, storageFlow, sentences])

  useEffect(() => {
    const isLastMessageFromBot = chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.source === "bot"
    if (storageFlow && [sessionFlowName.ParentPerceptionSurvey].includes(storageFlow) && isStreamingComplete && stateMachineLength && strandStep >= stateMachineLength && isLastMessageFromBot) {
      Swal.fire({
        title: t("PPsCompletionMessage"),
        showCancelButton: false,
        confirmButtonText: t("PPsCompletionCTA"),
        showCloseButton: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        imageUrl: "https://static-media.gritworks.ai/fe-images/PNG/Shikshalokam/check-mark.png",
        imageHeight: "100",
      }).then(result => {
        if (result.isConfirmed) {
          clearFromStorage()
          setLanguage(LANGUAGE_ENUMS.ENGLISH)
          setChatLanguage(LANGUAGE_ENUMS.ENGLISH)
          setHasSelectedLanguage(false)
          stopAllAudio()
          navigate(-2)
        }
      })
    }
  }, [isStreamingComplete, strandStep, stateMachineLength, storageFlow, chatHistory])

  /**
   * Display chat session titles for guest users after delay
   * Shows available chat sessions in sidebar with loading state
   */
  useEffect(() => {
    const currentFlow = storageFlow
    if (profileToUse && !accessToken && !endStoryMutation.isPending && ![sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory, sessionFlowName.ParentPerceptionSurvey].includes(currentFlow)) {
      console.log("setting loading to true", "state_tracker")
      setIsLoading(true)
      const titleTime = setTimeout(() => {
        if (shouldShowChatHistoryFeature) showChatTitle()
      }, 4000)

      return () => {
        if (!noStoryFound) {
          setIsLoading(false)
        }
        clearTimeout(titleTime)
      }
    } else if (!endStoryMutation.isPending && ![sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory, sessionFlowName.ParentPerceptionSurvey].includes(currentFlow)) {
      setIsLoading(false)
    }
  }, [profileToUse, accessToken, endStoryMutation.isPending, noStoryFound])

  // ========================================================================
  // SECTION: UI State Management (Execution Order: 7 - Throughout Lifecycle)
  // These effects manage UI state, modals, and visual feedback
  // ========================================================================

  /**
   * Control body scroll overflow based on loading and modal states
   * Prevents background scrolling when modals or loaders are active
   */
  useEffect(() => {
    if (isLoading || endStoryMutation.isPending || isModalOpen || acceptedTnc === "ONGOING") {
      document.body.style.overflowY = "hidden"
    } else {
      document.body.style.overflowY = "auto"
    }

    return () => {
      document.body.style.overflowY = "auto"
    }
  }, [isLoading, endStoryMutation.isPending, isModalOpen])

  /**
   * Auto-dismiss file upload error messages after 5 seconds
   * Clears error text to improve user experience
   */
  useEffect(() => {
    const textErrorTime = setTimeout(() => {
      setFileErrorText("")
    }, 5000)

    return () => {
      clearTimeout(textErrorTime)
    }
  }, [fileErrorText])

  /**
   * Track voice recording duration with timer
   * Updates recording time counter every second during recording
   */
  useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
      setIntervalId(id)
    } else {
      clearInterval(intervalId)
      setSeconds(0)
    }

    return () => clearInterval(intervalId)
  }, [hasStartedRecording])


  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    setHasStartedRecording(false)
  }, [mediaRecorder])


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (hasStartedRecording) {
          stopRecording()
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [hasStartedRecording, stopRecording])

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
    }
  }, [])
  /**
   * Dynamically adjust textarea height based on content
   * Provides better UX by expanding textarea as user types
   */
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto"
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [textMessage])

  // ========================================================================
  // SECTION: Chat History & Messages (Execution Order: 8 - During Conversation)
  // These effects manage chat messages, recordings, and scroll behavior
  // ========================================================================

  /**
   * Update chat history index and trigger scroll to view
   * Keeps track of last bot message and scrolls to latest message
   */
  useEffect(() => {
    lastBotMessageIndex.current = chatHistory?.length - 1
    if (!showFileInput) handleScrollToView()
  }, [chatHistory])

  /**
   * Scroll to end of page when file input section appears
   * Ensures user sees upload controls after story completion
   */
  useEffect(() => {
    if (!isLoading && showFileInput && acceptedTnc !== "ONGOING") {
      endPageToScrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [isLoading, showFileInput, acceptedTnc])

  /**
   * Attach audio recordings to user messages in chat history
   * Updates latest user message with voice recording data
   */
  useEffect(() => {
    if (!!recordings?.length && chatHistory[chatHistory?.length - 1]?.source !== "bot") {
      const updatedChatHistory = [...chatHistory]
      updatedChatHistory[chatHistory?.length - 1] = {
        ...updatedChatHistory[chatHistory?.length - 1],
        recording: recordings[recordings?.length - 1],
      }
      console.log("state_tracker", updatedChatHistory)
      setChatHistory(updatedChatHistory)
    }
    return () => {}
  }, [recordings, chatHistory])

  /**
   * Attach appendix URLs to bot messages when available
   * Adds supplementary content links to bot responses
   */
  useEffect(() => {
    if (!!appendix?.length && chatHistory[chatHistory?.length - 1].source === "bot") {
      const lastMessage = chatHistory[chatHistory?.length - 1]
      lastMessage.appendixURL = appendix
      lastMessage.hasAppendix = true
      setChatHistory([...chatHistory])
      setAppendix([])
    }
    return () => {}
  }, [appendix, chatHistory])

  /**
   * Reset recognition text and trigger state after processing
   * Manages voice recognition cleanup after message processing
   */
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

  // ========================================================================
  // SECTION: Audio & TTS Management (Execution Order: 9 - During Message Playback)
  // These effects handle text-to-speech, audio playback, and speaker controls
  // ========================================================================

  /**
   * Control audio mute/unmute state
   * Toggles audio muting based on user preference
   */
  useEffect(() => {
    if (audioRef?.current) {
      if (isMute) {
        audioRef.current.muted = true
      } else {
        audioRef.current.muted = false
      }
    }
  }, [isMute])

  /**
   * Auto-play audio for bot messages when streaming completes
   * Automatically triggers TTS playback for new bot responses
   */
  useEffect(() => {
    let shouldPlay = false
    if (showFileInput) {
      shouldPlay = true
    } else if ((noStoryFound || noStoryFound === null) && !isIntroMessageLoading && !isLoading && !endStoryMutation.isPending) {
      const currentFlow = storageFlow

      if (currentFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.GuestMiStory, sessionFlowName.ParentPerceptionSurvey].includes(currentFlow)) {
        if (chatHistory.length > 0) {
          if (isStreamingComplete && chatHistory[chatHistory.length - 1]?.source === "bot") {
            shouldPlay = true
          }
        } else if (langProgress === "IN_PROGRESS") {
          shouldPlay = false
        } else {
          shouldPlay = true
        }
      } else if (chatHistory && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.source === "bot" && !isIntroMessageLoading && !isLoading && !endStoryMutation.isPending) {
        shouldPlay = true
      }
    }
    if (isStreamingComplete && shouldPlay && !endStoryMutation.isPending && !isLoading && !isPdfDownloading && isMute && acceptedTnc && acceptedTnc !== "ONGOING" && !isIntroMessageLoading) {
      const speakerButtons = document.querySelectorAll(".button-11.button-3")
      const lastSpeakerButton = speakerButtons[speakerButtons.length - 1]

      if (lastSpeakerButton) {
        lastSpeakerButton.click()
      }
    }
  }, [isStreamingComplete, showFileInput, showHomepage, endStoryMutation.isPending, isLoading, isPdfDownloading, storyData, chatHistory, isMute, acceptedTnc, isIntroMessageLoading, noStoryFound])

  /**
   * Process TTS requests for unnarrated bot messages
   * Converts text to speech for messages not yet played aloud
   */
  useEffect(() => {
    let unnarratedMessages = sentences.filter(x => !x?.isNarrated)
    let hasUnnarratedMessages = !!unnarratedMessages?.length
    let sourceLanguage = languageToUse
    if (acceptedTnc === "ONGOING") {
      return () => {}
    }
    if (isNextAllowed && hasUnnarratedMessages && !isLoading && !endStoryMutation.isPending) {
      handleAI4BharatTTSRequest(unnarratedMessages[0].message, unnarratedMessages[0].id, sourceLanguage)
    }

    return () => {}
  }, [isNextAllowed, sentences, languageToUse, isLoading, endStoryMutation.isPending, acceptedTnc])

  /**
   * Debug log for tracking override ID changes
   * Helps debug audio playback override scenarios
   */
  useEffect(() => {
    console.log("hasOverideId: ", hasOverRideId)
  }, [hasOverRideId])

  // ========================================================================
  // SECTION: Editor Management (Execution Order: 10 - When Modal Opens)
  // These effects initialize and manage the EditorJS instance for story editing
  // ========================================================================

  /**
   * Initialize EditorJS when modal opens with story data
   * Configures editor with flow-specific content (challenges/solutions or Q&A)
   */
  useEffect(() => {
    if (!!editorCopyChanges && isModalOpen && storyData) {
      const flow = storageFlow
      let parsed_content = []
      try {
        if (storageFlow && [sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(storageFlow)) {
          const challenges = storyData?.other_params?.challenges_faced || []
          const solutions = storyData?.other_params?.solutions_discussed || []

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
          ]
        } else if (storageFlow && [sessionFlowName.ListeningActivity].includes(flow)) {
          const questionAnswers = storyData?.other_params?.question_answers || []

          parsed_content = []
          questionAnswers.forEach((qa, index) => {
            // Add question header
            parsed_content.push({
              type: "header",
              data: {
                text: `Q${index + 1}: ${qa.question}`,
                level: 3,
                customId: `question-${index}`,
              },
            })

            parsed_content.push({
              type: "paragraph",
              data: {
                text: qa.answer || "",
              },
            })

            if (index < questionAnswers.length - 1) {
              parsed_content.push({
                type: "paragraph",
                data: {
                  text: "​",
                },
                readonly: true,
              })
            }
          })
        } else {
          parsed_content = editorCopyChanges.map(item => ({
            type: item.type,
            data: {
              text: item.data.text,
            },
          }))
        }
      } catch (error) {
        parsed_content = []
      }

      if (!document.getElementById("editorjs")) {
        return
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
          setEditor(_editor)
          const style = document.createElement("style")
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
          `
          document.head.appendChild(style)
          setTimeout(() => {
            const blocks = document.querySelectorAll(".ce-block")

            blocks.forEach((block, blockIndex) => {
              const headerEl = block.querySelector(".ce-header")
              const paragraphEl = block.querySelector(".ce-paragraph")

              if (headerEl) {
                const text = headerEl.innerText.trim().toLowerCase()

                if (text === t("challengesHeader").toLowerCase() || text === t("solutionsHeader").toLowerCase() || (text.startsWith("q") && text.includes(":"))) {
                  headerEl.setAttribute("contenteditable", "false")
                  headerEl.style.pointerEvents = "none"
                  headerEl.style.color = "#374151"
                  headerEl.style.fontWeight = "bold"

                  if (text.startsWith("q") && text.includes(":")) {
                    headerEl.classList.add("question-header")

                    block.classList.add("non-deletable")
                    block.setAttribute("data-readonly", "true")

                    const preventDeletion = e => {
                      if (e.key === "Backspace" || e.key === "Delete") {
                        e.preventDefault()
                        e.stopPropagation()
                        return false
                      }
                    }

                    block.addEventListener("keydown", preventDeletion, true)
                    headerEl.addEventListener("keydown", preventDeletion, true)

                    block.addEventListener(
                      "contextmenu",
                      e => {
                        e.preventDefault()
                        return false
                      },
                      true
                    )

                    block.style.userSelect = "none"
                    block.style.webkitUserSelect = "none"
                    block.style.mozUserSelect = "none"
                    block.style.msUserSelect = "none"
                  }
                }
              } else if (paragraphEl) {
                const paragraphText = paragraphEl.textContent || paragraphEl.innerText || ""
                const isEmpty = !paragraphText.trim() || paragraphText === "​" || paragraphText === " "

                const prevBlock = block.previousElementSibling
                const prevPrevBlock = prevBlock?.previousElementSibling

                const isPrevBlockAnswer = prevBlock?.querySelector(".ce-paragraph")
                const isPrevPrevBlockQuestion = prevPrevBlock?.querySelector(".ce-header")?.innerText.toLowerCase().startsWith("q")

                if (isEmpty && isPrevBlockAnswer && isPrevPrevBlockQuestion) {
                  block.classList.add("spacer-block")
                  paragraphEl.setAttribute("contenteditable", "false")
                  paragraphEl.style.pointerEvents = "none"
                  paragraphEl.style.userSelect = "none"
                  paragraphEl.style.cursor = "default"

                  const preventInteraction = e => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                    return false
                  }

                  block.addEventListener("click", preventInteraction, true)
                  block.addEventListener("mousedown", preventInteraction, true)
                  block.addEventListener(
                    "focus",
                    e => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (e.target.blur) e.target.blur()
                      return false
                    },
                    true
                  )
                  block.addEventListener("keydown", preventInteraction, true)
                  block.addEventListener("keyup", preventInteraction, true)
                  block.addEventListener("input", preventInteraction, true)

                  block.style.userSelect = "none"
                  block.style.webkitUserSelect = "none"
                  block.style.mozUserSelect = "none"
                  block.style.msUserSelect = "none"
                } else if (isPrevBlockAnswer === false && prevBlock?.querySelector(".ce-header")?.innerText.toLowerCase().startsWith("q")) {
                  paragraphEl.classList.add("answer-paragraph")
                }
              }
            })
          }, 500)
        },
        defaultBlock: "paragraph",
        data: {
          blocks: parsed_content.length > 0 ? parsed_content : [{ type: "paragraph", data: { text: "" } }],
        },
        onChange: async (api, event) => {
          setIsSaving(false)
          const savedData = await api.saver.save()

          const filteredBlocks = savedData.blocks.filter((block, index) => {
            if (block.type === "paragraph") {
              const isEmpty = !block.data.text.trim() || block.data.text === "​" || block.data.text === " "
              return !isEmpty
            }
            return true
          })

          const imageBlocks = filteredBlocks.filter(block => block.type === "image")
          if (!isInitialLoadRef.current) {
            if (storyMediaIdArray?.length !== imageBlocks?.length) {
              for (let i = 0; i < storyMediaIdArray?.length; i++) {
                const storyFile = storyMediaIdArray[i]
                let fileFound = false
                for (let j = 0; j < imageBlocks?.length; j++) {
                  if (storyFile?.file === imageBlocks[j]?.data?.url) {
                    fileFound = true
                    break
                  }
                }
                if (!fileFound) {
                  partialMediaUpdate(storyFile?.id)
                }
              }
            }
          }
        },
      })
    }

    return () => {
      if (!!Object.keys(editor || {})?.length) editor.destroy()
    }
  }, [editorCopyChanges, isModalOpen, storyData])

  const formatTime = secs => {
    const minutes = Math.floor(secs / 60)
    const seconds = secs % 60
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

function handleLlmError(errorMessage, errorType) {
  setLlmError(errorMessage)
  setLlmErrorType(errorType || "generic_error")
}

  async function callEndStory(hasClickedOnRegenerate = false) {
    let endStoryResponse
    if ((isStreamingComplete && strandStep >= stateMachineLength) || hasClickedOnRegenerate) {
      try {
        setIsLoading(true)
        let sourceLanguage = preferredLanguage?.value || languageToUse

        endStoryResponse = await endStoryMutation.mutateAsync({ data: {
            session: sessionId,
            profile_id: profileToUse,
            stage: "COMPLETED",
            access_token: accessToken,
            flow: storageFlow,
            language: sourceLanguage,
          }})

        if (endStoryResponse?.id) {
          setFiles([])
          setShowFileInput(true)
          setLlmError("")
          window.location.reload()
        } else {
          handleLlmError(endStoryResponse?.error_message, endStoryResponse?.error_type)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error completing the story:", error)
        handleLlmError(error?.response?.data?.error_message, error?.response?.data?.error_type)
        setIsLoading(false)
      } finally {
        setNoStoryFound(false)
      }
    }
  }

  const navigateBack = () => {
    let rerouteUrl = previousUrl
    stopAllAudio()
    if (accessToken) {
      console.log("clearing storage")
      clearFromStorage()
      navigateSsoFlow(ssoRerouteURL)
      return
    }
    console.log("clearing storage")
    clearFromStorage()
    setLanguage(LANGUAGE_ENUMS.ENGLISH)
    setChatLanguage(LANGUAGE_ENUMS.ENGLISH)
    setHasSelectedLanguage(false)
    if (rerouteUrl && rerouteUrl !== null && rerouteUrl !== undefined && rerouteUrl !== "") {
      window.location.href = rerouteUrl
    } else {
      window.location.replace("https://www.google.com")
    }
  }

  function navigateSsoFlow(rerouteURL) {
    // navigate(-2)
    // console.log("rerouteURL", rerouteURL)
    // if (rerouteURL) {
    //   clearFromStorage()
    //   window.location.replace(rerouteURL)
    // } else {
    console.log("navigating -2")
    navigate(-2)
    // }
  }

  function stayOnPage() {
    window.history.pushState(null, "", window.location.href)
  }

  const getQuestionAnswersFromBlocks = blocks => {
    const questionAnswers = []
    let currentQuestion = null

    const filteredBlocks = blocks.filter(block => {
      if (block.type === "paragraph") {
        const text = block.data.text || ""
        const isEmpty = !text.trim() || text === "​" || text === " "
        return !isEmpty
      }
      return true
    })

    filteredBlocks.forEach((block, index) => {
      if (block.type === "header" && block.data.text.startsWith("Q")) {
        if (currentQuestion) {
          questionAnswers.push(currentQuestion)
        }

        const questionText = block.data.text.replace(/^Q\d+:\s*/, "")
        currentQuestion = { question: questionText, answer: "" }
      } else if (block.type === "paragraph" && currentQuestion) {
        currentQuestion.answer = block.data.text || ""
        questionAnswers.push(currentQuestion)
        currentQuestion = null
      }
    })

    if (currentQuestion) {
      questionAnswers.push(currentQuestion)
    }

    return questionAnswers
  }

  const defaultEditorClick = (title, name, location) => {
    stopAllAudio()
    return (
      <>
        <div className="fixed inset-0 bg-white flex items-center justify-center p-0 max-sm:px-0 z-[100]">
          <div className="bg-gray-100 rounded-lg shadow-lg w-full h-full max-w-2xl p-[30px_0_0] relative" onClick={e => e.stopPropagation()}>
            <div className="overflow-y-auto h-full w-full">
              <div className="px-[73px] max-sm:px-[23px]">
                <h2 className="text-lg font-semibold text-black-700">{t("editorHeading")}</h2>

                <div className="mt-4">
                  <h3 className="text-md font-semibold">{title}</h3>
                  <p className="text-gray-600 text-sm">
                    {name}, {location}
                  </p>
                </div>

                <div className="mt-4 h-60 overflow-y-auto">
                  <div id="editorjs" ref={editorContainerRef} className=""></div>
                </div>

                <div className="mt-4">
                  <UploadImages storyData={storyData} access_token={accessToken} files={files} setFiles={setFiles} isLoading={isLoading} setIsLoading={setIsLoading} handleMultipleUploads={handleMultipleUploads} fileErrorText={fileErrorText} setFileErrorText={setFileErrorText} showImages={false} />
                </div>
              </div>
              <div className="w-full flex justify-center py-4 px-[40px] bg-gray-100">
                <button
                  onClick={async () => {
                    try {
                      const outputData = await editor.save()
                      let updatePayload = {
                        id: storyData?.id,
                        token: accessToken,
                        session: sessionId,
                        flow: storageFlow,
                        formatted_content: outputData?.blocks,
                      }

                      setIsLoading(true)
                      const result = await partialUpdateStoryById({
                        token: accessToken,
                        data: updatePayload,
                        storyId: updatePayload.id,
                      })
                      setStoryData(result)
                      setIsLoading(false)

                      if (isSpecialFlow && accessToken) {
                        setIsLoading(true)
                        await updateReflectionStatusApi(projectId, "completed", sessionFlowName.SsoFlow, accessToken)
                        console.log("clearing storage")
                        clearFromStorage()
                        console.log("History length:", window.history.length)
                        console.log("Can go back 1?", window.history.length > 1)
                        console.log("Can go back 3?", window.history.length > 3)
                        setSsoNavigationTriggered(true)
                        const message = { type: "MItra", name: "MItra" }
                        setTimeout(() => {
                          window.postMessage(message, "*")
                          console.log("Postmessage called")
                        }, 500)

                        console.log("navigating from the condtion to -3")
                        navigate(-3, { replace: true })

                        return
                      } else {
                        window.location.reload()
                      }
                    } catch (error) {
                      console.error("Saving failed: ", error)
                      if (accessToken) {
                        console.log("clearing storage")
                        clearFromStorage()
                        navigate(-1)
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
    )
  }

  const getListAfterHeaderText = (headerText, blocks) => {
    const idx = blocks.findIndex(b => b.type === "header" && b.data.text.trim().toLowerCase() === headerText.toLowerCase())
    if (idx !== -1 && blocks[idx + 1]?.type === "list") {
      const items = blocks[idx + 1].data.items || []
      return items.map(item => (typeof item === "string" ? item : item?.content || ""))
    }
    return []
  }

  const handleDownloadStop = () => {
    setTriggerDownload(false)
    setIsLoading(false)
    setIsPdfDownloading(false)
    window.location.reload()
  }

  async function resetChat(e) {
    if (e) {
      e.preventDefault()
    }
    setIsLoading(true)
    removeChatHistory()
    setIsOldChatOpen(false)
    setIsNewChatOpen(true)
    setShowFileInput(false)
    setLlmError("")
    setLlmErrorType(null)
    setSessionId(null)
    setStrandStep(null)
    const session = await getSessionDetails()
    setSessionId(session.sessionid)
    setIsChatVisible(false)
    setChatbotClickedOn("")
    setShowHomepage(true)
    setIsLoading(false)

    window.location.reload()
  }

  function extractTextBlocks(formattedContent) {
    if (!formattedContent) return []
    const blocks = JSON.parse(formattedContent)
    if (!blocks || blocks?.length === 0) return []
    return blocks.filter(block => block.type === "paragraph")
  }

  async function getSessionInfo() {
    let currentSession = sessionId
    try {
      const response = await getChatSessionApi({ sessionId: currentSession })
      return response?.data?.results
    } catch (error) {
      console.error("Error fetching AI4Bharat audio:", error)
      throw error
    }
  }

  function getSessionRoute() {
    const currentFlow = storageFlow
    console.log("Current Flow:", currentFlow)
    console.log("Is the flow equal", currentFlow === sessionFlowName.ListeningActivity)

    // Configuration mapping flow names to bot routes
    const flowToRouteMap = {
      [sessionFlowName.GuestDiscussion]: bot_routes.shikshalokam_chaupal,
      [sessionFlowName.LoginDiscussion]: bot_routes.shikshalokam_chaupal,
      [sessionFlowName.ListeningActivity]: bot_routes.listening_activity,
      [sessionFlowName.ParentPerceptionSurvey]: bot_routes.parent_perception_survey,
    }

    const typeBasedRouteMap = {
      normal: {
        [sessionFlowName.LoginMiStory]: bot_routes.normal,
        [sessionFlowName.GuestMiStory]: bot_routes.guest_normal,
      },
      oneshot: {
        [sessionFlowName.LoginMiStory]: bot_routes.oneshot,
        [sessionFlowName.GuestMiStory]: bot_routes.guest_oneshot,
      },
    }

    // Check direct flow mapping first
    if (currentFlow && flowToRouteMap[currentFlow]) {
      return flowToRouteMap[currentFlow]
    }

    // Check type-based mapping
    const routeMap = selectedType === "normal" ? typeBasedRouteMap.normal : typeBasedRouteMap.oneshot

    if (currentFlow && routeMap[currentFlow]) {
      return routeMap[currentFlow]
    }

    // Default route
    return bot_routes.reflection
  }

  // ========================================================================
  const closeModal = () => {
    setIsModalOpen(false)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  function handleScrollToView() {
    if (acceptedTnc === "ONGOING") return
    try {
      document?.querySelector("#last-chat-boundary")?.scrollIntoView({
        behavior: "smooth",
      })
    } catch (error) {
      console.error({ error })
    }
  }

  const pdfDownloadSidebar = async sessionid => {
    try {
      setIsLoading(true)
      setIsPdfDownloading(true)

      const story = await getStoryBySessionAPI(sessionid, accessToken)

      const story_media = story[0]?.story_media
      const pdfMedia = story_media?.filter(media => media.media_type === "application/pdf") || []

      const pdfFileName = story[0]?.title + ".pdf"
      const fileUrl = pdfMedia[0]?.public_url

      if (fileUrl && pdfFileName) {
        const response = await fetch(fileUrl)

        if (response.ok) {
          const reader = response.body.getReader()
          const chunks = []

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
          }

          const blob = new Blob(chunks)
          const a = document.createElement("a")
          const url = window.URL.createObjectURL(blob)
          a.href = url
          a.download = pdfFileName
          document.body.appendChild(a)
          a.click()

          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        } else {
          console.error("Network response was not ok.")
        }
      } else {
        console.error("No PDF media found or invalid file URL.")
      }
    } catch (error) {
      setIsLoading(false)
      console.error("Error downloading file:", error)
    } finally {
      setIsPdfDownloading(false)
      setIsLoading(false)
    }
  }

  async function getCompanyChatApi(currentSession, signal) {
    return axiosInstance({
      url: `/api/companychat/?session=${currentSession}`,
      signal,
    })
  }


  async function showChatTitle() {
    try {
      const currentSessionID = sessionId
      const currentFlow = storageFlow
      let sessionComplete
      const TitleAndSession = []
      const response = await getChatSessionApi({
        profile: profileToUse,
        flow: currentFlow,
      })

      if (response) {
        let sortedResult = quickSort(response?.data?.results, compareByIdDesc)
        sortedResult.forEach((sessionObj, index) => {
          const status = sessionObj.session_status?.toLowerCase() === "completed" ? t("completedStatusText") : t("inProgressStatusText")
          TitleAndSession.push({
            session: sessionObj.session,
            title: sessionObj.title,
            sessionStatus: status,
          })
          if (sessionObj.session === currentSessionID) {
            sessionComplete = sessionObj.session_status?.toLowerCase() === "completed"
          }
        })
        setShowFileInput(sessionComplete === true)
        setSessionTitleDetail(TitleAndSession)
        setChatTitle([...TitleAndSession.slice(0, chatToAddLength)])
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMoreData = () => {
  
    setTimeout(() => {
      if (visibleItemCount < sessionTitleDetail.length) {
        setVisibleItemCount(prevCount => prevCount + chatToAddLength)
        setChatTitle(prevChatTitle => [...prevChatTitle, ...sessionTitleDetail.slice(prevChatTitle.length, prevChatTitle.length + chatToAddLength)])
      }
    }, 1000)
  }

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
            <div key={`session-title-bttn-${index}`} className="chat-title-div div5">
              <div
                className="div6"
                onClick={() => {
                  handleChatSessionButtonClick({
                    key: `session-title-bttn-${index}`,
                  })
                }}
              >
                <span className="span1">{item?.title}</span>
                <span className={`span2 ${item?.sessionStatus === t("completedStatusText") ? "span3" : "span4"}`}>{item?.sessionStatus}</span>
              </div>

              {item?.sessionStatus === t("completedStatusText") && (
                <button
                  className="span5"
                  onClick={() => {
                    pdfDownloadSidebar(item?.session)
                  }}
                >
                  <FiDownload />
                </button>
              )}
              {item?.sessionStatus !== t("completedStatusText") && <button className="span5"></button>}
            </div>
          ))}
        </InfiniteScroll>
      </div>
    )
  }

  const handleOnInputText = e => {
    e.preventDefault()
    setTextMessage(e.target.value)

    if (e.target.value.trim() === "") {
      setIsRecognizing(false)
      setHasStartedListening(false)
    }
  }

  const handleAI4BharatTTSRequest = async (text, id, sourceLanguage) => {
    try {
      if (id === "intro_msg_id" && isIntroPlayed.current === true) {
        return
      }
      if (id === "intro_msg_id") {
        isIntroPlayed.current = true
      }
      let cachedAudioUrl = audioCache[id]
      let audio_result = ""
      let audio

      if (!sourceLanguage) {
        sourceLanguage = "en"
      }

      let storedRoute = getSessionRoute()

      if (!hasOverRideId) {
        handleMessagesForBot(text)
      }

      if (isMute && !hasOverRideId) {
        setSentences(prev => {
          let all_sentences = JSON.parse(JSON.stringify([...prev]))
          return all_sentences.map(x => ({ ...x, isNarrated: true }))
        })
        setIsNextAllowed(true)
        setHasOverRideId(null)
        return
      }

      if (!cachedAudioUrl) {
        audio_result = await getAI4BharatAudioApi(text, sourceLanguage, storedRoute)
        if (audio_result?.length) {
          cachedAudioUrl = `data:audio/wav;base64,${audio_result}`
          setAudioCache(prevCache => ({
            ...prevCache,
            [id]: cachedAudioUrl,
          }))
        }
      }

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
    } catch (error) {
      console.error("Error in handleAI4BharatTTSRequest:", error)
      handleOnStopSpeaking()
    }
  }

  const isTyping = !!textMessage.trim()

  const handleFirstMessage = ({ message, category }) => {
    try {
      if (category === "special") {
        window.location.reload()
        return
      }
      handleScrollToView()
    } catch (error) {
      console.error({ error })
    }
  }

  const handleOnSpeaking = async (text, id, staticMsg, hasClickedOnSpeaker = false) => {
    try {
      try {
        if (!!audioRef.current) await audioRef.current.pause()
      } catch (error) {
        console.error({ error })
      }
      if (id === "intro_msg_id") {
        isIntroPlayed.current = false
      }
      setHasOverRideId(id)
      setIsNextAllowed(true)
      const messageToPlay = staticMsg ? staticMsg : chatHistory.find(message => message.updated_at === id)
      setSentences(prev => {
        return [
          {
            message: messageToPlay?.msg,
            isNarrated: false,
            id: id,
          },
        ]
      })
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
    console.log("RMS (volume):", rms)

    return rms < silenceThreshold
  }

  const [isStartingRecording, setIsStartingRecording] = useState(false)
  const startRecording = () => {
    if (isStartingRecording || hasStartedRecording) return
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      handleOnStopSpeaking()
      setIsStartingRecording(true)
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          mediaStreamRef.current = stream
          const options = {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 16000,
          }
          const recorder = new MediaRecorder(stream, options)
          setMediaRecorder(recorder)

          const localAudioChunks = []

          recorder.start()
          setHasStartedRecording(true)
          setIsStartingRecording(false)

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
              let s3Url = await handleS3Upload(audioBlob, `${Date.now()}`, `chatbot/companychat/${sessionId}/`, storyData)
              if (!s3Url || s3Url === "") {
                transcriptResult = t("asrError")
              }
              setAsrAudio(prev => [...prev, s3Url]) 
              let storedRoute = getSessionRoute()
              transcriptResult = await ai4BharatASRApi(s3Url, languageToUse, storedRoute)
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
                setTextMessage(prev => {
                  if (prev && prev.trim().length > 0) {
                    return prev.trimEnd() + " " + transcriptResult
                  }
                  return transcriptResult
                })
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
          setIsStartingRecording(false)
        })
    } else {
      console.warn("getUserMedia not supported on your browser!")
    }
  }



  function downloadPdf() {
    let current_company = companyName ? companyName : null
    let currentState = userState ? userState : null
    if (!currentState) {
      currentState = cookies.get("state")
    }
    if (!current_company) {
      current_company = cookies.get("company")
    }

    return (
      <>
        <PdfDownloader key={new Date().getTime()} storyData={storyData} isShikshalokam={true} downloadTriggered={triggerDownload} handleDownloadStop={handleDownloadStop} storyMediaArr={files} currentState={currentState} current_company={current_company} />
      </>
    )
  }

  const handleSelectedTypeNameChanges = e => {
    console.log("reached here")
    let { value } = e?.target
    function changeSelectedValue(value, e) {
      if (value === "") value = selectedLabel?.types[0]?.value
      setSelectedType(value)
      resetChat(e)
    }
    if ([sessionFlowName.GuestMiStory].includes(storageFlow)) {
      showGuestPopup(() => changeSelectedValue(value, e), stayOnPage)
    } else {
      changeSelectedValue(value, e)
    }
  }

  const convertHeifToJpg = async file => {
    const formData = new FormData()
    formData.append("image", file)

    const response = await axiosInstance.post("api/image-converter/", formData, {
      responseType: "blob",
    })

    const convertedBlob = response.data

    const originalName = file.name.split(".").slice(0, -1).join(".")
    const jpgFile = new File([convertedBlob], `${originalName}.jpg`, {
      type: "image/jpeg",
    })

    return jpgFile
  }

  const handleMultipleUploads = async (e, storyData) => {
    const filesArray = Array.from(e.target.files)
    const currentFiles = [...files]

    if (currentFiles?.length + filesArray.length > 10) {
      setFileErrorText(fileExceedText)
      return
    }

    const story_id = storyData?.id
    if (!story_id) {
      return
    }

    const maxFileSize = 50 * 1024 * 1024
    const allowedExtensions = ["jpeg", "jpg", "png", "svg", "webp", "heif", "heic"]

    const uploadPromises = filesArray.map(async file => {
      if (file.size > maxFileSize) {
        setFileErrorText(fileSizeText)
        setIsLoading(false)
        throw new Error("File size exceeds limit")
      }

      const fileName = file.name
      const fileExtension = fileName.split(".").pop().toLowerCase()
      console.log("fileName: ", fileName)
      console.log("fileExtension: ", fileExtension)

      console.log("In promise for file:", fileName)

      if (!allowedExtensions.includes(fileExtension)) {
        setFileErrorText(t("fileTypeErrorText"))
        setIsLoading(false)
        throw new Error("Invalid file type")
      }

      try {
        if (["heic", "heif"].includes(fileExtension)) {
          file = await convertHeifToJpg(file)
        }

        const s3Url = await handleS3Upload(file, fileName, "chatbot/storymedia/", storyData)

        const formData = {
          file_url: s3Url,
          story: story_id,
          name: fileName,
          media_type: file.type,
          include_in_story: true,
          access_token: accessToken,
          flow: storageFlow,
          session: sessionId,
        }

        const uploadedFile = await uploadImage(formData, setError, navigate, setIsLoading, setFiles)
        return uploadedFile
      } catch (error) {
        console.error({ error })
        if (accessToken) {
          console.log("clearing storage")
          clearFromStorage()
          navigate(-1)
        } else if ([sessionFlowName.SsoFlow].includes(storageFlow) && accessToken) {
          clearFromStorage()
          navigateSsoFlow(ssoRerouteURL)
        }
        setIsLoading(false)
        return null
      }
    })

    try {
      const uploadedFiles = await Promise.allSettled(uploadPromises)
      const validFiles = uploadedFiles.filter(result => result.status === "fulfilled" && result.value).map(result => result.value)

      setFiles([...currentFiles, ...validFiles])
    } catch (e) {
      console.error("Upload handling error", e)
    }
  }

  function handleAcceptTnC() {
    setAcceptedTnC(true)
    if (isSpecialFlow) {
      setShouldFetchIntro(true)
    }
  }

  useEffect(() => {
    console.log(acceptedTnc, "acceptedTnc")
  }, [acceptedTnc])

  return (
    <>
      {acceptedTnc === "ONGOING" && !isLoading && shouldFetchChatSession && <PrivacyPolicyPopup tncText={t("tncText")} onAccept={handleAcceptTnC} />}

      {chatLanguage && acceptedTnc === "ONGOING" && !isLoading && storageFlow && isSpecialFlow && <PrivacyPolicyPopup tncText={t("tncText")} onAccept={handleAcceptTnC} useStaticText={false} />}
      <div className={`div27 ${isOpen && " div70"}`}>
        <div className={`div28 ${isOpen ? "div29" : ""}`}>{isShikshalokamPublicType && storageFlow && !isSpecialFlow && <Sidebar isOpen={isOpen} toggle={setIsOpen} isMobileFirst={true} showScrollbarContent={accessToken && showScrollbarContent} resetChat={resetChat} setIsResetCalled={setIsResetCalled} languageToUse={languageToUse} stopAllAudio={stopAllAudio} />}</div>
        {isOpen && <div className="div7" onClick={() => setIsOpen(false)}></div>}
        <div className={isMobile ? "div30_a" : "div30"}>
          <MainHeader
            isMobileFirst={isMobile}
            showTheDots={false}
            content={
              <>
                {[sessionFlowName.LoginMiStory, sessionFlowName.GuestMiStory].includes(storageFlow) && <CustomFormData layOut={2} selectID="selectedTypeID" selectName="selectedType" selectOptions={selectedLabel.types} selectValue={selectedType} selectClassName="div31" selectOnChange={handleSelectedTypeNameChanges} showDefaultDropdownText={false} />}
                <button
                  onClick={async e => {
                    if (isSpecialFlow) {
                      showGuestPopup(() => {
                        if (isSpecialFlow) setBotName(null)
                        resetChat()
                      }, stayOnPage)
                    } else {
                      setIsResetCalled(true)
                      await resetChat(e)
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
      {(isInitialising || isLoading || isIntroMessageLoading || endStoryMutation.isPending) && (
        <div className="loader-load-spinner">
          <div className="div67">
            <BiLoader className="loader-rotate-loader loader-icon" />
            {isPdfDownloading && (
              <div className="div68">
                <label className="form-label label1">{t("downloadLoader")}</label>
              </div>
            )}
            {endStoryMutation.isPending && (
              <div className="div69 text-center">
                <h2 className="form-label label1 font-bold text-lg sm:text-2xl text-center">
                  {storageFlow && [sessionFlowName.ListeningActivity].includes(storageFlow) ? t("feedbackLoaderHeading") : storageFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(storageFlow) ? t("reportLoaderHeading") : storageFlow && [sessionFlowName.GuestMiStory].includes(storageFlow) ? t("storyGuestLoaderHeading") : t("storyLoaderHeading")}
                </h2>
                <label className="form-label label1 text-center">{storageFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.LoginDiscussion].includes(storageFlow) ? t("reportLoader") : t("storyLoader")}</label>
              </div>
            )}
          </div>
        </div>
      )}
      {storyData && isModalOpen && (isSpecialFlow && accessToken ? defaultEditorClick(storyData?.title, firstName, storyData?.location) : <ReportEditor onClose={closeModal} onSave={onEditorSave} disabled={isLoading || isSaving} />)}
      <div className={`${accessToken ? "div72" : isOpen ? "div71" : ""}`}>
        {shouldFetchChatSession && (
          <>
            <button
              onClick={e => {
                if (accessToken) {
                  clearFromStorage()
                  navigate(-1)
                }
              }}
              className="button-13"
            >
              <div>{t("doLater")}</div>
            </button>
          </>
        )}
        <HiddenRecorder />
        <div className={`${accessToken ? "div33-a" : "div33"} div9`}>
          {!showHomepage && (
            <ul className="div34">
              {chatHistory &&
                chatHistory?.map((chat, i) => (
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
                        isTalking={chat.source === "bot" && !isStreamingComplete && i === chatHistory.length - 1}
                        handleOnStopSpeaking={() => handleOnStopSpeaking()}
                        handleOnSpeaking={() => {
                          handleOnSpeaking(chat?.msg, chat?.updated_at)
                        }}
                        isAnyPlaying={!!hasOverRideId || isTalking}
                        isPlaying={hasOverRideId === chat?.updated_at}
                        isStreamingComplete={isStreamingComplete}
                        setNotMute={setNotMute}
                        chatId={chat?.updated_at}
                      />
                    </div>
                    {!hasStartedListening && chatHistory[chatHistory?.length - 1].source === "user" && i === chatHistory?.length - 1 ? (
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
          )}
          {showHomepage && (
            <>
              {storageFlow &&
                (() => {
                  const prefixMap = {
                    [sessionFlowName.ListeningActivity]: "la_",
                    [sessionFlowName.ParentPerceptionSurvey]: "pppi_",
                  }

                  const prefix = prefixMap[storageFlow] || ""
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
                  )
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
                        handleOnSpeaking(chatHistory[0]?.msg, chatHistory[0]?.updated_at)
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
          {isStreamingComplete && showFileInput && !showHomepage && !endStoryMutation.isPending && !isLoading && !isPdfDownloading && storyData?.id !== "" && !([sessionFlowName.GuestMiStory].includes(storageFlow) && accessToken) && (
            <>
              {![sessionFlowName.ListeningActivity, sessionFlowName.ParentPerceptionSurvey].includes(storageFlow) && (
                <div className="div13">
                  <ChatMessage
                    botNameToDisplay={botNameToDisplay}
                    userType="bot"
                    message={(() => {
                      const flow = storageFlow
                      return flow && [sessionFlowName.GuestMiStory].includes(flow) ? t("evidenceStory") : t("evidence")
                    })()}
                    isTalking={false}
                    handleOnStopSpeaking={() => handleOnStopSpeaking()}
                    handleOnSpeaking={() => {
                      const flow = storageFlow
                      const message_to_use = flow && [sessionFlowName.GuestMiStory].includes(flow) ? t("evidenceStory") : t("evidence")
                      handleOnSpeaking(message_to_use, "upload-img-id", { msg: message_to_use, updated_at: "upload-img-id", source: "bot" })
                    }}
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
                      <span className="div16">{t("upload")}</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/jpeg, image/png, image/svg+xml, image/webp, image/heif, image/heic"
                        // multiple
                        onChange={e => {
                          setIsLoading(true)
                          handleMultipleUploads(e, storyData)
                        }}
                        onClick={e => {
                          if (files?.length >= 10) {
                            setFileErrorText(fileExceedText)
                          } else {
                            setFileErrorText("")
                          }
                        }}
                        disabled={isLoading || isImageUploading || (fileErrorText !== "" && fileErrorText !== fileSizeText && fileErrorText === fileExceedText)}
                        className="div17"
                      />
                    </label>
                  </div>

                  <div className="div18">
                    <p className="li-message">{t("photosLimitMsg")}</p>
                  </div>
                  <>
                    {isImageUploading && (
                      <div className="div18">
                        <p className="li-3">{t("uploadLoadMsg")}</p>
                      </div>
                    )}
                  </>
                  {files?.length > 0 ? (
                    <div className="div18">
                      <h4 className="h4-1">{t("uploadedFiles")}:</h4>
                      <ul>
                        {fileErrorText && <li className="li-1">{fileErrorText}</li>}
                        {files.map((file, index) => (
                          <li key={index} className="li-2">
                            {file.name.slice(0, 20)}
                            {file.name.length > 20 && "..."}
                            <button
                              className="button-1"
                              onClick={() => {
                                setFiles(files.filter(f => f.id !== file.id))
                                partialMediaUpdate(file?.id, false)
                              }}
                            >
                              <RxCross2 />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="div18">
                      <ul>{fileErrorText && <li className="li-1">{fileErrorText}</li>}</ul>
                    </div>
                  )}
                </div>
              )}

              {![sessionFlowName.ParentPerceptionSurvey].includes(storageFlow) && (
                <div className="div19">
                  <ChatMessage
                    botNameToDisplay={botNameToDisplay}
                    userType="bot"
                    message={storageFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(storageFlow) ? t("reportText") : storageFlow && [sessionFlowName.ListeningActivity].includes(storageFlow) ? t("reportFeedbackText") : t("storyText")}
                    isTalking={false}
                    handleOnStopSpeaking={() => handleOnStopSpeaking()}
                    handleOnSpeaking={(message, updatedAt, staticMessage) => {
                      const message_to_use = storageFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.LoginDiscussion].includes(storageFlow) ? t("reportText") : storageFlow && [sessionFlowName.ListeningActivity].includes(storageFlow) ? t("reportFeedbackText") : t("storyText")
                      console.log("message_to_use", message_to_use)
                      handleOnSpeaking(message_to_use, "download-story-id", { msg: message_to_use, updated_at: "download-story-id", source: "bot" })
                    }}
                    isAnyPlaying={!!hasOverRideId || isTalking}
                    isPlaying={hasOverRideId === "download-story-id"}
                    isStreamingComplete={isStreamingComplete}
                    setNotMute={setNotMute}
                    chatId={"download-story-id"}
                    isStaticMessage={true}
                  />
                  {!projectId && (
                    <div className="div20">
                      <button
                        className="clickable-button"
                        onClick={() => {
                          if (sessionId) {
                            pdfDownloadSidebar(sessionId)
                          }
                        }}
                        disabled={isLoading || isPdfDownloading}
                      >
                        <div className="download-story-div">
                          <FiDownload className="icon-1" />
                          <span className="div16" ref={endPageToScrollRef}>
                            {storageFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.LoginDiscussion].includes(storageFlow) ? t("downloadReportText") : t("downloadStoryText")}
                          </span>
                        </div>
                      </button>

                      {triggerDownload && isPdfDownloading && !isLoading && downloadPdf()}
                    </div>
                  )}
                  <div className="div20">
                    <button className="clickable-button" onClick={openModal} disabled={isLoading || isPdfDownloading}>
                      <div className="download-story-div">
                        <MdEdit className="icon-1" />
                        <span className="div16" ref={endPageToScrollRef}>
                          {storageFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.LoginDiscussion].includes(storageFlow) ? t("editReportText") : t("editStoryText")}
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
                            setIsLoading(true)
                            await updateReflectionStatusApi(projectId, "completed", storageFlow, accessToken)
                          } else {
                            window.location.reload()
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
              )}
            </>
          )}
          {llmError && llmError !== "" && (
            <>
              <p className="error-para">{llmError}</p>
              {llmErrorType === "generic_error" && (
              <div className="div20">
                <button
                  className="clickable-button"
                  onClick={async () => {
                    setIsLoading(true)
                    await callEndStory(true)
                  }}
                  disabled={isLoading || isPdfDownloading}
                >
                  <div className="download-story-div">
                    <TbReload className="icon-1" />
                    <span className="div16" ref={endPageToScrollRef}>
                      {storageFlow && [sessionFlowName.GuestDiscussion, sessionFlowName.ListeningActivity, sessionFlowName.LoginDiscussion].includes(storageFlow) ? t("reDownloadReportText") : t("reDownloadStoryText")}
                    </span>
                  </div>
                </button>

                {triggerDownload && isPdfDownloading && !isLoading && downloadPdf()}
              </div>
              )}
            </>
          )}
          <div id="last-chat-boundary" className="div38" />
        </div>
        <Notification />

        {(!showFileInput || showFileInput === null) && !isLoading && !endStoryMutation.isPending && (llmError === "" || !llmError) && Array.isArray(chatHistory) && chatHistory.some(item => item && Object.keys(item).length > 0) && (
          <form
            ref={inputWrapperRef}
            className="form-1 chat-input-row"
            onSubmit={event => {
              event.preventDefault()
              if (!hasStartedListening && !isFetchingData && !isStartingRecording) {
                handleSendMessage(event)
              }
            }}
            autoComplete="off"
          >
            {/* Mic button on the left */}
            <button
              type="button"
              aria-label={hasStartedRecording ? t("stopRecording") : t("startRecording")}
              aria-pressed={hasStartedRecording}
              onClick={hasStartedRecording ? stopRecording : startRecording}
              disabled={isFetchingData || isStartingRecording}
              className={`mic-btn ${hasStartedRecording ? "mic-recording" : "mic-idle"}`}
            >
              {hasStartedRecording ? <FaRegStopCircle /> : <FaMicrophone />}
            </button>

            {/* Text area in the middle */}
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
                disabled={hasStartedRecording || isFetchingData || isStartingRecording}
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

            <button
              type="submit"
              aria-label={t("sendMessage")}
              disabled={!textMessage.trim() || hasStartedRecording || isFetchingData || isStartingRecording}
              className="send-btn"
            >
              <MdSend />
            </button>
          </form>
        )}
      </div>
    </>
  )
}

export default ShikshalokamVoiceBasedChat

function ChatMessage({ userType, message, name, recording, handleOnSpeaking, handleOnStopSpeaking, isPlaying, botNameToDisplay, isStreamingComplete, setNotMute, chat, staticMessage, chatId }) {
  let sanitizedContent = DOMPurify.sanitize(message)
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
                <button className={`button-10 button-3`} onClick={handleOnStopSpeaking} disabled={!isStreamingComplete}>
                  <HiMiniSpeakerWave />
                </button>
              ) : (
                <button
                  className={`button-11 button-3`}
                  onClick={() => {
                    setNotMute(false)
                    handleOnSpeaking(message, chat?.updated_at, staticMessage, true)
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
            <WaveSurferPlayer url={recording?.result} {...default_wave_surfer_config} />
          </div>
        )}
        <div className={` ${userType === "bot" ? "div53" : "div54"} div52 custom-voice-chat-chats`} id={chatId}>
          <ReactMarkdown children={sanitizedContent} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} className="prose max-w-none" />
        </div>
      </div>
    </div>
  )
}

const uploadImage = (formData, setError, navigate, setIsLoading, setFiles) => {
  const accessToken = useUserDataLocalStore.getState().getAccessToken()
  return new Promise(async (resolve, reject) => {
    try {
      setIsLoading(true)
      const uploadedFile = await createStoryMediaApi({
        token: accessToken,
        data: formData,
      })
      setFiles(prevFiles => [...prevFiles, uploadedFile])
      setIsLoading(false)
      resolve(uploadedFile)
    } catch (error) {
      console.error({ error })
      if (accessToken) {
        console.log("clearing storage")
        clearFromStorage()
        navigate(-1)
      }
      setError({
        response: error?.request?.response || error?.message,
        status: error?.request?.status || 500,
      })
      setIsLoading(false)
      reject(error)
    }
  })
}
