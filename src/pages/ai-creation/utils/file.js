import { DEFAULT_FILE_NAME, FILE_EXTENSIONS, FILE_TYPES } from "../constants/file";
import { showNotification } from "../../../components/ToastMessage/TotastMessage";

export const getFileName = (fileName = DEFAULT_FILE_NAME, fileExtension = FILE_EXTENSIONS.PDF) => {
    const ext = (fileExtension || FILE_EXTENSIONS.PDF).replace(/^\./, '').toLowerCase();
    if (fileName.toLowerCase().endsWith(`.${ext}`)) {
        return fileName;
    }
    return `${fileName}.${ext}`;
};

const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const notifyUrlCopied = fullFileName =>
  showNotification({
    message: `${fullFileName} URL copied to clipboard!`,
    type: "success",
    options: {
      autoClose: 3000,
      position: "top-center",
      style: { fontWeight: "bold", color: "#1D1616" },
    },
  })

export const handleShareFile = async (
    url = "",
    fileName = "",
    fileExtension = "",
    fileType = "",
    onError,
    t
) => {
    const fullFileName = getFileName(fileName, fileExtension);
    console.group("handleShareFile");
    console.log("URL:", url);
    console.log("File name:", fullFileName);
    console.log("navigator.share:", !!navigator.share);
    console.log("navigator.canShare:", !!navigator.canShare);
    console.log("navigator.clipboard:", !!navigator.clipboard);
    console.log("User agent:", navigator.userAgent);
    console.log("Is secure context:", window.isSecureContext);
    
    try {
        if (navigator.share) {
            let file;

            try {
                console.log("Fetching file...");
                const response = await fetch(url);
                console.log("Fetch status:", response.status);

                if (response.ok) {
                    const blob = await response.blob();
                    console.log("Blob type:", blob.type);
                    console.log("Blob size (bytes):", blob.size);

                    file = new File([blob], fullFileName, {
                        type: fileType || blob.type,
                    });

                    console.log("File created:", file);
                }
            } catch (e) {
                console.warn("File fetch failed:", e);
            }

            if (
                file &&
                navigator.canShare &&
                navigator.canShare({ files: [file] })
            ) {
                console.log("Sharing FILE...");
                await navigator.share({
                    files: [file],
                    title: t("common.shareTitle") || "Improvement Plan",
                    text: t("common.shareMessage") || "Check out this improvement plan",
                });
                console.log("File shared successfully");
                return;
            }

            console.log("Sharing URL...");
            await navigator.share({
                title: t("common.shareTitle") || "Improvement Plan",
                text: t("common.shareMessage") || "Check out this improvement plan",
                url,
            });
            console.log("URL shared successfully");
            return;
        }

        console.warn("navigator.share not available, copying URL...");
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            notifyUrlCopied(fullFileName);
        } else {
            onError?.(`Sharing not supported on this device.`);
        }
    } catch (error) {
        console.error("Share error:", error);
        console.log("Error name:", error?.name);
        console.log("Error message:", error?.message);

        if (error?.name === "AbortError") {
            console.log("User cancelled share");
            return;
        }

        try {
            console.log("Falling back to clipboard...");
            if (!navigator.clipboard) {
                throw new Error("Clipboard API not available");
            }
            await navigator.clipboard.writeText(url);
            notifyUrlCopied(fullFileName);
        } catch (clipboardError) {
            console.error("Clipboard failed:", clipboardError);
            onError?.(`Failed to share ${fullFileName}.`);
        }
    } finally {
        console.groupEnd();
    }
};

export const handleDownloadFile = async (
    url = "",
    fileName = "",
    fileExtension = "",
    onError
) => {
    const fullFileName = getFileName(fileName, fileExtension);
    try {
        // Fetch the PDF file from the URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch PDF");
        }

        // Convert the response to a blob
        const blob = await response.blob();

        // Create a download link
        const link = document.createElement("a");
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        link.download = fullFileName;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Error downloading PDF:", error);
        onError?.(`Failed to download ${fullFileName}.`);
    }
};