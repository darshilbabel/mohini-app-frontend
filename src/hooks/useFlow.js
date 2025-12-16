import { URL_PARAMS } from "../constants/urls"
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

    setPreviousUrl(window.location.href)

    navigate({
      pathname: ROUTES.COMMON_CHAT,
      search: new URLSearchParams({ [URL_PARAMS.FLOW]: selectedFlow }).toString(),
    })

    setIsLoading(false)
  }

  return {
    isLoading,
    setIsLoading,
    handleFlowSelection,
  }
}
