/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react"
import { getSessionDetailsApi } from "../api/endpoints/chat"
import { readElevateProfileApi } from "../api/endpoints/user"
import { updateReflectionStatusApi } from "../api/endpoints/project"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import ROUTES from "../url"
import { BiLoader } from "react-icons/bi"
import "../components/custom-style.css"
import "../index.css"
import { clearFromStorage } from "../services/storage_service"
import { setLanguage } from "../i18n"
import { LANGUAGE_ENUMS, sessionFlowName } from "./ShikshalokamVoiceChat/enum"
import { useChatDataLocalStore } from "store"
import { useSiteDataLocalStore } from "store"
import { useUserDataLocalStore } from "store"
import { URL_PARAMS } from "constants/urls"

function SsoFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const { sessionId } = useChatDataLocalStore()
  const { setChatLanguage, setHasSelectedLanguage, setSsoRerouteURL } = useSiteDataLocalStore.getState()
  const { setFlow, setSessionId, setIsNewChatOpen, setProjectId, setTaskId } = useChatDataLocalStore.getState()
  const { setFirstName, setCompanyName, setState, setAcceptedTnC, setAccessToken, setProfileId } = useUserDataLocalStore.getState()

  // useEffect(() => {
  //   clearFromStorage();
  // }, []);

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

      if (!accessToken || accessToken === "") {
        navigate(-1)
        window.location.reload()
      }
      try {
        const data = await readElevateProfileApi(accessToken)
        if (data) {
          const profile_details = data?.profile_details
          if (profile_details) {
            if (!!projectId) {
              const statusRes = await updateReflectionStatusApi(projectId, "started", sessionFlowName.SsoFlow, accessToken)
              if (!!projectId && statusRes?.status !== 200) {
                clearFromStorage()
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
            } else {
              setChatLanguage(profile_details.route)
              setLanguage(profile_details.route)
            }

            setSsoRerouteURL(rerouteRaw)
            setFirstName(profile_details.first_name)
            setCompanyName(profile_details.company)
            setState(profile_details.state)
            setFlow(flow_type)
            const hasAcc = profile_details.has_accepted_tnc
            setAcceptedTnC(typeof hasAcc === "string" ? hasAcc : "ONGOING")
            setAccessToken(accessToken)
            setProfileId(profile_details.profileid)
            setIsNewChatOpen(true)
            setProjectId(projectId)
            setTaskId(taskId)
            // navigate(ROUTES.SHIKSHALOKAM_HOME_PAGE, {replace: true});
            window.location.replace("/mohini" + ROUTES.SHIKSHALOKAM_HOME_PAGE)
          } else {
            navigate(-1)
          }
        } else {
          navigate(-1)
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
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

/* eslint-disable react-hooks/exhaustive-deps */
