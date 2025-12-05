

export function getNextButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Next"
        case "hi":
            return "आगे बड़े"
        default:
            return "Next"
    }
}

export function getAddOwnButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Add Your Own"
        case "hi":
            return "अपना उद्देश्य डालें"
        default:
            return "Add Your Own"
    }
}

export function getSuggestMoreButtonTranslation(language) {
    const defaultEnglishText = "Suggest More?"
    switch(language) {
        case "en":
            return defaultEnglishText
        case "hi":
            return "और सुझाव दें?"
        default:
            return defaultEnglishText
    }
}

export function getOrTextTranslation(language) {

    switch(language) {
        case "en":
            return "Or"
        case "hi":
            return "या"
        default:
            return "Or"
    }
}

export function getContinueButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Continue"
        case "hi":
            return "जारी रखें"
        default:
            return "Continue"
    }
}

export function getObjectiveTextTranslation(language) {

    switch(language) {
        case "en":
            return "Objectives"
        case "hi":
            return "उद्देश्य"
        default:
            return "Objectives"
    }
}

export function getObjectivePlaceholderTranslation(language) {

    switch(language) {
        case "en":
            return "Enter objectives"
        case "hi":
            return "उद्देश्य दर्ज करें"
        default:
            return "Enter objectives"
    }
}

export function getObjectiveEmptyTranslation(language) {

    switch(language) {
        case "en":
            return "Please enter an objective!"
        case "hi":
            return "कृपया एक उद्देश्य दर्ज करें!"
        default:
            return "Please enter an objective!"
    }
}