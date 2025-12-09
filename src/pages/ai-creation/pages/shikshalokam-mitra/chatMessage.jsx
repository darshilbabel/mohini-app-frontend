import React, { useRef, useState, useEffect } from "react";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { RiMic2Fill } from "react-icons/ri";
import { RxSpeakerOff } from "react-icons/rx";
import {
  getComfirmButtonTranslation,
  getDenyButtonTranslation,
  getExploreTranslation,
} from "./question script/firstpage_translation";
import { clearMitraSessionStorage } from "./MainPage";
import ROUTES from "../../../../url";
import { useAICreationSessionStore } from "store";

export function BotMessage({
  botMessage,
  botSecondMessage,
  firstparaClass,
  firstpageClass,
  secondParaClass,
  isUsingMicrophone,
  useTextbox,
  showFirst = false,
  showSecond = false,
  showThird = false,
  setIsUsingMicrophone,
  setUseTextbox,
  setUserInput,
  secondMessageClass,
  handleSpeakerOn,
  isBotTalking,
  audioId,
  handleSpeakerOff,
  showExplore = false,
}) {
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage()

  const language = preferredLanguage.value || "en";

  useEffect(() => {
    if (!isBotTalking) {
      setIsSpeakerOn(false);
    }
  }, [isBotTalking]);

  useEffect(() => {
    if (isSpeakerOn) {
      let messageToSend = "";
      if (botMessage) {
        messageToSend += botMessage += " ";
      }
      if (botSecondMessage) {
        messageToSend += botSecondMessage += " ";
      }
      handleSpeakerOn(messageToSend, audioId);
    }
  }, [isSpeakerOn]);

  return (
    <>
      <div className={firstparaClass}>
        <div className="icon-column">
          <img
            className="bot-image"
            src="https://static-media.gritworks.ai/fe-images/GIF/Shikshalokam/bot_profile_image.gif"
            alt="Bot Image"
          />
          <div className="boticon-button-div">
            {isSpeakerOn ? (
              <HiOutlineSpeakerWave
                className="speaker-icon"
                onClick={() => {
                  setIsSpeakerOn(false);
                  handleSpeakerOff(audioId);
                }}
              />
            ) : (
              <RxSpeakerOff
                className="speaker-icon"
                onClick={() => {
                  setIsSpeakerOn(true);
                }}
              />
            )}
          </div>
        </div>
        <div className="text-column">
          {showFirst && (
            <HtmlMessage content={botMessage} className={firstpageClass} />
          )}
          {showSecond && (
            <HtmlMessage
              content={botSecondMessage}
              className={secondMessageClass}
            />
          )}
          {showThird && (
            <div className="firstpage-third-div">
              <button
                className="firstpage-confirm-button"
                onClick={() => {
                  setUserInput((prevInput) => [
                    ...prevInput,
                    `${getComfirmButtonTranslation(language)}!`,
                  ]);
                }}
              >
                {language && getComfirmButtonTranslation(language)}
              </button>
              <button
                className="firstpage-deny-button"
                onClick={() => {
                  setIsUsingMicrophone(false);
                  setUseTextbox(false);
                  setUserInput((prevInput) => [
                    ...prevInput,
                    getDenyButtonTranslation(language),
                  ]);
                }}
              >
                {language && getDenyButtonTranslation(language)}
              </button>
            </div>
          )}
          {showExplore && (
            <div className="firstpage-third-div">
              <button
                className="firstpage-confirm-button"
                onClick={() => {
                  clearMitraSessionStorage();
                  window.location.href = ROUTES.EXPLORE;
                }}
              >
                {language && getExploreTranslation(language)}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function UserMessage({ userMessage, userDetail }) {
  return (
    <>
      <div className="firstuser-div">
        {userDetail?.image ? (
          <img src={userDetail?.image} className="user-image" />
        ) : (
          <div className="user-image"></div>
        )}
        <p className="firstuser-para1">{userMessage}</p>
      </div>
    </>
  );
}

export function HtmlMessage({ content, className }) {
  return (
    <p className={className} dangerouslySetInnerHTML={{ __html: content }}></p>
  );
}
