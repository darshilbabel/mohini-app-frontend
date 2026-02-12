import React, { useEffect, useRef } from "react";

export default function ConversationWrapperCard({ children, scrollRef }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScrollbarStyles = () => {
      if (window.innerWidth < 768) {
        // Mobile: hide scrollbar
        container.style.msOverflowStyle = 'none';
        container.style.scrollbarWidth = 'none';
      } else {
        // Desktop: show scrollbar
        container.style.msOverflowStyle = 'auto';
        container.style.scrollbarWidth = 'thin';
      }
    };

    updateScrollbarStyles();
    window.addEventListener('resize', updateScrollbarStyles);

    return () => {
      window.removeEventListener('resize', updateScrollbarStyles);
    };
  }, []);

  const shouldScroll = scrollRef !== null;

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (shouldScroll) {
          if (typeof scrollRef === 'function') {
            scrollRef(node);
          } else if (scrollRef) {
            scrollRef.current = node;
          }
        }
      }}
      className={`relative flex flex-col w-[calc(100%-32px)] md:w-[100%] h-full rounded-[20px] p-[10px] md:p-[30px] border border-[#DBDBDB] bg-[#F0F2F5] shadow-[0px_0px_8px_0px_#0000001A] mx-auto my-4 md:mx-0 md:!my-0 lg:!mx-0 lg:!my-0 ${shouldScroll ? 'overflow-y-auto [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-transparent md:[&::-webkit-scrollbar-thumb]:rounded-full md:hover:[&::-webkit-scrollbar-thumb]:bg-gray-400' : 'overflow-y-auto'}`}
      style={shouldScroll ? {
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      } : {}}
    >
      {children}
    </div>
  );
}
