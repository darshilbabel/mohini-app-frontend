import React from "react";
import { useTranslation } from "react-i18next";
import ChatBox from "./ChatBox";

export default function InitialConversationCard({
  textInputRef,
  textMessage,
  handleOnInputText,
  setUseTextbox,
  handleSendMessage,
}) {
  const { t } = useTranslation("ai_creation_translation");
  return (
    <div className="flex flex-col gap-[20px] rounded-[20px] p-[10px] md:p-[30px] bg-transparent shadow-[0px_2px_4px_0px_#0000000D]">
      <p className="font-medium text-base leading-[24px] text-center text-[#333333]">
        {t("defineChallenge.welcomeMessage")}
      </p>
      <ChatBox
        textInputRef={textInputRef}
        textMessage={textMessage}
        handleOnInputText={handleOnInputText}
        setUseTextbox={setUseTextbox}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}
