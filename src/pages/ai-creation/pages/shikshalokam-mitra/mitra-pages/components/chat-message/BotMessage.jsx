import React from "react";
import BotImage from "./BotImage";
import Speaker from "./Speaker";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BotMessage = ({
  isShowImages = false,
  isShowBotSpeaker = false,
  isPlaying = false,
  handleOnSpeaking,
  handleOnStopSpeaking,
  disableStopButton = false,
  disableSpeakButton = false,
  primaryMessage = "",
  secondaryMessage = "",
  chatId,
  customClassNames = {},
}) => {
  const { wrapperStyles = "" } = customClassNames;
  return (
    <div className={`flex items-start relative py-7 ${wrapperStyles}`}>
      {!!(isShowImages || isShowBotSpeaker) && (
        <>
          <div className="div42">
            {isShowImages && <BotImage />}
            {isShowBotSpeaker && (
              <Speaker
                isPlaying={isPlaying}
                handleOnStopSpeaking={handleOnStopSpeaking}
                handleOnSpeaking={handleOnSpeaking}
                disableStopButton={disableStopButton}
                disableSpeakButton={disableSpeakButton}
              />
            )}
          </div>
        </>
      )}
      <div id={chatId}>
        {!!primaryMessage?.length && (
          <ReactMarkdown
            children={primaryMessage}
            remarkPlugins={[remarkGfm]}
            className="text-black font-medium text-base leading-6 tracking-normal align-middle"
          />
        )}
        {!!secondaryMessage?.length && (
          <ReactMarkdown
            children={secondaryMessage}
            remarkPlugins={[remarkGfm]}
            className="text-black font-normal text-sm leading-6 tracking-normal align-middle"
          />
        )}
      </div>
    </div>
  );
};

export default BotMessage;
