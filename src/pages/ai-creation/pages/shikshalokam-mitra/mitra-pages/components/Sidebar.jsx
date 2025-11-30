import React from "react";
import { useTranslation } from "react-i18next";
import { FaRegPlusSquare } from "react-icons/fa";
import { CgPlayPauseR } from "react-icons/cg";
import { ACTIVE_TABS } from "../../../../constants/mitra.constants";

function Action({ icon: Icon, text, onClick }) {
  return (
    <button
      className="flex items-center gap-3 bg-transparent p-0 border-0 cursor-pointer w-full text-left"
      onClick={onClick}
    >
      <Icon className="w-6 h-6 text-[#555555] flex-shrink-0" />
      <p className="font-medium text-base leading-[24px] text-[#555555] break-words">
        {text}
      </p>
    </button>
  );
}

export default function Sidebar({
  setActiveTab,
  isSidebarOpen = false,
  setIsSidebarOpen,
  isMobile = false,
  handleNewMIPClick,
}) {
  const { t } = useTranslation();
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === ACTIVE_TABS.WELCOME) {
      handleNewMIPClick();
    }
    // Close sidebar on mobile after clicking an action
    if (isMobile && setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="w-[280px] md:w-[220px] lg:w-[250px] h-full flex flex-col gap-8 rounded-[20px] p-10 border border-[#DBDBDB] bg-[#F0F2F5] shadow-[0px_0px_8px_0px_#0000001A] pt-20 md:pt-10">
          <Action
            icon={FaRegPlusSquare}
            text={t("sidebar.newMIP")}
            onClick={() => handleTabClick(ACTIVE_TABS.WELCOME)}
          />
          <Action
            icon={CgPlayPauseR}
            text={t("sidebar.faq")}
            onClick={() => handleTabClick(ACTIVE_TABS.FAQ)}
          />
        </div>
      </div>
    </>
  );
}
