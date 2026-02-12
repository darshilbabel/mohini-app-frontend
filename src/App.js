import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { sessionFlowName } from "./constants/session"
import { useRoutes, Navigate } from "react-router-dom"
import { UserProvider } from "./context/user"
import CommonHomePage from "./pages/Login/commonPage"
import NotFound from "./pages/shikshagraha-repository/not-found"
import PrivacyPage from "./pages/privacyPage"
import React from "react"
import ROUTES from "./url"
import ShikshagrahaRepository from "./pages/shikshagraha-repository/listing"
import ShikshagrahaRepositoryDetail from "./pages/shikshagraha-repository/details"
import ShikshalokamChat from "./pages/shikshalokamChat"
import SsoFlow from "./pages/ssoFlow"
import UnifiedChat from "./pages/UnifiedChat/UnifiedChat"
import ChatContainer from "./pages/ShikshalokamVoiceChat/chat-container"
import MainPage from "pages/ai-creation/pages/shikshalokam-mitra/MainPage"
import ImprovementPlan from "pages/ai-creation/pages/improvement-plan"

const queryClient = new QueryClient()

function App() {
  const elements = useRoutes([...clean_routes(protected_routes_config), ...clean_routes(unprotected_routes_config), ...clean_routes(unprotected_old_routes)])

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>{elements}</UserProvider>
    </QueryClientProvider>
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

  // mitra chat routes
  { path: ROUTES.MITRA_CHAT, element: <MainPage /> },
  { path: ROUTES.IMPROVEMENT_PLAN, element: <ImprovementPlan /> },

  // { path: ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN, element: <Shikshalokam type={"shikshalokam"} variant={"publicBot"} /> },
  // { path: ROUTES.SHIKSHALOKAM_VOICE_CHAT, element: <ShikshalokamVoiceBasedChat type={"shikshalokam"} variant={"publicBot"} /> },

  { path: ROUTES.COMMON_CHAT, element: <ChatContainer /> },

  { path: ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT, element: <ShikshalokamChat type={sessionFlowName.GuestDiscussion} /> },
  { path: ROUTES.SHIKSHALOKAM_GUEST_LISTENING_CHAT, element: <ShikshalokamChat type={sessionFlowName.ListeningActivity} /> },
  { path: ROUTES.SHIKSHALOKAM_GUEST_MI_STORY, element: <ShikshalokamChat type={sessionFlowName.GuestMiStory} /> },
  { path: ROUTES.SHIKSHALOKAM_PPPI_VOICE_CHAT, element: <ShikshalokamChat type={sessionFlowName.ParentPerceptionSurvey} /> },

  // Unified PTM route
  { path: ROUTES.SHIKSHALOKAM_PTM_CHAT_PAGE, element: <UnifiedChat type={sessionFlowName.megaPTM} /> },
  { path: ROUTES.SHIKSHALOKAM_PTM_HOME_PAGE, element: <CommonHomePage usecaseType={sessionFlowName.megaPTM} /> },

  // Unified YLC route
  { path: ROUTES.SHIKSHALOKAM_YLC_CHAT_PAGE, element: <UnifiedChat type={sessionFlowName.YLC} /> },
  { path: ROUTES.SHIKSHALOKAM_YLC_HOME_PAGE, element: <CommonHomePage usecaseType={sessionFlowName.YLC} /> },

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
