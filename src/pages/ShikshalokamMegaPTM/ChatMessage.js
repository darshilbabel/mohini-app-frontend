
import DOMPurify from "dompurify";
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2";
import { MdAccountCircle } from "react-icons/md";
import WaveSurferPlayer from "../interview-text-voice/voice-player";
import { default_wave_surfer_config } from "../interview-text-voice/useVoiceRecord";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from "rehype-raw";

function ChatMessage({
  userType,
  message,
  name,
  recording,
  handleOnSpeaking,
  handleOnStopSpeaking,
  isPlaying,
  botNameToDisplay,
  isStreamingComplete,
  setNotMute,
  chat,
  staticMessage,
  chatId,
}) {

  let sanitizedContent = DOMPurify.sanitize(message);
  return (
    <div className="div41">
      {(userType === "bot")&& <div className="div42">
        <div
          className={`${
            userType === "bot" ? "div43" : "div44"
          } div45`}
        >
          <MdAccountCircle />
        </div>
        <div className="div46">
          {userType === "bot" ? (
            (isPlaying) ? (
              <button
                className={`button-10 button-3`}
                onClick={handleOnStopSpeaking}
                disabled={!isStreamingComplete}
              >
                <HiMiniSpeakerWave />
              </button>
            ) : (
              <button
                className={`button-11 button-3`}
                onClick={() => {
                  setNotMute(false);
                  handleOnSpeaking(message, chat?.updated_at, staticMessage, true);
                }}
                disabled={!isStreamingComplete}
              >
                <HiMiniSpeakerXMark />
              </button>
            )
          ) : null}
        </div>
      </div>}
      <div className={`${userType==='user'? 'div47': 'div48'}`}>
        <div
          className={`div36 ${(userType==='user')&& 'div37'}`}
        >
          {(userType === "user")&& <div
          className={`div49`}
        >
          <MdAccountCircle />
        </div>}
          {userType === "bot" ? botNameToDisplay : name}
        </div>
        {!!message && !!recording && (
          <div
            className={` ${
              userType === "bot" ? "div53" : "div54"
            } div50`}
          >
            <WaveSurferPlayer
              url={recording?.result}
              {...default_wave_surfer_config}
            />
          </div>
        )}
        <div
          className={` ${
            userType === "bot" ? "div53" : "div54"
          } div52 custom-voice-chat-chats`}
          id={chatId}
        >
            <ReactMarkdown  children={sanitizedContent} remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} className="prose max-w-none"
            />
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;