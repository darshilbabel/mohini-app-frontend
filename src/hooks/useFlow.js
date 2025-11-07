import { sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum"
import { STORE_NAME_CONSTANTS } from "store/constants"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useParams } from "react-router-dom"
import { useState } from "react"
import { useChatStorage } from "hooks/useStorage"
import { useSiteStorage, useStorage } from "hooks/useStorage"
import ROUTES from "../url"
import useChatDataLocalStore from "store/slices/chatData/chatDataLocal"
import useSiteDataLocalStore from "store/slices/siteData/siteDataLocal"

export const useFlow = usecaseType => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const selectedFlow = useChatStorage()(state => state.flow)
  const { setPreviousUrl } = useSiteStorage().getState()

  const handleFlowSelection = async stopAllAudio => {
    setIsLoading(true)
    await stopAllAudio()

    // const flow = useChatDataSessionStore.getState().getFlow();

    let navigateUrl = undefined
    let replaceUrl = undefined

    setPreviousUrl(window.location.href)

    const accessToken = useSiteDataLocalStore.getState().getAccessToken()
    const flowRoutes = {
      [sessionFlowName.GuestDiscussion]: ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT,
      [sessionFlowName.GuestMiStory]: ROUTES.SHIKSHALOKAM_GUEST_MI_STORY,
    }

    const route = flowRoutes[selectedFlow]
    if (!route) {
      return
    }

    if (searchParams.get("flow")) {
      useChatDataLocalStore.getState().setFlow(searchParams.get("flow"))
    }

    // if (accessToken) {
    //   useChatDataLocalStore.getState().setFlow(flow)
    //   replaceUrl = "/mohini" + route
    // } else {
    navigateUrl = route
    // }
    if (!navigateUrl) return

    // if (!replaceUrl && !navigateUrl) {
    //   return
    // }

    // if (replaceUrl) {
    //   return window.location.replace(replaceUrl)
    // }
    // if (navigateUrl) {
    navigate(navigateUrl)
    // window.location.reload()
    // }
    setIsLoading(false)
  }

  return {
    isLoading,
    setIsLoading,
    handleFlowSelection,
  }
}
