import React from "react";
import { FiPlusCircle } from "react-icons/fi";
import {
  getSuggestMoreButtonTranslation,
  getOrTextTranslation,
  getAddOwnButtonTranslation,
} from "../../question script/secondpage_tanslation";
import { useTranslation } from "react-i18next";

const SuggestOrAddCta = ({
  handleSuggestMore,
  language,
  handleAddOwnClick,
  showSuggestMoreButton = true,
  showAddOwnButton = true,
  showAdditionalCTA = false,
  additionCTAText,
  handleAdditionalCTAClick
}) => {
  const showOrText = showSuggestMoreButton && showAddOwnButton;
  const buttonStyle =
    "flex items-center font-sans font-normal text-base leading-[1.4] text-right text-[#1177FF]";

  const {t} =  useTranslation("ai_creation_translation")


  return (
    <div className="secondpage-div1">
      {showSuggestMoreButton && (
        <div className="flex justify-center">
          <button className={buttonStyle} onClick={handleSuggestMore}>
            {getSuggestMoreButtonTranslation(language)}
          </button>
        </div>
      )}
      {showOrText && (
        <div className="flex justify-center">
          <p className="secondpage-or-text">{getOrTextTranslation(language)}</p>
        </div>
      )}
      {showAddOwnButton && (
        <div className="flex justify-center">
          <button className={buttonStyle} onClick={handleAddOwnClick}>
            <FiPlusCircle className="mr-[5px]" />
            {getAddOwnButtonTranslation(language)}
          </button>
        </div>
      )}
      {showAdditionalCTA && (
        <>
          <div className="flex justify-center">
            <p className="secondpage-or-text">{getOrTextTranslation(language)}</p>
          </div>
          <div className="flex justify-center">
            <button className={buttonStyle} onClick={handleAdditionalCTAClick}>
              {t(additionCTAText)}
            </button>
          </div>
        </>
      )}
    </div>
  )
};

export default SuggestOrAddCta;
