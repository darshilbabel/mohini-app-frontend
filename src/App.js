/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import ROUTES from "./url";
import { UserProvider, useUserDispatcher, useUserStore } from "./context/user";
import { useLocalStorage } from "react-use";
import USER_ACTIONS from "./context/user/user-actions";
import Shikshalokam from "./pages/shikshalokam";
import ShikshalokamVoiceBasedChat from "./pages/ShikshalokamVoiceChat/voice-chat";
import WelcomePage from "./components/Welcome";
import GuestPage from "./components/GuestPage";
import PrivacyPage from "./pages/privacyPage";
import ShikshalokamChat from "./pages/shikshalokamChat";
import SsoFlow from "./pages/ssoFlow";
import { sessionFlowName } from "./pages/ShikshalokamVoiceChat/enum";
import CommonHomePage from "./pages/Login/commonPage";


function App() {
  const elements = useRoutes([
    ...clean_routes(protected_routes_config),
    ...clean_routes(unprotected_routes_config),
    ...clean_routes(unprotected_old_routes),
  ]);

  return (
    <React.Fragment>
      <UserProvider>{elements}</UserProvider>
    </React.Fragment>
  );
}

export default App;

const ProtectedComponent = ({ component, isAccessible }) => {
  const userStore = useUserStore();
  const userDispatcher = useUserDispatcher();

  const [localUserData] =
    useLocalStorage("grit", {});


  if (!isAccessible) {
    return <Navigate to={"/page-not-found"} />;
  }

  return component;
};


const protected_routes = [

];

const unprotected_old_routes = [
  // { path: ROUTES.SHIKSHALOKAM_HOME_PAGE, element: <WelcomePage /> },
  // { path: ROUTES.SHIKSHALOKAM_GUEST_PAGE, element: <GuestPage /> },
  { path: ROUTES.SHIKSHALOKAM_VOICE_CHAT_LOGIN, element: <Shikshalokam type={'shikshalokam'} variant={'publicBot'}/> },
  { path: ROUTES.SHIKSHALOKAM_VOICE_CHAT, element: <ShikshalokamVoiceBasedChat type={'shikshalokam'} variant={'publicBot'}/>},
  // { path: ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT, element: <ShikshalokamVoiceBasedChat type={'shikshalokam'} variant={'publicBot'}/>},
  { path: ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT, element: <ShikshalokamChat type={sessionFlowName.GuestDiscussion} />},
  { path: ROUTES.SHIKSHALOKAM_GUEST_MI_STORY, element: <ShikshalokamChat type={sessionFlowName.GuestMiStory} />},
  {path: ROUTES.TERMS_AND_CONDITIONS, element: <PrivacyPage />},
  { path: ROUTES.SHIKSHALOKAM_HOME_PAGE, element: <CommonHomePage /> },
  {path: ROUTES.SSO_FLOW, element: <SsoFlow />},
];

const unprotected_routes_config = [
];

const protected_routes_config = protected_routes.map((x) => ({
  ...x,
  caseSensitive: true,
  element: (
    <ProtectedComponent component={x.element} isAccessible={x?.isAccessible} />
  ),
}));

const clean_routes = (unpure_collection) =>
  unpure_collection.map((x) => ({
    path: x?.path,
    element: x?.element,
    caseSensitive: x?.caseSensitive,
  }));
/* eslint-disable react-hooks/exhaustive-deps */
