import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAICreationSessionStore } from "../../../../../../../store";

import { FiPlusCircle } from "react-icons/fi";
import { IoArrowForward } from "react-icons/io5";

import { getOrTextTranslation } from "../../../question script/secondpage_tanslation";
import { validateObjective } from "../../../../../../../api/endpoints";

import Reasons from "../Reasons";
import TextareaWithVoice from "../../../../../components/textarea-with-mic";
import ErrorText from "../ErrorText";
import BotMessage from "../chat-message/BotMessage";

export function FinalObjectiveSection({
    objectiveListArray,
    handleContinueClick,
    errorText,
    setErrorText,
    isSelectObjectiveSection,
    setHasClickedOnAddmore,
    appendEmptyTextarea = false,
  }) {
  
    const { t } = useTranslation("ai_creation_translation");
    
    const [{ objectiveList, selectedIds }, setObjectiveState] = useState(() => {
      const timestamp = Date.now();
      const newItemId = `new-${timestamp}`;
      
      if (objectiveListArray && objectiveListArray.length > 0) {
        const mappedObjectives = objectiveListArray.map((obj, index) => ({
          id: `obj-${index}-${timestamp}`,
          content: typeof obj === "string" ? obj : (obj?.text ?? ""),
          reason: obj?.reason || "",
          isNew: false
        }));
        if (appendEmptyTextarea) {
          mappedObjectives.push({ id: newItemId, content: "", isNew: true });
        }
        return {
          objectiveList: mappedObjectives,
          selectedIds: appendEmptyTextarea ? new Set([newItemId]) : new Set()
        };
      }
      return {
        objectiveList: [{ id: newItemId, content: "", isNew: true }],
        selectedIds: new Set([newItemId])
      };
    });
    
    const [isFetchingData, setIsFetchingData] = useState(false);

    const errorTimeoutRef = useRef(null);

    
    const setObjectiveList = (updater) => {
      setObjectiveState(prev => ({
        ...prev,
        objectiveList: typeof updater === 'function' ? updater(prev.objectiveList) : updater
      }));
    };
    
    const setSelectedIds = (updater) => {
      setObjectiveState(prev => ({
        ...prev,
        selectedIds: typeof updater === 'function' ? updater(prev.selectedIds) : updater
      }));
    };
  
    const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || "en";
    const language = preferredLanguage.value || "en";
  
    const handleInputChange = (id, value) => {
      setObjectiveList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, content: value } : item))
      );
    };
  
    const handleCheckboxToggle = (id) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    };
  
    const handleAddObjective = () => {
      const newId = Date.now().toString();
      setObjectiveList((prev) => [
        ...prev,
        { id: newId, content: "", isNew: true },
      ]);
      setSelectedIds((prev) => new Set([...prev, newId]));
    };
  
    const handleValidateAndContinue = async () => {
      try {
        setIsFetchingData(true);
        setErrorText("");
  
        const objectivesToValidate = objectiveList
          .filter(obj => selectedIds.has(obj.id) && obj.content?.trim())
          .map(obj => obj.content.trim());
  
        if (objectivesToValidate.length === 0) {
          setErrorText(t("selectObjective.pleaseSelectAtLeastOneObjective") || "Please select at least one objective");
          setIsFetchingData(false);
          return;
        }
  
        const profile_id = useAICreationSessionStore.getState().getProfileId();
        const user_problem_statement = useAICreationSessionStore.getState().getUserProblemStatement();

  
        // Validate only selected objectives
        const validate_response = await validateObjective(
          objectivesToValidate,
          language,
          profile_id,
          user_problem_statement
        );
  
        setIsFetchingData(false);
  
        if (validate_response?.result === "false" || validate_response?.result === false) {
          setErrorText(validate_response?.error_message || t("common.pleaseTryAgainLater"));
          return;
        }
  
        // If validation passes, proceed with only SELECTED objectives
        const objectives = objectiveList
          .filter(obj => selectedIds.has(obj.id) && obj.content?.trim())
          .map(obj => ({ text: obj.content.trim() }));
        handleContinueClick(objectives);
  
      } catch (error) {
        const errorMessage =
          useAICreationSessionStore.getState().getSystemError() || t("common.pleaseTryAgainLater");
        setErrorText(errorMessage);
        setIsFetchingData(false);
        errorTimeoutRef.current = setTimeout(() => {
                setErrorText("");
        }, 10000);
        console.error("Error validating objectives:", error);
      }
    };

    useEffect(() => {
      return () => {
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
      };
    }, []);


  
    const hasSelectedObjectivesWithContent = objectiveList.some(
      (obj) => selectedIds.has(obj.id) && obj.content?.trim()
    );
    const isContinueDisabled = !hasSelectedObjectivesWithContent || isFetchingData;
  
    return (
      <div className="final-action-page mt-3">
        <BotMessage 
          primaryMessage={t("selectObjective.craftYourOwnObjectives")} 
          secondaryMessage={t("selectObjective.addEditObjectives")} 
        />
  
        <div className="secondpage-obj-fixed">
          <div className="secondpage-obj-div">
            <p className="secondpage-obj-text">{t("selectObjective.title")}</p>
            <div className="thirdpage-error-div">
              <p className="secondpage-valid-text">{t("selectObjective.pleaseAddAtLeastOneObjective")}</p>
            </div>
            {errorText && errorText !== "" && <ErrorText errorText={errorText} />}
            
            <div>
              {objectiveList.map((objective, index) => (
                <div key={objective.id} className="action-box">
                  <TextareaWithVoice 
                    value={objective.content || ""} 
                    placeholder={t("selectObjective.writeObjectiveHere")} 
                    disabled={!isSelectObjectiveSection || isFetchingData} 
                    onChange={text => handleInputChange(objective.id, text)} 
                    className="final-action-input" 
                  />
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(objective.id)}
                      onChange={() => handleCheckboxToggle(objective.id)}
                      disabled={!isSelectObjectiveSection || isFetchingData}
                      className="objective-checkbox"
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
              ))}
            </div>
  
            {isSelectObjectiveSection && (
              <>
  
                <Reasons reasonList={objectiveList} />
  
                <div className="secondpage-add-div1">
                  <button
                    className="flex items-center font-sans font-normal text-base leading-[1.4] text-right text-[#1177FF]"
                    onClick={() => {
                      handleAddObjective();
                    }}
                    disabled={isFetchingData}
                  >
                    <FiPlusCircle className="secondpage-plus-icon" />
                    {t("selectObjective.addObjective")}
                  </button>
                </div>
  
                <div className="secondpage-add-div1 mt-0">
                  <p className="secondpage-or-text">{getOrTextTranslation(language)}</p>
                </div>
  
                <div className="secondpage-add-div1 mt-0">
                  <button
                    onClick={() => {
                      setHasClickedOnAddmore(false);
                    }}
                    className="flex items-center font-sans font-normal text-base leading-[1.4] text-right text-[#1177FF]"
                    disabled={isFetchingData}
                  >
                    {t("selectObjective.goBack")}
                  </button>
                </div>
  
                <div className="thirdpage-continue-div">
                  <button
                    className={`thirdpage-select-bttn ${isContinueDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    onClick={handleValidateAndContinue}
                    disabled={isContinueDisabled}
                  >
                    {t("common.continue")}
                    <IoArrowForward className="thirdpage-cont-arrow-icon" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }