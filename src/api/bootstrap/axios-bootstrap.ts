import { create } from "axios";

import { API_URL } from "@/constants/api";
import { useAppStore } from "@/store/useAppStore";
import { useSessionStore } from "@/store/useSessionStore";

export const apiClient = create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const session = useSessionStore.getState().session;
  const accessToken = useAppStore.getState().user.accessToken;

  if (session) {
    config.headers.set(
      "Authorization",
      `${session.tokenType} ${session.accessToken}`,
    );
  } else if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().setAccessToken(null);
      useSessionStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
