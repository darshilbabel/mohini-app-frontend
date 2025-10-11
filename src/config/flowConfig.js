import { sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";
import ROUTES from "../url";
import ptmQuestions from "../services/const/questions/ptmQuestions";
import ylcQuestions from "../services/const/questions/ylcQuestions";

export const FLOW_CONFIG = {
  [sessionFlowName.megaPTM]: {
    flowName: sessionFlowName.megaPTM,
    questions: ptmQuestions,
    homePageRoute: ROUTES.SHIKSHALOKAM_PTM_HOME_PAGE,
    chatRoute: ROUTES.SHIKSHALOKAM_PTM_CHAT_PAGE,
    apiRoute: "/mega_ptm",
    completionMessageKey: "ptmCompletionMessage",
    completionCTAKey: "ptmCompletionCTA",
    introHeadingKey: "ptmIntroductionHeading",
    introLines: [
      "ptmIntroductionDescriptionLine1",
      "ptmIntroductionDescriptionLine2",
      "ptmIntroductionDescriptionLine3"
    ]
  },
  [sessionFlowName.YLC]: {
    flowName: sessionFlowName.YLC,
    questions: ylcQuestions,
    homePageRoute: ROUTES.SHIKSHALOKAM_YLC_HOME_PAGE,
    chatRoute: ROUTES.SHIKSHALOKAM_YLC_CHAT_PAGE,
    apiRoute: "/ylc",
    completionMessageKey: "ptmCompletionMessage",
    completionCTAKey: "ptmCompletionCTA",
    introHeadingKey: "ptmIntroductionHeading",
    introLines: [
      "ptmIntroductionDescriptionLine1",
      "ptmIntroductionDescriptionLine2",
      "ptmIntroductionDescriptionLine3"
    ]
  }
};

export const getFlowConfig = (flowType) => {
  const config = FLOW_CONFIG[flowType];
  if (!config) {
    throw new Error(`Flow configuration not found for: ${flowType}`);
  }
  return config;
};
