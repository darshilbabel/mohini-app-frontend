import React from "react";
import Source from "../Source";
import Reasons from "../Reasons";
import { useAICreationSessionStore } from "store";

const ObjectivesCard = ({
  objectiveList = [],
  visibleCount,
  selectedIndices = [],
  handleObjectiveClick,
  isSelectObjectiveSection,
  objectiveSource = {},
}) => {


  const selectedObjective = useAICreationSessionStore(
    state => state.selectedObjective
  );

  // Handle both legacy single string and new array format for selectedObjective from store
  const selectedObjectivesArray = Array.isArray(selectedObjective) 
    ? selectedObjective 
    : (selectedObjective ? [selectedObjective] : []);

  const getObjectiveCardClass = (objIndex, obj) => {
    // Check if this index is in the selectedIndices array
    if (selectedIndices.length > 0) {
      return selectedIndices.includes(objIndex)
        ? "secondpage-obj-selected-button-div"
        : "secondpage-obj-bttn-div";
    }
    
    // Fallback: check if this objective's text matches any stored selected objective
    if (selectedObjectivesArray.length > 0) {
      const isSelected = selectedObjectivesArray.some(
        selected => selected === obj?.text || selected === obj
      );
      return isSelected
        ? "secondpage-obj-selected-button-div"
        : "secondpage-obj-bttn-div";
    }

    return "secondpage-obj-bttn-div";
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
      {!!(!isSelectObjectiveSection && selectedObjectivesArray.length > 0) ? (
        // Show all selected objectives when not in selection mode
        selectedObjectivesArray.map((objective, idx) => {

          const mappedIndex = mappedObjectives.findIndex(obj => obj.text === objective);
          return (<div
            key={`selected-objective-${idx}`}
            className="secondpage-obj-selected-button-div"
          >
            <div className="secondpage-obj-line"></div>
            <button className="secondpage-obj-bttn">{mappedIndex !== -1 && <span>{mappedIndex + 1}.</span>} {objective}</button>
          </div>
          )
})
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
                  <span>{objIndex+1}.</span> {obj?.text || ""} {obj?.source_keys?.map((key, index) => (
                  <sup key={index}>
                    [{key}]{" "}
                  </sup>
                ))}
                </button>
              </div>
            ))}
        </>
      )}

      <div className="flex flex-col gap-2">
        <Reasons reasonList={objectiveList} />
        <Source source={objectiveSource} />
      </div>


    </div>
  );
};

export default ObjectivesCard;
