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
  latitude: string | null;
  longitude: string | null;
};

export type PractitionerCoordinates = {
  latitude: number;
  longitude: number;
};

export type CreatePractitionerPayload = {
  user: {
    name: string;
    email: string;
    password: string;
  };
  coordinates?: PractitionerCoordinates;
};

export type UpdatePractitionerLocationPayload = PractitionerCoordinates;

export async function createPractitioner(
  payload: CreatePractitionerPayload,
): Promise<Practitioner> {
  const { data } = await apiClient.post<ApiEnvelope<Practitioner>>(
    routes.practitioners,
    payload,
  );
  return unwrap(data);
}

export async function getPractitioner(id: string): Promise<Practitioner> {
  const { data } = await apiClient.get<ApiEnvelope<Practitioner>>(
    routes.practitioner(id),
  );
  return unwrap(data);
}

export async function updatePractitionerLocation(
  practitionerId: string,
  payload: UpdatePractitionerLocationPayload,
): Promise<Practitioner> {
  const { data } = await apiClient.patch<ApiEnvelope<Practitioner>>(
    routes.practitioner(practitionerId),
    payload,
  );
  return unwrap(data);
}
