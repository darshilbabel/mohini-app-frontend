import React from "react";
import DOMPurify from "dompurify";
import { CONVERSATION_USER_TYPES } from "../../../../../constants/mitra.constants";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";

const { USER, BOT } = CONVERSATION_USER_TYPES;

function ChatMessage({
  userType,
  message,
  recording,
  appendixURL,
  isTalking,
  handleOnSpeaking,
  handleOnStopSpeaking,
  isPlaying,
  isStreamingComplete,
  chatId,
  userDetail,
  validation,
  isShowImages = false,
  isShowBotSpeaker = false,
}) {
  let sanitizedContent = DOMPurify.sanitize(message);

  const isBotConversation = userType && userType === BOT;
  const isUserConversation = userType && userType === USER;

  return (
    <div>
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
        />
      )}
      {isUserConversation && (
        <UserMessage
          isShowImages={isShowImages}
          userDetail={userDetail}
          message={sanitizedContent}
          chatId={chatId}
        />
      )}
    </div>
  );
}

export default ChatMessage;

{
  /* {isTalking && <div className="div55">(Typing...)</div>}
            {!!appendixURL?.length && (
              <div>
                <h6 className="h6-1">Resource:</h6>
                {appendixURL?.map((url, index) => (
                  <div key={index} className="div56">
                    {url === "nan" ? (
                      "Not available"
                    ) : (
                      <a
                        key={index}
                        href={url}
                        rel="noreferrer"
                        target="_blank"
                        className="a-1"
                      >
                        {url}
                      </a>
                    )}
                    <br />
                  </div>
                ))}
              </div>
            )}
            {validation === "NO_PROBLEM_STATEMENT" && isBotConversation && (
              <>
                <div className="firstpage-third-div">
                  <button
                    className="firstpage-confirm-button"
                    onClick={() => {
                      clearMitraSessionStorage();
                      window.location.href =
                        process.env.REACT_APP_ROUTE_EXPLORE;
                    }}
                  >
                    {languageToUse && getExploreTranslation(languageToUse)}
                  </button>
                </div>
              </>
            )} */
}
