

export function getFirstPageMessages(userDetail, userInput, userProblemStatement, language) {
    if (language === 'en') {
        return {
            0: [
                { role: "bot", message: `Hi, ${userDetail.name}!`, messageId: '0_0' },
                { role: "bot", message: "What challenge in your school do you want to solve for today?", messageId: '0_1' }
            ],
            1: [
                { role: "user", message: userInput[0], messageId: '1_0' },
                { role: "bot", message: `Here's how I understand your challenge: ${userProblemStatement}`, messageId: '1_1' },
                { role: "bot", message: "Is this correct?", messageId: '1_2' }
            ],
            2: [
                { role: "user", message: userInput[1], messageId: '2_0' },
                {
                    role: "bot",
                    message: "Let's try again. Could you tell me about the challenge you are facing in more detail? I'll do my best to help you find the right solution!",
                    messageId: '2_1'
                },
            ],
            3: [
                {
                    role: "user",
                    message: userInput[2] ?? userInput[1],
                    messageId: '3_0'
                },
            ],
            10: [
                {
                    role: "bot",
                    message: "Would you like to rephrase the challenge you are facing?",
                    messageId: '10_0'
                },
            ],
            11: [
                {
                    role: "bot",
                    message: "My focus is on helping schools grow. Can you tell me about a school-focused problem?",
                    messageId: '11_0'
                },
            ],
            12: [
                {
                    role: "bot",
                    message: "Glad to hear that! To discover improvements relevant to you, start exploring here",
                    messageId: '12_0'
                },
            ]
        };
    } else if (language === 'hi') {
        return {
            0: [
                { role: "bot", message: `नमस्ते, ${userDetail.name}!`, messageId: '0_0' },
                { role: "bot", message: "आज आप अपने विद्यालय में कौन सी समस्या का समाधान करना चाहते हैं?", messageId: '0_1' }
            ],
            1: [
                { role: "user", message: userInput[0], messageId: '1_0' },
                { role: "bot", message: `मैंने आपकी समस्या को इस प्रकार समझा है: ${userProblemStatement}`, messageId: '1_1' },
                { role: "bot", message: "क्या यह सही है?", messageId: '1_2' }
            ],
            2: [
                { role: "user", message: userInput[1], messageId: '2_0' },
                {
                    role: "bot",
                    message: "आइए फिर से कोशिश करें। क्या आप मुझे अपनी समस्या के बारे में अधिक विस्तार से बता सकते हैं? मैं सही समाधान खोजने में आपकी पूरी मदद करूंगा!",
                    messageId: '2_1'
                },
            ],
            3: [
                {
                    role: "user",
                    message: userInput[2] ?? userInput[1],
                    messageId: '3_0'
                },
            ],
            10: [
                {
                    role: "bot",
                    message: "क्या आप अपनी समस्या को दोबारा स्पष्ट करना चाहेंगे?",
                    messageId: '10_0'
                },
            ],
            11: [
                {
                    role: "bot",
                    message: "मेरा ध्यान स्कूलों को बढ़ाने में मदद करने पर है। क्या आप मुझे स्कूल से जुड़ी किसी समस्या के बारे में बता सकते हैं?",
                    messageId: '11_0'
                },
            ],
            12: [
                {
                    role: "bot",
                    message: "यह सुनकर खुशी हुई! आपके लिए प्रासंगिक सूक्ष्म सुधारों को खोजने के लिए, यहाँ से खोज शुरू करें।",
                    messageId: '12_0'
                },
            ]
        };
    }
};



export function getSecondPageMessages(language) {
    if (language === 'en') {
        return {
            4: [
                {
                    role: "bot",
                    message: "These are some objectives that could help address your challenge.",
                    messageId: '4_0'
                },
                {
                    role: "bot",
                    message: "Select one to get started.",
                    messageId: '4_1'
                },
            ],
            5: [
                { role: "bot", message: "Enter your objective", messageId: '5_0' },
            ],
        };
    } else if (language === 'hi') {
        return {
            4: [
                {
                    role: "bot",
                    message: "ये कुछ उद्देश्य हैं जो आपकी समस्या का समाधान करने में मदद कर सकते हैं।",
                    messageId: '4_0'
                },
                {
                    role: "bot",
                    message: "आगे बढ़ने के लिए एक चुनें",
                    messageId: '4_1'
                },
            ],
            5: [
                { role: "bot", message: "अपना उद्देश्य दर्ज करें", messageId: '5_0' },
            ],
        };

    }
}


export function getThirdPageMessages(language, add_own = false) {
    if (language === 'en') {
        return {
            6: [
                {
                    role: "bot",
                    message: "Great choice! To achieve your objective, here are some actions you can take.",
                    messageId: '6_0'
                },
                {
                    role: "bot",
                    message: "Select one to get started.",
                    messageId: '6_1'
                },
            ],
            7: add_own ?
                [
                    { role: "bot", message: "Craft your own action plan", messageId: '7_0' },
                    {
                        role: "bot",
                        message: "Add each step you'd like to take.",
                        messageId: '7_1'
                    },
                ] : [
                    { role: "bot", message: "Finalize Action List", messageId: '7_0' },
                    {
                        role: "bot",
                        message: "You can edit, reorder, delete actions, or add your own to create the perfect plan!",
                        messageId: '7_1'
                    },
                ],
        };
    } else if (language === 'hi') {
        return {
            6: [
                {
                    role: "bot",
                    message: "बेहतरीन चयन! अपने उद्देश्य को प्राप्त करने के लिए आप ये कदम उठा सकते हैं।",
                    messageId: '6_0'
                },
                {
                    role: "bot",
                    message: "आगे बढ़ने के लिए एक चुनें",
                    messageId: '6_1'
                },
            ],
            7: add_own ?
                [
                    { role: "bot", message: "अपनी स्वयं की कार्य योजना बनाएं", messageId: '7_0' },
                    {
                        role: "bot",
                        message: "वह प्रत्येक चरण जोड़ें जो आप उठाना चाहते हैं।",
                        messageId: '7_1'
                    },
                ] : [
                    { role: "bot", message: "क्रिया सूची को अंतिम रूप दें", messageId: '7_0' },
                    {
                        role: "bot",
                        message: "आप क्रियाओं को संपादित, पुनः क्रमबद्ध, हटाकर या अपनी स्वयं की क्रियाएं जोड़कर आदर्श योजना बना सकते हैं!",
                        messageId: '7_1'
                    },
                ],
        };

    }

}

export function getFourthPageMessages(language) {
    if (language === 'en') {
        return {
            8: [
                {
                    role: "bot",
                    message: "How many weeks would you like to dedicate to this improvement?",
                    messageId: '8_0'
                },
                {
                    role: "bot",
                    message: "Slide to select.",
                    messageId: '8_1'
                },

            ],
        };
    } else if (language === 'hi') {
        return {
            8: [
                {
                    role: "bot",
                    message: "इस सुधार के लिए आप कितने सप्ताह समर्पित करना चाहेंगे?",
                    messageId: '8_0'
                },
                {
                    role: "bot",
                    message: "स्लाइड करके चयन करें।",
                    messageId: '8_0'
                },
            ],
        };

    }
}


export function getFifthPageMessages(language) {
    if (language === 'en') {
        return {
            9: [
                {
                    role: "bot",
                    message: "Here is the title for your improvement journey.",
                    messageId: '9_0'
                },
                {
                    role: "bot",
                    message: "You can edit it if you'd like.",
                    messageId: '9_1'
                },

            ],
        };
    } else if (language === 'hi') {
        return {
            9: [
                {
                    role: "bot",
                    message: "यह आपके सुधार यात्रा का शीर्षक है।",
                    messageId: '9_0'
                },
                {
                    role: "bot",
                    message: "आप यदि चाहें तो इसे संपादित कर सकते हैं।",
                    messageId: '9_1'
                },
            ],
        };

    }
}
