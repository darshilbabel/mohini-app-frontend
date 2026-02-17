import { BiTrash } from "react-icons/bi"
import { GoPlusCircle } from "react-icons/go"
import { handleMultipleUploads } from "../../../utils/story"
import { updateStoryMediaApi } from "api/endpoints"
import { useChatStorage } from "hooks/useStorage"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useUserDataLocalStore } from "store"

const UploadImages = ({ storyData, access_token, isLoading, setIsLoading, showImages = false, fileErrorText, setFileErrorText }) => {
  const { t } = useTranslation()
  const fileExceedText = t("fileExceedText")

  const [files, setFiles] = useState([])

  const accessToken = useUserDataLocalStore(state => state.access_token)
  const sessionId = useChatStorage()(state => state.sessionId)
  const storageFlow = useChatStorage()(state => state.flow)

  async function partialMediaUpdate(updateId, include_in_story = false) {
    try {
      setFiles(prev => prev.filter(f => f.id !== updateId))
      const formData = {
        include_in_story: include_in_story,
        flow: storageFlow,
        access_token: accessToken,
        session: sessionId,
      }
      await updateStoryMediaApi({ token: accessToken, data: formData, mediaId: updateId, partialUpdate: true })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (fileErrorText !== "") {
      setIsLoading(false)
    }
    const textErrorTime = setTimeout(() => {
      setFileErrorText("")
    }, 5000)

    return () => {
      clearTimeout(textErrorTime)
    }
  }, [fileErrorText])

  return (
    <div className="mt-4">
      <div className="text-md font-bold text-black-500 mb-2">{t("uploadImagesStory")}</div>
      <div className="flex items-center gap-2 mb-4">
        <label className="cursor-pointer flex flex-col gap-2 text-purple-600 hover:text-purple-800">
          <span className="flex items-center">
            <span className="text-lg font-bold">
              <GoPlusCircle />
            </span>
            <span className="text-md font-bold pl-[2px]">{t("addImage")}</span>
          </span>
          {fileErrorText && <span className="text-red-500 block px-2">{fileErrorText}</span>}
          <input
            type="file"
            className="hidden"
            accept="image/jpeg, image/png, image/svg+xml, image/webp, image/heif, image/heic"
            onChange={async e => {
              const selected = Array.from(e.target.files || [])

              // User canceled -> do nothing
              if (!selected.length) return

              setIsLoading(true)

              try {
                const uploadedFiles = await handleMultipleUploads(e, storyData, files, sessionId)
                if (uploadedFiles && uploadedFiles.error) {
                  setFileErrorText(uploadedFiles.error)
                }
                if (uploadedFiles && uploadedFiles.files) {
                  setFiles(uploadedFiles.files)
                }
              } catch (err) {
                console.error(err)
                setFileErrorText(t("somethingWentWrong") || "Upload failed")
              } finally {
                setIsLoading(false)
                // Reset input value so user can pick the same file again
                e.target.value = ""
              }
            }}
            onClick={e => {
              if (files?.length >= 10) {
                setFileErrorText(fileExceedText)
              } else {
                setFileErrorText("")
              }
            }}
            disabled={isLoading || (fileErrorText !== "" && fileErrorText === fileExceedText)}
          />
        </label>
      </div>

      <div className="mb-2">
        <p className="text-sm text-gray-600">{t("photosLimitMsg")}</p>
      </div>

      {/* Conditional rendering based on showImages prop */}
      {showImages ? (
        // Show actual images
        <div className="grid grid-cols-3 max-sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {files?.map((image, index) => (
            <div key={index} className="relative group bg-gray-200 rounded-lg overflow-hidden">
              <img src={image?.public_url} alt="Uploaded" className="w-full h-32 object-cover" />
              <button className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => partialMediaUpdate(image?.id, false, access_token, setIsLoading)}>
                <BiTrash className="text-white text-2xl" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        // Show file names only
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {files?.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-0 rounded-lg">
              <span className="text-sm font-medium text-gray-700 truncate">{file.name || `Image ${index + 1}`}</span>
              <button className="text-red-500 hover:text-red-700 p-1" onClick={() => partialMediaUpdate(file?.id, false, access_token, setIsLoading)}>
                <BiTrash className="text-lg" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">{t("uploadedFiles")}:</h4>
          <div className="text-sm text-gray-600">
            {files.length}/10 {t("filesUploadedMessage")}
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadImages
