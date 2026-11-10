import { AxiosHeaders, create } from "axios";

import { routes } from "@/api/endpoints/routes";
import { endSession } from "@/auth/session";
import { API_URL } from "@/constants/api";
import { useAppStore } from "@/store/useAppStore";

export const apiClient = create({
  baseURL: API_URL,
});

const publicPostEndpoints = new Set<string>([
  routes.login,
  routes.practitioners,
  routes.passwordRecoveryRequest,
]);

apiClient.interceptors.request.use((config) => {
  const accessToken = useAppStore.getState().user.accessToken;
  const isPublicPost =
    config.method === "post" && publicPostEndpoints.has(config.url ?? "");

  if (accessToken && !isPublicPost) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentToken = useAppStore.getState().user.accessToken;
      const sentAuthorization = AxiosHeaders.from(error.config?.headers).get(
        "Authorization",
      );
      if (currentToken && sentAuthorization === `Bearer ${currentToken}`) {
        endSession(currentToken);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
