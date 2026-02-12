import React from "react";
import UserImage from "./UserImage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaUser } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const UserMessage = ({
  isShowImages = false,
  userDetail = {},
  message,
  chatId,
  showChatStyle = false,
}) => {
  const { t } = useTranslation("ai_creation_translation");
  
  if (showChatStyle) {
    return (
      <div className="flex flex-col items-end relative py-4 pr-1 w-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-[#101010]">{t("common.you")}</span>
          <div className="w-8 h-8 rounded-full bg-[#4A3B94] flex items-center justify-center">
            <FaUser className="text-white text-sm" />
          </div>
        </div>
        
        <div 
          className="bg-[#4A3B94] rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] mr-10" 
          id={chatId}
        >
          {isShowImages && <UserImage userDetail={userDetail} />}
          <ReactMarkdown
            children={message}
            remarkPlugins={[remarkGfm]}
            className="text-white font-medium text-base leading-6 tracking-normal align-middle"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end relative py-7 pr-1 w-full">
      {isShowImages && <UserImage userDetail={userDetail} />}
      <div className="div52 div73" id={chatId}>
        <ReactMarkdown
          children={message}
          remarkPlugins={[remarkGfm]}
          className="text-black font-medium text-base leading-6 tracking-normal align-middle"
        />
      </div>
    </div>
  );
};

export default UserMessage;
