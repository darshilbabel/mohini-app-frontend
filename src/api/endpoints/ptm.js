import { API_ENDPOINTS } from "constants/urls";
import { apiClient } from "../client";

/**
 * Save PTM Question
 * @param {Object} data - The PTM question data
 * @param {string} data.session - Session ID
 * @param {string} data.status - Status of the question (e.g., "COMPLETED")
 * @param {string} [data.flow="megaPTM"] - Flow type
 * @param {number} data.profile_id - Profile ID
 * @param {string} data.id - Question ID
 * @param {string} data.answer_id - Answer ID
 * @param {number} data.sequence - Question sequence number
 * @param {string} data.question - The question text
 * @param {string} data.translated_question - Translated question text
 * @param {string} data.answer - The answer text
 * @param {string} data.language - Language code (e.g., "te", "en")
 * @param {string} data.sent_at - Timestamp when sent (ISO format)
 * @param {string|null} data.audio_url - Audio URL if available
 * @param {string} data.service - Service identifier
 * @returns {Promise<Object>} The response data from saving the PTM question
 */
export const savePTMQuestionApi = async ({
  session,
  status,
  flow = "megaPTM",
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
}) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.SAVE_PTM_QUESTION,
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
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    return error?.response?.data;
  }
};
