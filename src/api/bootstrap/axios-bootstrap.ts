import { create } from "axios";
import { API_URL } from "@/constants/api";
import { useAppStore } from "@/store/useAppStore";

export const apiClient = create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAppStore.getState().user.accessToken;
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().setAccessToken(null);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
