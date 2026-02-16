import axios, { AxiosInstance } from "axios"
import env from "utils/env"

type TAPIConfig = {
  headers?: {
    Authorization?: string
  }
  params?: Record<string, string>
  signal?: AbortSignal
}

class ApiClient {
  private readonly client: AxiosInstance

  constructor(httpClient: AxiosInstance) {
    this.client = httpClient
  }

  async get<T = any>(url: string, config: TAPIConfig) {
    return this.client.get<T>(url, config)
  }

  async post<T = any>(url: string, data: any, config: TAPIConfig) {
    return this.client.post<T>(url, data, config)
  }

  async put<T = any>(url: string, data: any, config: TAPIConfig) {
    return this.client.put<T>(url, data, config)
  }

  async delete<T = any>(url: string, config: TAPIConfig) {
    return this.client.delete<T>(url, config)
  }

  async patch<T = any>(url: string, data: any, config: TAPIConfig) {
    return this.client.patch<T>(url, data, config)
  }
}

const axiosInstance = axios.create({
  withCredentials: false,
  baseURL: env.LOCAL_PROXY(),
  params: {},
})

export const apiClient = new ApiClient(axiosInstance)
