import "../../components/custom-style.css"
import "../../index.css"
import "./commonPageStyle.css"
import { LANGUAGE_ENUMS } from "pages/ShikshalokamVoiceChat/enum"
import { sessionFlowName } from "../../constants/session"
import { URL_PARAMS } from "../../constants/urls"
import { useAudio } from "../../hooks/useAudio"
import { useEffect, useMemo } from "react"
import { useFlow } from "../../hooks/useFlow"
import { useLanguage } from "../../hooks/useLanguage"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useSiteDataSessionStore } from "store"
import { useSiteStorage } from "hooks/useStorage"
import FlowSelection from "../../components/FlowSelection"
import Header from "../../components/Header"
import LanguageSelectionGrid from "../../components/LanguageSelectionGrid"
import LoadingSpinner from "../../components/LoadingSpinner"
import ROUTES from "../../url"
import useUrlFlow from "hooks/useUrlFlow"

function CommonHomePage({ usecaseType }) {
  const { audioRef, stopAudioTriggered, setStopAudioTriggered, stopAllAudio } = useAudio()
  const { isLoading, setIsLoading, handleFlowSelection } = useFlow()
  const { languageButtonSelect, handleLanguageChange } = useLanguage()
  const chatLanguage = useSiteDataSessionStore(state => state.chatLanguage)
  const hasSelectedLanguage = useSiteDataSessionStore(state => state.hasSelectedLanguage)
  const setChatLanguage = useSiteDataSessionStore(state => state.setChatLanguage)
  const setPreviousUrl = useSiteStorage()(state => state.setPreviousUrl)

  const ptm_case = sessionFlowName.megaPTM === usecaseType
  const ylc_case = sessionFlowName.YLC === usecaseType

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const { flow: urlFlow } = useUrlFlow()
  const urlLanguage = useMemo(() => searchParams.get("language"), [searchParams])

  // Initialize language and flow processing
  useEffect(() => {
    if (chatLanguage) return

    if (!urlLanguage && !languageButtonSelect) {
      setChatLanguage(LANGUAGE_ENUMS.ENGLISH)
    }
  }, [chatLanguage])

  useEffect(() => {
    if (!urlFlow) return

    stopAllAudio()
  }, [urlFlow])

  useEffect(() => {
    if (!hasSelectedLanguage || !urlFlow) return

    navigate({
      pathname: ROUTES.COMMON_CHAT,
      search: new URLSearchParams({ [URL_PARAMS.FLOW]: urlFlow }).toString(),
    })
  }, [urlFlow, hasSelectedLanguage])

  // Process language selection
  useEffect(() => {
    // Don't process if user hasn't selected a language (and no URL language) or if no flow is specified
    console.log({ urlLanguage, hasSelectedLanguage, urlFlow })
    if (!urlLanguage && !hasSelectedLanguage) {
      setIsLoading(false)
      return
    }

    if (ptm_case) {
      navigate(ROUTES.SHIKSHALOKAM_PTM_CHAT_PAGE)
      return
    }

    if (ylc_case) {
      navigate(ROUTES.SHIKSHALOKAM_YLC_CHAT_PAGE)
      return
    }

    if (!urlFlow) {
      setIsLoading(false)
      return
    }

    const URL_PARAMS_MAP = {
      [sessionFlowName.ListeningActivity]: ROUTES.SHIKSHALOKAM_GUEST_LISTENING_CHAT,
      [sessionFlowName.ParentPerceptionSurvey]: ROUTES.SHIKSHALOKAM_PPPI_VOICE_CHAT,
    }
    setPreviousUrl(window.location.href)

    if (URL_PARAMS_MAP[urlFlow]) {
      navigate(URL_PARAMS_MAP[urlFlow])
      return
    }

    navigate({
      pathname: ROUTES.COMMON_CHAT,
      search: new URLSearchParams({ [URL_PARAMS.FLOW]: urlFlow }).toString(),
    })
  }, [chatLanguage, urlLanguage, urlFlow, hasSelectedLanguage])

  useEffect(() => {
    handleLanguageChange(chatLanguage, audioRef, stopAllAudio, setStopAudioTriggered)
  }, [chatLanguage])

  const onFlowContinue = () => {
    return handleFlowSelection(stopAllAudio)
  }

  // Updated render conditions
  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 px-0">
      {/* Desktop Header */}
      <Header languageButtonSelect={languageButtonSelect} isDesktop={true} />

      {/* Main Content */}
      <div className="w-full px-0">
        {/* Mobile Header */}
        <Header languageButtonSelect={languageButtonSelect} isDesktop={false} />

        <div className="bg-slate-50 sm:pt-6 sm:h-[100%] flex flex-col justify-center mt-0 w-full">
          <div className="flex justify-end mr-6 relative block sm:hidden"></div>

          {!hasSelectedLanguage && <LanguageSelectionGrid usecaseType={usecaseType} />}
          {!ptm_case && !ylc_case && hasSelectedLanguage && !urlFlow && <FlowSelection audioRef={audioRef} stopAudioTriggered={stopAudioTriggered} setStopAudioTriggered={setStopAudioTriggered} onFlowContinue={onFlowContinue} setIsLoading={setIsLoading} />}
        </div>
      </div>

      {/* Loading Spinner */}
      <LoadingSpinner isVisible={isLoading} />
    </div>
  )
}

export default CommonHomePage
