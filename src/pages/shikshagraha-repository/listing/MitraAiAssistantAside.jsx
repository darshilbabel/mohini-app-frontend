import React from "react";
import { useTranslation } from "react-i18next";
import { MdMoreVert } from "react-icons/md";
import ROUTES from "../../../url";

export default function MitraAiAssistantAside() {
  const { t } = useTranslation();
  const handleClick = () => {
    // Open Mitra AI assistant page in a new tab
    const fullUrl = `${window.location.origin}${ROUTES.SHIKSHAGRAHA_REPOSITORY_MITRA_AI_ASSISTANT}`;
    window.open(fullUrl, "_blank");
  };

  return (
    <aside className="bg-white px-4 py-6 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold leading-[28px]">{t("mitraAiAssistant")}</h3>
        <MdMoreVert className="w-5 h-5 text-[#9CA3AF]" />
      </div>
      <div className="h-[1px] border-t border-[#E5E7EB] my-4"></div>
      <div className="rounded-lg p-3 bg-[#F3F4F6] cursor-pointer" onClick={handleClick}>
        <h4 className="font-medium text-sm leading-[20px]">
          {t("generateMicroImprovementProjects")}
        </h4>
        <p className="font-normal text-xs leading-[16px] text-[#6B7280] mt-[10px]">
          {t("generateMicroImprovementProjectsDescription")}
        </p>
      </div>
    </aside>
  );
}
