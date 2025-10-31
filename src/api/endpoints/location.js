import { apiClient } from "../client";
import API_ENDPOINTS from "constants/urls";

export const getLocationApi = async (parentId = null) => {

    let params = undefined

    if (parentId) {
        params = { parentId };
    }

    const response = await apiClient.get(API_ENDPOINTS.GET_LOCATION, { params });
    return response.data;
}