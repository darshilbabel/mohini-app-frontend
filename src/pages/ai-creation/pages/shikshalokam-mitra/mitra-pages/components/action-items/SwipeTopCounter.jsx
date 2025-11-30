import React from "react";
import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";

const SwipeTopCounter = ({
  selectedIndex,
  actionList,
  handleLeftArrowClick,
  handleRightArrowClick,
}) => {
  return (
    (
      <div className="flex flex-row-reverse items-center sm:w-full md:w-[60%] md:min-w-[570px]">
        <RiArrowRightSFill
          className={`cursor-pointer ${
            selectedIndex === actionList?.length - 1
              ? "thirdpage-arrow-icon-last"
              : "thirdpage-arrow-icon"
          }`}
          onClick={handleRightArrowClick}
        />
        <RiArrowLeftSFill
          className={`cursor-pointer ${
            selectedIndex === 0
              ? "thirdpage-arrow-icon-last"
              : "thirdpage-arrow-icon"
          }`}
          onClick={handleLeftArrowClick}
        />
        <span className="actionlist-number">
          {selectedIndex + 1}/{actionList.length}
        </span>
      </div>
    )
  );
};

export default SwipeTopCounter;
