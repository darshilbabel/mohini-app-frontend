import { API_ENDPOINTS, URL_PARAMS } from "../constants/urls"
import { useChatStorage, useSiteStorage } from "hooks/useStorage"
import { clearFromStorage } from "../services/storage_service"
import { getFlowLanguagesApi } from "../api/endpoints/flow"
import { languageList, languageValueMap } from "../pages/ShikshalokamVoiceChat/enum"
import { sessionFlowName } from "../constants/session"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useSiteDataSessionStore } from "store"
import { useTranslation } from "react-i18next"
import ROUTES from "../url"
import useUrlFlow from "../hooks/useUrlFlow"

const LanguageSelectionGrid = ({ usecaseType }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const setChatLanguage = useSiteDataSessionStore(state => state.setChatLanguage)
  const setHasSelectedLanguage = useSiteDataSessionStore(state => state.setHasSelectedLanguage)
  const setStorageFlow = useChatStorage()(state => state.setFlow)
  const setPreviousUrl = useSiteStorage()(state => state.setPreviousUrl)

  const { flow: urlFlow } = useUrlFlow()

  const {
    data: flowLanguages,
    isError: isFlowLanguagesError,
    error: flowLanguagesError,
  } = useQuery({
    queryKey: [API_ENDPOINTS.FLOW_LANGUAGES, urlFlow],
    queryFn: () => getFlowLanguagesApi(urlFlow),
    retry: false,
    enabled: !!urlFlow && ![sessionFlowName.ParentPerceptionSurvey, sessionFlowName.ListeningActivity].includes(urlFlow),
  })

  useEffect(() => {
    if (!isFlowLanguagesError) return

    if (flowLanguagesError?.response?.status === 404) {
      console.error("Flow not found or inactivate, navigating to home page")
      clearFromStorage()
      navigate(ROUTES.SHIKSHALOKAM_HOME_PAGE, { replace: true })
    }
  }, [flowLanguagesError, isFlowLanguagesError])

  const handleLanguageClick = langValue => {
    setChatLanguage(langValue)
    setHasSelectedLanguage(true)

    if (!urlFlow) return
    const route_mapping = {
      [sessionFlowName.ParentPerceptionSurvey]: ROUTES.SHIKSHALOKAM_PPPI_VOICE_CHAT,
      [sessionFlowName.ListeningActivity]: ROUTES.SHIKSHALOKAM_GUEST_LISTENING_CHAT,
    }

    if (route_mapping[urlFlow]) {
      setPreviousUrl(window.location.href)
      setStorageFlow(urlFlow)
      navigate(route_mapping[urlFlow])
      return
    }

    navigate({
      pathname: ROUTES.COMMON_CHAT,
      search: new URLSearchParams({ [URL_PARAMS.FLOW]: urlFlow }).toString(),
    })
  }

  return (
    <>
      <div className="text-center text-lg md:text-2xl sm:text-md mt-0 sm:mt-[100px] text-slate-700">
        <b>{t("welcome_text")}</b>
      </div>
      <p className="sm:text-xl text-md font-semibold text-center">{t("languageQuestion")}</p>
      <div className="mt-4 mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:justify-items-center lg:px-[80px] md:px-[20px] sm:px-[20px] px-[10px]">
        {flowLanguages &&
          flowLanguages.languages.map(lang => (
            <div key={lang} className="div14-lang w-full text-center vertical-center m-0 h-[100px] flex items-center justify-center" onClick={() => handleLanguageClick(lang)}>
              <button className="w-full">{languageValueMap[lang]}</button>
            </div>
          ))}
        {!flowLanguages &&
          languageList
            .filter(lang => !lang.excludeFor.includes(urlFlow || usecaseType))
            .map(lang => (
              <div key={lang.value} className="div14-lang w-full text-center vertical-center m-0 h-[100px] flex items-center justify-center" onClick={() => handleLanguageClick(lang.value)}>
                <button className="w-full">{lang.label}</button>
              </div>
            ))}
      </div>
    </>
  )
}

export default LanguageSelectionGrid
