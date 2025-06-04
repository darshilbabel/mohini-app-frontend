import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "./languageSelectionPopup.css";

const LanguageSelectionPopup = ({ languageList, selectedLanguage, onSelect, onClose }) => {
    const { t } = useTranslation();
 
    useEffect(() => {
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);

        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <>
            <div className="language-select-cover"></div>
            <div className="language-select-bg">
                <div className="language-select-container">
                    <div className="language-select-content px-0">
                        <p className="mb-4 sm:text-xl text-lg font-bold text-center">{t('languageQuestion')}</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-2 md:gap-y-4 justify-center">
                        {languageList.map((lang) => (
                            <div
                                key={lang.value}
                                className={`div14-lang flex items-center justify-center p-0 ${
                                selectedLanguage === lang.value ? "bg-[#d5eafd] text-white" : ""
                            }`}
                            >
                            <button
                                className="div16 text-center w-full h-full"
                                disabled={selectedLanguage === lang.value}
                                onClick={() => onSelect(lang.value)}
                            >
                                {lang.label}
                            </button>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

LanguageSelectionPopup.propTypes = {
  languageList: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedLanguage: PropTypes.string,
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
};

export default LanguageSelectionPopup;
