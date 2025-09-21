// components/LanguageSelector.js
import { languageList } from "../pages/ShikshalokamVoiceChat/enum";
import FormData from "./Form/FormData";

const LanguageSelector = ({ 
  userLanguage, 
  onLanguageChange, 
  className = "",
  isVisible = true,
}) => {
  if (!isVisible) return null;

  return (
    <div className={`min-w-[100px] max-w-fit ${className}`}>
      <FormData
        layOut={2}
        labelName=""
        id="pagelanguageID"
        selectID="pagelanguageID"
        selectName="language"
        selectOptions={languageList}
        labelDivClass="text-left text-slate-700"
        selectValue={userLanguage}
        selectClassName="bg-white text-slate-600 rounded-3xl p-3 mt-0 outline outline-slate-300 outline-1 outline-offset min-w-max"
        selectOnChange={onLanguageChange}
      />
    </div>
  );
};

export default LanguageSelector;