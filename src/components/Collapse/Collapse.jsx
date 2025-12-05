import React, { useState } from "react";

const Collapse = ({ title, children, defaultOpen = false, customClassNames = {} }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const { wrapperStyles = "" } = customClassNames;

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sm:w-full md:w-[90%] border border-gray-200 rounded-lg overflow-hidden shadow-[0px_0px_10px_0px_#00000026] ${wrapperStyles}`}>
      <div
        className="flex justify-between items-center h-[50px] pt-3 pr-5 pb-3 pl-5 bg-white cursor-pointer"
        onClick={toggleCollapse}
      >
        <span className="text-base font-medium leading-none text-[#1D4ED8] flex-1">{title}</span>
        <span className="flex items-center justify-center text-gray-500">
          {isOpen ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 10L8 6L12 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {isOpen && (
        <div className="p-4 bg-white">{children}</div>
      )}
    </div>
  );
};

export default Collapse;

