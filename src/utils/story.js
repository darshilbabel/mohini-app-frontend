import { createStoryMediaApi } from "api/endpoints"
import { handleS3Upload } from "../services/storage_service"
import { sessionFlowName } from "../constants/session"
import { URL_PARAMS } from "../constants/urls"
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

export const getQuestionAnswersFromBlocks = blocks => {
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

export function extractStoryData(flow, blocks) {
  if (!flow) return null

  if ([sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(flow)) {
    const challenges = getListAfterHeaderText(i18n.t("challengesHeader"), blocks)
    const solutions = getListAfterHeaderText(i18n.t("solutionsHeader"), blocks)

    return {
      challenges_faced: challenges,
      solutions_discussed: solutions,
    }
  } else if ([sessionFlowName.ListeningActivity].includes(flow)) {
    const questionAnswers = getQuestionAnswersFromBlocks(blocks)

    return {
      question_answers: questionAnswers,
    }
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

export const handleMultipleUploads = async (e, storyData, files, sessionId, maxImages = 10, perImageSize = 2) => {
  const urlParams = new URLSearchParams(window.location.search)
  const storageFlow = urlParams.get(URL_PARAMS.FLOW)

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

export const getEditorContentBlocks = (otherParams, storageFlow, editorCopyChanges) => {
  try {
    if (!otherParams || !storageFlow) return []
    let parsed_content = []

    if ([sessionFlowName.LoginDiscussion, sessionFlowName.GuestDiscussion].includes(storageFlow)) {
      const challenges = otherParams?.challenges_faced || []
      const solutions = otherParams?.solutions_discussed || []

      parsed_content = [
        {
          type: "header",
          data: {
            text: i18n.t("challengesHeader"),
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
            text: i18n.t("solutionsHeader"),
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
    } else if ([sessionFlowName.ListeningActivity].includes(storageFlow)) {
      const questionAnswers = otherParams?.question_answers || []

      parsed_content = []
      questionAnswers.forEach((qa, index) => {
        // Add question header
        parsed_content = [
          ...parsed_content,
          {
            type: "header",
            data: {
              text: `Q${index + 1}: ${qa.question}`,
              level: 3,
              customId: `question-${index}`,
            },
          },
          {
            type: "paragraph",
            data: {
              text: qa.answer || "",
            },
          },
        ]

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

    return parsed_content
  } catch (error) {
    console.error("Error getting editor content blocks: ", error)
    return []
  }
}
