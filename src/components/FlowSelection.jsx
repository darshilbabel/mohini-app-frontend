// components/FlowSelection.js
import { FaArrowRightLong } from "react-icons/fa6"
import { sessionFlowName } from "../constants/session"
import { useChatStorage } from "hooks/useStorage"
import { useTranslation } from "react-i18next"
import ShowPageButton from "./ShowPageButton"

const FlowSelection = ({ audioRef, stopAudioTriggered, setStopAudioTriggered, onFlowContinue, setIsLoading }) => {
  const { t } = useTranslation()

  const selectedFlow = useChatStorage()(state => state.flow)
  const setSelectedFlow = useChatStorage().getState().setFlow

  const handleContinueClick = async () => {
    setIsLoading(true)
    await onFlowContinue()
  }

  return (
    <>
      <div className="text-center text-lg md:text-xl sm:text-md mt-0 sm:mt-[100px] text-slate-700">
        <b>{t("commonPageSelectionText")}</b>
      </div>
      <div className="py-2 px-0 text-center">
        <div className="flex flex-col items-center gap-8 py-2 px-0 font-inter">
          {/* Flow Options */}
          <div className="flex flex-col w-full justify-center items-center gap-4 flow-button-custom px-4">
            <FlowOption
              flowName={sessionFlowName.GuestDiscussion}
              // selectedFlow={selectedFlow}
              onSelect={setSelectedFlow}
              buttonText={t("commonPageButtonText2")}
              buttonId="capture-discussion"
              // userLanguage={userLanguage}
              audioRef={audioRef}
              stopAudioTriggered={stopAudioTriggered}
              setStopAudioTriggered={setStopAudioTriggered}
              logo="https://s3.ap-south-1.amazonaws.com/static-media.gritworks.ai/fe-images/PNG/Shikshalokam/discussion_capture_logo.png"
            />
            <FlowOption
              flowName={sessionFlowName.GuestMiStory}
              // selectedFlow={selectedFlow}
              onSelect={setSelectedFlow}
              buttonText={t("commonPageButtonText1")}
              buttonId="capture-mi-story"
              // userLanguage={userLanguage}
              audioRef={audioRef}
              stopAudioTriggered={stopAudioTriggered}
              setStopAudioTriggered={setStopAudioTriggered}
              logo="https://s3.ap-south-1.amazonaws.com/static-media.gritworks.ai/fe-images/PNG/Shikshalokam/mi_story_capture_logo.png"
            />
          </div>

          {/* Continue Button */}
          <button className={`mt-0 px-16 py-2 rounded-xl text-white text-lg font-medium flex items-center ${selectedFlow ? "bg-[#572E91] cursor-pointer" : "bg-[#8d888857] cursor-not-allowed"}`} disabled={!selectedFlow} onClick={handleContinueClick}>
            {t("continueBtnText")} <FaArrowRightLong className="ml-2 text-xl" />
          </button>
        </div>
      </div>
    </>
  )
}

// Individual Flow Option Component
const FlowOption = ({
  flowName,
  // selectedFlow,
  onSelect,
  buttonText,
  buttonId,
  // userLanguage,
  audioRef,
  stopAudioTriggered,
  setStopAudioTriggered,
  logo,
}) => {
  const selectedFlow = useChatStorage()(state => state.flow)
  const isSelected = selectedFlow === flowName

  return (
    <span
      className={`flex items-center gap-3 px-3 justify-center sm:py-4 py-3 rounded-2xl text-[#322f2f] cursor-pointer 
        ${isSelected ? "bg-[#efeafe]" : "bg-[#e3ecf48f]"} sm:max-w-[500px] w-full`}
      onClick={() => onSelect(flowName)}
    >
      <span className="text-base font-medium">
        <ShowPageButton
          text={buttonText}
          id={buttonId}
          // userLanguage={userLanguage}
          showSpeaker={true}
          forcePlayAudio={isSelected}
          // selectedFlow={selectedFlow}
          audioRef={audioRef}
          stopAudioTriggered={stopAudioTriggered}
          setStopAudioTriggered={setStopAudioTriggered}
          logo={logo}
        />
      </span>
    </span>
  )
}

export default FlowSelection
