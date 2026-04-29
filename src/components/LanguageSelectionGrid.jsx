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
    isLoading: isFlowLanguagesLoading,
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
      <div className="mt-4 mb-10 grid grid-cols-2 gap-3 md:gap-6 lg:px-[80px] md:px-[20px] sm:px-[20px] px-[10px]">
        {isFlowLanguagesLoading &&
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="div14-lang animate-skeleton m-0 h-[100px]"></div>
          ))}
        {!isFlowLanguagesLoading && flowLanguages &&
          flowLanguages.languages.map((lang, index, arr) => {
            const isLastOdd = arr.length % 2 !== 0 && index === arr.length - 1
            return (
              <div
                key={lang}
                className={`div14-lang m-0 h-[100px] flex items-center justify-center${isLastOdd ? " col-span-2 w-1/2 mx-auto" : ""}`}
                onClick={() => handleLanguageClick(lang)}
              >
                <button className="w-full text-center">{languageValueMap[lang]}</button>
              </div>
            )
          })}
        {!isFlowLanguagesLoading && !flowLanguages &&
          languageList
            .filter(lang => !lang.excludeFor.includes(urlFlow || usecaseType))
            .map((lang, index, arr) => {
              const isLastOdd = arr.length % 2 !== 0 && index === arr.length - 1
              return (
                <div
                  key={lang.value}
                  className={`div14-lang m-0 h-[100px] flex items-center justify-center${isLastOdd ? " col-span-2 w-1/2 mx-auto" : ""}`}
                  onClick={() => handleLanguageClick(lang.value)}
                >
                  <button className="w-full text-center">{lang.label}</button>
                </div>
              )
            })}
      </div>
    </>
  )
}

export default LanguageSelectionGrid
