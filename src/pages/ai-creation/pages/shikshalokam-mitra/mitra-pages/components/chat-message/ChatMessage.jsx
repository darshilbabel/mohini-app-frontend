import React from "react";
import DOMPurify from "dompurify";
import { CONVERSATION_USER_TYPES } from "../../../../../constants/mitra.constants";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";

const { USER, BOT } = CONVERSATION_USER_TYPES;

function ChatMessage({
  userType,
  message,
  handleOnSpeaking,
  handleOnStopSpeaking,
  isPlaying,
  isStreamingComplete,
  chatId,
  userDetail,
  isShowImages = false,
  isShowBotSpeaker = false,
  showChatStyle = true,
}) {
  let sanitizedContent = DOMPurify.sanitize(message);

  const isBotConversation = userType && userType === BOT;
  const isUserConversation = userType && userType === USER;

  return (
    <div className="w-full">
      {isBotConversation && (
        <BotMessage
          isShowImages={isShowImages}
          isShowBotSpeaker={isShowBotSpeaker}
          isPlaying={isPlaying}
          handleOnSpeaking={handleOnSpeaking}
          handleOnStopSpeaking={handleOnStopSpeaking}
          disableStopButton={!isStreamingComplete}
          disableSpeakButton={!isStreamingComplete}
          primaryMessage={sanitizedContent}
          chatId={chatId}
          showChatStyle={showChatStyle}
        />
      )}
      {isUserConversation && (
        <UserMessage
          isShowImages={isShowImages}
          userDetail={userDetail}
          message={sanitizedContent}
          chatId={chatId}
          showChatStyle={showChatStyle}
        />
      )}
    </div>
  );
}

export default ChatMessage;