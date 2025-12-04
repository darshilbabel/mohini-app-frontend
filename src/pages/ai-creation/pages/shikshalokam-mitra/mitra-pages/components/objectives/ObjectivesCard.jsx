import React from "react";
import Source from "../Source";
import { useAICreationSessionStore } from "store";

const ObjectivesCard = ({
  objectiveList = [],
  visibleCount,
  selectedIndex,
  handleObjectiveClick,
  selectedObjective,
  isSelectObjectiveSection,
  objectiveSource = {},
}) => {

  const getObjectiveCardClass = (objIndex, obj) => {
    // If no index is selected, check if this objective matches the stored one
    if (selectedIndex === null || selectedIndex === undefined) {
      const storedObjective = useAICreationSessionStore.getState().getSelectedObjective();
      return storedObjective === obj
        ? "secondpage-obj-selected-button-div"
        : "secondpage-obj-bttn-div";
    }
    // Otherwise, check if this index matches the selected index
    return objIndex === selectedIndex
      ? "secondpage-obj-selected-button-div"
      : "secondpage-obj-bttn-div";
  };
  return (
    <div className="objective-list-div">
      {!!(!isSelectObjectiveSection && selectedObjective?.length > 0) ? (
        <div
          key="selected-objective"
          className="secondpage-obj-selected-button-div"
        >
          <div className="secondpage-obj-line"></div>
          <button className="secondpage-obj-bttn">{selectedObjective}</button>
        </div>
      ) : (
        <>
          {(Array.isArray(objectiveList) ? objectiveList : [])
            .slice(0, visibleCount)
            .map((obj, objIndex) => (
              <div
                key={objIndex}
                className={getObjectiveCardClass(objIndex, obj)}
                onClick={() => handleObjectiveClick(objIndex)}
              >
                <div className="secondpage-obj-line"></div>
                <button className="secondpage-obj-bttn">
                  {obj?.text || ""} <sup>{objIndex + 1}</sup>
                </button>
              </div>
            ))}
        </>
      )}
      <Source source={objectiveSource} />
    </div>
  );
};

export default ObjectivesCard;
