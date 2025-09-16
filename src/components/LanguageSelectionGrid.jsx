// components/LanguageSelectionGrid.js
import { useTranslation } from "react-i18next";
import { languageList } from "../pages/ShikshalokamVoiceChat/enum";
import { useLocation } from "react-router-dom";

const LanguageSelectionGrid = ({ 
  usecaseType, 
  onLanguageSelect,
  setIsLanguageProcessing 
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  const handleLanguageClick = (langValue) => {
    setIsLanguageProcessing(true);
    onLanguageSelect(langValue, true);
  };

  const searchParams = new URLSearchParams(location.search);
  const currentFlow = searchParams.get("flow");

  return (
    <>
      <div className="text-center text-lg md:text-2xl sm:text-md mt-0 sm:mt-[100px] text-slate-700">
        <b>{t("welcome_text")}</b>
      </div>
      <p className="sm:text-xl text-md font-semibold text-center">
        {t("languageQuestion")}
      </p>
      <div className="mt-4 mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:justify-items-center lg:px-[80px] md:px-[20px] sm:px-[20px] px-[10px]">
        {languageList
          .filter(
            (lang) =>
              !lang.excludeFor.includes(currentFlow) &&
              !lang.excludeFor.includes(usecaseType)
          )
          .map((lang) => (
            <div
              key={lang.value}
              className="div14-lang w-full text-center vertical-center m-0 h-[100px] flex items-center justify-center"
              onClick={() => handleLanguageClick(lang.value)}
            >
              <button className="w-full">{lang.label}</button>
            </div>
          ))}
      </div>
    </>
  );
};

export default LanguageSelectionGrid;