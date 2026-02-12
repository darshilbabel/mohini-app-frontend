import React from "react";
import { RxCross2 } from "react-icons/rx";

function Popup({
  togglePopup,
  isOpen,
  headerText,
  bodyText,
  confirmButtonText,
  discardButtonText,
  handleDiscard,
  handleConfirm,
}) {
  return (
    <div>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">
              <h3>{headerText}</h3>
              <button className="close-btn" onClick={togglePopup}>
                <RxCross2 className="popup-cross-icon" />
              </button>
            </div>
            <p className="popup-text-body">{bodyText}</p>
            <div className="popup-actions">
              <button className="stay-btn" onClick={handleConfirm}>
                {confirmButtonText}
              </button>
              <button className="discard-btn" onClick={handleDiscard}>
                {discardButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Popup;
