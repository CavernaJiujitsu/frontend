import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  userId: string;
  roles: UserRole[];
  practitionerId?: string;
  teacherId?: string;
};

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN" | "CAVE_ADMIN";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>(
    routes.mobileLogin,
    payload,
  );
  return unwrap(data);
}
