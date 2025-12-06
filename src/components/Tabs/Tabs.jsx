import React, { useState } from "react";

const Tabs = ({ tabs = [], defaultActiveTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTabContent = tabs[activeTab]?.content || null;


  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      {/* Mobile: Top - Tabs | Desktop: Left side - Tabs (20%) */}
      <div className="w-full md:w-[20%]">
        <div className="flex flex-row md:!flex-col lg:!flex-col gap-1 overflow-x-auto md:overflow-x-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                px-4 py-3 text-left font-['Urbanist'] font-medium text-xs leading-none whitespace-nowrap
                ${
                  activeTab === index
                    ? "bg-[#F1E9FF] text-[#7C3AED] rounded-[6px]"
                    : "bg-white text-gray-700"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Bottom - Content | Desktop: Right side - Content (80%) */}
      <div className="w-full md:w-[80%] bg-white overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:px-4">
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;

