import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaRegStopCircle } from "react-icons/fa";
import { TbSend2 } from "react-icons/tb";
import { FaCircle } from "react-icons/fa6";
import { IoMicOutline } from "react-icons/io5";


const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

function ChatBox({
  textInputRef,
  textMessage,
  handleOnInputText,
  setUseTextbox,
  placeholder,
  autoFocus = false,
  handleSendMessage,
  styles = {},
  disabled = false,
  hasStartedRecording = false,
  startRecording,
  stopRecording,
  isFetchingData = false,
  seconds,
}) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  const {
    formStyles = "",
    inputStyles = "",
    voiceButtonStyles = "",
    sendButtonStyles = "",
  } = styles;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const disableVoiceButton =
    (textMessage && textMessage?.trim()?.length > 0) || isFetchingData;
  const disableSendButton =
    !textMessage || textMessage?.trim()?.length === 0 || disabled;

  const shouldShowWhiteBg =
    isFocused || (textMessage && textMessage.length > 0);

  const inputPlaceholderText = useMemo(() => {
    if (isFetchingData) return t("defineChallenge.placeholderProcessing");
    if (hasStartedRecording) return t("defineChallenge.placeholderListening");
    if (placeholder) return placeholder;
    return t("defineChallenge.placeholderDefine");
  }, [hasStartedRecording, isFetchingData, placeholder, t]);

  function handleScrollToView() {
    // if (acceptedTnc === "ONGOING") return
    try {
      document?.querySelector("#last-chat-boundary")?.scrollIntoView({
        behavior: "smooth",
      })
    } catch (error) {
      console.error({ error })
    }
  }

  return (
    <>
      <style>{`
        #chat-box-textarea::-webkit-scrollbar {
          width: 4px;
        }
        #chat-box-textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        #chat-box-textarea::-webkit-scrollbar-thumb {
          background: #AAAAAA;
          border-radius: 2px;
        }
        #chat-box-textarea::-webkit-scrollbar-thumb:hover {
          background: #888888;
        }
        /* Firefox */
        #chat-box-textarea {
          scrollbar-width: thin;
          scrollbar-color: #AAAAAA transparent;
        }
      `}</style>
      <form
        onSubmit={handleSendMessage}
        autoComplete="off"
        className={`cursor-pointer flex items-center gap-[10px] h-full overflow-y-auto border border-[#DDDDDD] py-3 px-4 mx-auto w-full md:w-[80%] lg:w-[70%] ${
          shouldShowWhiteBg ? "bg-white" : "bg-[#F0F2F5]"
        } ${textMessage?.includes("\n") ? "rounded-3xl" : "rounded-[50px]"} ${formStyles}`}
      >
      <textarea
        ref={textInputRef}
        type="text"
        id="chat-box-textarea"
        className={`h-[24px] resize-none outline-none focus:outline-none border-0 bg-transparent placeholder:font-normal placeholder:text-base placeholder:text-[#AAAAAA] font-normal text-base leading-normal text-[#101010] w-[90%] max-h-24 py-0 px-0 ${inputStyles}`}
        placeholder={inputPlaceholderText}
        autoFocus={autoFocus}
        value={textMessage}
        onChange={handleOnInputText}
        disabled={disabled}
        onKeyDown={async e => {
          if (e.key === "Enter") {
            if (e.shiftKey) {
              try {
                e.preventDefault();
                e.target.form.requestSubmit();
                setTimeout(() => {
                  e.target.value = "";
                }, 0);
              } catch (error) {
                console.error("Error handling text:", error);
              } finally {
                setUseTextbox(false);
              }
            }
          }
        }}
        // onFocus={() => {
        //   setTimeout(() => {
        //     handleScrollToView()
        //     if (textInputRef.current) {
        //       textInputRef.current.scrollIntoView({
        //         behavior: "smooth",
        //         block: "center",
        //       })
        //     }
        //   }, 300)
        // }}
        onInput={e => {
          e.target.style.height = "auto"
          const maxHeight = 96
          const scrollHeight = e.target.scrollHeight
          // For single-line content (no newlines), maintain 24px height
          // Only grow when there are actual line breaks
          const hasLineBreaks = e.target.value.includes('\n')
          const newHeight = hasLineBreaks 
            ? Math.max(24, scrollHeight) 
            : 24
          if (newHeight > maxHeight) {
            e.target.style.height = `${maxHeight}px`
            e.target.style.overflowY = "scroll"
          } else {
            e.target.style.height = `${newHeight}px`
            e.target.style.overflowY = "hidden"
          }
        }}
      />
      {hasStartedRecording && (
        <div className="flex items-center space-x-1 text-red-600 text-sm font-medium pointer-events-none">
          <FaCircle className="text-red-500 animate-pulse w-[10px] h-[10px] text-xs" />
          <span>{formatTime(seconds)}</span>
        </div>
      )}
      <button
        disabled={disableVoiceButton}
        className={`${
          hasStartedRecording ? "text-red-500" : "text-black"
        } disabled:text-[#64748b] disabled:cursor-not-allowed cursor-pointer ${voiceButtonStyles}`}
        onClick={hasStartedRecording ? stopRecording : startRecording}
      >
        {hasStartedRecording ? (
          <FaRegStopCircle className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]" />
        ) : (
          <IoMicOutline className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px]" />
        )}
      </button>
      <button
        disabled={disableSendButton}
        type="submit"
        className={`disabled:cursor-not-allowed disabled:text-[#64748b] cursor-pointer ${!disableSendButton ? "text-[#007BFF]" : ""} ${sendButtonStyles}`}
      >
        <TbSend2 className="w-[22px] h-[22px] lg:w-[26px] lg:h-[26px]" />
      </button>
    </form>
    </>
  );
}

export default ChatBox;
