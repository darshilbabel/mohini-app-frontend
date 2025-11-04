import { SESSION_USECASE_TYPE } from "constants/session"
import { sessionFlowName } from "./pages/ShikshalokamVoiceChat/enum"
import { useRoutes, Navigate } from "react-router-dom"
import { UserProvider } from "./context/user"
import CommonHomePage from "./pages/Login/commonPage"
import NotFound from "./pages/shikshagraha-repository/not-found"
import PrivacyPage from "./pages/privacyPage"
import React from "react"
import ROUTES from "./url"
import ShikshagrahaRepository from "./pages/shikshagraha-repository/listing"
import ShikshagrahaRepositoryDetail from "./pages/shikshagraha-repository/details"
import Shikshalokam from "./pages/shikshalokam"
import ShikshalokamChat from "./pages/shikshalokamChat"
import ShikshalokamVoiceBasedChat from "./pages/ShikshalokamVoiceChat/voice-chat"
import SsoFlow from "./pages/ssoFlow"
import UnifiedChat from "./pages/UnifiedChat/UnifiedChat"

function App() {
  const elements = useRoutes([...clean_routes(protected_routes_config), ...clean_routes(unprotected_routes_config), ...clean_routes(unprotected_old_routes)])

  return (
    <React.Fragment>
      <UserProvider>{elements}</UserProvider>
    </React.Fragment>
  )
}

export default App

const ProtectedComponent = ({ component, isAccessible }) => {
  if (!isAccessible) {
    return <Navigate to={"/page-not-found"} />
  }

  return component
}

const protected_routes = []

const unprotected_old_routes = [
  { path: ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN, element: <Shikshalokam type={"shikshalokam"} variant={"publicBot"} /> },
  { path: ROUTES.SHIKSHALOKAM_VOICE_CHAT, element: <ShikshalokamVoiceBasedChat type={"shikshalokam"} variant={"publicBot"} /> },
  { path: ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT, element: <ShikshalokamChat type={sessionFlowName.GuestDiscussion} /> },
  { path: ROUTES.SHIKSHALOKAM_GUEST_LISTENING_CHAT, element: <ShikshalokamChat type={sessionFlowName.ListeningActivity} /> },
  { path: ROUTES.SHIKSHALOKAM_GUEST_MI_STORY, element: <ShikshalokamChat type={sessionFlowName.GuestMiStory} /> },

  // Unified PTM route
  { path: ROUTES.SHIKSHALOKAM_PTM_CHAT_PAGE, element: <UnifiedChat type={sessionFlowName.megaPTM} /> },
  { path: ROUTES.SHIKSHALOKAM_PTM_HOME_PAGE, element: <CommonHomePage usecaseType={SESSION_USECASE_TYPE.MEGA_PTM} /> },

  // Unified YLC route
  { path: ROUTES.SHIKSHALOKAM_YLC_CHAT_PAGE, element: <UnifiedChat type={sessionFlowName.YLC} /> },
  { path: ROUTES.SHIKSHALOKAM_YLC_HOME_PAGE, element: <CommonHomePage usecaseType={SESSION_USECASE_TYPE.YLC} /> },

  { path: ROUTES.TERMS_AND_CONDITIONS, element: <PrivacyPage /> },
  { path: ROUTES.SHIKSHALOKAM_HOME_PAGE, element: <CommonHomePage /> },
  { path: ROUTES.SSO_FLOW, element: <SsoFlow /> },
  { path: ROUTES.SHIKSHAGRAHA_REPOSITORY, element: <ShikshagrahaRepository /> },
  { path: ROUTES.SHIKSHAGRAHA_REPOSITORY_DETAIL, element: <ShikshagrahaRepositoryDetail /> },
  { path: ROUTES.NOT_FOUND, element: <NotFound /> },
]

const unprotected_routes_config = []

const protected_routes_config = protected_routes.map(x => ({
  ...x,
  caseSensitive: true,
  element: <ProtectedComponent component={x.element} isAccessible={x?.isAccessible} />,
}))

const clean_routes = unpure_collection =>
  unpure_collection.map(x => ({
    path: x?.path,
    element: x?.element,
    caseSensitive: x?.caseSensitive,
  }))
/* eslint-disable react-hooks/exhaustive-deps */
