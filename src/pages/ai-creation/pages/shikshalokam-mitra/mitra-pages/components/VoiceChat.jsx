import React, { useState } from "react";
import Notification, {
  showNotification,
} from "../../../../../../components/ToastMessage/TotastMessage";
import { handleS3Upload } from "../../../../../../services/storage_service";
import { useAudio } from "../../../../../../hooks/useAudio";
import { ai4BharatASRApi } from "api/endpoints/ai"
import { useAICreationSessionStore } from "store";

// const sessionFlowName = {
//   GuestDiscussion: "guest-discussion",
//   LoginDiscussion: "login-discussion",
//   GuestMiStory: "guest-mi-story",
//   LoginMiStory: "login",
//   SsoFlow: "guest-mi-story",
//   Reflection: "reflection",
//   megaPTM: "megaPTM",
//   YLC: "YLC",
//   ListeningActivity: "listening-activity",
// };

// const storageFlow = "guest-discussion";

const sessionRoute = "/guided_guest";

const languageToUse = "en";

const VoiceChat = () => {
  const [textMessage, setTextMessage] = useState("");
  const [hasOverRideId, setHasOverRideId] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [isNextAllowed, setIsNextAllowed] = useState(true);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [storyData, setStoryData] = useState(null);
  const [asrAudio, setAsrAudio] = useState(null);

  const { stopAllAudio, audioRef } = useAudio();

  const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0);

    const rms = Math.sqrt(
      rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length
    );
    console.log("RMS (volume):", rms);

    return rms < silenceThreshold;
  };

  const handleOnStopSpeaking = async () => {
    try {
      try {
        if (audioRef.current) await audioRef.current.pause();
      } catch (error) {
        console.error({ error });
      }
      setHasOverRideId(null);
      setSentences([]);
      setIsNextAllowed(true);
    } catch (error) {
      console.error({ error });
    }
  };
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setHasStartedRecording(false);
    }
  };
  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      handleOnStopSpeaking();
      setTextMessage("");
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const options = {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 16000,
          };
          const recorder = new MediaRecorder(stream, options);
          setMediaRecorder(recorder);

          const localAudioChunks = [];

          recorder.start();
          setHasStartedRecording(true);

          recorder.ondataavailable = (event) => {
            localAudioChunks.push(event.data);
          };

          recorder.onstop = async () => {
            if (localAudioChunks.length > 0) {
              const audioBlob = new Blob(localAudioChunks, {
                type: "audio/webm;codecs=opus",
              });
              const isSilent = await isSilentAudio(audioBlob, 0.02);

              if (!audioBlob || isSilent) {
                showNotification({
                  message: "Oops! We couldn't capture your speech. Try again.",
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                });
                return;
              }

              setIsFetchingData(true);
              let transcriptResult = "";
              const sessionId = useAICreationSessionStore.getState().getSession();
              
              let s3Url = await handleS3Upload(
                audioBlob,
                `${Date.now()}`,
                `chatbot/companychat/${sessionId}/`,
                storyData
              );
              if (!s3Url || s3Url === "") {
                transcriptResult =
                  "Oops! We couldn't capture your speech. Try again.";
              }
              setAsrAudio(s3Url);
              let storedRoute = sessionRoute;
              transcriptResult = await ai4BharatASRApi(
                s3Url,
                languageToUse,
                storedRoute
              );
              if (!transcriptResult || transcriptResult === "") {
                showNotification({
                  message: "Oops! We couldn't capture your speech. Try again.",
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                });
              } else {
                setTextMessage(transcriptResult);
              }
              setIsFetchingData(false);
            } else {
              console.warn("No audio chunks were recorded.");
              setIsFetchingData(false);
            }
          };
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err);
          setIsFetchingData(false);
        });
    } else {
      console.warn("getUserMedia not supported on your browser!");
    }
  };

  return (
    <div>
      <Notification />
      <button
        onClick={() => {
          hasStartedRecording ? stopRecording() : startRecording();
        }}
      >
        {hasStartedRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default VoiceChat;
