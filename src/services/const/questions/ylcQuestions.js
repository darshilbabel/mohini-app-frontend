import { TextConversionType } from "../../../pages/ShikshalokamVoiceChat/enum"
import env from "../../../utils/env"

const base_path = env.AUDIO_PATH()
const questions = {
  1: {
    question_id: "q1",
    sequence: 1,
    service: TextConversionType.TRANSLITERATE,
    questions: [
      {
        variant_id: "q1v1",
        title: {
          en: {
            text: "Welcome! I'm MItra. I'm here to collect the details of the activity that you carried out in your community. Before we start, can you mention your name?",
            audio: `${base_path}/audio/ylc/en/q1v1_en.b64`,
          },
          kn: {
            text: "ಸ್ವಾಗತ! ನಾನು ಮಿತ್ರ. ನಿಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ ನೀವು ನಡೆಸಿದ ಚಟುವಟಿಕೆಯ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ನಾವು ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು, ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಬಹುದೇ?",
            audio: `${base_path}/audio/ylc/kn/q1v1_kn.b64`,
          },
        },
      },
    ],
  },
  2: {
    question_id: "q2",
    sequence: 2,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q2v1",
        title: {
          en: {
            text: "Can you mention your age?",
            audio: `${base_path}/audio/ylc/en/q2v1_en.b64`,
          },
          kn: {
            text: "ನಿಮ್ಮ ವಯಸ್ಸನ್ನು ನಮೂದಿಸಬಹುದೇ?",
            audio: `${base_path}/audio/ylc/kn/q2v1_kn.b64`,
          },
        },
      },
    ],
  },
  3: {
    question_id: "q3",
    sequence: 3,
    service: TextConversionType.TRANSLITERATE,
    questions: [
      {
        variant_id: "q3v1",
        title: {
          en: {
            text: "Can you mention your email ID?",
            audio: `${base_path}/audio/ylc/en/q3v1_en.b64`,
          },
          kn: {
            text: "ನಿಮ್ಮ ಇಮೇಲ್ ಐಡಿಯನ್ನು ನೀವು ನಮೂದಿಸಬಹುದೇ?",
            audio: `${base_path}/audio/ylc/kn/q3v1_kn.b64`,
          },
        },
      },
    ],
  },
  4: {
    question_id: "q4",
    sequence: 4,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q4v1",
        title: {
          en: {
            text: "What is your contact number? This is optional.",
            audio: `${base_path}/audio/ylc/en/q4v1_en.b64`,
          },
          kn: {
            text: "ನಿಮ್ಮ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ ಏನು? ಇದು ಐಚ್ಛಿಕ.",
            audio: `${base_path}/audio/ylc/kn/q4v1_kn.b64`,
          },
        },
      },
    ],
  },
  5: {
    question_id: "q5",
    sequence: 5,
    service: TextConversionType.TRANSLITERATE,
    questions: [
      {
        variant_id: "q5v1",
        title: {
          en: {
            text: "Name the Person or Leader who referred you to attend this movement.",
            audio: `${base_path}/audio/ylc/en/q5v1_en.b64`,
          },
          kn: {
            text: "ಈ ಆಂದೋಲನಕ್ಕೆ ಹಾಜರಾಗಲು ನಿಮ್ಮನ್ನು ಶಿಫಾರಸು ಮಾಡಿದ ವ್ಯಕ್ತಿ ಅಥವಾ ನಾಯಕನನ್ನು ಹೆಸರಿಸಿ.",
            audio: `${base_path}/audio/ylc/kn/q5v1_kn.b64`,
          },
        },
      },
    ],
  },
  6: {
    question_id: "q6",
    sequence: 6,
    service: TextConversionType.TRANSLITERATE,
    questions: [
      {
        variant_id: "q6v1",
        title: {
          en: {
            text: "Mention the name of your college or the Community Youth Club you are representing.",
            audio: `${base_path}/audio/ylc/en/q6v1_en.b64`,
          },
          kn: {
            text: "ನಿಮ್ಮ ಕಾಲೇಜು ಅಥವಾ ನೀವು ಪ್ರತಿನಿಧಿಸುತ್ತಿರುವ ಸಮುದಾಯ ಯುವ ಸಂಘದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
            audio: `${base_path}/audio/ylc/kn/q6v1_kn.b64`,
          },
        },
      },
    ],
  },
  7: {
    question_id: "q7",
    sequence: 7,
    service: TextConversionType.TRANSLITERATE,
    questions: [
      {
        variant_id: "q7v1",
        title: {
          en: {
            text: "Mention the name of the district where you carried out the activity.",
            audio: `${base_path}/audio/ylc/en/q7v1_en.b64`,
          },
          kn: {
            text: "ನೀವು ಚಟುವಟಿಕೆ ನಡೆಸಿದ ಜಿಲ್ಲೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
            audio: `${base_path}/audio/ylc/kn/q7v1_kn.b64`,
          },
        },
      },
    ],
  },
  8: {
    question_id: "q8",
    sequence: 8,
    service: TextConversionType.TRANSLITERATE,
    questions: [
      {
        variant_id: "q8v1",
        title: {
          en: {
            text: "Mention the name of the panchayat or ward where you carried out the activity.",
            audio: `${base_path}/audio/ylc/en/q8v1_en.b64`,
          },
          kn: {
            text: "ನೀವು ಚಟುವಟಿಕೆ ನಡೆಸಿದ ಪಂಚಾಯತ್ ಅಥವಾ ವಾರ್ಡ್‌ನ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
            audio: `${base_path}/audio/ylc/kn/q8v1_kn.b64`,
          },
        },
      },
    ],
  },
  9: {
    question_id: "q9",
    sequence: 9,
    service: TextConversionType.TRANSLITERATE,
    questions: [
      {
        variant_id: "q9v1",
        title: {
          en: {
            text: "Mention the name of the village or area where you carried out the activity.",
            audio: `${base_path}/audio/ylc/en/q9v1_en.b64`,
          },
          kn: {
            text: "ನೀವು ಚಟುವಟಿಕೆ ನಡೆಸಿದ ಗ್ರಾಮ ಅಥವಾ ಪ್ರದೇಶದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
            audio: `${base_path}/audio/ylc/kn/q9v1_kn.b64`,
          },
        },
      },
    ],
  },
  10: {
    question_id: "q10",
    sequence: 10,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q10v1",
        title: {
          en: {
            text: "How many youth members were actively involved with you while solving the challenge or problem?",
            audio: `${base_path}/audio/ylc/en/q10v1_en.b64`,
          },
          kn: {
            text: "ಸವಾಲು ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಹರಿಸುವಾಗ ಎಷ್ಟು ಯುವ ಸದಸ್ಯರು ನಿಮ್ಮೊಂದಿಗೆ ಸಕ್ರಿಯವಾಗಿ ತೊಡಗಿಸಿಕೊಂಡರು?",
            audio: `${base_path}/audio/ylc/kn/q10v1_kn.b64`,
          },
        },
      },
    ],
  },
  11: {
    question_id: "q11",
    sequence: 11,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q11v1",
        title: {
          en: {
            text: "What is the name of the activity you conducted?",
            audio: `${base_path}/audio/ylc/en/q11v1_en.b64`,
          },
          kn: {
            text: "ನೀವು ನಡೆಸಿದ ಚಟುವಟಿಕೆಯ ಹೆಸರೇನು?",
            audio: `${base_path}/audio/ylc/kn/q11v1_kn.b64`,
          },
        },
      },
    ],
  },
  12: {
    question_id: "q12",
    sequence: 12,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q12v1",
        title: {
          en: {
            text: "What challenge or problem did you identify?",
            audio: `${base_path}/audio/ylc/en/q12v1_en.b64`,
          },
          kn: {
            text: "ನೀವು ಯಾವ ಸವಾಲು ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ಗುರುತಿಸಿದ್ದೀರಿ?",
            audio: `${base_path}/audio/ylc/kn/q12v1_kn.b64`,
          },
        },
      },
    ],
  },
  13: {
    question_id: "q13",
    sequence: 13,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q13v1",
        title: {
          en: {
            text: "How did you solve this challenge or problem? Explain it step by step what you did, where you did it, and how you did it.",
            audio: `${base_path}/audio/ylc/en/q13v1_en.b64`,
          },
          kn: {
            text: "ಈ ಸವಾಲು ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ನೀವು ಹೇಗೆ ಪರಿಹರಿಸಿದ್ದೀರಿ? ನೀವು ಏನು ಮಾಡಿದ್ದೀರಿ, ಎಲ್ಲಿ ಮಾಡಿದ್ದೀರಿ ಮತ್ತು ಹೇಗೆ ಮಾಡಿದ್ದೀರಿ ಎಂಬುದನ್ನು ಹಂತ ಹಂತವಾಗಿ ವಿವರಿಸಿ.",
            audio: `${base_path}/audio/ylc/kn/q13v1_kn.b64`,
          },
        },
      },
    ],
  },
  14: {
    question_id: "q14",
    sequence: 14,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q14v1",
        title: {
          en: {
            text: "What are the changes observed after solving the challenge or problem?",
            audio: `${base_path}/audio/ylc/en/q14v1_en.b64`,
          },
          kn: {
            text: "ಸವಾಲು ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಹರಿಸಿದ ನಂತರ ಗಮನಿಸಿದ ಬದಲಾವಣೆಗಳು ಯಾವುವು?",
            audio: `${base_path}/audio/ylc/kn/q14v1_kn.b64`,
          },
        },
      },
    ],
  },
  15: {
    question_id: "q15",
    sequence: 15,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q15v1",
        title: {
          en: {
            text: "How many schools were impacted by this solution?",
            audio: `${base_path}/audio/ylc/en/q15v1_en.b64`,
          },
          kn: {
            text: "ಈ ಪರಿಹಾರದಿಂದ ಎಷ್ಟು ಶಾಲೆಗಳು ಪ್ರಭಾವಿತವಾಗಿವೆ?",
            audio: `${base_path}/audio/ylc/kn/q15v1_kn.b64`,
          },
        },
      },
    ],
  },
  16: {
    question_id: "q16",
    sequence: 16,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q16v1",
        title: {
          en: {
            text: "Did you solve this problem in the school or community?",
            audio: `${base_path}/audio/ylc/en/q16v1_en.b64`,
          },
          kn: {
            text: "ನೀವು ಶಾಲೆಯಲ್ಲಿ ಅಥವಾ ಸಮುದಾಯದಲ್ಲಿ ಈ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಹರಿಸಿದ್ದೀರಾ?",
            audio: `${base_path}/audio/ylc/kn/q16v1_kn.b64`,
          },
        },
      },
    ],
  },
  17: {
    question_id: "q17",
    sequence: 17,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q17v1",
        title: {
          en: {
            text: "How many students were impacted by this solution?",
            audio: `${base_path}/audio/ylc/en/q17v1_en.b64`,
          },
          kn: {
            text: "ಈ ಪರಿಹಾರದಿಂದ ಎಷ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು ಪ್ರಭಾವಿತರಾಗಿದ್ದಾರೆ?",
            audio: `${base_path}/audio/ylc/kn/q17v1_kn.b64`,
          },
        },
      },
    ],
  },
  18: {
    question_id: "q18",
    sequence: 18,
    service: TextConversionType.TRANSLATE,
    questions: [
      {
        variant_id: "q18v1",
        title: {
          en: {
            text: "What is your next plan to solve this challenge or problem?",
            audio: `${base_path}/audio/ylc/en/q18v1_en.b64`,
          },
          kn: {
            text: "ಈ ಸವಾಲು ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಹರಿಸಲು ನಿಮ್ಮ ಮುಂದಿನ ಯೋಜನೆ ಏನು?",
            audio: `${base_path}/audio/ylc/kn/q18v1_kn.b64`,
          },
        },
      },
    ],
  },
  19: {
    question_id: "q19",
    sequence: 19,
    service: TextConversionType.TRANSLITERATE,
    questions: [
      {
        variant_id: "q19v1",
        title: {
          en: {
            text: "Kindly add your social media links: LinkedIn, Instagram, ....",
            audio: `${base_path}/audio/ylc/en/q19v1_en.b64`,
          },
          kn: {
            text: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ಲಿಂಕ್‌ಗಳನ್ನು ಸೇರಿಸಿ: LinkedIn, Instagram, ....",
            audio: `${base_path}/audio/ylc/kn/q19v1_kn.b64`,
          },
        },
      },
    ],
  },
}

export default questions

export const ylcStoryTextAudio = {
  en: {
    uploadPhotoAudio: `${base_path}/audio/ylc/en/q20v1_en.b64`,
    storyReportAudio: `${base_path}/audio/ylc/en/q21v1_en.b64`,
  },
  kn: {
    uploadPhotoAudio: `${base_path}/audio/ylc/kn/q20v1_kn.b64`,
    storyReportAudio: `${base_path}/audio/ylc/kn/q21v1_kn.b64`,
  },
}
