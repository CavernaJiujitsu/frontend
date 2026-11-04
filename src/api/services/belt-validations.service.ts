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
    params: { page: 1, limit: 100, practitionerId },
  });
  return unwrap(data).data;
}
