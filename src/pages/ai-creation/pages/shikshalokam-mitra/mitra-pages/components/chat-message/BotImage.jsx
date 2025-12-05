import React from "react";
import { DEFAULT_BOT_IMAGE_URL } from "../../../../../constants/mitra.constants";

const BotImage = ({ srcUrl = DEFAULT_BOT_IMAGE_URL, customClasses = {} }) => {
  const { wrapperStyles = "", imageStyles = "" } = customClasses;

  return (
    <div className={`div36 ${wrapperStyles}`}>
      <img
        className={`bot-image ${imageStyles}`}
        src={srcUrl}
      />
    </div>
  );
};

export default BotImage;
