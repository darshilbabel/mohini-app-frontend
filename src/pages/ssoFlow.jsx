import "../components/custom-style.css"
import "../index.css"
import { BiLoader } from "react-icons/bi"
import { clearFromStorage } from "../services/storage_service"
import { getSessionDetailsApi } from "../api/endpoints/chat"
import { LANGUAGE_ENUMS, sessionFlowName } from "./ShikshalokamVoiceChat/enum"
import { readElevateProfileApi } from "../api/endpoints/user"
import { setLanguage } from "../i18n"
import { updateReflectionStatusApi } from "../api/endpoints/project"
import { URL_PARAMS } from "constants/urls"
import { useChatDataLocalStore, useSiteDataLocalStore, useUserDataLocalStore } from "store"
import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import ROUTES from "../url"
import { env } from "utils/env"

function SsoFlow() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { setChatLanguage, setHasSelectedLanguage, setSsoRerouteURL } = useSiteDataLocalStore.getState()
  const { setFlow, setSessionId, setIsNewChatOpen, setProjectId, setTaskId } = useChatDataLocalStore.getState()
  const { setFirstName, setCompanyName, setState, setAcceptedTnC, setAccessToken, setProfileId } = useUserDataLocalStore.getState()

  useEffect(() => {
    async function fetchProfileDetails() {
      const accessToken = searchParams.get(URL_PARAMS.ACCESS_TOKEN)
      const flow_type = searchParams.get(URL_PARAMS.FLOW)
      const projectId = searchParams.get(URL_PARAMS.PROJECT_ID)
      const taskId = searchParams.get(URL_PARAMS.TASK_ID)
      const sessionId = searchParams.get(URL_PARAMS.SESSION_ID)
      const languagePassed = searchParams.get(URL_PARAMS.LANGUAGE)
      let rerouteRaw = searchParams.get(URL_PARAMS.RE_ROUTE_URL) || ""
      if (rerouteRaw.startsWith('"') && rerouteRaw.endsWith('"')) {
        rerouteRaw = rerouteRaw.slice(1, -1)
      }
      console.log(rerouteRaw, URL_PARAMS.RE_ROUTE_URL)
      // const rerouteUrl = decodeURIComponent(rerouteRaw)

      if (env.AUTH_METHOD() === "url" && (!accessToken || accessToken === "")) {
        navigate(-1);
        window.location.reload();
      }
      try {
        // const data = await readElevateProfileApi(accessToken);
        const data = await readElevateProfileApi();
        if (data) {
          const profile_details = data?.profile_details
          if (profile_details) {
            if (projectId) {
              const statusRes = await updateReflectionStatusApi(projectId, "started", sessionFlowName.SsoFlow, accessToken)
              if (statusRes?.status !== 200) {
                clearFromStorage();
                navigate(-1)
              }
            }

            clearFromStorage()
            setLanguage(LANGUAGE_ENUMS.ENGLISH)
            setChatLanguage(LANGUAGE_ENUMS.ENGLISH)
            if (sessionId && sessionId !== "" && sessionId !== "null") {
              setSessionId(sessionId)
            } else {
              let session = await getSessionDetailsApi()
              setSessionId(session.sessionid)
            }
            if (languagePassed && languagePassed !== "" && languagePassed !== "null" && Object.values(LANGUAGE_ENUMS).includes(languagePassed)) {
              setHasSelectedLanguage(true)
              setChatLanguage(languagePassed)
              setLanguage(languagePassed)
            } else if (profile_details.route) {
              setChatLanguage(profile_details.route)
              setLanguage(profile_details.route)
            }

            setSsoRerouteURL(rerouteRaw)
            setFirstName(profile_details.first_name)
            setCompanyName(profile_details.company)
            setState(profile_details.state)
            setFlow(flow_type)
            const hasAcc = profile_details.has_accepted_tnc;
            setAcceptedTnC(typeof hasAcc === "string" ? hasAcc : "ONGOING")
            setAccessToken(env.AUTH_METHOD() === "url" ? accessToken : true)
            setProfileId(profile_details.profileid)
            setIsNewChatOpen(true)
            setProjectId(projectId)
            setTaskId(taskId)

            const params = new URLSearchParams()
            if (flow_type) params.append("flow", flow_type)
            if (languagePassed && languagePassed !== "" && languagePassed !== "null" && Object.values(LANGUAGE_ENUMS).includes(languagePassed)) {
              params.append("language", languagePassed)
            }
            const queryString = params.toString()
            const navigationPath = queryString ? `${ROUTES.SHIKSHALOKAM_HOME_PAGE}?${queryString}` : ROUTES.SHIKSHALOKAM_HOME_PAGE
            navigate(navigationPath, { replace: true })
            // window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_HOME_PAGE)
          } else {
            navigate(-1)
          }
        } else {
          navigate(-1)
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate(-1)
      }
    }

    fetchProfileDetails()
  }, [searchParams])

  return (
    <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 justify-center h-screen">
      <div className="login-load-spinner">
        <div className="login-div67">
          <BiLoader className="login-rotate-loader login-loader-icon" />
        </div>
      </div>
    </div>
  )
}

export default SsoFlow
