import { apiClient } from "../client"
import { API_ENDPOINTS } from "constants/urls"

export const getFlowLanguagesApi = async flow_route => {
  const response = await apiClient.get(API_ENDPOINTS.FLOW_LANGUAGES, {
    params: {
      flow_route,
    },
  })
  return response.data
}

export const getFlowInfoApi = async flow_route => {
  const response = await apiClient.get(API_ENDPOINTS.FLOW_CONNECTION_INFO, {
    params: {
      flow_route,
    },
  })
  return response.data
}
