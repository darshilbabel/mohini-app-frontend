import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Select, { components } from "react-select"
import { Search, X } from "lucide-react"
/** Icons */
import { FaCircle } from "react-icons/fa6"
import { IoMicOutline } from "react-icons/io5"
import { FaRegStopCircle } from "react-icons/fa"
import { TbSend2 } from "react-icons/tb"
/** Hooks OR Stores */
import { useSiteDataLocalStore } from "store"
import { useAudio } from "hooks/useAudio"
import { useChatStorage } from "hooks/useStorage"
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore"
import useVoiceRecord from "../../interview-text-voice/useVoiceRecord"
/** Components */
import Notification, { showNotification } from "../../../components/ToastMessage/TotastMessage"
/** Services and Utilities */
import { handleS3Upload } from "../../../services/storage_service"
import { ai4BharatASRApi } from "api/endpoints"
import { getSessionRoute, formatTime, isSilentAudio } from "pages/ShikshalokamVoiceChat/voiceToText"

export default function Filters() {
  const globalSearchValue = useRepositoryStore(state => state.q)

  const filters = useRepositoryStore(state => state.filters)
  // fetch master list
  const fetchMasterList = useRepositoryStore(state => state.fetchMasterList)
  // get master list
  const dropdown_meta = useRepositoryStore(state => state.masterList)

  const resetFilters = useRepositoryStore(state => state.resetFilters)

  const setFilters = useRepositoryStore(state => state.setFilters)
  const setGlobalSearch = useRepositoryStore(state => state.setSearch)
  const storageFlow = useChatStorage()(state => state.flow)
  const selectedType = useChatStorage()(state => state.selectedType)
  const languageToUse = useSiteDataLocalStore(state => state.chatLanguage)
  const sessionId = useChatStorage()(state => state.sessionId)

  const [search, setSearch] = useState("")
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [hasStartedRecording, setHasStartedRecording] = useState(false)

  const [isConvertingVoiceToText, setIsConvertingVoiceToText] = useState(false)

  const [seconds, setSeconds] = useState(0)
  const [intervalId, setIntervalId] = useState(null)

  const { recordings, HiddenRecorder } = useVoiceRecord()

  const { t } = useTranslation()

  const { stopAllAudio, audioRef } = useAudio()

  // const [debouncedSearch] = useDebounce(
  //   () => {
  //     if (!!search && search?.length > 3) {
  //       setGlobalSearch(search)
  //     }
  //   },
  //   500,
  //   [search]
  // )

  const handleSendClick = () => {
    if (!!search && search?.length > 3) {
      setGlobalSearch(search)
    }
  }

  const handleChange = (key, value) => {
    setFilters({ [key]: value }, true)
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setHasStartedRecording(false)
    }
  }

  const handleOnStopSpeaking = async () => {
    try {
      try {
        if (audioRef.current) await audioRef.current.pause()
      } catch (error) {
        console.error({ error })
      }
    } catch (error) {
      console.error({ error })
    }
  }

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      handleOnStopSpeaking()
      setSearch("")
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          const options = {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 16000,
          }
          const recorder = new MediaRecorder(stream, options)
          setMediaRecorder(recorder)

          const localAudioChunks = []

          recorder.start()
          setHasStartedRecording(true)

          recorder.ondataavailable = event => {
            localAudioChunks.push(event.data)
          }

          recorder.onstop = async () => {
            if (localAudioChunks.length > 0) {
              const audioBlob = new Blob(localAudioChunks, {
                type: "audio/webm;codecs=opus",
              })
              const isSilent = await isSilentAudio(audioBlob, 0.02)

              if (!audioBlob || isSilent) {
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                })
                return
              }

              setIsConvertingVoiceToText(true)
              let transcriptResult = ""
              let s3Url = await handleS3Upload(audioBlob, `${Date.now()}`, `chatbot/companychat/${sessionId}/`)
              if (!s3Url || s3Url === "") {
                transcriptResult = t("asrError")
              }
              let storedRoute = getSessionRoute(storageFlow, selectedType)
              console.log("storedRoute", storedRoute)
              transcriptResult = await ai4BharatASRApi(s3Url, languageToUse, storedRoute)
              if (!transcriptResult || transcriptResult === "") {
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                })
              } else {
                setSearch(transcriptResult)
                // setGlobalSearch(transcriptResult)
              }
              setIsConvertingVoiceToText(false)
            } else {
              console.warn("No audio chunks were recorded.")
              setIsConvertingVoiceToText(false)
            }
          }
        })
        .catch(err => {
          console.error("Error accessing microphone:", err)
          setIsConvertingVoiceToText(false)
        })
    } else {
      console.warn("getUserMedia not supported on your browser!")
    }
  }

  useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
      setIntervalId(id)
    } else {
      clearInterval(intervalId)
      setSeconds(0)
    }

    return () => clearInterval(intervalId)
  }, [hasStartedRecording])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) {
      params.set("q", search)
    }
    const searchParams = `?${params.toString()}`
    window.history.replaceState({}, "", `${window.location.pathname}${searchParams}`)
  }, [search])

  useEffect(() => {
    fetchMasterList()
    const searched_param = new URLSearchParams(window.location.search)?.get("q")
    setSearch(searched_param ?? "");
    setGlobalSearch(searched_param ?? "");
  }, [])

  const disableSendButton = search?.trim()?.length === 0 || isConvertingVoiceToText || hasStartedRecording;

  const searchInput = (
    <div className="relative flex flex-row items-center w-full h-full">
      <div className="flex items-center justify-center absolute left-0 top-0 h-full pl-[12px] pointer-events-none">
        <Search className="w-4 h-4 text-gray-300" />
      </div>
      <input
        type="text"
        placeholder="Search with AI"
        className="pl-[41px] pr-[17px] py-[12px] max-w-[331px] w-full h-[53px] bg-white border border-gray-300 rounded-[12px] text-[14px] leading-[19px] font-manrope text-gray-700 placeholder-[#9CA3AF] focus:outline-none"
        value={search}
        onChange={e => {
          e.preventDefault()
          setSearch(e.target.value)
          if (!e.target.value) {
            setGlobalSearch("")
          }
          // console.log("debouce ready", debouncedSearch(e.target.value))
        }}
      />
      {hasStartedRecording && (
        <div className="flex items-center justify-center absolute right-[4.5rem] space-x-1 text-red-600 text-sm font-medium pointer-events-none">
          <FaCircle className="text-red-500 animate-pulse w-[10px] h-[10px] text-xs" />
          <span>{formatTime(seconds)}</span>
        </div>
      )}
      <button className={`flex items-center justify-center absolute right-10 top-0 h-full pl-[12px] ${hasStartedRecording ? "text-red-500" : "text-black"} disabled:text-[#64748b] disabled:cursor-not-allowed cursor-pointer`} onClick={hasStartedRecording ? stopRecording : startRecording}>
        {hasStartedRecording ? <FaRegStopCircle className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]" /> : <IoMicOutline className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px]" />}
      </button>
      <button disabled={disableSendButton} className={`flex items-center justify-center absolute right-3 top-0 h-full pl-[12px] disabled:cursor-not-allowed disabled:text-[#64748b] cursor-pointer ${!disableSendButton ? "text-[#007BFF]" : ""}`} onClick={handleSendClick}>
        <TbSend2 className="w-[22px] h-[22px] lg:w-[26px] lg:h-[26px]" />
      </button>
    </div>
  )

  return (
    <>
      <HiddenRecorder />
      <Notification />
      <div className="md:sticky top-0 z-50 flex flex-row items-center p-3 bg-white max-w-[1670px]  w-full rounded-[1rem] shadow-[0_0_4px_rgba(0,0,0,0.2)]">
        <div className="flex flex-wrap items-center p-0 gap-3 w-full md:w-[75%]">
          {!!dropdown_meta?.length
            ? dropdown_meta?.map(({ label, options, key }, index) => (
                <React.Fragment key={`label-${label}-${index}`}>
                  <DropdownSelect key={label} label={label} options={options} selected={filters[key] || "Select a " + label} onChange={value => handleChange(key, value)} />
                </React.Fragment>
              ))
            : null}
          {!!Object.keys(filters).some(key => !!filters[key]?.length) && (
            <button className="p-2 rounded-[12px] flex items-center gap-2 text-red-600 bg-red-50" onClick={() => resetFilters()}>
              <X className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>

        <div className="flex justify-end ml-auto relative z-10 w-full md:w-[25%]">
          <div className="flex flex-col items-start max-w-[331px] w-full h-[53px]">{searchInput}</div>
        </div>
      </div>
    </>
  )
}

const CustomMultiValue = props => {
  const { index, getValue } = props
  const maxToShow = 2
  const selected = getValue()

  if (index < maxToShow) {
    return <components.MultiValue {...props} />
  }

  if (index === maxToShow) {
    const remaining = selected.length - maxToShow
    return <div className="flex items-center px-2 text-sm text-gray-600">+{remaining} more</div>
  }

  return null
}

const CheckboxOption = props => {
  return (
    <components.Option {...props}>
      <div className="flex items-center">
        <input type="checkbox" checked={props.isSelected} readOnly className="mr-2 accent-blue-500" />
        <label>{props.label}</label>
      </div>
    </components.Option>
  )
}

const MenuList = props => {
  const { options, value, onChange } = props.selectProps

  const allSelected = value?.length === options?.length

  const toggleSelectAll = () => {
    if (allSelected) {
      onChange([], { action: "deselect-all" })
    } else {
      onChange(options, { action: "select-all" })
    }
  }

  return (
    <components.MenuList {...props}>
      <div className="flex items-center px-3 py-2 border-b border-gray-200 bg-gray-50">
        <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="mr-2 accent-blue-500" />
        <label className="font-medium text-gray-700 cursor-pointer select-none">{allSelected ? "Deselect All" : "Select All"}</label>
      </div>
      {props.children}
    </components.MenuList>
  )
}

const DropdownSelect = ({ label, options, selected, onChange }) => (
  <div className="relative mr-4 p-1">
    <Select
      options={options.map(x => ({ value: x.value, label: x.display }))}
      value={selected}
      onChange={onChange}
      isMulti
      placeholder={label}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      components={{
        Option: CheckboxOption,
        MenuList: MenuList,
        MultiValue: CustomMultiValue,
      }}
      styles={{
        control: base => ({
          ...base,
          border: "none",
          background: "rgb(82 82 91 / 1%)",
          boxShadow: "none",
          minHeight: "40px",
          "&:hover": { border: "none" },
        }),
        placeholder: base => ({ ...base, color: "#49454F" }),
        valueContainer: base => ({
          ...base,
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          alignItems: "center",
          padding: "2px 8px",
        }),
        multiValue: base => ({
          ...base,
          background: "white",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
        }),
        multiValueLabel: base => ({
          ...base,
          color: "black",
          fontSize: "13px",
          padding: "0 4px",
        }),
        menu: base => ({
          ...base,
          zIndex: 9999,
        }),
      }}
      className="max-w-[200px] bg-gray-100 rounded-[12px] text-zinc-600 text-sm"
    />
  </div>
)
