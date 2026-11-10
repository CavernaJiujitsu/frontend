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
  age: number | null;
};

export type PractitionerCoordinates = {
  latitude: number;
  longitude: number;
};

export type PractitionerOrigin = {
  caveId: string;
  caveName: string;
  caveUnitId: string;
  caveUnitName: string;
};

export async function getPractitionerOrigin(
  id: string,
): Promise<PractitionerOrigin | null> {
  const { data } = await apiClient.get<ApiEnvelope<PractitionerOrigin | null>>(
    routes.practitionerOrigin(id),
  );
  return unwrap(data);
}

export async function setPractitionerOrigin(
  id: string,
  payload: Pick<PractitionerOrigin, "caveId" | "caveUnitId">,
): Promise<PractitionerOrigin> {
  const { data } = await apiClient.put<ApiEnvelope<PractitionerOrigin | null>>(
    routes.practitionerOrigin(id),
    payload,
  );
  const origin = unwrap(data);
  if (!origin)
    throw new Error(
      "A unidade de origem não está mais disponível. Tente novamente.",
    );
  return origin;
}

export type CreatePractitionerPayload = {
  user: {
    name: string;
    email: string;
    password: string;
  };
  coordinates?: PractitionerCoordinates;
};

export type UpdatePractitionerLocationPayload = PractitionerCoordinates;

export type UpdatePractitionerPayload = {
  name?: string;
  email?: string;
  age?: number;
  latitude?: number;
  longitude?: number;
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

export async function updatePractitioner(
  practitionerId: string,
  payload: UpdatePractitionerPayload,
): Promise<Practitioner> {
  const { data } = await apiClient.patch<ApiEnvelope<Practitioner>>(
    routes.practitioner(practitionerId),
    payload,
  );
  return unwrap(data);
}
