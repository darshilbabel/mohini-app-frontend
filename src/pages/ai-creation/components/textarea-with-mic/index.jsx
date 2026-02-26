import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaRegStopCircle, FaCircle } from "react-icons/fa";
import { IoMicOutline } from "react-icons/io5";
import { handleS3Upload } from "../../../../services/storage_service";
import { ai4BharatASRApi } from "../../../../api/endpoints/ai";
import { showNotification } from "../../../../components/ToastMessage/TotastMessage";
import { useAICreationSessionStore } from "../../../../store";
import { useSiteDataSessionStore } from "../../../../store";
import { useTranslation } from "react-i18next";

/* ---------- helpers (copied AS-IS) ---------- */

const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const rawData = audioBuffer.getChannelData(0)

    const rms = Math.sqrt(rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length)

    return rms < silenceThreshold
  } finally {
    await audioContext.close()
  }
}

/* ---------- component ---------- */

function TextareaWithVoice({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  autoFocus = false,
  className = "",
  textareaId = "textarea-with-voice",
  setIsRecording
}) {
  const { t } = useTranslation("ai_creation_translation");
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null); 

  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const sessionRoute = "/guided_guest";
  const languageToUse = useSiteDataSessionStore().getChatLanguage() || "en";

  /* ---------- timer ---------- */

  useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
      intervalRef.current = id;
    } else {
      clearInterval(intervalId);
      setSeconds(0);
    }

    return () => clearInterval(intervalId);
  }, [hasStartedRecording]);

  /* ---------- cleanup ---------- */

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /* ---------- recording handlers ---------- */

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setHasStartedRecording(false);
      setIsRecording?.(false);
    }
  };

  const startRecording = () => {

    setIsRecording?.(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      showNotification({
        message: t?.("common.browserNotSupported") || "Browser not supported",
        type: "error",
      });
      return;
    }

    onChange("", true); // clear text before recording

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
          audioBitsPerSecond: 16000,
        });

        setMediaRecorder(recorder);
        mediaRecorderRef.current = recorder;
        const chunks = [];

        recorder.start();
        setHasStartedRecording(true);

        recorder.ondataavailable = (e) => chunks.push(e.data);

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());

          if (!chunks.length) return;

          const audioBlob = new Blob(chunks, {
            type: "audio/webm;codecs=opus",
          });

          const isSilent = await isSilentAudio(audioBlob, 0.02);
          if (isSilent) {
            showNotification({
              message: t?.("common.failedToCaptureSpeech"),
              type: "error",
            });
            return;
          }

          setIsFetchingData(true);
          try {
            const sessionId =
              useAICreationSessionStore.getState().getSession();

            const s3Url = await handleS3Upload(
              audioBlob,
              `${Date.now()}`,
              `chatbot/companychat/${sessionId}/`,
              null
            );

            const transcript = await ai4BharatASRApi(
              s3Url,
              languageToUse,
              sessionRoute
            );

            if (transcript) onChange(transcript, false);
            else
              showNotification({
                message: t?.("common.failedToCaptureSpeech"),
                type: "error",
              });
          } catch (err) {
            console.error(err);
            showNotification({
              message: t?.("common.failedToCaptureSpeech"),
              type: "error",
            });
          } finally {
            setIsFetchingData(false);
          }
        };
      })
      .catch(() => {
        showNotification({
          message: t?.("common.microphoneAccessDenied"),
          type: "error",
        });
      });
  };

  /* ---------- auto-grow ---------- */

  const handleInput = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    onChange(el.value);
  };

  /* ---------- placeholder ---------- */

  const computedPlaceholder = useMemo(() => {
    if (isFetchingData) return t?.("defineChallenge.placeholderProcessing");
    if (hasStartedRecording) return t?.("defineChallenge.placeholderListening");
    return placeholder;
  }, [isFetchingData, hasStartedRecording, placeholder]);

  const disableVoice = isFetchingData || disabled;



  return (
    <div className="flex items-center gap-3 w-full">
      <textarea
        ref={textareaRef}
        id={textareaId}
        value={value}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={computedPlaceholder}
        className={className}
        onInput={handleInput}
      />

      {hasStartedRecording && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <FaCircle className="animate-pulse w-2 h-2" />
          {formatTime(seconds)}
        </div>
      )}

      <button
        type="button"
        disabled={disableVoice}
        onClick={() => {

            if(hasStartedRecording) {
                stopRecording();
            }
            else {
                startRecording();
            }
        }}
      >
        {hasStartedRecording ? (
          <FaRegStopCircle className="w-5 h-5 text-red-500" />
        ) : (
          <IoMicOutline className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

export default TextareaWithVoice;
