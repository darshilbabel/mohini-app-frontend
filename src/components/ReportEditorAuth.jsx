import { useEffect, useRef } from "react"
import UploadImages from "pages/ShikshalokamVoiceChat/upload-images"
import { useUserDataLocalStore } from "../store"
import { useTranslation } from "react-i18next"

const ReportEditorAuth = ({ title, name, location, onSave, stopAllAudio, storyData, isLoading, setIsLoading, fileErrorText, setFileErrorText, isSaving }) => {
  const { t } = useTranslation()

  const editorContainerRef = useRef(null)
  const accessToken = useUserDataLocalStore(state => state.access_token)

  useEffect(() => {
    stopAllAudio()
  }, [])

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-0 max-sm:px-0 z-[100]">
      <div className="bg-gray-100 rounded-lg shadow-lg w-full h-full max-w-2xl p-[30px_0_0] relative" onClick={e => e.stopPropagation()}>
        <div className="overflow-y-auto h-full w-full">
          <div className="px-[73px] max-sm:px-[23px]">
            <h2 className="text-lg font-semibold text-black-700">{t("editorHeading")}</h2>

            <div className="mt-4">
              <h3 className="text-md font-semibold">{title}</h3>
              <p className="text-gray-600 text-sm">
                {name}, {location}
              </p>
            </div>

            <div className="mt-4 h-60 overflow-y-auto">
              <div id="editorjs" ref={editorContainerRef} className=""></div>
            </div>

            <div className="mt-4">
              <UploadImages storyData={storyData} access_token={accessToken} isLoading={isLoading} setIsLoading={setIsLoading} fileErrorText={fileErrorText} setFileErrorText={setFileErrorText} />
            </div>
          </div>
          <div className="w-full flex justify-center py-4 px-[40px] bg-gray-100">
            <button onClick={() => onSave()} disabled={isLoading || isSaving} className="w-full bg-[#212121] text-white py-2 rounded-md hover:bg-black disabled:opacity-50">
              {t("EditorConfirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportEditorAuth
