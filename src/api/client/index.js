import axios from "axios"
import env from "utils/env"
import axiosRetry from 'axios-retry';

class ApiClient {
  constructor(httpClient) {
    this.client = httpClient
  }

  async get(url, config) {
    return this.client.get(url, config)
  }

  async post(url, data, config) {
    return this.client.post(url, data, config)
  }

  async put(url, data, config) {
    return this.client.put(url, data, config)
  }

  async delete(url, config) {
    return this.client.delete(url, config)
  }

  async patch(url, data, config) {
    return this.client.patch(url, data, config)
  }
}

const axiosInstance = axios.create({
  withCredentials: false,
  baseURL: env.LOCAL_PROXY(),
  params: {},
})

axiosRetry(axiosInstance, { retries: 0 });

export const apiClient = new ApiClient(axiosInstance)
