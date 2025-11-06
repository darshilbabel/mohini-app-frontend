import React, { useEffect } from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from "rehype-raw";

import "./privacyPolicyStyle.css";
import { useTranslation } from "react-i18next";


const PrivacyPolicyPage = ({ tncText, onAccept, onDecline, shouldShowAcceptDecline=true}) => {

  const { t } = useTranslation();

  return (
    <>
        <div className="">
            <div className="">
            <div className="">
                <div className="tnc-text-login">
                    <MarkdownComponent markdownText={tncText} />
                </div>
            </div>
            {(shouldShowAcceptDecline)&& <div className="tnc-buttons">
                <button className="tnc-button accept" onClick={onAccept}>
                  {t('tncConfirm')}
                </button>
                <button className="tnc-button decline" onClick={onDecline}>
                  {t('tncDecline')}
                </button>
            </div>}
            </div>
        </div>
    </>
  );
};

PrivacyPolicyPage.propTypes = {
  tncText: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
};

export default PrivacyPolicyPage;

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