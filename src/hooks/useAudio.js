// hooks/useAudio.js
import { useRef, useState } from "react";

export const useAudio = () => {
  const [stopAudioTriggered, setStopAudioTriggered] = useState(false);
  const audioRef = useRef();

  const stopAllAudio = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  return {
    audioRef,
    stopAudioTriggered,
    setStopAudioTriggered,
    stopAllAudio,
  };
};