import React, { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { faqData } from "../../../../constants/faq";
import { useTranslation } from "react-i18next";

// Single FAQ Accordion Item
const FAQItem = ({ question, answer, index, isOpen, onToggle }) => {
  return (
    <div
      className={`border rounded-lg transition-all duration-200 ${
        isOpen
          ? "border-blue-500 shadow-sm"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <button
        className="bg-[#F0F2F5] w-full flex items-center justify-between p-3 text-left focus:outline-none"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-bold text-gray-900">
          <span className="mr-2">{index}.</span>
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 mt-3">
          <div
            className="text-gray-700 prose prose-sm max-w-none 
              [&>p]:mb-3 [&>p]:leading-relaxed
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ul>li]:mb-1
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>ol>li]:mb-1
              [&_strong]:font-semibold [&_strong]:text-gray-900"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        </div>
      )}
    </div>
  );
};

// FAQ Section with title and questions
const FAQSection = ({ title, questions, sectionIndex, openItems, onToggle }) => {
  // Calculate starting index for this section based on previous sections
  let startIndex = 1;
  for (let i = 0; i < sectionIndex; i++) {
    startIndex += faqData.content[i].question_list.length;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {questions.map((q, qIdx) => {
          const globalIndex = startIndex + qIdx;
          const itemKey = `${sectionIndex}-${qIdx}`;
          return (
            <FAQItem
              key={itemKey}
              question={q.question}
              answer={q.answer}
              index={globalIndex}
              isOpen={openItems[itemKey] || false}
              onToggle={() => onToggle(itemKey)}
            />
          );
        })}
      </div>
    </div>
  );
};

// Main FAQ Component
export default function FAQ({ onBack }) {
  const { t } = useTranslation("ai_creation_translation");
  const [openItems, setOpenItems] = useState({});

  const handleToggle = (itemKey) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-white rounded-[20px] p-6 md:p-8">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1177FF] hover:text-blue-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t("common.back") || "Back"}</span>
        </button>
      )}

      {/* FAQ Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
        {faqData.faqPageTitle}
      </h1>

      {/* FAQ Sections */}
      <div className="max-w-3xl mx-auto">
        {faqData.content.map((section, sIdx) => (
          <FAQSection
            key={sIdx}
            title={section.title}
            questions={section.question_list}
            sectionIndex={sIdx}
            openItems={openItems}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}

