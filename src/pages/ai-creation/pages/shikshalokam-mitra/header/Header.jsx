import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Popup from "../../../../../components/Popup/index";

import "../stylesheet/chatStyle.css";
import { useNavigate } from "react-router-dom";
import { clearMitraSessionStorage } from "../MainPage";
import {
  getBodyText,
  getConfirmText,
  getDiscardText,
  getHeaderText,
} from "../question script/header_translation";
import ROUTES from "../../../../../url";
import { useAICreationSessionStore } from "store";

function Header({
  shouldEnableGoBack = false,
  shouldEnableCross = false,
  shouldEnableGoForward = false,
  handleGoBack,
  handleGoForward,
  hideMovement = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const preferredLanguage = useAICreationSessionStore.getState().getPreferredLanguage() || {}
  const language = preferredLanguage.value || "en";

  const handleClosing = () => {
    clearMitraSessionStorage();
    window.location.href = ROUTES.LOGIN;
  };

  const tooglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {(shouldEnableCross || shouldEnableGoBack || shouldEnableGoForward) && (
        <div className="headerpage-div">
          {!hideMovement && (
            <div className="headerpage-arrow-div">
              <button
                onClick={handleGoBack}
                disabled={!shouldEnableGoBack}
                className={`${shouldEnableGoBack ? "" : "text-gray-500"}`}
              >
                <FiArrowLeft className="headerpage-arrow-icon" />
              </button>
              <button
                onClick={handleGoForward}
                disabled={!shouldEnableGoForward}
                className={`${shouldEnableGoForward ? "" : "text-gray-500"}`}
              >
                <FiArrowRight className="headerpage-arrow-icon" />
              </button>
            </div>
          )}
          {shouldEnableCross && (
            <button
              onClick={tooglePopup}
              className={!shouldEnableGoBack ? "headerpage-cross-only" : ""}
            >
              <RxCross2 className="headerpage-cross-icon" />
            </button>
          )}
        </div>
      )}
      <Popup
        isOpen={isOpen}
        headerText={getHeaderText(language)}
        bodyText={getBodyText(language)}
        confirmButtonText={getConfirmText(language)}
        discardButtonText={getDiscardText(language)}
        handleDiscard={handleClosing}
        togglePopup={tooglePopup}
        handleConfirm={tooglePopup}
      />
    </>
  );
}

export default Header;
