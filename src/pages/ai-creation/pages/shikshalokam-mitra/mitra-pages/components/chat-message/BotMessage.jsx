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

  const markdownComponents = {
    ul: ({ children }) => (
      <ul className="list-disc pl-6 my-2 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 my-2 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-6">{children}</li>
    ),
  };

  return (
    <div className={`flex items-start relative py-7 ${wrapperStyles}`}>
      {!!(isShowImages || isShowBotSpeaker) && (
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
      )}

      <div id={chatId}>
        {!!primaryMessage?.length && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
            className="text-black font-medium text-base leading-6"
          >
            {primaryMessage}
          </ReactMarkdown>
        )}

        {!!secondaryMessage?.length && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
            className="text-black font-normal text-sm leading-6"
          >
            {secondaryMessage}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default BotMessage;
