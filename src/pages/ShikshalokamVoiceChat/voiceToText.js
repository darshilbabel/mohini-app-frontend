import { sessionFlowName } from "../../constants/session"
import { bot_routes } from "../../configure"

export const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const arrayBuffer = await blob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  const rawData = audioBuffer.getChannelData(0)

  const rms = Math.sqrt(rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length)
  console.log("RMS (volume):", rms)

  return rms < silenceThreshold
}

export function getSessionRoute(storageFlow, selectedType) {
  const currentFlow = storageFlow
  console.log("Current Flow:", currentFlow)
  console.log("Is the flow equal", currentFlow === sessionFlowName.ListeningActivity)

  // Configuration mapping flow names to bot routes
  const flowToRouteMap = {
    [sessionFlowName.GuestDiscussion]: bot_routes.shikshalokam_chaupal,
    [sessionFlowName.LoginDiscussion]: bot_routes.shikshalokam_chaupal,
    [sessionFlowName.ListeningActivity]: bot_routes.listening_activity,
  }

  const typeBasedRouteMap = {
    normal: {
      [sessionFlowName.LoginMiStory]: bot_routes.normal,
      [sessionFlowName.GuestMiStory]: bot_routes.guest_normal,
    },
    oneshot: {
      [sessionFlowName.LoginMiStory]: bot_routes.oneshot,
      [sessionFlowName.GuestMiStory]: bot_routes.guest_oneshot,
    },
  }

  // Check direct flow mapping first
  if (currentFlow && flowToRouteMap[currentFlow]) {
    return flowToRouteMap[currentFlow]
  }

  // Check type-based mapping
  const routeMap = selectedType === "normal" ? typeBasedRouteMap.normal : typeBasedRouteMap.oneshot

  if (currentFlow && routeMap[currentFlow]) {
    return routeMap[currentFlow]
  }

  // Default route
  return bot_routes.reflection
}

export const formatTime = secs => {
  const minutes = Math.floor(secs / 60)
  const seconds = secs % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
