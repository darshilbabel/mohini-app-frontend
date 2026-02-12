import React, { useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";

function Guidelines({ text }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!text) return null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-1 cursor-pointer text-[#666666] hover:text-[#1177FF] transition-colors">
        <span className="text-sm font-medium">Guidelines</span>
        <IoInformationCircleOutline className="w-4 h-4" />
      </div>

      {showTooltip && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="relative w-64 md:w-80 p-3 bg-white border border-[#DDDDDD] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text }} />
            <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white" />
            <div className="absolute -top-[9px] left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-[#DDDDDD]" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Guidelines;

