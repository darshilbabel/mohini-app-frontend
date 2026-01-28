import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const ActionItemsSwiper = ({
  selectedIndex,
  actionList,
  swipeDirection,
  finalActionList,
  isViewMode,
  handleActionListClick,
  hasClickedOnAddmore
}) => {

  const { t } = useTranslation("ai_creation_translation");
  
  const actionItems = useMemo(() => {
    if (isViewMode) {
      return finalActionList?.map((action) => action?.content || "") || [];
    }
    return actionList[selectedIndex]?.actionSteps || [];
  }, [isViewMode, finalActionList, actionList, selectedIndex]);


  const mappedActionItems = useMemo(() => {

    if (!actionItems || actionItems.length === 0) {
      return actionItems;
    }

    // Collect all unique source IDs in order of appearance
    const uniqueSources = [
      ...new Set(
        actionItems
          ?.map((item) => item?.sources?.map((source) => source.source_id))
          ?.flat()
      ),
    ];

    // Map each action item to include source_keys
    return actionItems.map((item) => {
      const source_keys = [];

      item?.sources?.forEach((source) => {
        const idx = uniqueSources.indexOf(source.source_id);
        const key = idx + 1;
        
        // Only add if not already in source_keys
        if (!source_keys.includes(key)) {
          source_keys.push(key);
        }
      });

      return {
        ...item,
        source_keys,
      };
    });
  }, [actionItems, isViewMode]);

  return (
    <div key={selectedIndex} className={`thirdpage-obj-selected-button-div ${swipeDirection === "left" ? "swipe-left" : swipeDirection === "right" ? "swipe-right" : ""}`} onClick={handleActionListClick}>
      <div className="secondpage-obj-line"></div>
      <button className={`thirdpage-obj-bttn ${swipeDirection ? `swipe-in-${swipeDirection}` : ""}`}>
        {actionList[selectedIndex]?.duration_weeks !== "" && (
          <p className="thirdpage-duration">
            <span>{actionList[selectedIndex]?.plan_name ?? t("actionItems.myActionPlan")}{" "}</span>
            {!hasClickedOnAddmore && actionList[selectedIndex]?.duration_weeks && (
              <>
                <span className="thirdpage-week">({actionList[selectedIndex]?.duration_weeks}</span> week{actionList[selectedIndex]?.duration_weeks > 1 ? "s" : ""} recommend)
              </>
            )}
          </p>
        )}
        <ol>
          {(mappedActionItems || []).map((subAction, subActionIndex) => (
            <li key={`${selectedIndex}.${subActionIndex}`}>
              <span className="thirdpage-list-text">
                {subAction?.step}{" "}
                {subAction?.source_keys?.map((key, index) => (
                  <sup key={index}>[{key}] </sup>
                ))}
              </span>
            </li>
          ))}
        </ol>
      </button>
    </div>
  )
};

export default ActionItemsSwiper;
