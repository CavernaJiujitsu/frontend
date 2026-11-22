import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import type { ApiEnvelope } from "@/api/types/envelope";

export type RequestPasswordRecoveryPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export async function requestPasswordRecovery(
  payload: RequestPasswordRecoveryPayload,
): Promise<void> {
  await apiClient.post<ApiEnvelope<null>>(
    routes.passwordRecoveryRequest,
    payload,
  );
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await apiClient.post<ApiEnvelope<null>>(routes.passwordRecoveryReset, payload);
}
