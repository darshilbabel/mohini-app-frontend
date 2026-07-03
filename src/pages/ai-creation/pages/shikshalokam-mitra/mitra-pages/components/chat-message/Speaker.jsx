import React from "react";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { RxSpeakerOff } from "react-icons/rx";

const Speaker = ({
  isPlaying = false,
  handleOnStopSpeaking,
  handleOnSpeaking,
  disableSpeakButton = false,
  disableStopButton = false,
  customClasses = {},
}) => {
  const {
    wrapperStyles = "",
    playButtonStyles = "",
    stopButtonStyles = "",
    playButtonIconStyles = "",
    stopButtonIconStyles = "",
  } = customClasses;

  return (
    <div className={`mt-1 mb-3 ${wrapperStyles}`}>
      {isPlaying ? (
        <button
          className={`button-10 button-3 ${playButtonStyles}`}
          onClick={handleOnStopSpeaking}
          disabled={disableSpeakButton}
        >
          <HiOutlineSpeakerWave className={`${playButtonIconStyles}`} />
        </button>
      ) : (
        <button
          className={`button-11 button-3 ${stopButtonStyles}`}
          onClick={handleOnSpeaking}
          disabled={disableStopButton}
        >
          <RxSpeakerOff className={`${stopButtonIconStyles}`} />
        </button>
      )}
    </div>
  );
};

export default Speaker;
