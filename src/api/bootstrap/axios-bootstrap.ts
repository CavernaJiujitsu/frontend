import { create, isAxiosError } from "axios";

import { bearerTokenOf, isPublicAuthRoute } from "@/api/bootstrap/auth-header";
import { API_URL } from "@/constants/api";
import { useAppStore } from "@/store/useAppStore";
import { expireSession } from "@/utils/session";

export const apiClient = create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAppStore.getState().user.accessToken;
  if (accessToken && !isPublicAuthRoute(config.url)) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const sentToken = bearerTokenOf(error.config);
      // Only the session that sent the request can expire. After the first
      // 401 resets the store, concurrent 401s (and late ones from a previous
      // session) see another token, or none, and are ignored.
      if (
        sentToken !== null &&
        sentToken === useAppStore.getState().user.accessToken
      ) {
        expireSession();
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
