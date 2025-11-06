// import { spokenWordsToDigits } from "../utils/base_utils";
import { getAI4BharatAudioApi } from "../api/endpoints/ai"

let currentAudio = null

export const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const arrayBuffer = await blob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  const rawData = audioBuffer.getChannelData(0)

  const rms = Math.sqrt(rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length)
  console.log("RMS (volume):", rms)

  return rms < silenceThreshold
}

export const handleOnSpeaking = async (text, id, sourceLanguage, audioRef, audioCache, setAudioCache, setIsPlaying, storedRoute) => {
  try {
    try {
      if (!!audioRef.current) await audioRef.current.pause()
    } catch (error) {
      console.error({ error })
    }
    console.log("text", text)
    console.log("id", id)
    console.log("sourceLanguage", sourceLanguage)
    console.log("audioRef", audioRef)

    handleAI4BharatTTSRequest(text, id, sourceLanguage, audioCache, audioRef, setAudioCache, setIsPlaying, storedRoute)
  } catch (error) {
    console.error({ error })
  }
}

export const handleOnStopSpeaking = async (audioRef, setIsPlaying) => {
  try {
    setIsPlaying(false)
    try {
      if (audioRef.current) await audioRef.current.pause()
    } catch (error) {
      console.error({ error })
    }
  } catch (error) {
    console.error({ error })
  }
}

export const stopRecording = (setHasStartedRecording, mediaRecorder) => {
  if (mediaRecorder) {
    mediaRecorder.stop()
    setHasStartedRecording(false)
  }
}

export const handleAI4BharatTTSRequest = async (text, id, sourceLanguage = "en", audioCache, audioRef, setAudioCache, setIsPlaying, storedRoute) => {
  try {
    let cachedAudioUrl = audioCache && id in audioCache ? audioCache[id] : null

    let audio_result = ""
    let audio

    if (!cachedAudioUrl) {
      audio_result = await getAI4BharatAudioApi(text, sourceLanguage, storedRoute)
      if (audio_result?.length) {
        cachedAudioUrl = `data:audio/wav;base64,${audio_result}`
        setAudioCache(prevCache => ({
          ...prevCache,
          [id]: cachedAudioUrl,
        }))
      }
    }

    if (cachedAudioUrl) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      audioRef.current = new Audio(cachedAudioUrl)
      setCurrentAudio(audioRef.current)
      audio = audioRef.current

      audio.onplay = () => {}

      audio.onended = () => {
        setIsPlaying(false)
      }

      try {
        await audio.play()
      } catch (error) {
        console.error("Error playing audio:", error)
      }
    }
  } catch (error) {
    console.error("Error in handleAI4BharatTTSRequest:", error)
    handleOnStopSpeaking(audioRef, setIsPlaying)
  }
}

export const setCurrentAudio = audio => {
  // console.log("Setting current audio: ", audio);
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.currentTime = 0
    } catch (e) {}
  }
  currentAudio = audio
}

export const stopCurrentAudio = () => {
  if (currentAudio) {
    console.log("✅ Stopping global audio", currentAudio)
    try {
      currentAudio.pause()
      currentAudio.currentTime = 0
    } catch (e) {
      console.warn("⚠️ Audio stop error:", e)
    }
    currentAudio = null
  } else {
    console.log("⚠️ No global audio to stop.")
  }
}
