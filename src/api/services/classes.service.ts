import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import type { PaginatedResponse } from "@/api/types/pagination";

export type ClassEnrollment = {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
};

export type EnrollClassPayload = {
  practitionerId: string;
};

export type ClassBeltItem = {
  belt?: { id: string; name: string };
};

export type BackendClass = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  type?: string;
  teacher?: { id: string; user?: { name?: string }; name?: string };
  belts?: { belt?: { id: string; name: string } }[];
};

export type ListClassesParams = {
  caveUnitId?: string;
  type?: string;
  page?: number;
  limit?: number;
};

export async function listClasses(
  params: ListClassesParams = {},
): Promise<BackendClass[]> {
  const { data } = await apiClient.get<
    ApiEnvelope<PaginatedResponse<BackendClass>>
  >(routes.classes, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      ...(params.caveUnitId ? { caveUnitId: params.caveUnitId } : {}),
      ...(params.type ? { type: params.type } : {}),
    },
  });
  return unwrap(data).data;
}

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

export async function checkInClass(
  classId: string,
  enrollmentId: string,
): Promise<ClassEnrollment> {
  const { data } = await apiClient.post<ApiEnvelope<ClassEnrollment>>(
    `${routes.classes}/${classId}/enrollments/${enrollmentId}/check-in`,
  );
  return unwrap(data);
}

export async function cancelClassEnrollment(
  classId: string,
  enrollmentId: string,
): Promise<ClassEnrollment> {
  const { data } = await apiClient.post<ApiEnvelope<ClassEnrollment>>(
    `${routes.classes}/${classId}/enrollments/${enrollmentId}/cancel`,
  );
  return unwrap(data);
}
