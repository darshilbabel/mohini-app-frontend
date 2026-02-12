import React from "react";
import BotImage from "./BotImage";
import Speaker from "./Speaker";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaUser } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAICreationSessionStore } from "../../../../../../../store";
import rehypeRaw from "rehype-raw";

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
  showChatStyle = false,
}) => {
  const { t } = useTranslation("ai_creation_translation");
  const { wrapperStyles = "" } = customClassNames;

  const botMessageName = useAICreationSessionStore(state => state.botMessageName);

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

  if (showChatStyle) {
    return (
      <div className={`flex flex-col items-start relative py-4 ${wrapperStyles}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#4A3B94] flex items-center justify-center">
            <FaUser className="text-white text-lg" />
          </div>
          <span className="font-semibold text-sm text-[#101010]">{botMessageName ?? t("common.defaultBotName")}</span>
        </div>
        
        <div 
          id={chatId} 
          className="bg-[#F6F2FE] rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] ml-10"
        >
          {!!(isShowImages || isShowBotSpeaker) && (
            <div className="div42 mb-2">
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

          {!!primaryMessage?.length && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]} 
              components={markdownComponents}
              className="text-[#101010] font-medium text-base leading-6"
            >
              {primaryMessage}
            </ReactMarkdown>
          )}

          {!!secondaryMessage?.length && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]} 
              components={markdownComponents}
              className="text-[#101010] font-normal text-sm leading-6"
            >
              {secondaryMessage}
            </ReactMarkdown>
          )}
        </div>
      </div>
    );
  }

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
            rehypePlugins={[rehypeRaw]} 
            components={markdownComponents}
            className="text-black font-medium text-base leading-6"
          >
            {primaryMessage}
          </ReactMarkdown>
        )}

        {!!secondaryMessage?.length && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]} 
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
