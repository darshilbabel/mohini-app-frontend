import { LANGUAGE_ENUMS } from "pages/ShikshalokamVoiceChat/enum";

export const INITIAL_STATE = {
    accessToken: null,
    chatLanguage: LANGUAGE_ENUMS.ENGLISH,
    hasSelectedLanguage: false,
    previousUrl: null,
}