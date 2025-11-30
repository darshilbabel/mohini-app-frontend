export function getTitleErrorTranslation(language) {
    const defaultText = "The title should not exceed the 100-character limit."

    switch(language) {
        case "en":
            return defaultText;
        case "hi":
            return "टाइटल की लंबाई 100 अक्षरों से अधिक नहीं होनी चाहिए।"
        default:
            return defaultText
    }
}

export function getTitleNumberTranslation(language) {
    const defaultText = "Title should not contain numbers or special characters."

    switch(language) {
        case "en":
            return defaultText;
        case "hi":
            return "शीर्षक में संख्याएँ या विशेष वर्ण नहीं होने चाहिए।"
        default:
            return defaultText
    }
}

export function getEmptyTitleErrorTranslation(language) {
    const defaultText = "Title cannot be empty."

    switch(language) {
        case "en":
            return defaultText;
        case "hi":
            return "टाइटल खाली नहीं हो सकता।"
        default:
            return defaultText
    }
}

export function getTitlePlaceholderTranslation(language) {
    const defaultText = "[AI-generated title]"

    switch(language) {
        case "en":
            return defaultText;
        case "hi":
            return "[ए.आई. द्वारा उत्पन्न टाइटल]"
        default:
            return defaultText
    }
}

export function getCreateLoadingTranslation(language) {

    switch(language) {
        case "en":
            return "Creating your Micro-Improvement Plan..."
        case "hi":
            return "आपका सूक्ष्म-सुधार योजना तैयार की जा रही है..."
        default:
            return "Creating your Micro-Improvement Plan..."
    }
}