import { useMemo, useEffect, useRef } from "react";
import ChatMessage from "./chat-message/ChatMessage";
import LoadingChat from "./LoadingChat";
import { useAICreationSessionStore } from "../../../../../../store";

function ChatWindow({
  isTalking,
  handleOnSpeaking,
  handleOnStopSpeaking,
  botNameToDisplay,
  isStreamingComplete,
  setNotMute,
  userDetail,
  chatHistory,
  hasStartedListening = false,
  hasOverRideId,
  isDefineChallengeSection,
  scrollRef,
  page,
}) {


  const objectiveList = useAICreationSessionStore.getState().getObjective();
  const allObjectiveChatHistory = useAICreationSessionStore.getState().getObjectiveChatHistory();
  const allActionListChatHistory = useAICreationSessionStore.getState().getActionListChatHistory();
  const selectedObjective = useAICreationSessionStore(state => state.selectedObjective);
  const selectedAction = useAICreationSessionStore(state => state.selectedAction);
  const selectedWeek = useAICreationSessionStore.getState().getSelectedWeek();
  const selectedFlowType = useAICreationSessionStore.getState().getSelectedFlowType();
  const errorText = useAICreationSessionStore.getState().getErrorText();


  const getShowLoadingChat = (indexNumber) => {

    const isWeeksSelectionSection = page && page === 4;
    const isObjectiveSection = page && page === 2;
    const isActionListSection = page && page === 3;
    const isInitialSwitchSection = page === 0;


    let showLoader = true;

    if(isInitialSwitchSection) {

      showLoader = selectedFlowType ? false : true;
    }

    if(isDefineChallengeSection) {
      showLoader = objectiveList?.length > 0 ? false : true;

      if(errorText) {
        showLoader = false;
      }
    }
    else if(isWeeksSelectionSection) {
      showLoader = selectedWeek ? false : true
    }
    else if(isObjectiveSection) {

      const messageIndex = allObjectiveChatHistory?.findIndex(item => item?.updated_at === chatHistory[chatHistory?.length - 1]?.updated_at);

      showLoader = messageIndex !== allObjectiveChatHistory?.length - 1 ? false : selectedObjective ? false : true;

      if(errorText) {
        showLoader = false;
      }
    }
    else if(isActionListSection) {

      const messageIndex = allActionListChatHistory?.findIndex(item => item?.updated_at === chatHistory[chatHistory?.length - 1]?.updated_at);
      showLoader = messageIndex !== allActionListChatHistory?.length - 1 ? false : selectedAction ? false : true;

    }


    return (
      !hasStartedListening &&
      chatHistory[chatHistory?.length - 1].source === "user" &&
      indexNumber === chatHistory?.length - 1 && showLoader
    );
  };

  const chatsToShow = useMemo(() => {
    const data = [];
    let shouldPush = true;
    chatHistory?.forEach((chat) => {
      if (shouldPush) {
        data.push(chat);
        if (chat?.shouldMoveForward === "yes" && chat?.source === "user") {
          shouldPush = false;
        }
      }
    });
    return data;
  }, [chatHistory]);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!isDefineChallengeSection) return;

    const container = containerRef.current;
    if (!container) return;

    const updateScrollbarStyles = () => {
      if (window.innerWidth < 768) {
        // Mobile: hide scrollbar
        container.style.msOverflowStyle = "none";
        container.style.scrollbarWidth = "none";
      } else {
        // Desktop: show scrollbar
        container.style.msOverflowStyle = "auto";
        container.style.scrollbarWidth = "thin";
      }
    };

    updateScrollbarStyles();
    window.addEventListener("resize", updateScrollbarStyles);

    return () => {
      window.removeEventListener("resize", updateScrollbarStyles);
    };
  }, [isDefineChallengeSection]);

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (isDefineChallengeSection && scrollRef) {
          if (typeof scrollRef === "function") {
            scrollRef(node);
          } else if (scrollRef) {
            scrollRef.current = node;
          }
        }
      }}
      className={`${isDefineChallengeSection ? "h-full flex-1" : "h-full"} ${
        isDefineChallengeSection
          ? "overflow-y-auto [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-transparent md:[&::-webkit-scrollbar-thumb]:rounded-full md:hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
          : ""
      }`}
      style={
        isDefineChallengeSection
          ? {
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }
          : {}
      }
    >
      <ul className="div34">
        {chatsToShow?.map((chat, i) => (
          <li
            key={i}
            className={`div35 ${chat?.source === "user" ? "label1" : "label1"}`}
          >
            <div className={`div36 ${chat?.source === "user" && "div37"}`}>
              <ChatMessage
                botNameToDisplay={botNameToDisplay}
                userType={chat?.source}
                message={`${chat?.msg}`}
                name={"You"}
                recording={chat?.recording}
                hasAppendix={chat?.recording}
                appendixURL={chat?.appendixURL}
                isTalking={
                  chat.source === "bot" &&
                  !isStreamingComplete &&
                  i === chatHistory.length - 1
                }
                handleOnStopSpeaking={() => handleOnStopSpeaking()}
                handleOnSpeaking={() => {
                  setNotMute(false);
                  handleOnSpeaking(`${chat?.msg}`, chat?.updated_at);
                }}
                isAnyPlaying={!!hasOverRideId || isTalking}
                isPlaying={hasOverRideId === chat?.updated_at}
                isStreamingComplete={isStreamingComplete}
                setNotMute={setNotMute}
                chatId={chat?.updated_at}
                validation={chat?.validation}
                userDetail={userDetail}
              />
            </div>
            {getShowLoadingChat(i) && <><LoadingChat /></>}
          </li>
        ))}
      </ul>
      <div id="last-chat-boundary" className="div38" />
    </div>
  );
}

export default ChatWindow;
