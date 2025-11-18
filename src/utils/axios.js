import axios from "axios"
import env from "./env"

const axiosInstance = axios.create({
  withCredentials: false,
  baseURL: env.LOCAL_PROXY(),
  params: {},
});

export default axiosInstance;
