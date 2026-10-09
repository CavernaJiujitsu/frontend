import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type ClassEnrollment = {
  id: string;
  status: string;
};

export type EnrollClassPayload = {
  practitionerId: string;
};

export async function enrollClass(
  classId: string,
  payload: EnrollClassPayload,
): Promise<ClassEnrollment> {
  const { data } = await apiClient.post<ApiEnvelope<ClassEnrollment>>(
    `${routes.classes}/${classId}/enrollments`,
    payload,
  );
  return unwrap(data);
}
