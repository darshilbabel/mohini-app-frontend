import React from "react";
import { MdMoreVert } from "react-icons/md";
import ROUTES from "../../../url";

export default function MitraAiAssistantAside() {
  const handleClick = () => {
    // Open Mitra AI assistant page in a new tab
    const fullUrl = `${process.env.REACT_APP_LOCAL_PROXY}${ROUTES.SHIKSHAGRAHA_REPOSITORY_MITRA_AI_ASSISTANT}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <aside className="bg-white px-4 py-6 h-full" onClick={handleClick}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold leading-[28px]">Mitra AI Assistant</h3>
        <MdMoreVert className="w-5 h-5 text-[#9CA3AF]" />
      </div>
      <div className="h-[1px] border-t border-[#E5E7EB] my-4"></div>
      <div className="rounded-lg p-3 bg-[#F3F4F6] cursor-pointer">
        <h4 className="font-medium text-sm leading-[20px]">
          Generate Micro Improvement Projects (MIPs)
        </h4>
        <p className="font-normal text-xs leading-[16px] text-[#6B7280] mt-[10px]">
          MItra AI asks questions to understand your challenges, objectives,
          tasks, along with observations and surveys to generate tailored
          solutions...
        </p>
      </div>
    </aside>
  );
}
