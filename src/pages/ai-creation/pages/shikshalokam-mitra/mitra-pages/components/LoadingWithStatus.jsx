import React, { useState, useEffect } from "react";
import LoadingChat from "./LoadingChat";

const defaultStatusMessages = [
  "Accessing knowledge base...",
  "Generating responses...",
  "Cross checking responses...",
  "Regenerating better quality responses...",
  "Finalizing...",
  "Verifying output..."
];

function LoadingWithStatus({ 
  statusMessages = defaultStatusMessages, 
  rotationInterval = 5000,
  customClassNames = {},
  showDefaultLoader = false
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { 
    wrapperStyles = "", 
    textStyles = "",
    loaderWrapperStyles = "" 
  } = customClassNames;

  useEffect(() => {
    if (currentIndex >= statusMessages.length - 1) return;
    
    const timeout = setTimeout(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, rotationInterval);

    return () => clearTimeout(timeout);
  }, [currentIndex, statusMessages.length, rotationInterval]);

  return (
    <div className={`flex items-center gap-4 py-6 ${wrapperStyles}`}>
      <p className={`text-base font-medium text-[#572E91] animate-pulse ${textStyles}`}>
        {statusMessages[currentIndex]}
      </p>
      {showDefaultLoader && <div className={loaderWrapperStyles}>
        <LoadingChat />
      </div>}
    </div>
  );
}

export default LoadingWithStatus;

