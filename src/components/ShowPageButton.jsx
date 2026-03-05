// components/ShowPageButton.js
import { useEffect, useRef, useState } from "react"
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2"
import { handleOnSpeaking, handleOnStopSpeaking } from "../services/audio_service"
import useSiteDataSessionStore from "store/slices/siteData/siteDataSession"
import { useChatStorage } from "hooks/useStorage"

const ShowPageButton = ({
  text,
  id,
  audioRef,
  stopAudioTriggered,
  setStopAudioTriggered,
  // userLanguage = "en",
  showSpeaker = false,
  forcePlayAudio = false,
  logo = "",
}) => {
  const [audioCache, setAudioCache] = useState({})
  const [isPlaying, setIsPlaying] = useState(false)

  const hasForcedPlay = useRef(1)
  const prevFlow = useRef(null)

  const chatLanguage = useSiteDataSessionStore(state => state.chatLanguage)
  const selectedFlow = useChatStorage()(state => state.flow)

  // Reset audio cache and state when language changes
  useEffect(() => {
    setAudioCache({})
    audioRef.current = null
    hasForcedPlay.current = 2
    prevFlow.current = selectedFlow
  }, [chatLanguage])

  // Reset playing state when flow changes
  useEffect(() => {
    if (prevFlow.current !== selectedFlow) {
      setIsPlaying(false)
      hasForcedPlay.current = 1
      prevFlow.current = selectedFlow
    }
  }, [selectedFlow])

  // Handle forced play audio
  useEffect(() => {
    if (forcePlayAudio && !isPlaying && text && hasForcedPlay.current === 1) {
      hasForcedPlay.current = 2
      setStopAudioTriggered(false)
      setIsPlaying(true)
      handleOnSpeaking(text, id, chatLanguage, audioRef, audioCache, setAudioCache, setIsPlaying)
    }
  }, [forcePlayAudio, text, id, isPlaying, audioCache])

  // Handle stop audio trigger
  useEffect(() => {
    if (stopAudioTriggered) {
      setIsPlaying(false)
    }
  }, [stopAudioTriggered])

  const handleSpeakerClick = e => {
    e.stopPropagation()
    if (isPlaying) {
      if (!forcePlayAudio) {
        handleOnStopSpeaking(audioRef, setIsPlaying)
      }
    } else {
      if (!forcePlayAudio && hasForcedPlay.current !== 1) {
        setStopAudioTriggered(false)
        setIsPlaying(true)
        handleOnSpeaking(text, id, chatLanguage, audioRef, audioCache, setAudioCache, setIsPlaying)
      }
    }
  }

  return (
    <div className="flex flex-col items-center vertical-center text-center">
      {logo && logo !== "" && (
        <div className="w-[40px] mb-2">
          <img src={logo} alt="Logo" />
        </div>
      )}
      <div className="flex items-center gap-2 vertical-center">
        {showSpeaker && (
          <span className="speaker-div vertical-center">
            <button type="button" className={`speaker-off-button text-[1.3rem] md:text-lg sm:text-[1.3rem] vertical-center ${isPlaying ? "text-[#322f2f]" : ""}`} onClick={handleSpeakerClick}>
              {isPlaying ? <HiOutlineSpeakerWave /> : <HiOutlineSpeakerXMark />}
            </button>
          </span>
        )}
        <label htmlFor={id} className="text-[1rem] md:text-md sm:text-[1rem]">
          {text}
        </label>
      </div>
    </div>
  )
}

export default ShowPageButton
