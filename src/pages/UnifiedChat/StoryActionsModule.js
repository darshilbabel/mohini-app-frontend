import React, { useState, useEffect, useRef } from "react"
import { MdEdit } from "react-icons/md"
import { GrGallery } from "react-icons/gr"
import { FiDownload } from "react-icons/fi"
import { RxCross2 } from "react-icons/rx"
import { IoClose } from "react-icons/io5"
import EditorJS from "@editorjs/editorjs"
import Header from "@editorjs/header"
import List from "@editorjs/list"
import { useTranslation } from "react-i18next"
import { PrimaryButton } from "../../components/Buttons"
import ChatMessage from "../ShikshalokamMegaPTM/ChatMessage"
import PdfDownloader from "../story/upload-content/pdfDownloader"
import { handleS3Upload } from "../../services/storage_service"
import { createStoryMediaApi, partialUpdateStoryById, updateStoryMediaApi } from "api/endpoints"
import axiosInstance from "../../utils/axios"
import { LANGUAGE_ENUMS } from "../ShikshalokamVoiceChat/enum"
import { sessionFlowName } from "../../constants/session"
import { getStoryBySessionAPI } from "api/endpoints"
import { useSiteDataSessionStore } from "store"
import { useChatStorage, useStorage } from "hooks/useStorage"
import { useUserDataLocalStore } from "store"

// Reusable partialUpdateMedia function

// Reusable uploadImage function
// Photo Upload Component
export const PhotoUploadSection = ({ storyData, files, setFiles, isLoading, setIsLoading, botNameToDisplay, handleOnSpeaking, handleOnStopSpeaking, hasOverRideId, isTalking, isStreamingComplete, setNotMute, navigate, flowConfig }) => {
  const { t } = useTranslation()
  const [fileErrorText, setFileErrorText] = useState("")
  const [isImageUploading, setIsImageUploading] = useState(false)
  const sessionId = useChatStorage()(state => state.sessionId)
  const storageFlow = useChatStorage()(state => state.flow)
  const chatLanguage = useSiteDataSessionStore(state => state.chatLanguage)
  const accessToken = useUserDataLocalStore(state => state.access_token)

  const fileExceedText = t("fileExceedText")
  const fileSizeText = t("fileSizeText")

  const uploadImage = async (formData, setFiles) => {
    try {
      const uploadedFile = await createStoryMediaApi({
        data: formData,
        token: accessToken,
      })

      setFiles(prevFiles => [...prevFiles, uploadedFile])

      return uploadedFile
    } catch (error) {
      console.error({ error })
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const textErrorTime = setTimeout(() => {
      setFileErrorText("")
    }, 5000)

    return () => {
      clearTimeout(textErrorTime)
    }
  }, [fileErrorText])

  const partialUpdateMedia = async (partialUpdateId, include_in_story = false) => {
    try {
      const formData = {
        include_in_story: include_in_story,
        flow: storageFlow,
        access_token: accessToken,
        session: sessionId,
      }
      setIsLoading(true)

      await updateStoryMediaApi({
        mediaId: partialUpdateId,
        data: formData,
        partialUpdate: true,
      })
    } catch (error) {
      console.error({ error })
    } finally {
      setIsLoading(false)
    }
  }

  const convertHeifToJpg = async file => {
    const formData = new FormData()
    formData.append("image", file)

    const response = await axiosInstance.post("api/image-converter/", formData, {
      responseType: "blob",
    })

    const convertedBlob = response.data
    const originalName = file.name.split(".").slice(0, -1).join(".")
    const jpgFile = new File([convertedBlob], `${originalName}.jpg`, {
      type: "image/jpeg",
    })

    return jpgFile
  }

  const handleMultipleUploads = async (e, storyData) => {
    const filesArray = Array.from(e.target.files)
    const currentFiles = [...files]
    console.log("currentFiles", currentFiles)
    console.log("filesArray", filesArray)

    if (currentFiles?.length + filesArray.length > 10) {
      setFileErrorText(fileExceedText)
      return
    }

    const story_id = storyData?.id
    if (!story_id) {
      return
    }

    const maxFileSize = 50 * 1024 * 1024
    const allowedExtensions = ["jpeg", "jpg", "png", "svg", "webp", "heif", "heic"]

    const uploadPromises = filesArray.map(async file => {
      if (file.size > maxFileSize) {
        setFileErrorText(fileSizeText)
        setIsLoading(false)
        throw new Error("File size exceeds limit")
      }

      const fileName = file.name
      const fileExtension = fileName.split(".").pop().toLowerCase()

      if (!allowedExtensions.includes(fileExtension)) {
        setFileErrorText(t("fileTypeErrorText"))
        setIsLoading(false)
        throw new Error("Invalid file type")
      }

      try {
        if (["heic", "heif"].includes(fileExtension)) {
          file = await convertHeifToJpg(file)
        }

        const s3Url = await handleS3Upload(file, fileName, "chatbot/storymedia/", storyData)

        const formData = {
          file_url: s3Url,
          story: story_id,
          name: fileName,
          media_type: file.type,
          include_in_story: true,
          access_token: accessToken,
          flow: storageFlow,
          session: sessionId,
        }

        const uploadedFile = await uploadImage(formData, setFiles)
        return uploadedFile
      } catch (error) {
        console.error({ error })
        setIsLoading(false)
        return null
      } finally {
        setIsLoading(false)
      }
    })

    try {
      const uploadedFiles = await Promise.allSettled(uploadPromises)
      const validFiles = uploadedFiles.filter(result => result.status === "fulfilled" && result.value).map(result => result.value)

      setFiles([...currentFiles, ...validFiles])
    } catch (e) {
      console.error("Upload handling error", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("isLoading", isLoading)
  }, [isLoading])

  return (
    <div className="div13">
      <ChatMessage
        botNameToDisplay={botNameToDisplay}
        userType="bot"
        message={t(`${flowConfig?.uploadPhotoKey}`)}
        isTalking={false}
        handleOnStopSpeaking={() => handleOnStopSpeaking()}
        handleOnSpeaking={() => {
          const lang = chatLanguage
          const message_to_use = flowConfig?.uploadPhotoKey
          handleOnSpeaking(flowConfig?.storyTextAudio?.[lang]?.uploadPhotoAudio, "upload-img-id", {
            msg: message_to_use,
            updated_at: "upload-img-id",
            source: "bot",
          })
        }}
        isAnyPlaying={!!hasOverRideId || isTalking}
        isPlaying={hasOverRideId === "upload-img-id"}
        isStreamingComplete={isStreamingComplete}
        setNotMute={setNotMute}
        chatId={"upload-img-id"}
        isStaticMessage={true}
      />
      <div className="div14">
        <label className="clickable-label" htmlFor="file-upload">
          <GrGallery className="icon-1" />
          <span className="div16">{t("upload")}</span>
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg, image/png, image/svg+xml, image/webp, image/heif, image/heic"
            onChange={e => {
              console.log("e", e)
              setIsLoading(true)
              handleMultipleUploads(e, storyData)
            }}
            onClick={e => {
              if (files?.length >= 10) {
                setFileErrorText(fileExceedText)
              } else {
                setFileErrorText("")
              }
            }}
            disabled={isLoading || isImageUploading || (fileErrorText !== "" && fileErrorText !== fileSizeText && fileErrorText === fileExceedText)}
            className="div17"
          />
        </label>
      </div>

      <div className="div18">
        <p className="li-message">{t("photosLimitMsg")}</p>
      </div>

      {isImageUploading && (
        <div className="div18">
          <p className="li-3">{t("uploadLoadMsg")}</p>
        </div>
      )}

      {files?.length > 0 ? (
        <div className="div18">
          <h4 className="h4-1">{t("uploadedFiles")}:</h4>
          <ul>
            {fileErrorText && <li className="li-1">{fileErrorText}</li>}
            {files.map((file, index) => (
              <li key={index} className="li-2">
                {file.name.slice(0, 20)}
                {file.name.length > 20 && "..."}
                <button
                  className="button-1"
                  onClick={() => {
                    setIsLoading(true)
                    setFiles(prev => prev.filter(f => f.id !== file.id))
                    partialUpdateMedia(file?.id, false)
                  }}
                >
                  <RxCross2 />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="div18">
          <ul>{fileErrorText && <li className="li-1">{fileErrorText}</li>}</ul>
        </div>
      )}
    </div>
  )
}

// Edit Story Modal Component
export const EditStoryModal = ({ isModalOpen, closeModal, storyData, editorCopyChanges, setIsLoading: parentSetIsLoading, isSaving, setIsSaving, access_token, navigate }) => {
  const { t } = useTranslation()
  const editorContainerRef = useRef(null)
  const [editor, setEditor] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const sessionId = useChatStorage()(state => state.sessionId)
  const storageFlow = useChatStorage()(state => state.flow)
  const accessToken = useUserDataLocalStore(state => state.access_token)

  const handleSetIsLoading = value => {
    setIsLoading(value)
    if (parentSetIsLoading) {
      parentSetIsLoading(value)
    }
  }

  useEffect(() => {
    if (!!editorCopyChanges && isModalOpen && storyData) {
      const flow = storageFlow
      let parsed_content = []

      try {
        if (flow && [sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(flow)) {
          const challenges = storyData?.other_params?.challenges_faced || []
          const solutions = storyData?.other_params?.solutions_discussed || []

          parsed_content = [
            {
              type: "header",
              data: {
                text: t("challengesHeader"),
                level: 2,
                customId: "challenges",
              },
            },
            {
              type: "list",
              data: {
                style: "unordered",
                items: challenges.length > 0 ? challenges : [""],
              },
            },
            {
              type: "header",
              data: {
                text: t("solutionsHeader"),
                level: 2,
                customId: "solutions",
              },
            },
            {
              type: "list",
              data: {
                style: "unordered",
                items: solutions.length > 0 ? solutions : [""],
              },
            },
          ]
        } else if (flow && [sessionFlowName.ListeningActivity].includes(flow)) {
          const questionAnswers = storyData?.other_params?.question_answers || []

          parsed_content = []
          questionAnswers.forEach((qa, index) => {
            parsed_content.push({
              type: "header",
              data: {
                text: `Q${index + 1}: ${qa.question}`,
                level: 3,
                customId: `question-${index}`,
              },
            })

            parsed_content.push({
              type: "paragraph",
              data: {
                text: qa.answer || "",
              },
            })

            if (index < questionAnswers.length - 1) {
              parsed_content.push({
                type: "paragraph",
                data: {
                  text: "​",
                },
                readonly: true,
              })
            }
          })
        } else {
          parsed_content = editorCopyChanges.map(item => ({
            type: item.type,
            data: {
              text: item.data.text,
            },
          }))
        }
      } catch (error) {
        parsed_content = []
      }

      if (!document.getElementById("editorjs")) {
        return
      }

      const _editor = new EditorJS({
        holder: "editorjs",
        placeholder: t("editorPlaceholder"),
        autofocus: true,
        hideToolbar: true,
        tools: {
          header: {
            class: Header,
            inlineToolbar: false,
          },
          list: {
            class: List,
            inlineToolbar: false,
            config: {
              defaultStyle: "unordered",
            },
          },
        },
        onReady: () => {
          setEditor(_editor)
          const style = document.createElement("style")
          style.innerHTML = `
            .ce-toolbar__plus, .ce-toolbar__actions { display: none !important; }
            .ce-popover, .ce-settings, .ce-settings__button { display: none !important; }
            .ce-block--selected .ce-block__drag-handle { display: none !important; }
            .ce-inline-toolbar { display: none !important; }
            .ce-block--selected { outline: none !important; }
          `
          document.head.appendChild(style)
        },
        defaultBlock: "paragraph",
        data: {
          blocks: parsed_content.length > 0 ? parsed_content : [{ type: "paragraph", data: { text: "" } }],
        },
        onChange: async (api, event) => {
          setIsSaving(false)
        },
      })
    }

    return () => {
      if (!!Object.keys(editor || {})?.length) editor.destroy()
    }
  }, [editorCopyChanges, isModalOpen, storyData])

  const getListAfterHeaderText = (headerText, blocks) => {
    const idx = blocks.findIndex(b => b.type === "header" && b.data.text.trim().toLowerCase() === headerText.toLowerCase())
    if (idx !== -1 && blocks[idx + 1]?.type === "list") {
      const items = blocks[idx + 1].data.items || []
      return items.map(item => (typeof item === "string" ? item : item?.content || ""))
    }
    return []
  }

  const getQuestionAnswersFromBlocks = blocks => {
    const questionAnswers = []
    let currentQuestion = null

    const filteredBlocks = blocks.filter(block => {
      if (block.type === "paragraph") {
        const text = block.data.text || ""
        const isEmpty = !text.trim() || text === "​" || text === " "
        return !isEmpty
      }
      return true
    })

    filteredBlocks.forEach((block, index) => {
      if (block.type === "header" && block.data.text.startsWith("Q")) {
        if (currentQuestion) {
          questionAnswers.push(currentQuestion)
        }

        const questionText = block.data.text.replace(/^Q\d+:\s*/, "")
        currentQuestion = { question: questionText, answer: "" }
      } else if (block.type === "paragraph" && currentQuestion) {
        currentQuestion.answer = block.data.text || ""
        questionAnswers.push(currentQuestion)
        currentQuestion = null
      }
    })

    if (currentQuestion) {
      questionAnswers.push(currentQuestion)
    }

    return questionAnswers
  }

  if (!isModalOpen) return null

  return (
    <div className="voice-chat-editor-overlay" onClick={closeModal}>
      <div className="voice-chat-editor-content" onClick={e => e.stopPropagation()}>
        <button onClick={closeModal} className="editor-content-button">
          <IoClose className="icon-7" />
        </button>
        <div id="container-editor">
          <div className="container-editor-div">
            <div id="editorjs" ref={editorContainerRef} className="editor-main-div"></div>
          </div>
        </div>
        <div className="editor-button-div">
          <PrimaryButton
            onClick={async () => {
              try {
                handleSetIsLoading(true)
                const outputData = await editor.save()
                const flow = storageFlow

                let updatePayload = {
                  id: storyData?.id,
                  access_token: accessToken,
                  session: sessionId,
                  flow,
                }

                if (flow && [sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(flow)) {
                  const blocks = outputData?.blocks || []
                  const challenges = getListAfterHeaderText(t("challengesHeader"), blocks)
                  const solutions = getListAfterHeaderText(t("solutionsHeader"), blocks)

                  updatePayload = {
                    ...updatePayload,
                    ...storyData?.other_params,
                    other_params: {
                      ...(storyData?.other_params || {}),
                      challenges_faced: challenges,
                      solutions_discussed: solutions,
                    },
                    formatted_content: null,
                  }
                } else if (flow && [sessionFlowName.ListeningActivity].includes(flow)) {
                  const blocks = outputData?.blocks || []
                  const questionAnswers = getQuestionAnswersFromBlocks(blocks)

                  updatePayload = {
                    ...updatePayload,
                    ...storyData?.other_params,
                    other_params: {
                      ...(storyData?.other_params || {}),
                      question_answers: questionAnswers,
                    },
                    formatted_content: null,
                  }
                } else {
                  updatePayload = {
                    ...updatePayload,
                    formatted_content: outputData?.blocks,
                  }
                }

                await partialUpdateStoryById({
                  setter: () => {},
                  loader: setIsSaving,
                  data: updatePayload,
                  token: access_token,
                  storyId: updatePayload.id,
                })

                window.location.reload()
              } catch (error) {
                handleSetIsLoading(false)
                console.error("Saving failed: ", error)
              }
            }}
            disabled={isLoading || isSaving}
          >
            {t("saveChanges")}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

// Download Story Component
export const DownloadStoryButton = ({ sessionid, isLoading: parentIsLoading, isPdfDownloading: parentIsPdfDownloading, setIsLoading, setIsPdfDownloading, access_token, t }) => {
  const [triggerDownload, setTriggerDownload] = useState(false)
  const [storyData, setStoryData] = useState(null)
  const isLoading = parentIsLoading
  const isPdfDownloading = parentIsPdfDownloading

  useEffect(() => {
    if (sessionid) {
      getStoryBySessionAPI(sessionid).then(story_data => {
        if (story_data && story_data?.length > 0 && story_data[0]) {
          setStoryData(story_data[0])
        }
      })
    }
  }, [sessionid])

  const pdfDownloadSidebar = async sessionid => {
    try {
      setIsLoading(true)
      setIsPdfDownloading(true)

      const story = await getStoryBySessionAPI(sessionid)
      const story_media = story[0]?.story_media
      const pdfMedia = story_media?.filter(media => media.media_type === "application/pdf") || []

      const pdfFileName = story[0]?.title + ".pdf"
      const fileUrl = pdfMedia[0]?.public_url

      if (fileUrl && pdfFileName) {
        const response = await fetch(fileUrl)

        if (response.ok) {
          const reader = response.body.getReader()
          const chunks = []

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
          }

          const blob = new Blob(chunks)
          const a = document.createElement("a")
          const url = window.URL.createObjectURL(blob)
          a.href = url
          a.download = pdfFileName
          document.body.appendChild(a)
          a.click()

          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error("Error downloading file:", error)
    } finally {
      setIsPdfDownloading(false)
      setIsLoading(false)
    }
  }

  const handleDownloadStop = () => {
    setTriggerDownload(false)
    setIsLoading(false)
    setIsPdfDownloading(false)
    window.location.reload()
  }

  return (
    <>
      <div className="div20">
        <button
          className="clickable-button"
          onClick={() => {
            if (sessionid) {
              pdfDownloadSidebar(sessionid)
            }
          }}
          disabled={isLoading || isPdfDownloading}
        >
          <div className="download-story-div">
            <FiDownload className="icon-1" />
            <span className="div16">{t("downloadStoryText")}</span>
          </div>
        </button>
      </div>
      {triggerDownload && isPdfDownloading && !isLoading && storyData && <PdfDownloader key={new Date().getTime()} storyData={storyData} isShikshalokam={true} downloadTriggered={triggerDownload} handleDownloadStop={handleDownloadStop} />}
    </>
  )
}

// Edit Story Button Component
export const EditStoryButton = ({ openModal, isLoading, isPdfDownloading, t }) => {
  return (
    <div className="div20">
      <button className="clickable-button" onClick={openModal} disabled={isLoading || isPdfDownloading}>
        <div className="download-story-div">
          <MdEdit className="icon-1" />
          <span className="div16">{t("editStoryText")}</span>
        </div>
      </button>
    </div>
  )
}

// Story Actions Container Component
export const StoryActionsContainer = ({
  botNameToDisplay,
  handleOnSpeaking,
  handleOnStopSpeaking,
  hasOverRideId,
  isTalking,
  isStreamingComplete,
  setNotMute,
  sessionid,
  openModal,
  isLoading,
  isPdfDownloading,
  setIsLoading,
  setIsPdfDownloading,
  access_token,
  flowConfig,
  showDownload = true, // Add this
  showEdit = true, // Add this
  t,
}) => {
  const chatLanguage = useSiteDataSessionStore(state => state.chatLanguage)

  return (
    <div className="div19">
      <ChatMessage
        botNameToDisplay={botNameToDisplay}
        userType="bot"
        message={t("storyText")}
        isTalking={false}
        handleOnStopSpeaking={() => handleOnStopSpeaking()}
        handleOnSpeaking={() => {
          const lang = chatLanguage || LANGUAGE_ENUMS.ENGLISH
          console.log("lang", lang)
          const message_to_use = t("storyText")
          handleOnSpeaking(flowConfig?.storyTextAudio[lang].storyReportAudio, "download-story-id", {
            msg: message_to_use,
            updated_at: "download-story-id",
            source: "bot",
          })
        }}
        isAnyPlaying={!!hasOverRideId || isTalking}
        isPlaying={hasOverRideId === "download-story-id"}
        isStreamingComplete={isStreamingComplete}
        setNotMute={setNotMute}
        chatId={"download-story-id"}
        isStaticMessage={true}
      />
      {showDownload && <DownloadStoryButton sessionid={sessionid} isLoading={isLoading} isPdfDownloading={isPdfDownloading} setIsLoading={setIsLoading} setIsPdfDownloading={setIsPdfDownloading} access_token={access_token} t={t} />}
      {showEdit && <EditStoryButton openModal={openModal} isLoading={isLoading} isPdfDownloading={isPdfDownloading} t={t} />}
    </div>
  )
}
