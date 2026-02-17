import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

/* utils and api services */

import {
  getObjectiveList,
  saveUserChatsInDB,
} from "../../../../../api/endpoints/chat_flow";
import { transformSource } from "../../../utils/mitra-chat";
/* components */
import BotMessage from "./components/chat-message/BotMessage";
import ObjectivesCard from "./components/objectives/ObjectivesCard";
import SuggestOrAddCta from "./components/SuggestOrAddCta";
import ErrorText from "./components/ErrorText";
/* constants */
import { LOADER_KEYS } from "../../../constants/common";
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants";
/* styles */
import "../stylesheet/chatStyle.css";
import { useAICreationSessionStore } from "store";
import { sessionFlowName } from "../../../../../constants/session";
import { useSearchParams } from "react-router-dom";
import ChatWindow from "./components/ChatWindow";
import ChatMessage from "./components/chat-message/ChatMessage";
import LoadingChat from "./components/LoadingChat";
import { IoArrowForward } from "react-icons/io5";
/* icons for editable objectives */
import Disclaimer from "./components/Disclaimer";
import Guidelines from "./components/Guidelines";
import { FinalObjectiveSection } from "./components/objectives/FinalObjectiveSection";
import LoadingWithStatus from "./components/LoadingWithStatus";

const { BOT, USER } = CONVERSATION_USER_TYPES;

function SelectObjective({
  isSelectObjectiveSection,
  setCurrentPageValue,
  errorText,
  setErrorText,
  handleScrollIntoView,
  handleLoaderState,
  getLoaderState,
}) {
  const { t } = useTranslation("ai_creation_translation");
  const [objectiveList, setObjectiveList] = useState(() => {
    const storedObjective = useAICreationSessionStore.getState().getObjective();
    if (storedObjective?.length > 0) {
      return storedObjective
    }
    else return []
  });
  const [prevObjectiveList, setPrevObjectiveList] = useState(() => {
    const storedPrevObjective = useAICreationSessionStore.getState().getPrevObjective();
    if (storedPrevObjective?.length > 0) {
      return storedPrevObjective
    }
    else return []
  });
  const [hasClickedOnAddmore, setHasClickedOnAddmore] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const [isInReadOnlyMode, setIsInReadOnlyMode] = useState(() => {
    const storedObjective = useAICreationSessionStore.getState().getSelectedObjective();
    if (storedObjective) {
      return typeof storedObjective === "string" ? true : false;
    }
  });
  const [objectiveSource, setObjectiveSource] = useState([]);
  const [prevObjectiveSource, setPrevObjectiveSource] = useState([]);
  const [isNewlyGeneratedList, setIsNewlyGeneratedList] = useState(() => {
    const storedPrevObjective = useAICreationSessionStore.getState().getPrevObjective();
    if (storedPrevObjective?.length > 0) {
      return true
    }
    else return false
  })
  const [objectiveListLoading, setObjectiveListLoading] = useState(false)
  const [prevObjectiveShown, setPrevObjectiveShown] = useState(() => {
    const isPrevObjectiveShown = useAICreationSessionStore.getState().getIsPrevObjectiveShown();
    if (isPrevObjectiveShown) {
      return true
    }
    else return false;
  })

  const localChatHistory = useAICreationSessionStore.getState().getObjectiveChatHistory()
  const isOwnObjective = useAICreationSessionStore.getState().getIsOwnObjective();

  const [objectiveChatHistory, setObjectiveChatHistory] = useState(
    !!localChatHistory?.length ? localChatHistory : []
  );


  const [visibleCount, setVisibleCount] = useState(() => {
    const defaultValueToShow = 3;
    if (!isInReadOnlyMode) {
      return defaultValueToShow;
    } else {
      const objectiveList = useAICreationSessionStore.getState().getObjective() || [];
      const storedSelectedObjectives = useAICreationSessionStore.getState().getSelectedObjective();
      
      // Handle both single string (legacy) and array of strings
      const selectedObjectivesArray = Array.isArray(storedSelectedObjectives) 
        ? storedSelectedObjectives 
        : (storedSelectedObjectives ? [storedSelectedObjectives] : []);

      // Find indices of all selected objectives
      const indices = selectedObjectivesArray
        .map(obj => objectiveList.findIndex(o => o?.text === obj || o === obj))
        .filter(idx => idx !== -1);
      
      setSelectedIndices(indices);
      setSelectedObjectives(indices.map(idx => objectiveList[idx]));
      
      const maxSelectedIndex = Math.max(...indices, -1);
      return maxSelectedIndex !== -1 && maxSelectedIndex > defaultValueToShow - 1
        ? maxSelectedIndex + 1
        : defaultValueToShow;
    }
  });
  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || "en";
  const language = preferredLanguage.value || "en";
  const { setObjective: setObjectiveStore, setPrevObjective: setPrevObjectiveStore, setPrevObjectiveSource: setPrevObjectiveSourceStore, setObjectiveSource: setObjectiveSourceStore, setChunks: setChunksStore, setSelectedObjective: setSelectedObjectiveStore, setHasClickedObjAddMore, setIsOwnObjective, setObjectListRetries, setIsPrevObjectiveShown: setIsPrevObjectiveShownStore, setErrorText: setErrorTextStore } = useAICreationSessionStore.getState()

  const { profileId, setUserProblemStatement: setUserProblemStatementStore } = useAICreationSessionStore.getState();


  const [searchParams] = useSearchParams()
  const storageFlow = sessionFlowName.Creation;
  const selectedType = ""
  const sessionId = useAICreationSessionStore.getState().getSession();
  const chatLanguage = useAICreationSessionStore.getState().getPreferredLanguage();
  let accessToken = sessionStorage.getItem("accToken");


  async function fetchObjectiveList(createNew = false, newProblemStatement = '') {

    try {
      if (!objectiveList || objectiveList?.length === 0) {
        // setIsLoading(true);
        handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, true);
        const userProblemStatement = newProblemStatement || useAICreationSessionStore.getState().getUserProblemStatement() || null;
        const profile_id = useAICreationSessionStore.getState().getProfileId() || null;
        const fetched_objectiveList = await getObjectiveList(
          userProblemStatement,
          language,
          profile_id
        );
        const { message = "", objective_list = [] } = fetched_objectiveList || {};

        if (
          objective_list?.length > 0
        ) {


          setErrorTextStore("")


          if(createNew) {
            setIsNewlyGeneratedList(true)
          }


          setObjectiveList(objective_list);
          setObjectiveStore(objective_list)


          const transformedSource = transformSource(
            objective_list
          );



          setObjectiveSourceStore(transformedSource)
          setObjectiveSource(transformedSource);


          setChunksStore(objective_list?.chunks)
          // setIsLoading(false);
          if (isSelectObjectiveSection) handleScrollIntoView();
        } else {
          const errorMessage = message?.length > 0 ? message : (useAICreationSessionStore.getState().getSystemError() || t("common.pleaseTryAgainLater"));
          setFetchError(errorMessage);
          // window.location.reload();
        }
      }
    } catch (error) {

      setFetchError(
       error?.response?.data?.message || t("common.pleaseTryAgainLater")
      );

      setErrorTextStore(error?.response?.data?.message || t("common.pleaseTryAgainLater"))
      // setIsLoading(false);
      handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, false);
      console.error(error);
    } finally {
      handleLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST, false);
    }
  }

  useEffect(() => {
    const storedObjective = useAICreationSessionStore.getState().getObjective();

    if(!storedObjective)
      fetchObjectiveList();

    const storedObjectiveSource = useAICreationSessionStore.getState().getObjectiveSource();
    const storedPrevObjectiveSource = useAICreationSessionStore.getState().getPrevObjectiveSource();

    if (storedObjectiveSource) {
      setObjectiveSource(storedObjectiveSource);
    }
    if (storedPrevObjectiveSource) {
      setPrevObjectiveSource(storedPrevObjectiveSource);
    }
    if (isSelectObjectiveSection) handleScrollIntoView();
  }, []);


  const handleSuggestMore = () => {
    setVisibleCount((prevCount) => {
      const newCount = prevCount + 3;
      handleScrollIntoView();
      return newCount;
    });
  };

  useEffect(() => {
    if (isInReadOnlyMode) {
      // setIsLoading(true);
      localStorage.removeItem("actionList");
      localStorage.removeItem("selected_action");
      const storedSelected = useAICreationSessionStore.getState().getSelectedObjective();
      // Handle both legacy single string and new array format
      const selectedArray = Array.isArray(storedSelected) 
        ? storedSelected 
        : (storedSelected ? [storedSelected] : []);
      setSelectedObjectives(selectedArray.map(text => ({ text })));
      setHasClickedOnAddmore(useAICreationSessionStore.getState().getHasClickedObjAddMore());
      // setIsLoading(false);
    }
  }, [isInReadOnlyMode]);

  const handleObjectiveClick = (index) => {
    setSelectedIndices(prevIndices => {
      const isAlreadySelected = prevIndices.includes(index);
      if (isAlreadySelected) {
        // Remove from selection
        return prevIndices.filter(i => i !== index);
      } else {
        // Add to selection
        return [...prevIndices, index];
      }
    });

    setSelectedObjectives(prevObjectives => {
      const objective = objectiveList[index];
      const isAlreadySelected = prevObjectives.some(obj => obj?.text === objective?.text);
      if (isAlreadySelected) {
        // Remove from selection
        return prevObjectives.filter(obj => obj?.text !== objective?.text);
      } else {
        // Add to selection
        return [...prevObjectives, objective];
      }
    });
  };

  function updateSelectedObjectiveSources(selectedObjectiveTexts) {
    const store = useAICreationSessionStore.getState();
    const objectives = store.getObjective() || [];
    const setSelectedObjectiveSource = store.setSelectedObjectiveSource;

    // Handle both single string and array of strings for backwards compatibility
    const textsArray = Array.isArray(selectedObjectiveTexts) 
      ? selectedObjectiveTexts 
      : [selectedObjectiveTexts];

    const finalSources = [];
    const seen = new Set();

    textsArray.forEach(selectedText => {
      const matchedObjective = objectives.find(
        (o) => o.text === selectedText
      );

      (matchedObjective?.sources || []).forEach(src => {
        if (src?.url && !seen.has(src.url)) {
          seen.add(src.url);
          finalSources.push(src);
        }
      });
    });

    setSelectedObjectiveSource(finalSources);
    return finalSources;
  }

  const handleNextClick = (objectives = [], customObjective = false) => {
    // Handle both single objective (for backwards compatibility) and array of objectives
    const objectivesArray = (Array.isArray(objectives) && objectives.length > 0)
      ? objectives 
      : (objectives?.text ? [objectives] : selectedObjectives);

    // Extract text from each objective
    const userSelectedObjectives = objectivesArray
      .map(obj => obj?.text?.trim())
      .filter(text => text?.length > 0);

    if (userSelectedObjectives.length > 0) {
      setErrorText("");

      // setIsLoading(true);
      // setObjectiveList([userSelectedObjectives]);
      setSelectedObjectiveStore(userSelectedObjectives);
      updateSelectedObjectiveSources(userSelectedObjectives);
      const currentSession = useAICreationSessionStore.getState().getSession();
      const botMessage = hasClickedOnAddmore && !customObjective
        ? t("selectObjective.enterObjective")
        : {
            role: BOT,
            message:
              t("selectObjective.theseAreSomeObjectives") +
              " " +
              t("selectObjective.selectObjective") +
              " " +
              JSON.stringify(useAICreationSessionStore.getState().getObjective()),
            messageId: "4_0",
          };




      const chunks = JSON.parse(useAICreationSessionStore.getState().getChunks());

      // Join all selected objectives for saving to DB
      const objectivesText = userSelectedObjectives.join(", ");

      saveUserChatsInDB(
        objectivesText,
        currentSession,
        botMessage?.role,
        chunks
      )
        .then(() => {
          saveUserChatsInDB(objectivesText, currentSession, USER);
        })
        .then(() => {

          setCurrentPageValue(2);
        })
        .catch((error) => {
          console.error("Error saving chats:", error);
        });
    }
  };


  const selectedObjective = useAICreationSessionStore(
    state => state.selectedObjective
  ) || null;

  const objectiveLoadingStatusMessages = t("selectObjective.loadingStatusMessages", { returnObjects: true });
  
  if (getLoaderState(LOADER_KEYS.FETCH_OBJECTIVE_LIST)) {
    return <LoadingWithStatus statusMessages={objectiveLoadingStatusMessages} />
  }


  const handleAddOwnObjective = () => {
    setSelectedObjectives([])
    setSelectedIndices([])
    setHasClickedOnAddmore(true)
  }

  // Find all separator messages with their data
  const separators = [];
  objectiveChatHistory?.forEach((item, index) => {
    if (item?.source === "SEPARATOR") {
      separators.push({
        index,
        objectives: item?.objectiveListData?.objectives || prevObjectiveList,
        sources: item?.objectiveListData?.sources || useAICreationSessionStore.getState().getPrevObjectiveSource()
      });
    }
  });

  // Create sections: chat history between separators
  const chatSections = [];
  
  if (separators.length === 0) {
    // No separators, all chat history goes in one section
    chatSections.push({
      chatHistory: objectiveChatHistory,
      showObjectives: false,
      objectiveListData: null
    });
  } else {
    // Before first separator
    if (separators[0].index > 0) {
      chatSections.push({
        chatHistory: objectiveChatHistory.slice(0, separators[0].index),
        showObjectives: false,
        objectiveListData: null
      });
    }

    // Between separators and after last separator
    for (let i = 0; i < separators.length; i++) {
      const currentSeparator = separators[i];
      const nextSeparator = separators[i + 1];
      
      // Add objective list for this separator
      chatSections.push({
        chatHistory: [],
        showObjectives: true,
        objectiveListData: {
          isLatest: i === separators.length - 1,
          sectionIndex: i,
          objectives: currentSeparator.objectives,
          sources: currentSeparator.sources
        }
      });

      // Add chat history after this separator until next separator (or end)
      const endIndex = nextSeparator?.index || objectiveChatHistory.length;
      if (currentSeparator.index + 1 < endIndex) {
        chatSections.push({
          chatHistory: objectiveChatHistory.slice(currentSeparator.index + 1, endIndex),
          showObjectives: false,
          objectiveListData: null
        });
      }
    }
  }

  // Check if any objectives are selected (works with both local state and store)
  const hasSelectedObjectives = selectedIndices.length > 0 || 
    (Array.isArray(selectedObjective) ? selectedObjective.length > 0 : !!selectedObjective);
  const isNextDisabled = !hasSelectedObjectives;


  return (
    <>
      <div>
        <div className="secondpage-bot-div ">
          {hasClickedOnAddmore && chatSections.length === 1 && isSelectObjectiveSection ? (
            <FinalObjectiveSection
              objectiveListArray={objectiveList}
              handleContinueClick={(objectives) => handleNextClick(objectives, true)}
              errorText={errorText}
              setErrorText={setErrorText}
              hasClickedOnAddmore={hasClickedOnAddmore}
              isSelectObjectiveSection={isSelectObjectiveSection}
              setHasClickedOnAddmore={setHasClickedOnAddmore}
              appendEmptyTextarea={true}
            />
          ) : (
            <>
              {/* Only show initial objectives if there are no separators (no regenerations) */}
              {separators.length === 0 && (
                <>
                  <BotMessage showChatStyle primaryMessage={t("selectObjective.theseAreSomeObjectives")} secondaryMessage={t("selectObjective.selectObjective")} />
                  <div className="mb-4">
                  <Guidelines text={t("selectObjective.guidelines")} />
                    
                  </div>
                  <div className="secondpage-obj-fixed bg-white p-3 rounded-2xl">
                    <div className="mt-3">
                      <p className="secondpage-obj-text">{t("selectObjective.title")}</p>
                      {!!(!fetchError || fetchError === "") && <ObjectivesCard objectiveList={objectiveList} visibleCount={visibleCount} selectedIndices={selectedIndices} handleObjectiveClick={handleObjectiveClick} selectedObjective={selectedObjective} isSelectObjectiveSection={isSelectObjectiveSection} objectiveSource={objectiveSource} />}
                      {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
                      <div className="w-[90%]">
                        <Disclaimer text={t('disclaimer.objectivesText')} />
                      </div>
                    </div>
                    {isSelectObjectiveSection && <SuggestOrAddCta showSuggestMoreButton={visibleCount < objectiveList?.length} handleSuggestMore={handleSuggestMore} language={language} handleAddOwnClick={handleAddOwnObjective} showAddOwnButton={true} />}

                    {isSelectObjectiveSection && (
                      <div className="thirdpage-continue-div">
                            <button
                              className={`thirdpage-select-bttn ${isNextDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                              onClick={() => {
                                handleNextClick()
                              }}
                              disabled={isNextDisabled}
                            >
                              {hasClickedOnAddmore ? t("common.continue") : t("common.next")}
                              <IoArrowForward className="thirdpage-cont-arrow-icon" />
                            </button>
                          </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col h-auto">
          {chatSections.map((section, sectionIndex) => {

            const isLatestList = section.objectiveListData?.isLatest || false;


            // For previous objective lists, just show simple text
            if (!isLatestList && section?.showObjectives) {
              return (
                <div key={`objectives-${sectionIndex}`} className="my-4">
                  <BotMessage primaryMessage="Previous objectives list" />
                </div>
              );
            }
            if (section.showObjectives) {


              const sectionObjectives = prevObjectiveShown ? prevObjectiveList : objectiveList;
              const sectionSources = prevObjectiveShown ? useAICreationSessionStore.getState().getPrevObjectiveSource() : objectiveSource;
              
              return (
                <div key={`objectives-${sectionIndex}`}>
                  {objectiveListLoading ? (
                    <LoadingChat />
                  ) : hasClickedOnAddmore && sectionIndex === chatSections.length -1 && isSelectObjectiveSection ? (
                    <FinalObjectiveSection
                      objectiveListArray={sectionObjectives}
                      handleContinueClick={(objectives) => handleNextClick(objectives, true)}
                      errorText={errorText}
                      setErrorText={setErrorText}
                      hasClickedOnAddmore={hasClickedOnAddmore}
                      isSelectObjectiveSection={isSelectObjectiveSection}
                      setHasClickedOnAddmore={setHasClickedOnAddmore}
                      appendEmptyTextarea={true}
                    />
                  ) : (
                    <div>
                      <BotMessage showChatStyle primaryMessage={t("selectObjective.theseAreSomeObjectives")} secondaryMessage={t("selectObjective.selectObjective")} />
                      <div className="mb-4">
                        <Guidelines text={t("selectObjective.guidelines")} />
                      </div>
                      <div className="secondpage-obj-fixed bg-white p-3 rounded-2xl">
                        <div className="mt-3">
                          <p className="secondpage-obj-text">{t("selectObjective.title")}</p>

                          {!!(!fetchError || fetchError === "") && <ObjectivesCard objectiveList={sectionObjectives} visibleCount={visibleCount} selectedIndices={selectedIndices} handleObjectiveClick={handleObjectiveClick} selectedObjective={selectedObjective} isSelectObjectiveSection={isSelectObjectiveSection} objectiveSource={sectionSources} />}
                          {!!(fetchError && fetchError !== "") && <ErrorText errorText={fetchError} />}
                          <div className="w-[90%]">
                            <Disclaimer text={t('disclaimer.objectivesText')} />
                          </div>
                        </div>
                        {isSelectObjectiveSection && (
                          <SuggestOrAddCta
                            showSuggestMoreButton={visibleCount < objectiveList?.length}
                            handleSuggestMore={handleSuggestMore}
                            language={language}
                            handleAddOwnClick={handleAddOwnObjective}
                            showAddOwnButton={true}
                            showAdditionalCTA={!prevObjectiveShown && separators.length > 0}
                            additionCTAText={t("selectObjective.showPrevious")}
                            handleAdditionalCTAClick={() => {
                              setObjectiveList(prevObjectiveList)
                              setObjectiveSource(useAICreationSessionStore.getState().getPrevObjectiveSource())
                              setPrevObjectiveShown(true)
                              setIsPrevObjectiveShownStore(true)
                              setObjectiveListLoading(true)
                              setSelectedObjectiveStore(null)

                              setTimeout(() => {
                                setObjectiveListLoading(false)
                              }, 1000)
                            }}
                          />
                        )}

                      {isSelectObjectiveSection && (
                        <div className="thirdpage-continue-div">
                            <button
                              className={`thirdpage-select-bttn ${isNextDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                              onClick={() => {
                                handleNextClick()
                              }}
                              disabled={isNextDisabled}
                            >
                              {hasClickedOnAddmore ? t("common.continue") : t("common.next")}
                              <IoArrowForward className="thirdpage-cont-arrow-icon" />
                            </button>
                          </div>
                      )}
                      </div>
                    </div>
                  )}
                </div>
              )
            } else if (section.chatHistory?.length > 0 && !hasClickedOnAddmore) {
              // This is a chat history section
              return (
                <ChatWindow 
                  key={`chat-${sectionIndex}`}
                  chatHistory={section.chatHistory} 
                  page={2} 
                />
              );
            }
            return null;
          })}

          {isSelectObjectiveSection ? (
            <></>
          ) : !isOwnObjective && (
            <div className={`div35 label1`}>
              <div className={`div36 div37`}>
                <ChatMessage 
                  message={Array.isArray(selectedObjective) ? selectedObjective.join(" and ") : selectedObjective} 
                  userType={USER} 
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  )
}



export default SelectObjective;
