import { sessionFlowName } from "../pages/ShikshalokamVoiceChat/enum";
import ROUTES from "../url";
import ptmQuestions from "../services/const/questions/ptmQuestions";
import ylcQuestions, { ylcStoryTextAudio } from "../services/const/questions/ylcQuestions";

const base_path = process.env.REACT_APP_ADUIO_PATH ?? "";

export const FLOW_CONFIG = {
  [sessionFlowName.megaPTM]: {
    flowName: sessionFlowName.megaPTM,
    questions: ptmQuestions,
    homePageRoute: ROUTES.SHIKSHALOKAM_PTM_HOME_PAGE,
    chatRoute: ROUTES.SHIKSHALOKAM_PTM_CHAT_PAGE,
    profileId: process.env.REACT_APP_MEGA_PTM_PROFILE_ID,
    apiRoute: "/mega_ptm",
    completionMessageKey: "ptmCompletionMessage",
    completionCTAKey: "ptmCompletionCTA",
    introHeadingKey: "ptmIntroductionHeading",
    uploadPhotoKey: "evidence'",
    introLines: [
      "ptmIntroductionDescriptionLine1",
      "ptmIntroductionDescriptionLine2",
      "ptmIntroductionDescriptionLine3"
    ],
    showCompletionPopup: true,
    storyActions: {
      showPhotoUpload: false,
      showEdit: false,
      showDownload: false
    }
  },
  [sessionFlowName.YLC]: {
    flowName: sessionFlowName.YLC,
    questions: ylcQuestions,
    homePageRoute: ROUTES.SHIKSHALOKAM_YLC_HOME_PAGE,
    chatRoute: ROUTES.SHIKSHALOKAM_YLC_CHAT_PAGE,
    profileId: process.env.REACT_APP_YLC_PROFILE_ID,
    apiRoute: "/ylc",
    completionMessageKey: "ptmCompletionMessage",
    completionCTAKey: "ptmCompletionCTA",
    introHeadingKey: "homepageHeading",
    introHeadingKey1: "homepageHeading1",
    introLines: [
      "homepageList",
      "homepageList1",
      "homepageList2"
    ],
    uploadPhotoKey: "evidenceStory",
    showCompletionPopup: false,
    storyActions: {
      showPhotoUpload: true,
      showEdit: true,
      showDownload: true
    },
    storyTextAudio: ylcStoryTextAudio
  }
};

export const getFlowConfig = (flowType) => {
  const config = FLOW_CONFIG[flowType];
  if (!config) {
    throw new Error(`Flow configuration not found for: ${flowType}`);
  }
  return config;
};
