export function getComfirmButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Yes"
        case "hi":
            return "हाँ"
        default:
            return "Yes"
    }
}

export function getDenyButtonTranslation(language) {

    switch(language) {
        case "en":
            return "No"
        case "hi":
            return "नहीं"
        default:
            return "No"
    }
}


export function getKeyboardButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Use text"
        case "hi":
            return "पाठ का प्रयोग करें"
        default:
            return "Use text"
    }
}

export function getVoiceButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Use voice"
        case "hi":
            return "आवाज का प्रयोग करें"
        default:
            return "Use voice"
    }
}

export function getVoiceStopButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Stop"
        case "hi":
            return "बंद करें"
        default:
            return "Stop"
    }
}

export function getInputPlaceholderTranslation(language) {

    switch(language) {
        case "en":
            return "Type your response here..."
        case "hi":
            return "अपनी प्रतिक्रिया यहां टाइप करें..."
        default:
            return "Type your response here..."
    }
}

export function getExploreTranslation(language) {
    const defaultText = 'Explore'
    switch(language) {
        case "en":
            return defaultText
        case "hi":
            return "खोजें"
        default:
            return defaultText
    }
}
export function getPlaceHolder1(language) {
    const defaultText = 'Listening... Speak now'
    switch(language) {
        case "en":
            return defaultText
        case "hi":
            return "सुन रही हूँ... अब बोलो"
        default:
            return defaultText
    }
}

export function getPlaceHolder2(language) {
    const defaultText = 'Processing speech... Please wait'
    switch(language) {
        case "en":
            return defaultText
        case "hi":
            return "भाषण संसाधित हो रहा है... कृपया प्रतीक्षा करें"
        default:
            return defaultText
    }
}

export function getPlaceHolder3(language) {
    const defaultText = 'Type your message'
    switch(language) {
        case "en":
            return defaultText
        case "hi":
            return "अपना संदेश लिखें"
        default:
            return defaultText
    }
}