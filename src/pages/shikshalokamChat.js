import { useEffect, useState } from "react"
import { getIpLocation, getProfileDetails, getSessionDetails } from "../services/api.service"
import { languageList } from "./ShikshalokamVoiceChat/enum"
import ROUTES from "../url"
import { useNavigate } from "react-router-dom"
import { setLanguage } from "../i18n"
import { BiLoader } from "react-icons/bi"
import ShikshalokamVoiceBasedChat from "./ShikshalokamVoiceChat/voice-chat"
import { loginApi } from "api/endpoints/auth"
import { useChatStorage, useUserStorage, useSiteStorage } from "hooks/useStorage"
import useUserDataLocalStore from "store/slices/userData/userDataLocal"
import { useSiteDataLocalStore } from "store"

function ShikshalokamChat({ type, variant }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const { setFirstName } = useUserStorage().getState()
  const chatLanguage = useSiteDataLocalStore(state => state.chatLanguage)
  const companyName = useUserStorage()(state => state.companyName)
  const deviceId = useUserStorage()(state => state.device_id)
  const ipCity = useUserStorage()(state => state.ipCity)
  const ipCountry = useUserStorage()(state => state.ipCountry)
  const ipState = useUserStorage()(state => state.ipState)
  const sessionId = useChatStorage()(state => state.sessionId)
  const setCompanyName = useUserStorage()(state => state.setCompanyName)
  const setDeviceId = useUserStorage()(state => state.setDeviceId)
  const setFlow = useChatStorage()(state => state.setFlow)
  const setHasAcceptedTnc = useUserStorage()(state => state.setHasAcceptedTnc)
  const setIpCity = useUserStorage()(state => state.setIpCity)
  const setIpCountry = useUserStorage()(state => state.setIpCountry)
  const setIpState = useUserStorage()(state => state.setIpState)
  const setIpZipCode = useUserStorage()(state => state.setIpZipCode)
  const setIsNewChatOpen = useChatStorage()(state => state.setIsNewChatOpen)
  const setProfileId = useUserStorage()(state => state.setProfileId)
  const setSessionId = useChatStorage()(state => state.setSessionId)
  const setUserId = useUserStorage()(state => state.setUserId)
  const storageFlow = useChatStorage()(state => state.flow)
  const userId = useUserStorage()(state => state.userId)

  const accessToken = useUserDataLocalStore(state => state.access_token)

  useEffect(() => {
    console.log("companyName chk", companyName)
    console.log("isLoading chk", isLoading)
  }, [companyName, isLoading])

  function getUserFingerPrint() {
    if (accessToken) return

    try {
      const fingerprint = window.navigator.userAgent + window.navigator.language + window.screen.colorDepth + window.screen.pixelDepth + window.screen.width + window.screen.height

      const newUserId = deviceId || btoa(fingerprint)

      if (!deviceId) setDeviceId(newUserId)
      setUserId(newUserId)
    } catch (error) {
      console.error("Error handling user ID:", error)
      setUserId("guest_" + Date.now())
    }
  }

  async function initialSetup() {
    if (accessToken) return

    try {
      const customEmail = deviceId + "@shikshalokam.org"
      const body = {
        email: customEmail,
        company: "shikshalokamstaging",
        password: "grit@123",
        latest_flow_used: storageFlow,
        other_params: {
          device_id: deviceId,
          city: ipCity || "",
          state: ipState || "",
          country: ipCountry || "",
        },
      }

      setIsLoading(true)
      const res = await getProfileDetails(body)

      //   if (res?.status === "error") {
      // 	setIsLoading(false);
      // 	return;
      //   }

      setProfileId(res.id)

      let session = await getSessionDetails()
      setSessionId(session.sessionid)

      const response = await loginApi({
        email: customEmail,
        password: "grit@123",
      })

      if (!!response?.access_token) {
        setCompanyName(response?.company)
        setFirstName(response?.first_name)
      } else {
        window.location.reload()
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error during initial setup:", error)
      navigate(ROUTES.SHIKSHALOKAM_HOME_PAGE)
      setIsLoading(false)
    }
  }

  const setFinalLanguage = async () => {
    if (accessToken) return

    await initialSetup()
    const storedLanguage = chatLanguage || languageList[0].value
    setLanguage(storedLanguage)
  }

  useEffect(() => {
    const runSetup = async () => {
      // if (accessToken) return

      if (!sessionId) {
        // clearFromStorage(false, ["local_route"])
        setIsLoading(true)
        // setHasAcceptedTnc("ONGOING")
        setIsNewChatOpen(true)

        const locationData = await getIpLocation()
        if (locationData && locationData?.location) {
          setIpState(locationData?.location?.regionName)
          setIpCity(locationData?.location?.city)
          setIpCountry(locationData?.location?.country)
          setIpZipCode(locationData?.location?.zip)
        }
        setFlow(type)
        getUserFingerPrint()
        await setFinalLanguage()

        setIsLoading(false)
      }
      // else if (storageFlow && !accessToken){
      // 	window.location.reload();
      // }
    }
    runSetup()
  }, [accessToken, sessionId])

  return (
    <>
      {companyName && !isLoading && (
        <>
          <ShikshalokamVoiceBasedChat type={"shikshalokam"} variant={"publicBot"} />
        </>
      )}
      {isLoading && (
        <div className="loader-load-spinner">
          <div className="div67">
            <BiLoader className="loader-rotate-loader loader-icon" />
          </div>
        </div>
      )}
    </>
  )
}

export default ShikshalokamChat
