import { useEffect, useState } from "react"
import { getSessionDetailsApi } from "../../api/endpoints/chat"
import { languageList, sessionFlowName } from "../ShikshalokamVoiceChat/enum"
import { useNavigate } from "react-router-dom"
import { setLanguage } from "../../i18n"
import { BiLoader } from "react-icons/bi"
import { useSiteDataLocalStore } from "store"

import UnifiedVoiceBasedChat from "./UnifiedVoiceBasedChat"
import { getFlowConfig } from "../../config/flowConfig"
import { useChatStorage, useUserStorage, useSiteStorage } from "hooks/useStorage"
import { STORE_NAME_CONSTANTS } from "store/constants"

function UnifiedChat({ type }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const flowConfig = getFlowConfig(type)

  const { setDeviceId, setProfileId, setHasAcceptedTnc } = useUserStorage().getState()
  const { setSessionId, setFlow, setIsNewChatOpen } = useChatStorage().getState()
  const chatLanguage = useSiteDataLocalStore()(state => state.chatLanguage)
  const deviceId = useUserStorage()(state => state.device_id)
  const storageFlow = useChatStorage()(state => state.flow)
  const sessionId = useChatStorage()(state => state.sessionId)

  function getUserFingerPrint() {
    try {
      const fingerprint = window.navigator.userAgent + window.navigator.language + window.screen.colorDepth + window.screen.pixelDepth + window.screen.width + window.screen.height

      const newUserId = deviceId || btoa(fingerprint)

      setDeviceId(newUserId)
    } catch (error) {
      console.error("Error handling user ID:", error)
    }
  }

  async function initialSetup() {
    try {
      setIsLoading(true)
      const profile_id = flowConfig.profileId
      setProfileId(profile_id)

      const { sessionid } = await getSessionDetailsApi()
      setSessionId(sessionid)

      setIsLoading(false)
    } catch (error) {
      console.error("Error during initial setup:", error)
      navigate(flowConfig.homePageRoute)
      setIsLoading(false)
    }
  }

  const setFinalLanguage = async () => {
    await initialSetup()
    const storedLanguage = chatLanguage || languageList[0].value
    setLanguage(storedLanguage)
  }

  useEffect(() => {
    const runSetup = async () => {
      if (!sessionId) {
        const storedLanguage = chatLanguage || languageList[0].value
        setIsLoading(true)
        setHasAcceptedTnc("ONGOING")
        setIsNewChatOpen(true)
        setFlow(type)
        setLanguage(storedLanguage)
        await getUserFingerPrint()
        await setFinalLanguage()
      }
    }
    runSetup()
  }, [type, storageFlow, sessionId])

  return (
    <>
      {!isLoading && (
        <>
          <UnifiedVoiceBasedChat flowType={type} variant={"publicBot"} />
        </>
      )}
      {isLoading && (
        <div className="loader-load-spinner">
          <div className="div67">
            <BiLoader className="loader-rotate-loader loader-icon" />
          </div>
        </div>
      )}
    </>
  )
}

export default UnifiedChat
