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


// 1️⃣ Collect all unique source IDs in order of appearance
const uniqueSources = [...new Set(objectiveList?.map(obj => obj?.sources?.map(source => source.source_id))?.flat())];

// 2️⃣ Map each objective to include the index (source_key)
const mappedObjectives = objectiveList.map(obj => {

  const source_keys = [];

  obj.sources.forEach(source => {
    const idx = uniqueSources.indexOf(source.source_id); // index in unique set

    source_keys.push(idx+1);

  })


  return {
    ...obj,
    source_keys
  };
});


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
          {(Array.isArray(mappedObjectives) ? mappedObjectives : [])
            .slice(0, visibleCount)
            .map((obj, objIndex) => (
              <div
                key={objIndex}
                className={getObjectiveCardClass(objIndex, obj)}
                onClick={() => handleObjectiveClick(objIndex)}
              >
                <div className="secondpage-obj-line"></div>
                
                <button className="secondpage-obj-bttn">
                  {obj?.text || ""} {obj?.source_keys?.map((key, index) => (
                  <sup key={index}>
                    [{key}]{" "}
                  </sup>
                ))}
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
