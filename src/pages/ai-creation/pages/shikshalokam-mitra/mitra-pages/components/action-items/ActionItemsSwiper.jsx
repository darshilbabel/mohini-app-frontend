import React, { useMemo } from "react";

const ActionItemsSwiper = ({
  selectedIndex,
  actionList,
  swipeDirection,
  finalActionList,
  isViewMode,
}) => {
  const actionItems = useMemo(() => {
    if (isViewMode) {
      return finalActionList?.map((action) => action?.content || "") || [];
    }
    return actionList[selectedIndex]?.actionSteps || [];
  }, [isViewMode, finalActionList, actionList, selectedIndex]);

  return (
    <div
      key={selectedIndex}
      className={`thirdpage-obj-selected-button-div ${
        swipeDirection === "left"
          ? "swipe-left"
          : swipeDirection === "right"
          ? "swipe-right"
          : ""
      }`}
    >
      <div className="secondpage-obj-line"></div>
      <button
        className={`thirdpage-obj-bttn ${
          swipeDirection ? `swipe-in-${swipeDirection}` : ""
        }`}
      >
        {actionList[selectedIndex]?.duration !== "" && (
          <p className="thirdpage-duration">
            <span className="thirdpage-week">
              {actionList[selectedIndex]?.duration}
            </span>{" "}
            weeks recommend
          </p>
        )}
        <ol>
          {(actionItems || []).map((subAction, subActionIndex) => (
            <li key={`${selectedIndex}.${subActionIndex}`}>
              <span className="thirdpage-list-text">{subAction}</span>
            </li>
          ))}
        </ol>
      </button>
    </div>
  );
};

export default ActionItemsSwiper;
