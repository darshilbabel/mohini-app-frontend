import React from "react";
import { MdOutlineCancel } from "react-icons/md";
import { GrShare } from "react-icons/gr";
import { CiMedicalCase } from "react-icons/ci";

const SourcePopup = ({ isOpen, onClose, source = {} }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Popup Content */}
      <div
        className="relative bg-white rounded-[20px] shadow-lg w-[90%] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {source?.label || ""}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <MdOutlineCancel className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {!!(source?.url?.length > 0) && (
          <div className="flex flex-col px-6 gap-3">
            <a
              href={source?.url || ""}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GrShare className="ml-2 w-4 h-4 text-gray-600 inline-block mr-2" />
              <span>Source URL</span>
            </a>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 border rounded-md border-[#DBDBDB] m-6">
          {source?.chunk || ""}
        </div>
      </div>
    </div>
  );
};

export default SourcePopup;
