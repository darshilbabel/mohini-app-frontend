import env from "../../utils/env"

const base_path = env.AUDIO_PATH()
const questions = {
  1: {
    question_id: "q1",
    sequence: 1,
    questions: [
      {
        variant_id: "q1v1",
        title: {
          en: {
            text: "What is your name and what are you doing at this meeting?",
            audio: `${base_path}/audio/q1v1_en.b64`,
          },
          te: {
            text: "మీ పేరు మరియు మీరు ఈ సమావేశంలో మీరు ఏమి చేస్తున్నారు?",
            audio: `${base_path}/audio/q1v1_te.b64`,
          },
        },
      },
    ],
  },
  2: {
    question_id: "q2",
    sequence: 2,
    questions: [
      {
        variant_id: "q2v1",
        title: {
          en: {
            text: "Please tell me the name of the district you are in.",
            audio: `${base_path}/audio/q2v1_en.b64`,
          },
          te: {
            text: "మీరు ఉన్న జిల్లా పేరు చెప్పండి.",
            audio: `${base_path}/audio/q2v1_te.b64`,
          },
        },
      },
    ],
  },
  3: {
    question_id: "q3",
    sequence: 3,
    questions: [
      {
        variant_id: "q3v1",
        title: {
          en: {
            text: "Please tell me the name of the school you are in.",
            audio: `${base_path}/audio/q3v1_en.b64`,
          },
          te: {
            text: "మీరు ఉన్న పాఠశాల పేరు చెప్పండి.",
            audio: `${base_path}/audio/q3v1_te.b64`,
          },
        },
      },
    ],
  },
  4: {
    question_id: "q4",
    sequence: 4,
    questions: [
      {
        variant_id: "q4v1",
        title: {
          en: {
            text: "Was there anything that stood out to you in today's meeting?",
            audio: `${base_path}/audio/q4v1_en.b64`,
          },
          te: {
            text: "ఈ రోజు జరిగిన సమావేశంలో మీకు ప్రత్యేకంగా అనిపించిన విషయం ఏమైనా ఉందా?",
            audio: `${base_path}/audio/q4v1_te.b64`,
          },
        },
      },
    ],
  },
  5: {
    question_id: "q5",
    sequence: 5,
    questions: [
      {
        variant_id: "q5v1",
        title: {
          en: {
            text: "Describe in detail how you felt about the school atmosphere today.",
            audio: `${base_path}/audio/q5v1_en.b64`,
          },
          te: {
            text: "ఇవాళ పాఠశాల వాతావరణం మీకు ఎలా అనిపించిందో వివరంగా చెప్పండి.",
            audio: `${base_path}/audio/q5v1_te.b64`,
          },
        },
      },
    ],
  },
  6: {
    question_id: "q6",
    sequence: 6,
    questions: [
      {
        variant_id: "q6v1",
        title: {
          en: {
            text: "How did you feel about the quality of the discussions held at this meeting?",
            audio: `${base_path}/audio/q6v1_en.b64`,
          },
          te: {
            text: "ఈ సమావేశంలో జరిగిన చర్చల నాణ్యత గురించి మీకు ఎలా అనిపించింది?",
            audio: `${base_path}/audio/q6v1_te.b64`,
          },
        },
      },
    ],
  },
  7: {
    question_id: "q7",
    sequence: 7,
    questions: [
      {
        variant_id: "q7v1",
        title: {
          en: {
            text: "What changes do you hope will happen in the school after this meeting?",
            audio: `${base_path}/audio/q7v1_en.b64`,
          },
          te: {
            text: "ఈ సమావేశం తర్వాత పాఠశాలలో మీరు ఏ మార్పులు జరుగుతాయి అని ఆశిస్తున్నారు?",
            audio: `${base_path}/audio/q7v1_te.b64`,
          },
        },
      },
    ],
  },
}
export default questions
