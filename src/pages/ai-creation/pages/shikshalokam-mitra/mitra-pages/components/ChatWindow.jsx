import { useMemo, useEffect, useRef } from "react";
import ChatMessage from "./chat-message/ChatMessage";
import LoadingChat from "./LoadingChat";
import { useAICreationSessionStore } from "../../../../../../store";
import Source from "./Source";
import { handleDownloadFile } from "../../../../utils/file";

function ChatWindow({
  isTalking,
  handleOnSpeaking,
  handleOnStopSpeaking,
  isStreamingComplete,
  setNotMute,
  userDetail,
  chatHistory,
  hasStartedListening = false,
  hasOverRideId,
  isDefineChallengeSection,
  scrollRef,
  page,
  isParaphraseLoading = false,
}) {


  const objectiveList = useAICreationSessionStore.getState().getObjective();
  const allObjectiveChatHistory = useAICreationSessionStore.getState().getObjectiveChatHistory();
  const allActionListChatHistory = useAICreationSessionStore.getState().getActionListChatHistory();
  const selectedObjective = useAICreationSessionStore(state => state.selectedObjective);
  const selectedAction = useAICreationSessionStore(state => state.selectedAction);
  const selectedWeek = useAICreationSessionStore.getState().getSelectedWeek();
  const selectedFlowType = useAICreationSessionStore.getState().getSelectedFlowType();
  const errorText = useAICreationSessionStore.getState().getErrorText();

  function formatSources(sources = []) {

    let return_obj = {}

    for (const source of sources) {
      const organization = source?.organization?.name;
      if (!organization) {
        continue;
      }
      if (!return_obj[organization]) {
        return_obj[organization] = [{
          currentSource: {...source}
        }];
      }
      else {
        return_obj[organization].push({
          currentSource: {...source}
        });
      }
    }

    return return_obj;
  }


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
          ? "[&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-transparent md:[&::-webkit-scrollbar-thumb]:rounded-full md:hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
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
      <div className="div34">
        {chatsToShow?.map((chat, i) => {
          const fileName = chat?.file_url?.split("/").pop()?.split(".")[0];
          return (
            <div
              key={i}
              className={`div35 ${chat?.source === "user" ? "label1" : "label1"}`}
            >
              <div className={`div36 ${chat?.source === "user" ? "": "flex-column !items-start"} ${i === chatsToShow.length - 1 ? "pb-0" : ""}`}>
                <ChatMessage
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
                {
                  chat?.sources && Array.isArray(chat?.sources) && chat?.sources.length && (
                    <div className="mb-4 w-full">
                      <Source source={formatSources(chat?.sources)} />
                    </div>
                  )
                }
                {chat?.file_url && (
                  <div className="mb-4 w-full">
                    <button className="h-[35px] flex items-center justify-center gap-[8px] rounded-md border border-[#572E91] px-3 bg-[#572E91] font-medium text-sm leading-none text-white w-full md:w-[200px]" onClick={() => handleDownloadFile(chat?.file_url, fileName, chat?.file_url?.split(".").pop())}>Download</button>
                  </div>
                )}
              </div>
              {getShowLoadingChat(i) && <LoadingChat />}
            </div>
        )
})}
        {/* Show paraphrase loader once at the end of the chat list */}
        {isParaphraseLoading && (
          <div className="div35 label1">
            <LoadingChat />
          </div>
        )}
      </div>
      <div id="last-chat-boundary" />
    </div>
  );
}

export default ChatWindow;
