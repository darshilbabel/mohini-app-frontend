import React from "react";
import PdfViewer from "./PdfViewer";
import { FILE_TYPES } from "../../constants/file";

const FileViewer = ({
  url = "",
  fileName = "",
  fileExtension = "",
  fileType = "",
  visibilityConfig = {},
}) => {
  if (fileType === FILE_TYPES.PDF) {
    return (
      <PdfViewer
        url={url}
        fileName={fileName}
        fileExtension={fileExtension}
        fileType={fileType}
        visibilityConfig={visibilityConfig}
      />
    );
  }
  return null;
};

export default FileViewer;
