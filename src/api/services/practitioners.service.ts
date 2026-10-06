import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type PractitionerUser = {
  id: string;
  name: string;
  email: string;
};

export type Practitioner = {
  id: string;
  user: PractitionerUser;
};

export type CreatePractitionerPayload = {
  user: {
    name: string;
    email: string;
    password: string;
  };
};

export async function createPractitioner(
  payload: CreatePractitionerPayload,
): Promise<Practitioner> {
  const { data } = await apiClient.post<ApiEnvelope<Practitioner>>(
    routes.practitioners,
    payload,
  );
  return unwrap(data);
}
