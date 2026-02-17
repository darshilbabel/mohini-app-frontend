import { bot_routes } from "../configure"
import axiosInstance from "../utils/axios"

const postWithoutAuth = async (body, endpoint) => {
  const headers = {
    "Content-Type": "application/json",
  }
  return await axiosInstance
    .post(`/api/${endpoint}`, body, { headers })
    .then(response => {
      if (response && response.data) {
        return response.data
      }
    })
    .catch(error => {
      return error?.response?.data
    })
}

const getWithoutAuth = async endpoint => {
  const headers = {
    "Content-Type": "application/json",
  }
  return await axiosInstance
    .get(`/api/${endpoint}`, { headers })
    .then(response => {
      if (response && response.data) {
        return response.data
      }
    })
    .catch(error => {
      return error?.response?.data
    })
}

export const getProfileDetails = async body => {
  const headers = {
    "Content-Type": "application/json",
  }
  return await axiosInstance
    .post(`/api/profile/`, body, { headers })
    .then(response => {
      if (response && response.data) {
        return response.data
      }
    })
    .catch(error => {
      return error?.response?.data
    })
}

export const getSessionDetails = async () => {
  const endpoint = `generate-session/`
  return await getWithoutAuth(endpoint)
}

export const submitFeedBack = async body => {
  const endpoint = `feedback/`
  return await postWithoutAuth(body, endpoint)
}

export const getIpLocation = async () => {
  const endpoint = `get-ip-location/`
  return await getWithoutAuth(endpoint)
}

export const readElevateProfile = async accessToken => {
  const headers = {
    "Content-Type": "application/json",
    "X-auth-token": accessToken,
  }
  return await axiosInstance
    .get(`api/read-elevate-profile/`, { headers })
    .then(response => {
      if (response && response.data) {
        return response.data
      }
    })
    .catch(error => {
      return error?.response?.data
    })
}

export async function getAI4BharatAudio(text, sourceLanguage = "en", storedRoute = bot_routes.normal) {
  try {
    const response = await axiosInstance.post("api/text_to_speech/", {
      text: text,
      source_language: sourceLanguage,
      route: storedRoute,
    })

    return response.data.audio
  } catch (error) {
    console.error("Error fetching AI4Bharat audio:", error)
    throw error
  }
}

export async function ai4BharatASR(base64, sourceLanguage = "en", storedRoute = bot_routes.normal) {
  try {
    const response = await axiosInstance.post("api/asr/", {
      s3Url: base64,
      source_language: sourceLanguage,
      route: storedRoute,
    })

    return response.data.transcript
  } catch (error) {
    console.error("Error fetching AI4Bharat audio:", error)
    return ""
  }
}

export const getUserProfile = async filter => {
  const endpoint = `user_profile${filter}`
  return await getWithoutAuth(endpoint)
}

export async function transliterateApi(message, sourceLanguage = "en", targetLanguage = "en", storedRoute = bot_routes.shikshalokam_chaupal, detect_language = false) {
  try {
    const response = await axiosInstance.post("api/text_transliterate/", {
      message_body: message,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      route: storedRoute,
      detect_language: detect_language,
    })
    const content = response.data?.transcript?.content
    if (Array.isArray(content)) {
      return content[0]
    } else if (typeof content === "string") {
      return content
    } else {
      console.warn("Unexpected content type:", content)
      return ""
    }
  } catch (error) {
    console.error("Error fetching Transliterate text:", error)
    return ""
  }
}

// Example usage of saveQuestion with squestion param
// You can call this function wherever you need to save the question
// const squestion = {
//   session: "session_12348",
//   status: "COMPLETED",
//   flow: "megaPTM",
//   profile_id: 2,
//   id: "question_1",
//   answer_id: "question_1_answer",
//   sequence: 1,
//   question: "ఫ్రాన్స్ రాజధాని ఏది?",
//   translated_question: "What is the capital of France?",
//   answer: "రాజధాని పారిస్.",
//   language: "te",
//   sent_at: "2025-07-04T12:00:00Z",
//   audio_url: null,
// }

export const savePTMQuestion = async ({ session, status, flow = "megaPTM", profile_id, id, answer_id, sequence, question, translated_question, answer, language, sent_at, audio_url, service }) => {
  const endpoint = `questions/save/`
  return await postWithoutAuth(
    {
      session,
      status,
      flow,
      profile_id,
      id,
      answer_id,
      sequence,
      question,
      translated_question,
      answer,
      language,
      sent_at,
      audio_url,
      service,
    },
    endpoint
  )
}
