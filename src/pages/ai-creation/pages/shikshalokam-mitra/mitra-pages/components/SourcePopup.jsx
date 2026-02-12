import React from "react"
import { MdOutlineCancel } from "react-icons/md"
import { GrShare } from "react-icons/gr"

const SourcePopup = ({ isOpen, onClose, sourcesData = {} }) => {
  const { label, chunksList, currentSource } = sourcesData || {}

  const sourceUrl = currentSource?.url || ""

  // Group chunks by chunk text and collect all highlight phrases
  const uniqueChunks = React.useMemo(() => {
    if (!chunksList || chunksList.length === 0) return []

    const chunkMap = new Map()

    chunksList.forEach(item => {
      const chunkText = item.chunk
      if (!chunkMap.has(chunkText)) {
        chunkMap.set(chunkText, {
          chunk: chunkText,
          highlights: [],
        })
      }
      if (item.highlight_text) {
        chunkMap.get(chunkText).highlights.push(item.highlight_text)
      }
    })

    return Array.from(chunkMap.values())
  }, [chunksList])

  if (!isOpen) return null

  const highlightText = (text, highlightPhrases) => {
    if (!highlightPhrases || highlightPhrases.length === 0 || !text) return text

    // Find all occurrences of all highlight phrases
    const matches = []
    highlightPhrases.forEach(phrase => {
      if (!phrase) return
      let startIndex = 0
      while (startIndex < text.length) {
        const index = text.toLowerCase().indexOf(phrase.toLowerCase(), startIndex)
        if (index === -1) break
        matches.push({ start: index, end: index + phrase.length })
        startIndex = index + 1
      }
    })

    if (matches.length === 0) return text

    // Sort matches by start position and merge overlapping ranges
    matches.sort((a, b) => a.start - b.start)
    const merged = []
    matches.forEach(match => {
      if (merged.length === 0 || merged[merged.length - 1].end < match.start) {
        merged.push(match)
      } else {
        merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, match.end)
      }
    })

    // Build the result with highlighted sections
    const result = []
    let lastIndex = 0
    merged.forEach((match, idx) => {
      if (match.start > lastIndex) {
        result.push(text.slice(lastIndex, match.start))
      }
      result.push(
        <mark key={idx} style={{ backgroundColor: "#FFFF00" }}>
          {text.slice(match.start, match.end)}
        </mark>
      )
      lastIndex = match.end
    })
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex))
    }

    return result
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
        {sourceUrl && <div key={sourceUrl} className="flex flex-col px-6 gap-3">
              <a href={sourceUrl || ""} target="_blank" rel="noopener noreferrer">
                <GrShare className="ml-2 w-4 h-4 text-gray-600 inline-block mr-2" />
                <span>Source URL</span>
              </a>
            </div>}
          <div className="mb-2">
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 border rounded-md border-[#DBDBDB] m-6 mt-2">
              {uniqueChunks?.map((item, index) => (
                <div key={index} className="mb-4">
                  <p>{highlightText(item.chunk, item.highlights)}</p>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  )
}

export default SourcePopup
