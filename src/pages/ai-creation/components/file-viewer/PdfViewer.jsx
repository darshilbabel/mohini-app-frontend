import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Document, Page, pdfjs } from "react-pdf";
import { handleShareFile, handleDownloadFile } from "../../utils/file";
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

  const [totalPages, setTotalPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageWidth, setPageWidth] = useState(DEFAULT_FILE_WIDTH);

  const isShareButtonVisible = isShareVisible && !!url?.length;
  const isDownloadButtonVisible = isDownloadVisible && !!url?.length;

  function onDocumentLoadSuccess({ numPages }) {
    setTotalPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error) {
    console.error("Error loading PDF:", error);
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
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
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
            <div>
              <BotMessage primaryMessage={"Here is your Improvement plan"} />
            </div>
            <div className="flex flex-row-reverse gap-2.5 my-5">
              {isDownloadButtonVisible && (
                <button
                  onClick={() =>
                    handleDownloadFile(url, fileName, fileExtension, (error) =>
                      setError(error)
                    )
                  }
                  className="w-[106px] h-[35px] flex items-center justify-center gap-[8px] rounded-md border border-[#572E91] p-2 bg-[#572E91] font-['Manrope'] font-medium text-sm leading-none text-white"
                >
                  <BsDownload />
                  {t("common.download")}
                </button>
              )}
              {isShareButtonVisible && (
                <button
                  onClick={() =>
                    handleShareFile(
                      url,
                      fileName,
                      FILE_EXTENSIONS.PDF,
                      FILE_TYPES.PDF,
                      (error) => setError(error)
                    )
                  }
                  className="w-[79px] h-[35px] flex items-center justify-center gap-[8px] rounded-md border border-[#572E91] p-2 bg-[#572E91] font-['Manrope'] font-medium text-sm leading-none text-white"
                >
                  <IoShareSocialOutline />
                  {t("common.share")}
                </button>
              )}
            </div>
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              width={pageWidth}
            />
          </Document>
        </>
      )}
    </div>
  );
}

export default PdfViewer;
