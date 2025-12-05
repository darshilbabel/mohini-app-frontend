import React from "react";
import UserImage from "./UserImage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const UserMessage = ({
  isShowImages = false,
  userDetail = {},
  message,
  chatId,
}) => {
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
