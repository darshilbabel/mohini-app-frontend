import API_ENDPOINTS from "constants/urls";
import { apiClient } from "../client";

/**
 * Generic authenticated request handler
 * @param {Object} params - Request parameters
 * @param {Function} params.loader - Loading state setter function
 * @param {Function} params.setter - Response data setter function
 * @param {Function} params.errorHandler - Error handler function
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Request payload data
 * @param {string} params.method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {string} params.url - API endpoint URL
 * @param {Object} params.params - Query parameters
 * @returns {Promise<void>}
 */
export async function createAuthRequest({
  loader = () => {},
  setter = () => {},
  errorHandler = () => {},
  token = "",
  data = {},
  method = "",
  url = "",
  params = {},
}) {
  try {
    if (!token && !url && !method) {
      throw new Error("Insufficient data!");
    }
    loader(true);

    const config = {
      headers: {
        Authorization: token,
      },
    };

    if (Object.keys(params).length > 0) {
      config.params = params;
    }

    let response;
    switch (method.toUpperCase()) {
      case "GET":
        response = await apiClient.get(url, config);
        break;
      case "POST":
        response = await apiClient.post(url, data, config);
        break;
      case "PUT":
        response = await apiClient.put(url, data, config);
        break;
      case "PATCH":
        response = await apiClient.patch(url, data, config);
        break;
      case "DELETE":
        response = await apiClient.delete(url, config);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    setter(response?.data || {});
    loader(false);
  } catch (error) {
    console.error({ error });
    errorHandler({
      response: error?.request?.response,
      status: error?.request?.status,
    });
    loader(false);
  }
}

/**
 * Get story by ID
 * @param {Object} params - Request parameters
 * @param {Function} params.loader - Loading state setter
 * @param {Function} params.setter - Response data setter
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Data object containing story ID
 * @param {string} params.data.id - Story ID
 * @returns {Promise<void>}
 */
export const getStoryById = async ({
  loader,
  setter,
  token,
  data = {
    id: "",
  },
}) => {
  try {
    await createAuthRequest({
      loader,
      setter,
      token,
      method: "GET",
      url: `${API_ENDPOINTS.STORY}${data.id}/`,
    });
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get all media for a story
 * @param {Object} params - Request parameters
 * @param {Function} params.loader - Loading state setter
 * @param {Function} params.setter - Response data setter
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Data object containing story ID
 * @param {string} params.data.story - Story ID
 * @returns {Promise<void>}
 */
export const getStoryAllMedia = async ({
  loader,
  setter,
  token,
  data = {
    story: "",
  },
}) => {
  try {
    await createAuthRequest({
      loader,
      setter,
      token,
      params: data,
      method: "GET",
      url: API_ENDPOINTS.STORY_MEDIA,
    });
  } catch (error) {
    console.error(error);
  }
};

/**
 * Create story media
 * @param {Object} params - Request parameters
 * @param {Function} params.loader - Loading state setter
 * @param {Function} params.setter - Response data setter
 * @param {Function} params.errorHandler - Error handler function
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Media data
 * @param {string} params.data.story - Story ID
 * @param {string} params.data.name - Media name
 * @param {Array} params.data.file - File array
 * @param {string} params.data.file_url - File URL
 * @param {string} params.data.media_type - Media type
 * @returns {Promise<void>}
 */
export const createStoryMedia = async ({
  loader,
  setter,
  errorHandler,
  token,
  data = {
    story: "",
    name: "",
    file: [],
    file_url: "",
    media_type: "",
  },
}) => {
  try {
    await createAuthRequest({
      loader,
      setter,
      errorHandler,
      token,
      data,
      method: "POST",
      url: API_ENDPOINTS.STORY_MEDIA,
    });
  } catch (error) {
    console.error(error);
  }
};

/**
 * Partially update story by ID
 * @param {Object} params - Request parameters
 * @param {Function} params.loader - Loading state setter
 * @param {Function} params.setter - Response data setter
 * @param {Function} params.errorHandler - Error handler function
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Update data
 * @param {string} params.data.id - Story ID
 * @param {Object} params.data.formatted_content - Formatted content object
 * @param {string} params.data.access_token - Access token
 * @param {string} params.data.session - Session ID
 * @param {string} params.data.flow - Flow type
 * @param {Object} params.data.other_params - Additional parameters
 * @returns {Promise<void>}
 */
export const partialUpdateStoryById = async ({
  loader,
  setter,
  errorHandler,
  token,
  data = {
    id: "",
    formatted_content: "",
    access_token: "",
    session: "",
    flow: "",
    other_params: {},
  },
}) => {
  try {
    await createAuthRequest({
      loader,
      setter,
      errorHandler,
      token,
      data: {
        formatted_content: JSON.stringify(data?.formatted_content),
        access_token: data?.access_token,
        session: data?.session,
        flow: data?.flow,
        other_params: data?.other_params,
      },
      method: "PATCH",
      url: `${API_ENDPOINTS.STORY}${data?.id}/`,
    });
  } catch (error) {
    console.error(error);
  }
};

/**
 * Update story media
 * @param {Object} params - Request parameters
 * @param {Function} params.loader - Loading state setter
 * @param {Function} params.setter - Response data setter
 * @param {Function} params.errorHandler - Error handler function
 * @param {string} params.token - Authorization token
 * @param {Object} params.data - Update data
 * @param {string} params.data.story - Story ID
 * @param {string} params.data.name - Media name
 * @param {File} params.data.file - File to upload
 * @param {string} params.data.id - Media ID
 * @param {string} params.data.access_token - Access token
 * @param {string} params.data.session - Session ID
 * @param {string} params.data.flow - Flow type
 * @param {string} params.data.media_type - Media type
 * @returns {Promise<void>}
 */
export const updateStoryMedia = async ({
  loader,
  setter,
  errorHandler,
  token,
  data = {
    story: "",
    name: "",
    file: [],
    id: "",
    access_token: "",
    session: "",
    flow: "",
  },
}) => {
  try {
    const formData = new FormData();
    formData.append("story", data.story);
    formData.append("name", data.name);
    formData.append("file", data.file);
    formData.append("media_type", data.media_type);
    formData.append("access_token", data.access_token);
    formData.append("flow", data.flow);
    formData.append("session", data.session);
    await createAuthRequest({
      loader,
      setter,
      errorHandler,
      token,
      data: formData,
      method: "PUT",
      url: `${API_ENDPOINTS.STORY_MEDIA}${data?.id}/`,
    });
  } catch (error) {
    console.error(error);
  }
};
