import { API_ENDPOINTS } from "../../constants/urls";
import { apiClient as axiosInstance } from "../client/index";


export async function getParaphraseText(user_input, language, paraphrase_text = false) {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.PARAPHRASE_API, {
            user_input,
            language,
            paraphrase_text
        });

        return response?.data?.paraphrased_output;
    } catch (error) {
        console.error('Error fetching Paraphrase api:', error);
        throw error;
    }
}

export async function getObjectiveList(user_input, language, profile_id) {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.OBJECTIVE_API, {
            user_input,
            language,
            profile_id
        }, {
            'axios-retry': {
                retries: 3,
                retryCondition: (error) => {
                    return error.response?.status === 500;
                }
            }
        });

        return response?.data;
    } catch (error) {
        console.error('Error fetching Objective api:', error);
        throw error;
    }
}

export async function getActionList(user_problem_statement, user_objective, language, profile_id) {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.ACTION_LIST_API, {
            user_problem_statement,
            user_objective,
            language,
            profile_id
        }, {
            'axios-retry': {
                retries: 5,
                retryCondition: (error) => {
                    return error.response?.status === 500;
                }
            }
        });

        return response?.data;
    } catch (error) {
        console.error('Error fetching Action list api:', error);
        throw error;
    }
}

export async function getTitle(user_problem_statement, user_objective, user_action_list, language, profile_id) {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.TITLE_API, {
            user_problem_statement,
            user_objective,
            user_action_list,
            language,
            profile_id
        });

        return response?.data?.title;
    } catch (error) {
        console.error('Error fetching Title api:', error);
        throw error;
    }
}

export async function saveUserChatsInDB(message, session, role, chunks = null) {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.SAVE_COMPANY_CHAT, {
            message,
            role,
            session,
            chunks
        });

        return response?.data;
    } catch (error) {
        console.error('Error saving chats in db api:', error);
        throw error;
    }
}


export async function getChatsFromDB(session) {
    try {
        const response = await axiosInstance.get(`${API_ENDPOINTS.GET_COMPANY_CHAT}?session=${session}`);

        return response?.data;
    } catch (error) {
        console.error('Error saving chats in db api:', error);
        throw error;
    }
}


export async function getNewSessionID() {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.GENERATE_SESSION_ID);

        return response?.data?.sessionid;
    } catch (error) {
        console.error('Error fetching sessionid api:', error);
        throw error;
    }
}

export async function createChatSession(session, email, access_token) {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CREATE_CHAT_SESSION, {
            session,
            email,
        }, {
            headers: {
                'X-auth-token': access_token,
            },
        });

        return response?.data;
    } catch (error) {
        console.error('Error Creating Chatsession api:', error);
        throw error;
    }
}

export async function createProject(
    access_token, user_problem_statement, user_action_steps, project_duration,
    project_title, profile_id, session, user_objective, chunks, language
) {
    try {
        const response = await axiosInstance.post(
            `${API_ENDPOINTS.CREATE_PROJECT}`,
            {
                access_token,
                user_problem_statement,
                user_action_steps,
                project_duration,
                project_title,
                profile_id,
                session,
                user_objective,
                chunks,
                language
            }
        );

        return response?.data;
    } catch (error) {
        console.error('Error creating Project api:', error);
        throw error;
    }
}

export async function updateChatSession(session, update_field) {
    try {
        const response = await axiosInstance.patch(
            `${API_ENDPOINTS.CHAT_SESSION}${session}/`,
            {
                session,
                ...update_field
            }
        );

        return response?.data;
    } catch (error) {
        console.error('Error Updating Chatsession:', error);
        throw error;
    }
}

export async function validateObjective(user_input, language, profile_id, user_problem_statement) {
    try {
        const response = await axiosInstance.post(
            `${API_ENDPOINTS.VALIDATE_OBJECTIVE}`,
            {
                user_input,
                language,
                profile_id,
                user_problem_statement
            }
        );

        return response?.data;
    } catch (error) {
        console.error('Error Validating Objective:', error);
        throw error;
    }
}

export async function validateTitle(user_input, user_objective, problem_statement, user_actions, language, profile_id) {
    try {
        const response = await axiosInstance.post(
            `${API_ENDPOINTS.VALIDATE_TITLE}`,
            {
                user_input,
                user_objective,
                problem_statement,
                user_actions,
                language,
                profile_id
            }
        );

        return response?.data;
    } catch (error) {
        console.error('Error Validating Title:', error);
        throw error;
    }
}

export async function validateActionList(user_input, user_objective, problem_statement, language, profile_id) {
    try {
        const response = await axiosInstance.post(
            `${API_ENDPOINTS.VALIDATE_ACTIONS}`,
            {
                user_input,
                user_objective,
                problem_statement,
                language,
                profile_id
            }
        );

        return response?.data;
    } catch (error) {
        console.error('Error Validating Action list:', error);
        throw error;
    }
}

export async function paraphraseChatConversation(session_id) {
    const response = await axiosInstance.post(API_ENDPOINTS.PARAPHRASE, {
        session_id
    });

    return response?.data?.paraphrased_output;
}