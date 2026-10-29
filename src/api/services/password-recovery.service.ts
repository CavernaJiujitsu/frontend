import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import type { ApiEnvelope } from "@/api/types/envelope";

export type RequestPasswordRecoveryPayload = {
  email: string;
};

export async function requestPasswordRecovery(
  payload: RequestPasswordRecoveryPayload,
): Promise<string> {
  const response = await apiClient.post<ApiEnvelope<null>>(
    routes.passwordRecoveryRequest,
    payload,
  );

  if (
    response.status !== 200 ||
    typeof response.data?.message !== "string" ||
    !response.data.message.trim()
  ) {
    throw new Error("Resposta inválida do servidor.");
  }

  return response.data.message;
}
