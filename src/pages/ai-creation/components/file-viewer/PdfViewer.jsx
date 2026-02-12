import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Document, Page, pdfjs } from "react-pdf";
import { handleShareFile, handleDownloadFile } from "../../utils/file";
import FileActionDropdown from "../file-viewer/FileActionDropdown";
import {
  FILE_TYPES,
  DEFAULT_FILE_WIDTH,
  FILE_EXTENSIONS,
} from "../../constants/file";
import { IoShareSocialOutline } from "react-icons/io5";
import { BsDownload } from "react-icons/bs";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import BotMessage from "../../pages/shikshalokam-mitra/mitra-pages/components/chat-message/BotMessage";
import { useAICreationSessionStore } from "store";
import { trackSolutionDownload } from "api/endpoints/analytics";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfViewer({
  url = "",
  fileName,
  fileExtension,
  fileType,
  visibilityConfig = {},
}) {
  const { t } = useTranslation("ai_creation_translation");

  const {
    isShareVisible = true,
    isDownloadVisible = true,
    showBotMessage = true,
  } = visibilityConfig;
  const media = useAICreationSessionStore((state) => state.media);

  const [totalPages, setTotalPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageWidth, setPageWidth] = useState(DEFAULT_FILE_WIDTH);

  const isShareButtonVisible = isShareVisible && media.length > 0;
  const isDownloadButtonVisible = isDownloadVisible && media.length > 0;

  const projectId = useAICreationSessionStore((state) => state.projectId);


  const handleDownloadSelect = (media) => {
  const extension = media.file_name.split(".").pop();

  trackSolutionDownload(projectId);
  handleDownloadFile(
    media.url,
    media.file_name,
    extension,
    setError
  );
};

const handleShareSelect = (media) => {
  const extension = media.file_name.split(".").pop();

  handleShareFile(
    media.url,
    media.file_name,
    extension,
    media.media_type,
    setError,
    t
  );
};

  function onDocumentLoadSuccess({ numPages }) {
    setTotalPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(err) {
    console.error("Error loading PDF:", err);
    setError("Failed to load PDF. Please try again.");
    setLoading(false);
  }

  function goToPrevPage() {
    setPageNumber((prev) => Math.max(1, prev - 1));
  }

  function goToNextPage() {
    setPageNumber((prev) => Math.min(totalPages, prev + 1));
  }

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth > 768) {
        setPageWidth(DEFAULT_FILE_WIDTH);
      } else {
        setPageWidth(window.innerWidth - 40);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);


  return (
    <div className="flex flex-col items-center">
      {error && <p className="text-red-500">{error}</p>}

      {!error && (
        <>
          {!!(totalPages && totalPages > 1) && (
            <div className="mb-2.5 flex gap-2.5 items-center">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="px-4 py-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("common.previous")}
              </button>
              <p>
                Page {pageNumber} of {totalPages}
              </p>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= totalPages}
                className="px-4 py-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("common.next")}
              </button>
            </div>
          )}

          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div>Loading PDF...</div>}
          >
            {showBotMessage && (
              <BotMessage primaryMessage="Here is your Improvement plan" />
            )}

            <div className="flex flex-row-reverse gap-2.5 my-5">
              {isDownloadButtonVisible && (
                <FileActionDropdown
                  label={t("common.download")}
                  icon={BsDownload}
                  options={media}
                  onSelect={handleDownloadSelect}
                />
              )}

              {isShareButtonVisible && (
                <FileActionDropdown
                  label={t("common.share")}
                  icon={IoShareSocialOutline}
                  options={media}
                  onSelect={handleShareSelect}
                />
              )}
            </div>

            <Page
              pageNumber={pageNumber}
              renderTextLayer
              renderAnnotationLayer
              width={pageWidth}
            />
          </Document>
        </>
      )}
    </div>
  );
}

export default PdfViewer;
