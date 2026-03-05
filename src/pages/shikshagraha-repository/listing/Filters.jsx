import React, { useEffect, useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import Select, { components } from "react-select"
import { Search, X } from "lucide-react"
/** Icons */
import { FaCircle } from "react-icons/fa6"
import { IoMicOutline } from "react-icons/io5"
import { FaRegStopCircle } from "react-icons/fa"
import { TbSend2 } from "react-icons/tb"
/** Hooks OR Stores */
import { useSiteDataSessionStore } from "store"
import { useAudio } from "hooks/useAudio"
import { useChatStorage } from "hooks/useStorage"
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore"
import useVoiceRecord from "../../interview-text-voice/useVoiceRecord"
/** Components */
import Notification, { showNotification } from "../../../components/ToastMessage/TotastMessage"
/** Services and Utilities */
import { handleS3Upload } from "../../../services/storage_service"
import { ai4BharatASRApi } from "api/endpoints/ai"
import { formatTime, isSilentAudio } from "pages/ShikshalokamVoiceChat/voiceToText"
import { bot_routes } from "configure"

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
  const setSearchInput = useRepositoryStore(state => state.setSearchInput)

  const languageToUse = useSiteDataSessionStore(state => state.chatLanguage)
  const sessionId = useChatStorage()(state => state.sessionId)

  const [search, setSearch] = useState("")
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [hasStartedRecording, setHasStartedRecording] = useState(false)
  // const [isConvertingVoiceToText, setIsFetchingData] = useState(false)
  const [isConvertingVoiceToText, setIsConvertingVoiceToText] = useState(false)

  const [seconds, setSeconds] = useState(0)
  const [intervalId, setIntervalId] = useState(null)
  const [hasStartedListening, setHasStartedListening] = useState(false)

  const textAreaRef = useRef(null)
  const [isMaxLengthReached, setIsMaxLengthReached] = useState(false)

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

  function handleSendMessage(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    if (!search.trim()) return

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
              let storedRoute = bot_routes.search_bot

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
  const handleOnInputText = inpText => {
    setSearch(inpText)
    setSearchInput(inpText) // Update store with current input value

    if (inpText.trim() === "") {
      // setIsRecognizing(false)
      setHasStartedListening(false)
    }

    if (inpText.trim() === "" && search.trim() !== "") {
      setGlobalSearch("")
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
    setSearch(searched_param ?? "")
    setGlobalSearch(searched_param ?? "")
    setSearchInput(searched_param ?? "") // Also set searchInput on mount

    return () => {
      setIsMaxLengthReached(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!textAreaRef.current) return
    const textarea = textAreaRef.current
    const minHeight = 29
    const maxHeight = 50

    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = "auto"
    const scrollHeight = textarea.scrollHeight
    const hasNewline = textarea.value.includes("\n")

    // If empty or single line (no newline), always set to minHeight to prevent shifting
    if (!textarea.value || !hasNewline) {
      textarea.style.height = `${minHeight}px`
      textarea.style.overflowY = "hidden"
    } else if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`
      textarea.style.overflowY = "auto"
    } else {
      textarea.style.height = `${scrollHeight}px`
      textarea.style.overflowY = "hidden"
    }
  }, [search])

  const disableSendButton = search?.trim()?.length === 0 || isConvertingVoiceToText || hasStartedRecording

  const searchInput = (
    <form
      className="relative flex flex-row items-center justify-center w-full h-full px-3 py-2 rounded-[12px] border border-gray-300"
      onSubmit={event => {
        if (!hasStartedListening && !isConvertingVoiceToText) {
          handleSendMessage(event)
        }
      }}
      autoComplete="off"
    >
      <div className="flex items-center justify-center relative h-full pointer-events-none">
        <Search className="w-4 h-4 text-gray-300" />
      </div>
      <div className="relative w-full flex items-center justify-center">
        <textarea
          className={`${isConvertingVoiceToText ? "min-h-[29px] sm:min-h-0" : ""} pl-3 max-w-[331px] w-full border-0 focus:outline-none focus:bg-transparent bg-transparent rounded-[12px] text-[14px] font-manrope text-gray-700 placeholder-[#9CA3AF] resize-none !overflow-y-auto`}
          style={{
            backgroundColor: "transparent",
            height: "29px",
            minHeight: "29px",
            maxHeight: "50px",
            resize: "none",
          }}
          onInput={e => {
            const textarea = e.target
            const minHeight = 29
            const maxHeight = 50

            // Reset height to auto to get accurate scrollHeight
            textarea.style.height = "auto"
            const scrollHeight = textarea.scrollHeight
            const hasNewline = textarea.value.includes("\n")

            // If empty or single line (no newline), always set to minHeight to prevent shifting
            if (!textarea.value || !hasNewline) {
              textarea.style.height = `${minHeight}px`
              // textarea.style.overflowY = "hidden"
            } else if (scrollHeight > maxHeight) {
              textarea.style.height = `${maxHeight}px`
              textarea.style.overflowY = "auto"
            } else {
              textarea.style.height = `${scrollHeight}px`
              // textarea.style.overflowY = "hidden"
            }
          }}
          onChange={e => {
            e.preventDefault()
            const inpText = e.target.value
            if (inpText?.length > 250) {
              e.target.value = inpText.slice(0, 250)
              if (!isMaxLengthReached) {
                showNotification({
                  message: t("maxInputCharacters"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                })
                setIsMaxLengthReached(true)
              }
            } else {
              handleOnInputText(inpText)
              if (isMaxLengthReached) {
                setIsMaxLengthReached(false)
              }
            }
          }}
          placeholder={hasStartedRecording ? t("placeholder1") : isConvertingVoiceToText ? t("placeholder2") : t("search_placeholder")}
          name="message-box"
          value={search}
          autoFocus={false}
          disabled={hasStartedRecording || isConvertingVoiceToText}
          ref={textAreaRef}
          onKeyDown={e => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault()
              e.target.form.requestSubmit()
            }
          }}
        />
        {hasStartedRecording && (
          <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center space-x-1 text-red-600 text-sm font-medium pointer-events-none">
            <FaCircle className="text-red-500 animate-pulse text-xs" />
            <span>{formatTime(seconds)}</span>
          </div>
        )}
      </div>
      <button className={`flex items-center justify-center relative ${hasStartedRecording ? "text-red-500" : "text-black"} disabled:text-[#64748b] disabled:cursor-not-allowed cursor-pointer`} onClick={hasStartedRecording ? stopRecording : startRecording}>
        {hasStartedRecording ? <FaRegStopCircle className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]" /> : <IoMicOutline className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[24px] lg:h-[24px]" />}
      </button>
      <button type="submit" disabled={hasStartedRecording || isConvertingVoiceToText} className={`flex items-center justify-center relative md:pl-[6px] pl-[12px] disabled:cursor-not-allowed disabled:text-[#64748b] cursor-pointer ${!disableSendButton ? "text-[#007BFF]" : ""}`}>
        <TbSend2 className="md:w-[18px] md:h-[18px] lg:w-[24px] lg:h-[24px]" />
      </button>
    </form>
  )

  return (
    <>
      <style>{`
        textarea[name="message-box"]:focus::placeholder {
          background-color: transparent !important;
        }
        textarea[name="message-box"]::placeholder {
          background-color: transparent !important;
        }
        textarea[name="message-box"] {
          scrollbar-width: thin;
          scrollbar-color: #9CA3AF transparent;
          line-height: 19px;
          padding-top: 5px;
          padding-bottom: 5px;
        }
        textarea[name="message-box"]::-webkit-scrollbar {
          width: 4px;
        }
        textarea[name="message-box"]::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea[name="message-box"]::-webkit-scrollbar-thumb {
          background-color: #9CA3AF;
          border-radius: 2px;
        }
        textarea[name="message-box"]::-webkit-scrollbar-thumb:hover {
          background-color: #6B7280;
        }
      `}</style>
      <HiddenRecorder />
      <Notification />
      <div id="filters-boundary" className="md:sticky top-0 z-50 flex flex-col lg:flex-row items-stretch lg:items-center p-3 bg-white max-w-[1670px]  w-full rounded-[1rem] shadow-[0_0_4px_rgba(0,0,0,0.2)]">
        <div className="min-h-[40px] flex items-center pt-2 gap-1 w-full lg:w-[75%] overflow-x-auto flex-shrink-0 lg:flex-wrap">

          {!!dropdown_meta?.length
            ? dropdown_meta?.map(({ label, options, key }, index) => (
                <React.Fragment key={`label-${label}-${index}`}>
                  <DropdownSelect key={label} label={label} options={options} selected={filters[key] || "Select a " + label} onChange={value => handleChange(key, value)} />
                </React.Fragment>
              ))
            : null}

          {!!Object.keys(filters).some(key => !!filters[key]?.length) && (
            <button className="min-w-[100px] p-2 rounded-[12px] flex items-center gap-2 text-red-600 bg-red-50" onClick={() => resetFilters()}>
              <X className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>

        <div className="flex justify-end ml-auto relative z-10 w-full lg:w-[25%] mt-7 lg:mt-0">
          <div className="flex flex-col items-start w-full h-[53px]">{searchInput}</div>
        </div>
      </div>
    </>
  )
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

const DropdownSelect = ({ label, options, selected, onChange }) => {
  const selectedCount = Array.isArray(selected) ? selected.length : 0

  return (
  <div className="relative mr-4 flex-shrink-0">
      {selectedCount > 0 && (
        <div className="absolute -top-1 -right-2 z-10 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-500 rounded-full">
          {selectedCount}
        </div>
      )}
    <Select
      options={options.map(x => ({ value: x.value, label: x.display }))}
      value={selected}
      onChange={onChange}
      isMulti
      placeholder={label}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      controlShouldRenderValue={false}
      components={{
        Option: CheckboxOption,
        MenuList: MenuList,
      }}
      styles={{
        control: base => ({
          ...base,
          border: "none",
          background: "rgb(82 82 91 / 1%)",
          boxShadow: "none",
          minHeight: "36px",
          "&:hover": { border: "none" },
        }),
        placeholder: base => ({ ...base, color: "#49454F", gridArea: "1/1/2/3" }),
        valueContainer: base => ({
          ...base,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          padding: "0px 8px",
          overflow: "hidden",
        }),
        input: base => ({
          ...base,
          gridArea: "1/1/2/3",
          margin: 0,
          padding: 0,
        }),
        menu: base => ({
          ...base,
          zIndex: 9999,
        }),
        menuPortal: base => ({
          ...base,
          zIndex: 9999,
        }),
      }}
      className="max-w-[200px] min-w-[128px] bg-gray-100 rounded-[12px] text-zinc-600 text-sm"
    />
  </div>
)
}
