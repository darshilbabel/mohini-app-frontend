import axios from "axios";

const axiosInstance = axios.create({
  withCredentials: false,
  baseURL: process.env.REACT_APP_LOCAL_PROXY,
  params: {}, 
});

export default axiosInstance;
