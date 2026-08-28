import { sessionFlowName } from "../constants/session"
import { useChatDataLocalStore } from "../store"
import { useChatStorage, useSiteStorage } from "hooks/useStorage"
import { useSearchParams } from "react-router-dom"
import { useState } from "react"
import env from "../utils/env"

export const useFlow = () => {
  const [isLoading, setIsLoading] = useState(true)
  const selectedFlow = useChatStorage()(state => state.flow)
  const [searchParams] = useSearchParams()
  const { setPreviousUrl } = useSiteStorage().getState()

  const handleFlowSelection = async stopAllAudio => {
    if (!selectedFlow) return

    setIsLoading(true)
    await stopAllAudio()

    setPreviousUrl(window.location.href)

    const flowParams = {
      [sessionFlowName.GuestDiscussion]: env.GUEST_DISCUSSION_FLOW(),
      [sessionFlowName.GuestMiStory]: env.GUEST_MI_STORY_FLOW(),
    }

    const flowValue = flowParams[selectedFlow]
    if (!flowValue) {
      setIsLoading(false)
      return
    }

    if (searchParams.get("flow")) {
      useChatDataLocalStore.getState().setFlow(searchParams.get("flow"))
    }

    const baseUrl = `${window.location.origin}${env.ROOT_PATH()}`
    const url = new URL(baseUrl)
    url.searchParams.set("flow", flowValue)
    window.location.href = url.toString()
  }

  return {
    isLoading,
    setIsLoading,
    handleFlowSelection,
  }
}
