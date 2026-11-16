import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type BeltValidationStatus =
  | "PENDING"
  | "SCHEDULED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type BeltValidation = {
  id: string;
  status: BeltValidationStatus;
  practitionerId?: string;
  targetBeltId?: string | null;
  certificateUrl?: string | null;
  classId?: string | null;
};

export type DeclareBeltValidationPayload = {
  practitionerId: string;
  targetBeltId?: string;
  certificateUrl?: string;
  classId?: string;
};

export async function declareBeltValidation(
  payload: DeclareBeltValidationPayload,
): Promise<BeltValidation> {
  const { data } = await apiClient.post<ApiEnvelope<BeltValidation>>(
    routes.beltValidations,
    payload,
  );
  return unwrap(data);
}

export async function listMyBeltValidations(
  practitionerId: string,
): Promise<BeltValidation[]> {
  const { data } = await apiClient.get<
    ApiEnvelope<{ data: BeltValidation[] }>
  >(routes.beltValidations, {
    // The backend DTO does not coerce `page`/`limit` query strings yet, so the
    // default pagination is used until it accepts explicit numbers.
    params: { practitionerId },
  });
  return unwrap(data).data;
}

export type ApproveBeltValidationPayload = {
  approvedBeltId?: string;
  notes?: string;
};

export async function approveBeltValidation(
  beltValidationId: string,
  payload: ApproveBeltValidationPayload,
): Promise<BeltValidation> {
  const { data } = await apiClient.patch<ApiEnvelope<BeltValidation>>(
    `${routes.beltValidations}/${beltValidationId}/approve`,
    payload,
  );
  return unwrap(data);
}
