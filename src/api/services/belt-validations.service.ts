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
};

export type DeclareBeltValidationPayload = {
  practitionerId: string;
  targetBeltId?: string;
  certificateUrl?: string;
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
