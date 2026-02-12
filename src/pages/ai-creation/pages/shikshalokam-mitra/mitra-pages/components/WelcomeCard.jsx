import React from "react";
import { useTranslation } from "react-i18next";

export default function WelcomeCard() {
  const { t } = useTranslation("ai_creation_translation");
  return (
    <div className="flex flex-col gap-4 sm:gap-5 lg:gap-[20px] rounded-[20px] p-4 sm:p-6 lg:p-[30px] bg-white shadow-[0px_2px_4px_0px_#0000000D] mb-8 sm:mb-12 lg:mb-[20px]">
      <h1 className="font-medium text-[24px] leading-[36px] text-center text-[#333333]">
        {t("defineChallenge.welcomeCardTitle")}
      </h1>
    </div>
  );
}
