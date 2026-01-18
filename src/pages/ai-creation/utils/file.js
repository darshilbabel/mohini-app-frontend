import { DEFAULT_FILE_NAME, FILE_EXTENSIONS, FILE_TYPES } from "../constants/file";
import { showNotification } from "../../../components/ToastMessage/TotastMessage";

export const getFileName = (fileName = DEFAULT_FILE_NAME, fileExtension = FILE_EXTENSIONS.PDF) => {
    return `${fileName}.${fileExtension.toLowerCase()}`;
};

const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const handleShareFile = async (
    url = "",
    fileName = "",
    fileExtension = "",
    fileType = "",
    onError
) => {
    const fullFileName = getFileName(fileName, fileExtension);
    
    if (!isMobileDevice()) {
        try {
            await navigator.clipboard.writeText(url);
            showNotification({
                message: `${fullFileName} URL copied to clipboard!`,
                type: "success",
                options: { 
                    autoClose: 3000,
                    position: "top-center",
                    style: { fontWeight: "bold", color: "#1D1616" }
                }
            });
            return;
        } catch (clipboardError) {
            onError?.(`Failed to copy ${fullFileName} URL to clipboard.`);
            return;
        }
    }
    
    try {
        if (navigator.share) {
            // Fetch the PDF file from the URL
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch PDF");
            }

            // Convert the response to a blob
            const blob = await response.blob();

            // Create a File object from the blob
            const file = new File([blob], fullFileName, {
                type: fileType || FILE_TYPES.PDF,
            });

            // Share the file using Web Share API
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Improvement Plan",
                    text: "Check out this improvement plan",
                });
            } else {
                // Fallback: share URL if file sharing is not supported
                await navigator.share({
                    title: "Improvement Plan",
                    text: "Check out this improvement plan",
                    url: url,
                });
            }
        } else {
            // Fallback: copy URL to clipboard if Web Share API is not available
            await navigator.clipboard.writeText(url);
            showNotification({
                message: `${fullFileName} URL copied to clipboard!`,
                type: "success",
                options: { 
                    autoClose: 3000,
                    position: "top-center",
                    style: { fontWeight: "bold", color: "#1D1616" }
                }
            });
        }
    } catch (error) {
        // User cancelled the share or error occurred
        if (error.name !== "AbortError") {
            console.error("Error sharing PDF:", error);
            // Fallback: try to copy URL to clipboard
            try {
                await navigator.clipboard.writeText(url);
                showNotification({
                    message: `${fullFileName} URL copied to clipboard!`,
                    type: "success",
                    options: { 
                        autoClose: 3000,
                        position: "top-center",
                        style: { fontWeight: "bold", color: "#1D1616" }
                    }
                });
            } catch (clipboardError) {
                onError?.(`Failed to share ${fullFileName}.`);
            }
        }
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