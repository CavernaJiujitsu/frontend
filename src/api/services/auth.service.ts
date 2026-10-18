import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  practitionerId: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>(
    routes.authLogin,
    payload,
  );
  return unwrap(data);
}
