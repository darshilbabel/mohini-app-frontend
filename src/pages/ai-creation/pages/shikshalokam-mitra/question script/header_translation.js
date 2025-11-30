
export function getHeaderText(language) {

    switch(language) {
        case "en":
            return "Discard Creation?"
        case "hi":
            return "योजना समाप्त करें?"
        default:
            return "Discard Creation?"
    }
}

export function getBodyText(language) {

    switch(language) {
        case "en":
            return "Your progress will not be saved if you exit now. Do you want to discard this journey?"
        case "hi":
            return "यदि आप अभी बाहर निकलते हैं, तो आपकी प्रगति सहेजी नहीं जाएगी। क्या आप इस यात्रा को समाप्त करना चाहते हैं?"
        default:
            return "Your progress will not be saved if you exit now. Do you want to discard this journey?"
    }
}

export function getConfirmText(language) {

    switch(language) {
        case "en":
            return "Stay"
        case "hi":
            return "जारी रखें"
        default:
            return "Stay"
    }
}

export function getDiscardText(language) {

    switch(language) {
        case "en":
            return "Discard"
        case "hi":
            return "समाप्त करें"
        default:
            return "Discard"
    }
}
