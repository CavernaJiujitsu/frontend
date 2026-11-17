import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import type { PaginatedResponse } from "@/api/types/pagination";

export type BeltValidationStatus =
  | "PENDING"
  | "SCHEDULED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

type BeltRef = { id: string; name: string } | null;

export type BeltValidation = {
  id: string;
  status: BeltValidationStatus;
  practitioner?: { id: string; user?: { name?: string; email?: string } } | null;
  currentBelt?: BeltRef;
  targetBelt?: BeltRef;
  class?: {
    id: string;
    type?: string;
    startsAt: string;
    endsAt: string;
    caveUnit?: { id: string; name: string } | null;
  } | null;
  certificateUrl?: string | null;
  notes?: string | null;
  scheduledAt?: string | null;
  createdAt?: string;
};

export type DeclareBeltValidationPayload = {
  practitionerId: string;
  targetBeltId?: string;
  /**
   * `id` returned by `POST /certificates/upload`. The API checks the owner by
   * this id (another user's certificate → 403), so the free `certificateUrl`
   * field is intentionally not exposed here.
   */
  certificateId?: string;
};

export type ListBeltValidationsParams = {
  practitionerId?: string;
  caveId?: string;
  teacherId?: string;
  status?: BeltValidationStatus;
};

const validationUrl = (id: string) => `${routes.beltValidations}/${id}`;

export async function declareBeltValidation(
  payload: DeclareBeltValidationPayload,
): Promise<BeltValidation> {
  const { data } = await apiClient.post<ApiEnvelope<BeltValidation>>(
    routes.beltValidations,
    payload,
  );
  return unwrap(data);
}

export async function listBeltValidations(
  params: ListBeltValidationsParams,
): Promise<PaginatedResponse<BeltValidation>> {
  // Never send empty filters (the API answers 400 for an empty UUID). Page and
  // limit are left to the API defaults (first 20 items).
  const query = Object.fromEntries(
    Object.entries(params).filter(([, value]) => Boolean(value)),
  );
  const { data } = await apiClient.get<
    ApiEnvelope<PaginatedResponse<BeltValidation>>
  >(routes.beltValidations, { params: query });
  return unwrap(data);
}

export async function getBeltValidation(id: string): Promise<BeltValidation> {
  const { data } = await apiClient.get<ApiEnvelope<BeltValidation>>(
    validationUrl(id),
  );
  return unwrap(data);
}

export async function scheduleBeltValidation(
  id: string,
  classId: string,
): Promise<BeltValidation> {
  const { data } = await apiClient.patch<ApiEnvelope<BeltValidation>>(
    `${validationUrl(id)}/schedule`,
    { classId },
  );
  return unwrap(data);
}

export async function approveBeltValidation(
  id: string,
  payload: { approvedBeltId?: string; notes?: string },
): Promise<BeltValidation> {
  const { data } = await apiClient.patch<ApiEnvelope<BeltValidation>>(
    `${validationUrl(id)}/approve`,
    payload,
  );
  return unwrap(data);
}

export async function rejectBeltValidation(
  id: string,
  payload: { suggestedBeltId: string; notes?: string },
): Promise<BeltValidation> {
  const { data } = await apiClient.patch<ApiEnvelope<BeltValidation>>(
    `${validationUrl(id)}/reject`,
    payload,
  );
  return unwrap(data);
}
