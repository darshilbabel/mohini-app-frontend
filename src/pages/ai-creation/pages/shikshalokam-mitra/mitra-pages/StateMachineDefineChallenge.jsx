import { bot_routes } from "../../../../../configure"
import { clearMitraSessionStorage } from "../MainPage"
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants"
import { createUserProfileApi, getTranslatedIntroMessageApi, getSessionDetailsApi, getCompanyBotApi, getChatSessionApi, paraphraseChatConversation } from "../../../../../api/endpoints"
import { DEFAULT_COMPANY_SLUG } from "../../../../../constants/session"
import { FIRST_BOT_MESSAGE } from "../../../constants/mitra-chat"
import { getAI4BharatAudioApi } from "api/endpoints/ai"
import { URL_PARAMS } from "../../../../../constants/urls"
import { useAudio } from "../../../../../hooks/useAudio"
import { useCallback, useEffect, useRef, useState } from "react"
import { useChatDataSessionStore } from "../../../../../store"
import { useChatWebhook } from "../../../../../hooks/useChatWebhook"
import { useNavigate } from "react-router-dom"
import { useSiteDataSessionStore, useAICreationSessionStore } from "../../../../../store"
import ChatBox from "./components/ChatBox"
import ChatWindow from "./components/ChatWindow"
import env from "../../../../../utils/env"
import Notification from "../../../../../components/ToastMessage/TotastMessage"
import useVoiceRecord from "../../text-voice/useVoiceRecord"
import LoadingChat from "./components/LoadingChat"
import { useConfirmationPopup } from "../../../../../hooks/useConfirmationPopup"

const wss_protocol = "wss://"

const state_machine_bot_route = bot_routes.define_challenges

const { BOT, USER } = CONVERSATION_USER_TYPES

const StateMachineDefineChallenge = ({ setCurrentPageValue, isReadOnly, userDetail, isDefineChallengeSection = false, handleScrollIntoView, scrollRef }) => {
  const lastBotMessageIndex = useRef(-1)
  let access_token = sessionStorage.getItem(URL_PARAMS.ACCESS_TOKEN)

  const chatHistory = useAICreationSessionStore(state => state.chatHistory)
  const firstName = useAICreationSessionStore(state => state.firstName)
  const chatLanguage = useSiteDataSessionStore(state => state.chatLanguage)
  const profileId = useAICreationSessionStore(state => state.profileId)
  const session = useAICreationSessionStore(state => state.session)
  const { setChatLanguage } = useSiteDataSessionStore.getState()
  const { setSystemError: setSystemErrorStore, setProfileId, setFirstName, setCompany: setCompanyStore, setSession: setSessionStore, setChatHistory, setIsChatVisible, setIntroMessage: setIntroMessageStore, setBotName, setUserProblemStatement: setUserProblemStatementStore, getChatHistory, getPreferredLanguage } = useAICreationSessionStore.getState()
  const { getStateMachineLength, setStateMachineLength, setStrandStep, getStrandStep } = useChatDataSessionStore.getState()

  const [isParaphraseLoading, setIsParaphraseLoading] = useState(false)
  const [textMessage, setTextMessage] = useState("")
  const [isStreamingComplete, setIsStreamingComplete] = useState(true)
  const [audioCache, setAudioCache] = useState({})
  const [hasStartedListening, setHasStartedListening] = useState(false)
  const [sentences, setSentences] = useState([])
  const [isNextAllowed, setIsNextAllowed] = useState(true)
  const [isMute, setNotMute] = useState(true)
  const [isTalking, setTalking] = useState(0)
  const [appendix, setAppendix] = useState([])
  const [hasOverRideId, setHasOverRideId] = useState(null)
  const [shouldFetchIntro, setShouldFetchIntro] = useState(false)
  const [isLocalLoading, setIsLocalLoading] = useState(false)
  const [isIntroLoading, setIsIntroLoading] = useState(false)

  const [isRecognizing, setIsRecognizing] = useState(false)
  const [shouldSendMessage] = useState(true)
  const [useTextbox, setUseTextbox] = useState(false)
  const [shouldMoveForward, setShouldMoveForward] = useState("no")

  const textInputRef = useRef(null)

  const { recordings, HiddenRecorder } = useVoiceRecord()
  const { commonsNetworkReconnectionPopup } = useConfirmationPopup()

  const { audioRef } = useAudio()

  const navigate = useNavigate()

  const {
    sendMessage,
    connect: connectToWebSocket,
    disconnect: disconnectFromWebSocket,
    isConnected: isSocketConnected,
  } = useChatWebhook(`${wss_protocol}${env.WEBSOCKET_HOST()}/ws/common/`, {
    autoConnect: false,
    reconnectAttempts: env.WEBSOCKET_RETRY_NUM(),
    onMessage: onWebSocketMessage,
    onFinalReconnectAttempt
  })

  function onFinalReconnectAttempt() {
    function onYesButtonClick() {
      try {
        let chat_history = getChatHistory()
        if (Array.isArray(chat_history)) {
          chat_history = chat_history.filter((chat, index) => !(index == chat_history.length - 1 && chat.source === "user"))
        }
        setChatHistory(chat_history)

        window.location.reload()
      } catch (error) {
        console.error("Error cleaning chat history before reload:", error)
        window.location.reload()
      }
    }

    function onNoButtonClick() {
      clearMitraSessionStorage()
      navigate("/")
      window.location.reload()
    }

    commonsNetworkReconnectionPopup(onYesButtonClick, onNoButtonClick)
  }

  function onWebSocketMessage(e) {
    const data = JSON.parse(e.data)
    const message = data["text"]

    if (message.source === BOT) {
      setIsStreamingComplete(false)
      const validation = message?.extra_content?.validation
      const should_move_forward = message?.extra_content?.should_move_forward
      const userProblemStatement = message?.extra_content?.problem_statement
      setUserProblemStatementStore(userProblemStatement)
      if (message?.msg !== "") {
        if (message?.step && Number.isInteger(message?.step)) setStrandStep(message?.step)
        const chat_history = structuredClone(getChatHistory())
        if (chat_history.length > 0 && chat_history[chat_history.length - 1]?.source === BOT) {
          if (message?.msg) {
            chat_history[chat_history.length - 1].msg += message?.msg
          }
        } else {
          chat_history.push({
            msg: message?.msg || "",
            updated_at: Date.now(),
            problemStatement: userProblemStatement || "",
            shouldMoveForward: should_move_forward,
            source: BOT,
            validation: validation || "",
          })
        }
        setChatHistory(chat_history)
        setSentences(prevSentences => {
          let updatedSentences = [...prevSentences]

          if (updatedSentences.length > 0 && updatedSentences[updatedSentences.length - 1]?.source === BOT) {
            if (message?.msg) {
              updatedSentences[updatedSentences.length - 1].message += message?.msg
            }
          } else {
            updatedSentences.push({
              message: message?.msg || "",
              source: BOT,
              isNarrated: false,
              id: Date.now(),
              validation: validation || "",
              shouldMoveForward: should_move_forward,
              problemStatement: userProblemStatement || "",
            })
            lastBotMessageIndex.current = updatedSentences.length - 1
          }
          return updatedSentences
        })
      }

      const strand_step = getStrandStep()
      const state_machine_length = getStateMachineLength()
      const chat_history = getChatHistory()
      if (Number.isInteger(strand_step) && Number.isInteger(state_machine_length) && strand_step >= state_machine_length && Array.isArray(chat_history) && chat_history.length && chat_history[chat_history.length - 1]?.source === BOT && isStreamingComplete) {
        setIsParaphraseLoading(true)
        paraphraseChatConversation(session).then(resp => {
          setUserProblemStatementStore(resp?.comprehensive_paragraph)

          const chat_history_updated = [...chat_history]
          const lastIndex = chat_history_updated.length - 1
          const paraphrase = resp?.comprehensive_paragraph?.trim()
          if (lastIndex >= 0 && paraphrase) {
            chat_history_updated[lastIndex] = {
              ...chat_history_updated[lastIndex],
              msg: `${chat_history_updated[lastIndex].msg}\n\n${paraphrase}`,
              updated_at: Date.now(),
              shouldMoveForward: "yes",
            }
          }
          setChatHistory(chat_history_updated)
        }).catch(err => {
          console.error(err)
        }).finally(() => {
          setIsParaphraseLoading(false)
          setShouldMoveForward("yes")
        })
      }
    } else {
      setIsStreamingComplete(false)
    }

    if (message.finish_reason === "stop" && message.source === BOT) {
      setTalking(0)
      setIsStreamingComplete(true)
      const chat_history = [...getChatHistory()]

      const chat_history_updated = chat_history.map((chat, index) => {
        if (index === chat_history.length - 1) {
          return {
            ...chat,
            shouldMoveForward: "yes",
          }
        }
        return chat
      })

      setChatHistory(chat_history_updated)
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

  useEffect(() => {
    return () => {
      disconnectFromWebSocket()
    }
  }, [])

  useEffect(() => {
    async function createUserProfile() {
      try {
        setIsLocalLoading(true)
        const data = await createUserProfileApi({ access_token }).then(resp => resp.profile_details)
        setProfileId(data?.id)
        setFirstName(data?.first_name)
        setCompanyStore(data?.company?.slug)
      } catch (error) {
        console.error(error?.response?.data || error)
        navigate(-1)
        clearMitraSessionStorage()
      } finally {
        setIsLocalLoading(false)
      }
    }

    async function fetchCompanyBotInfo() {
      try {
        const bots = await getCompanyBotApi({
          company__slug: DEFAULT_COMPANY_SLUG,
          route: state_machine_bot_route,
        }).then(resp => resp?.results)

        if (!bots || bots.length === 0) {
          throw new Error("No bots found")
        }
        const selectedBot = bots[0]
        if (selectedBot?.statemachine_length) {
          setStateMachineLength(selectedBot.statemachine_length)
        }
      } catch (error) {
        console.error(error)
        navigate(-1)
      }
    }

    const getSessionId = async () => {
      if (!session) {
        try {
          setIsLocalLoading(true)
          let sessionid = await getSessionDetailsApi().then(resp => resp?.sessionid)
          if (!sessionid) {
            throw new Error("Session ID not found")
          }
          setSessionStore(sessionid)
        } catch (error) {
          console.error(error)
          navigate(-1)
          clearMitraSessionStorage()
          return
        } finally {
          setIsLocalLoading(false)
        }
      }

      const preferredLanguage = getPreferredLanguage() || {}

      const language = preferredLanguage?.value || "en"
      sessionStorage.setItem("route", JSON.stringify(language))
      setChatLanguage(language)
    }

    if (!profileId && access_token) {
      createUserProfile()
      setShouldFetchIntro(true)
      setIsStreamingComplete(true)
    }
    fetchCompanyBotInfo()
    getSessionId()
  }, [access_token, profileId])

  useEffect(() => {
    async function getCurrentStep() {
      try {
        const chat_session_info = await getChatSessionApi({ sessionId: session }).then(resp => resp?.data?.results)
        if (!chat_session_info.length) {
          return null
        } else {
          return chat_session_info[0]?.current_step
        }
      } catch (error) {
        console.error(error)
        return null
      }
    }
    if (!session) return

    getCurrentStep().then(step => {
      if (step) {
        setStrandStep(step)
      }
    })
  }, [session])

  useEffect(() => {
    setShouldFetchIntro(true)
    setIsStreamingComplete(true)
    if (isDefineChallengeSection) handleScrollIntoView()
  }, [])

  useEffect(() => {
    if (chatHistory?.length !== 0) {
      setIsChatVisible(true)
    }
  }, [])

  useEffect(() => {
    if (shouldMoveForward === "yes") {
      setCurrentPageValue(1)
    }
  }, [shouldMoveForward])

  useEffect(() => {
    const fetchBotInfo = async () => {
      setIsIntroLoading(true)
      try {
        const storedRoute = state_machine_bot_route

        if (!shouldFetchIntro || chatHistory?.length || !chatLanguage) return

        let data = await getTranslatedIntroMessageApi({
          language: chatLanguage,
          company_bot__route: storedRoute,
        })
        setSystemErrorStore(data[0]?.error_message)
        let message = data[0]?.alt_introductory_message
        if (!message) {
          message = FIRST_BOT_MESSAGE
        }
        const botName = data[0]?.name || "Bot"
        setBotName(botName)

        if (message && firstName) {
          const words = message.split(" ")
          words.splice(1, 0, firstName)
          message = words.join(" ")
        }

        if (message && !!message?.trim() && chatHistory[chatHistory?.length - 1]?.msg !== message) {
          setIntroMessageStore(message)
          setSentences(prev => [
            ...prev,
            {
              message: message,
              isNarrated: false,
              id: Date.now(),
            },
          ])
        }
      } catch (error) {
        console.error({ error })
      }
    }

    if (chatHistory?.length === 0 && shouldFetchIntro && chatLanguage) {
      fetchBotInfo().then(() => {
        setShouldFetchIntro(false)
        setIsIntroLoading(false)
      })
    }
  }, [shouldFetchIntro, profileId, chatLanguage, firstName])

  useEffect(() => {
    lastBotMessageIndex.current = chatHistory?.length - 1
  }, [chatHistory])

  useEffect(() => {
    if (recordings?.length && chatHistory[chatHistory?.length - 1]?.source !== BOT) {
      let chat_history = [...getChatHistory()]

      chat_history[chat_history?.length - 1] = {
        ...chat_history[chat_history?.length - 1],
        recording: recordings[recordings?.length - 1],
      }
      setChatHistory(chat_history)
    }
  }, [recordings, chatHistory])

  useEffect(() => {
    if (audioRef?.current) {
      if (isMute) {
        audioRef.current.muted = true
      } else {
        audioRef.current.muted = false
      }
    }
  }, [isMute])

  useEffect(() => {
    if (useTextbox && textInputRef.current) {
      textInputRef.current.focus()
    }
  }, [useTextbox])

  /**
   * Function is called when the form is submitted
   */
  async function handleSendMessage(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    try {
      setIsChatVisible(true)
      setNotMute(true)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      if (!textMessage.trim()) return

      const chat_history = handleMessagesForUser(textMessage)

      const user_messages = chat_history.filter(message => message.source === USER)
      if (user_messages.length === 1 || !isSocketConnected) {
        connectToWebSocket()
        sendMessage({
          type: "authenticate",
          sessionid: session,
          profileid: profileId,
          access_token: access_token,
          route: chatLanguage,
          bot_route: state_machine_bot_route,
        })
      }

      sendMessage({
        text: textMessage,
        context: "",
      })

      setTextMessage("")
    } catch (error) {
      console.error("WebSocket connection failed:", error)
    }
  }

  /**
   * Function is called whenever the textarea input changes
   */
  const handleOnInputText = e => {
    e.preventDefault()
    setTextMessage(e.target.value)

    if (e.target.value.trim() === "") {
      setIsRecognizing(false)
      setHasStartedListening(false)
    }
  }

  const handleMessagesForBot = useCallback(
    sentence => {
      if (isRecognizing || hasStartedListening || !shouldSendMessage) return

      const lastMessage = chatHistory[chatHistory?.length - 1]
      if (lastMessage?.msg === sentence && lastMessage?.source === BOT) {
        return
      }

      const chat_history = structuredClone(getChatHistory())
      if (chatHistory[chatHistory?.length - 1]?.source === BOT) {
        const lastMessage = chat_history[chat_history?.length - 1]
        lastMessage.msg += " " + sentence
        setChatHistory(chat_history)
      } else {
        chat_history.push({
          msg: sentence,
          source: BOT,
        })
        setChatHistory(chat_history)
      }
    },
    [chatHistory]
  )

  const handleMessagesForUser = sentence => {
    const chat_history = [...getChatHistory()]
    chat_history.push(
      createMessage({
        msg: sentence,
        source: USER,
      })
    )
    setChatHistory(chat_history)

    return chat_history
  }

  const handleAI4BharatTTSRequest = async (text, id, sourceLanguage) => {
    try {
      let cachedAudioUrl = audioCache[id]
      let audio_result = ""
      let audio

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
        audio_result = await getAI4BharatAudioApi(text, sourceLanguage, bot_routes.mitra_create)
        if (audio_result?.length) {
          cachedAudioUrl = `data:audio/wav;base64,${audio_result}`
          setAudioCache(prevCache => ({
            ...prevCache,
            [id]: cachedAudioUrl,
          }))
        }
      }

      if (cachedAudioUrl) {
        audioRef.current = new Audio(cachedAudioUrl)
        audio = audioRef.current

        audio.onplay = () => {
          setIsNextAllowed(false)
        }

        audio.onended = () => {
          setSentences(prev => {
            let all_sentences = structuredClone(prev)
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
            let all_sentences = structuredClone(prev)
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
    }
  }

  useEffect(() => {
    let unnarratedMessages = sentences.filter(x => !x?.isNarrated)
    let hasUnnarratedMessages = !!unnarratedMessages?.length

    if (isNextAllowed && hasUnnarratedMessages) {
      handleAI4BharatTTSRequest(unnarratedMessages[0].message, unnarratedMessages[0].id, chatLanguage)
    }
  }, [isNextAllowed, sentences, chatLanguage])

  useEffect(() => {
    if (!!appendix?.length && Array.isArray(chatHistory) && chatHistory.length && chatHistory[chatHistory?.length - 1].source === BOT) {
      const chat_history = structuredClone(getChatHistory())
      const lastMessage = chat_history[chat_history?.length - 1]
      lastMessage.appendixURL = appendix
      lastMessage.hasAppendix = true
      setChatHistory(chat_history)
      setAppendix([])
    }
    if (isDefineChallengeSection) handleScrollIntoView()
  }, [appendix, chatHistory])

  const handleOnSpeaking = async (text, id, staticMsg) => {
    try {
      try {
        if (audioRef.current) await audioRef.current.pause()
      } catch (error) {
        console.error({ error })
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

  return (
    <>
      <HiddenRecorder />
      <Notification />
      {isLocalLoading || isIntroLoading ? (
        <LoadingChat />
      ) : (
        <div className={isDefineChallengeSection ? "flex flex-col h-auto" : ""}>
          <ChatWindow isTalking={isTalking} handleOnSpeaking={handleOnSpeaking} handleOnStopSpeaking={handleOnStopSpeaking} isStreamingComplete={isStreamingComplete} setNotMute={setNotMute} userDetail={userDetail} chatHistory={chatHistory} isReadOnly={isReadOnly} hasStartedListening={hasStartedListening} hasOverRideId={hasOverRideId} isParaphraseLoading={isParaphraseLoading} isDefineChallengeSection={isDefineChallengeSection} />
          {(isDefineChallengeSection && !isParaphraseLoading) && (
            <div className="mt-auto">
              <ChatBox textInputRef={textInputRef} textMessage={textMessage} handleOnInputText={handleOnInputText} setUseTextbox={setUseTextbox} handleSendMessage={handleSendMessage} isReadOnly={!isDefineChallengeSection} />
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default StateMachineDefineChallenge

export const createMessage = ({ updated_at = Date.now(), source = BOT, msg = "", validation = "" }) => ({
  updated_at,
  source,
  msg,
  validation,
})
