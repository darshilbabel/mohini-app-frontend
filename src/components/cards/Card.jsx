import React from "react";
import { showNotification } from "../ToastMessage/TotastMessage";

const Card = ({ className = "", label, title, description, sourceUrl, show = "", showSourcePopup }) => {
  const handleCopySourceUrl = async (url) => {
    if (!url) {
      showNotification({
        message: "No source URL available to copy.",
        type: "error",
        options: {
          position: "top-center",
          autoClose: 3000,
          style: { fontWeight: "bold", width: "80%" },
        },
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      showNotification({
        message: "Source URL copied to clipboard!",
        type: "success",
        options: {
          position: "top-center",
          autoClose: 3000,
          style: { fontWeight: "bold", width: "80%" },
        },
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      showNotification({
        message: "Failed to copy source URL. Please try again.",
        type: "error",
        options: {
          position: "top-center",
          autoClose: 3000,
          style: { fontWeight: "bold", width: "80%" },
        },
      });
    }
  };


  return (
    <div
      className={`flex flex-col border-[0.5px] border-solid border-[#572E91] gap-3 pt-2 pr-[10px] pb-2 pl-[10px] rounded-[10px] bg-white w-full my-[10px] mx-0 md:my-0 md:mx-0 shadow-[0px_4px_4px_0px_#0000001A] md:shadow-none ${className}`}
    >
      <div className="font-bold text-[12px] leading-none">{label}</div>
      <div className="font-medium text-[14px] leading-none text-black break-words whitespace-normal max-w-full">
        {title}
      </div>
      <div className="font-normal text-[12px] leading-none text-[#374151]">
        {description}
      </div>
      <div className="flex justify-end gap-2">
        {show && <button onClick={showSourcePopup} className="font-semibold text-[12px] leading-none text-[#1D4ED8]">
          Show
        </button>}
        {sourceUrl && <button onClick={() => handleCopySourceUrl(sourceUrl)} className="font-semibold text-[12px] leading-none text-[#1D4ED8]">
            Source URL  
          </button>}
      </div>
    </div>
  );
};

export default Card;

