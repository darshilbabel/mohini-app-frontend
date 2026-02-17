import { useRef } from "react"
import { PrimaryButton } from "components/Buttons"
import { IoClose } from "react-icons/io5"
import { useTranslation } from "react-i18next"

const ReportEditor = ({ onClose, onSave, disabled }) => {
  const editorContainerRef = useRef(null)
  const { t } = useTranslation()
  return (
    <div className="voice-chat-editor-overlay" onClick={onClose}>
      <div
        className="voice-chat-editor-content"
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <button onClick={onClose} className="editor-content-button">
          <IoClose className="icon-7" />
        </button>
        <div id="container-editor">
          <div className="container-editor-div">
            <div id="editorjs" ref={editorContainerRef} className="editor-main-div"></div>
          </div>
        </div>
        <div className="editor-button-div">
          <PrimaryButton onClick={onSave} disabled={disabled}>
            {t("saveChanges")}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

export default ReportEditor
