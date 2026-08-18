import { createStoryMediaApi } from "api/endpoints"
import { handleS3Upload } from "../services/storage_service"
import { URL_PARAMS } from "../constants/urls"
import { EDITOR_CONFIG_TYPE } from "../constants/editor"
import { useUserDataLocalStore } from "../store"
import axiosInstance from "./axios"
import i18n from "../i18n"

export function extractTextBlocks(formattedContent) {
  if (!formattedContent) return []
  const blocks = JSON.parse(formattedContent)
  if (!blocks || blocks?.length === 0) return []
  return blocks.filter(block => block.type === "paragraph")
}

export const getListAfterHeaderText = (headerText, blocks) => {
  const idx = blocks.findIndex(b => b.type === "header" && b.data.text.trim().toLowerCase() === headerText.toLowerCase())
  if (idx !== -1 && blocks[idx + 1]?.type === "list") {
    const items = blocks[idx + 1].data.items || []
    return items.map(item => (typeof item === "string" ? item : item?.content || ""))
  }
  return []
}

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const getQuestionAnswersFromBlocks = (blocks, editorConfig) => {
  const questionField = editorConfig?.question_field || "question"
  const answerField = editorConfig?.answer_field || "answer"
  // derive the header matcher from the configured prefix, falling back to the legacy "Q<n>:" format
  const headerPrefix = editorConfig?.header_prefix
  const headerRegex = headerPrefix ? new RegExp(`^${headerPrefix.split("{index}").map(escapeRegExp).join("\\d+")}\\s*`) : /^Q\d+:\s*/
  const isQuestionHeader = text => (headerPrefix ? headerRegex.test(text) : (text || "").startsWith("Q"))

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
    if (block.type === "header" && isQuestionHeader(block.data.text)) {
      if (currentQuestion) {
        questionAnswers.push(currentQuestion)
      }

      const questionText = block.data.text.replace(headerRegex, "")
      currentQuestion = { [questionField]: questionText, [answerField]: "" }
    } else if (block.type === "paragraph" && currentQuestion) {
      currentQuestion[answerField] = block.data.text || ""
      questionAnswers.push(currentQuestion)
      currentQuestion = null
    }
  })

  if (currentQuestion) {
    questionAnswers.push(currentQuestion)
  }

  return questionAnswers
}

export function extractStoryData(editorConfig, blocks) {
  if (!editorConfig) return null

  if (editorConfig.type === EDITOR_CONFIG_TYPE.HEADER_LIST_SECTIONS) {
    const result = {}
    editorConfig.sections.forEach(section => {
      result[section.data_key] = getListAfterHeaderText(i18n.t(section.header_i18n_key), blocks)
    })
    return result
  }

  if (editorConfig.type === EDITOR_CONFIG_TYPE.QA) {
    return { [editorConfig.data_key]: getQuestionAnswersFromBlocks(blocks, editorConfig) }
  }

  return null
}

function uploadImage(formData) {
  const accessToken = useUserDataLocalStore.getState().getAccessToken()
  return new Promise((resolve, reject) => {
    createStoryMediaApi({
      token: accessToken,
      data: formData,
    })
      .then(response => resolve(response))
      .catch(error => {
        console.error({ error })
        reject(error)
      })
  })
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

export const handleMultipleUploads = async (e, storyData, files, sessionId, maxImages = 10, perImageSize = 2, flowRoute) => {
  const urlParams = new URLSearchParams(window.location.search)
  // the URL intentionally retains the parent flow, so prefer the caller-supplied active (child) route
  const storageFlow = flowRoute || urlParams.get(URL_PARAMS.FLOW)

  const filesArray = Array.from(e.target.files).filter(file => {
    const fileSizeInMB = file.size / (1024 * 1024)
    return fileSizeInMB <= perImageSize
  })

  // if any files exceed the perImageSize, return an appropriate error
  if (Array.from(e.target.files).some(file => file.size / (1024 * 1024) > perImageSize)) {
    return {
      error: i18n.t("fileSizeTextDyn", { number: perImageSize }),
    }
  }
  const currentFiles = [...files]
  const accessToken = useUserDataLocalStore.getState().getAccessToken()

  if (currentFiles?.length + filesArray.length > maxImages) {
    return {
      error: i18n.t("fileExceedTextDyn", { number: maxImages }),
    }
  }

  const story_id = storyData?.id
  if (!story_id) {
    return
  }

  const maxFileSize = 50 * 1024 * 1024
  const allowedExtensions = new Set(["jpeg", "jpg", "png", "svg", "webp", "heif", "heic"])

  const uploadPromises = filesArray.map(async file => {
    if (file.size > maxFileSize) {
      return {
        error: i18n.t("fileSizeText"),
      }
    }

    const fileName = file.name
    const fileExtension = fileName.split(".").pop().toLowerCase()
    console.log("fileName: ", fileName)
    console.log("fileExtension: ", fileExtension)

    console.log("In promise for file:", fileName)

    if (!allowedExtensions.has(fileExtension)) {
      return {
        error: i18n.t("fileTypeErrorText"),
      }
    }

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

    const uploadedFile = await uploadImage(formData)
    return uploadedFile
  })

  const uploadedFiles = await Promise.allSettled(uploadPromises)
  const validFiles = uploadedFiles.filter(result => result.status === "fulfilled" && result.value).map(result => result.value)

  return {
    files: [...currentFiles, ...validFiles],
  }
}

export const getEditorContentBlocks = (otherParams, editorConfig, editorCopyChanges) => {
  try {
    if (!editorConfig) {
      return (editorCopyChanges || []).map(item => ({ type: item.type, data: { text: item.data.text } }))
    }

    if (editorConfig.type === EDITOR_CONFIG_TYPE.HEADER_LIST_SECTIONS) {
      return editorConfig.sections.flatMap(section => [
        { type: "header", data: { text: i18n.t(section.header_i18n_key), level: section.header_level } },
        {
          type: "list",
          data: {
            style: section.list_style,
            items: otherParams?.[section.data_key]?.length ? otherParams[section.data_key] : [""],
          },
        },
      ])
    }

    if (editorConfig.type === EDITOR_CONFIG_TYPE.QA) {
      const items = otherParams?.[editorConfig.data_key] || []
      return items.flatMap((qa, i) => [
        {
          type: "header",
          data: {
            text: editorConfig.header_prefix.replace("{index}", i + 1) + " " + qa[editorConfig.question_field],
            level: editorConfig.header_level,
          },
        },
        { type: "paragraph", data: { text: qa[editorConfig.answer_field] || "" } },
        ...(editorConfig.spacer_between && i < items.length - 1
          ? [{ type: "paragraph", data: { text: "​" }, readonly: true }]
          : []),
      ])
    }

    return (editorCopyChanges || []).map(item => ({ type: item.type, data: { text: item.data.text } }))
  } catch (error) {
    console.error("Error getting editor content blocks: ", error)
    return []
  }
}
