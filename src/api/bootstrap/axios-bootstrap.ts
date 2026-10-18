import { create } from "axios";

import { API_URL } from "@/constants/api";
import { useSessionStore } from "@/store/useSessionStore";

export const apiClient = create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const session = useSessionStore.getState().session;

  if (session) {
    config.headers.set(
      "Authorization",
      `${session.tokenType} ${session.accessToken}`,
    );
  }

  return config;
});

export default apiClient;
