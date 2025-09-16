// hooks/useAudio.js
import { useRef, useState } from "react";

export const useAudio = () => {
  const [stopAudioTriggered, setStopAudioTriggered] = useState(false);
  const audioRef = useRef();
  const controllerRef = useRef(null);

  const stopAllAudio = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (controllerRef.current) {
      controllerRef.current.abort(); // cancel ongoing API
    }
    controllerRef.current = new AbortController();
  };

  return {
    audioRef,
    controllerRef,
    stopAudioTriggered,
    setStopAudioTriggered,
    stopAllAudio,
  };
};