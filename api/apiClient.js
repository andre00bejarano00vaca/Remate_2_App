import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiBaseUrl } from "../config/env";

const apiClient = axios.create({
  baseURL: `${apiBaseUrl}/api`,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.multiRemove(["authToken", "isLoggedIn", "usuario", "rol"]);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
