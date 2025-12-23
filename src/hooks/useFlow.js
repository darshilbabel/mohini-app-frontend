import { useChatStorage, useSiteStorage } from "hooks/useStorage"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import ROUTES from "../url"

export const useFlow = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const selectedFlow = useChatStorage()(state => state.flow)
  const { setPreviousUrl } = useSiteStorage().getState()

  const handleFlowSelection = async stopAllAudio => {
    if (!selectedFlow) return

    setIsLoading(true)
    await stopAllAudio()

    let navigateUrl

    setPreviousUrl(window.location.href)

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

    navigateUrl = route

    navigate(navigateUrl)
    setIsLoading(false)
  }

  return {
    isLoading,
    setIsLoading,
    handleFlowSelection,
  }
}
