import React from "react"
import { MdOutlineCancel } from "react-icons/md"
import { GrShare } from "react-icons/gr"
import { CiMedicalCase } from "react-icons/ci"

const SourcePopup = ({ isOpen, onClose, sourcesData = {} }) => {
  if (!isOpen) return null

  const { label, sourcesList } = sourcesData || {}

  const sourceUrls = sourcesList?.map(source => source?.url)

  const highlightText = (text, highlightPhrase) => {
    if (!highlightPhrase || !text) return text

    const index = text.toLowerCase().indexOf(highlightPhrase.toLowerCase())
    if (index === -1) return text

    const before = text.slice(0, index)
    const match = text.slice(index, index + highlightPhrase.length)
    const after = text.slice(index + highlightPhrase.length)

    return (
      <>
        {before}
        <mark style={{ backgroundColor: "#FFFF00" }}>{match}</mark>
        {after}
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Popup Content */}
      <div className="overflow-scroll relative bg-white rounded-[20px] shadow-lg w-[90%] max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h3 className="text-xl font-semibold text-gray-900">{label || ""}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <MdOutlineCancel className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {!!(sourceUrls?.length > 0) &&
          sourceUrls?.map(sourceUrl => (
            <div key={sourceUrl} className="flex flex-col px-6 gap-3">
              <a href={sourceUrl || ""} target="_blank" rel="noopener noreferrer">
                <GrShare className="ml-2 w-4 h-4 text-gray-600 inline-block mr-2" />
                <span>Source URL</span>
              </a>
            </div>
          ))}
        {sourcesList?.map(source => (
          <div key={source.source_id} className="mb-2">
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 border rounded-md border-[#DBDBDB] m-6 mt-2">
              {source?.chunks?.map((chunk, index) => (
                <div key={index}>
                  <p>{highlightText(chunk.chunk, chunk.highlight_text)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SourcePopup
