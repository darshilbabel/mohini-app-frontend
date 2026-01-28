import React from "react";
import { getActionListTextTranslation } from "../../../question script/thirdpage_tanslation";
import SwipeTopCounter from "./SwipeTopCounter";
import ErrorText from "../ErrorText";
import ActionItemsSwiper from "./ActionItemsSwiper";
import { useAICreationSessionStore } from "../../../../../../../store";

const ActionItemsList = ({
  language,
  visibleCount = false,
  selectedIndex,
  actionList,
  handleLeftArrowClick,
  handleRightArrowClick,
  fetchError,
  swipeDirection,
  isViewMode = false,
  finalActionList = [],
  handleActionListClick,
  hasClickedOnAddmore,
  isSelectActionItems
}) => {

  const errorText = useAICreationSessionStore(state => state.errorText);

  return (
    <div>
      <p className="secondpage-obj-text">
        {getActionListTextTranslation(language)}
      </p>
      {(actionList?.length > 0 || finalActionList?.length > 0) && <>
      
        {visibleCount && !isViewMode && (
        <SwipeTopCounter
          selectedIndex={selectedIndex}
          actionList={actionList}
          handleLeftArrowClick={handleLeftArrowClick}
          handleRightArrowClick={handleRightArrowClick}
        />
      )}
        <div className="thirdpage-obj-container">
            <ActionItemsSwiper
              selectedIndex={selectedIndex}
              actionList={actionList}
              swipeDirection={swipeDirection}
              finalActionList={finalActionList}
              isViewMode={isViewMode}
              handleActionListClick={handleActionListClick}
              hasClickedOnAddmore={hasClickedOnAddmore}
            />
        </div>
      </>}
      
      {(isSelectActionItems && (!!(fetchError && fetchError !== "") || (errorText && errorText !== ""))) && <ErrorText errorText={fetchError || errorText} />}
    </div>
  );
};

export default ActionItemsList;
