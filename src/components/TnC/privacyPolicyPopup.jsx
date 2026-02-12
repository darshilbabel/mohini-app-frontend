import React, { useEffect } from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from "rehype-raw";

import "./privacyPolicyPopup.css";
import { useTranslation } from "react-i18next";


const PrivacyPolicyPopup = ({ tncText, onAccept, onDecline, useStaticText=false, isGuestChat = true }) => {

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
  
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  
  const { t } = useTranslation();

  return (
    <>
        <div className="tnc-cover"></div>
        <div className="tnc-bg">
            <div className="tnc-container">
            <div className="tnc-content">
                <div className="tnc-text">
                    <MarkdownComponent markdownText={tncText} />
                </div>
            </div>
            <div className="tnc-buttons">
                {(onAccept)&& <button className={`tnc-button accept ${!isGuestChat && '!bg-blue-600'}`} onClick={onAccept}>
                  {useStaticText? 'स्वीकार करें' : t('tncConfirm')}
                </button>}
                {(onDecline)&& <button className="tnc-button decline" onClick={onDecline}>
                  {t('tncDecline')}
                </button>}
            </div>
            </div>
        </div>
    </>
  );
};

PrivacyPolicyPopup.propTypes = {
  tncText: PropTypes.string.isRequired,
  onAccept: PropTypes.func,
  onDecline: PropTypes.func,
  useStaticText: PropTypes.bool,
  isGuestChat: PropTypes.bool,
};

export default PrivacyPolicyPopup;

const MarkdownComponent = ({ markdownText }) => {
    return (
      <ReactMarkdown
        children={markdownText}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        className="prose max-w-none md:max-w-[90%]"
      />
    );
  };