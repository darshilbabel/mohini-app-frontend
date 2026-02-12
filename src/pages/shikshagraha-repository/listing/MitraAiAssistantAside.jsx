import React from "react";
import { useTranslation } from "react-i18next";
import { MdMoreVert } from "react-icons/md";
import ROUTES from "../../../url";
import { rootPath } from "utils/constants";

export default function MitraAiAssistantAside() {
  const { t } = useTranslation();
  const handleClick = () => {
    // Open Mitra AI assistant page in a new tab
    const fullUrl = `${window.location.origin}${rootPath}${ROUTES.MITRA_CHAT}`;
    window.open(fullUrl, "_blank");
  };

  return (
    <aside className="bg-white px-3 py-3 md:px-4 md:py-6 h-auto rounded-lg shadow-2xl transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-bold leading-[28px]">{t("mitraAiAssistant")}</h3>
        <MdMoreVert className="w-5 h-5 text-[#9CA3AF]" />
      </div>
      <div className="h-[1px] border-t border-[#E5E7EB] my-2 md:my-4"></div>
      <div className="rounded-lg p-2 md:p-3 bg-[#F3F4F6]">
        <p className="font-normal text-xs leading-[16px] text-[#6B7280]">
          {t("generateMicroImprovementProjectsDescription")}
        </p>
        
      </div>
      <button onClick={handleClick} className="w-full p-2 flex justify-center items-center rounded-lg bg-[#2563EB] text-white mt-3 text-xs">
          <span className="font-medium">
            {t("generateImprovementProjects")}
          </span>
        </button>
    </aside>
  );
}
