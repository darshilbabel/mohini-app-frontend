

export function getActionListTextTranslation(language) {

    switch(language) {
        case "en":
            return "Action list"
        case "hi":
            return "कार्य सूची"
        default:
            return "Action list"
    }
}

export function getAddOwnButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Add Your Own"
        case "hi":
            return "अपना कार्य डालें"
        default:
            return "Add Your Own"
    }
}

export function getSelectButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Select"
        case "hi":
            return "इस कार्य को चुनें"
        default:
            return "Select"
    }
}

export function getAddActionButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Add Action"
        case "hi":
            return "और कार्य डालें"
        default:
            return "Add Action"
    }
}

export function getActionPlaceholderTranslation(language) {

    switch(language) {
        case "en":
            return "Write action here..."
        case "hi":
            return "यहाँ कार्य लिखें..."
        default:
            return "Write action here..."
    }
}

export function getActionErrorTranslation(language) {
    const defaultText = "Please add at least one action before proceeding."
    switch(language) {
        case "hi":
            return "कृपया आगे बढ़ने से पहले कम से कम एक कार्य जोड़ें।"
        default:
            return defaultText
    }
}

export function getActionDefaultTranslation(language) {

    const englishtDefaultList = [
        {id: "0", content: "Action 1"},
        {id: "1", content: "Action 2"}
    ]

    switch(language) {
        case "en":
            return englishtDefaultList
        case "hi":
            return [
                {id: "0", content: "पहला कार्य"},
                {id: "1", content: "दूसरा कार्य"}
            ]
        default:
            return englishtDefaultList
    }
}

export function getCreateMicroButtonTranslation(language) {

    switch(language) {
        case "en":
            return "Create Micro-Improvement Plan"
        case "hi":
            return "सूक्ष्म-सुधार योजना बनाएं"
        default:
            return "Create Micro-Improvement Plan"
    }
}
