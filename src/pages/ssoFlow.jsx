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
import { clearFromStorage, setInStorage } from "../services/storage_service"
import { setLanguage } from "../i18n"
import { LANGUAGE_ENUMS, languageList, sessionFlowName } from "./ShikshalokamVoiceChat/enum"
import { useChatDataLocalStore } from "store"
import { useSiteDataLocalStore } from "store"
import { useUserDataLocalStore } from "store"

function SsoFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const { sessionId } = useChatDataLocalStore()
  const { setChatLanguage, setHasSelectedLanguage, setSsoRerouteURL } = useSiteDataLocalStore.getState()
  const { setSessionId, setIsNewChatOpen, setProjectId, setTaskId } = useChatDataLocalStore.getState()
  const { setFirstName, setCompanyName, setState, setFlow, setAcceptedTnC, setAccessToken, setProfileId } = useUserDataLocalStore.getState()

  // useEffect(() => {
  //   clearFromStorage();
  // }, []);

  useEffect(() => {
    async function fetchProfileDetails() {
      const accessToken = searchParams.get("accToken")
      const flow_type = searchParams.get("flow")
      const projectId = searchParams.get("projectId")
      const taskId = searchParams.get("taskId")
      const sessionId = searchParams.get("sessionId")
      const languagePassed = searchParams.get("language")
      let rerouteRaw = searchParams.get("rerouteUrl") || ""
      if (rerouteRaw.startsWith('"') && rerouteRaw.endsWith('"')) {
        rerouteRaw = rerouteRaw.slice(1, -1)
      }
      console.log(rerouteRaw, "rerouteRaw")
      // const rerouteUrl = decodeURIComponent(rerouteRaw)

      if (!accessToken || accessToken === "") {
        navigate(-1)
        window.location.reload()
      }
      try {
        const data = await readElevateProfileApi(accessToken)
        if (data && data?.status.toLowerCase() === "ok") {
          const profile_details = data?.profile_details
          if (profile_details) {
            if (!!projectId) {
              const statusRes = await updateReflectionStatusApi(projectId, "started", sessionFlowName.SsoFlow, accessToken)
              if (!!projectId && statusRes?.status !== 200) {
                clearFromStorage()
                navigate(-1)
              }
            }

            clearFromStorage(true)
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
