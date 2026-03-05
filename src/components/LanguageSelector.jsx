// components/LanguageSelector.js
import { setLanguage } from "i18n"
import { languageList } from "../pages/ShikshalokamVoiceChat/enum"
import FormData from "./Form/FormData"
import { useSiteDataSessionStore } from "store"

const LanguageSelector = ({
  // userLanguage,
  // onLanguageChange,
  className = "",
  isVisible = true,
}) => {
  const chatLanguage = useSiteDataSessionStore(state => state.chatLanguage)
  const setChatLanguage = useSiteDataSessionStore(state => state.setChatLanguage)

  function handleChangeLanguage(lang) {
    setChatLanguage(lang)
    setLanguage(lang)
  }

  if (!isVisible) return null
  return (
    <div className={`min-w-[100px] max-w-fit ${className}`}>
      <FormData layOut={2} labelName="" id="pagelanguageID" selectID="pagelanguageID" selectName="language" selectOptions={languageList} labelDivClass="text-left text-slate-700" selectValue={chatLanguage} selectClassName="bg-white text-slate-600 rounded-3xl p-3 mt-0 outline outline-slate-300 outline-1 outline-offset min-w-max" selectOnChange={e => handleChangeLanguage(e.target.value)} />
    </div>
  )
}

export default LanguageSelector
