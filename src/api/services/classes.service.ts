import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import type { PaginatedResponse } from "@/api/types/pagination";

export type ClassType = "SCHEDULED" | "VALIDATION" | "EXAM";

export type EnrollmentStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "CONFIRMED"
  | "EXPIRED"
  | "CANCELLED";

export type ClassEnrollment = {
  id: string;
  status: EnrollmentStatus;
};

export type EnrollClassPayload = {
  practitionerId: string;
  requestInitialValidation?: boolean;
};

export type CreateClassPayload = {
  caveUnitId: string;
  teacherId: string;
  type?: ClassType;
  startsAt: string;
  endsAt: string;
  capacity: number;
  beltIds?: string[];
};

export type UpdateClassPayload = {
  type?: ClassType;
  startsAt?: string;
  endsAt?: string;
  capacity?: number;
};

export type EnrollmentItem = {
  id: string;
  status: EnrollmentStatus;
  confirmedAt: string | null;
  expiresAt: string;
  participationStartedAt?: string | null;
  participationEndedAt?: string | null;
  practitioner?: { id: string; user?: { name?: string; email?: string } };
};

export type BackendClass = {
  id: string;
  attendanceClosedAt?: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  type?: ClassType;
  caveUnit?: {
    id: string;
    name: string;
    neighborhood?: string | null;
    active?: boolean;
    cave?: { id: string; name: string };
  };
  // Contract C1: `{ id, user: { id, name } }` on reads; mutations may still
  // answer without `user` (DEC-backend-1). Every nested field stays optional so
  // a missing teacher name never breaks a screen.
  teacher?: { id: string; user?: { id?: string; name?: string }; name?: string };
  belts?: { belt?: { id: string; name: string } }[];
  /** Seats taken (list endpoint only). */
  enrolledCount?: number;
  /** Confirmed presences (list endpoint only). */
  presentCount?: number;
};

export type ListClassesParams = {
  caveUnitId?: string;
  /** Every unit of the cave; ignored by the API when `caveUnitId` is sent. */
  caveId?: string;
  teacherId?: string;
  type?: ClassType;
  /** ISO datetime; filters `startsAt >= from`. */
  from?: string;
  /** ISO datetime; filters `startsAt <= to`. */
  to?: string;
  page?: number;
  limit?: number;
};

const classUrl = (classId: string) => `${routes.classes}/${classId}`;
const enrollmentUrl = (classId: string, enrollmentId: string) =>
  `${classUrl(classId)}/enrollments/${enrollmentId}`;

/** Drops empty filters: the API rejects empty strings for UUID params. */
function cleanParams(params: object): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export async function listClassesPage(
  params: ListClassesParams = {},
): Promise<PaginatedResponse<BackendClass>> {
  const { data } = await apiClient.get<
    ApiEnvelope<PaginatedResponse<BackendClass>>
  >(routes.classes, {
    params: cleanParams({ page: 1, limit: 100, ...params }),
  });
  return unwrap(data);
}

export async function listClasses(
  params: ListClassesParams = {},
): Promise<BackendClass[]> {
  return (await listClassesPage(params)).data;
}

/** Upper bound of pages read by `listAllClasses` (100 classes each). */
export const MAX_CLASS_PAGES = 10;

/**
 * Reads every page of a filtered listing (meant for a bounded `from`/`to`
 * window), so a busy day is not silently cut at the first 100 classes.
 */
export async function listAllClasses(
  params: Omit<ListClassesParams, "page" | "limit"> = {},
): Promise<BackendClass[]> {
  const classes: BackendClass[] = [];
  for (let page = 1; page <= MAX_CLASS_PAGES; page += 1) {
    const result = await listClassesPage({ ...params, page, limit: 100 });
    classes.push(...result.data);
    if (result._meta.page >= result._meta.totalPage) break;
  }
  return classes;
}

export async function getClass(classId: string): Promise<BackendClass> {
  const { data } = await apiClient.get<ApiEnvelope<BackendClass>>(
    classUrl(classId),
  );
  return unwrap(data);
}

export async function createClass(
  payload: CreateClassPayload,
): Promise<BackendClass> {
  const { data } = await apiClient.post<ApiEnvelope<BackendClass>>(
    routes.classes,
    payload,
  );
  return unwrap(data);
}

export async function updateClass(
  classId: string,
  payload: UpdateClassPayload,
): Promise<BackendClass> {
  const { data } = await apiClient.patch<ApiEnvelope<BackendClass>>(
    classUrl(classId),
    payload,
  );
  return unwrap(data);
}

export async function replaceClassBelts(
  classId: string,
  beltIds: string[],
): Promise<void> {
  await apiClient.put(`${classUrl(classId)}/belts`, { beltIds });
}

export async function deleteClass(classId: string): Promise<void> {
  await apiClient.delete(classUrl(classId));
}

export async function enrollClass(
  classId: string,
  payload: EnrollClassPayload,
): Promise<ClassEnrollment> {
  const { data } = await apiClient.post<ApiEnvelope<ClassEnrollment>>(
    `${classUrl(classId)}/enrollments`,
    payload,
  );
  return unwrap(data);
}

export async function listEnrollments(
  classId: string,
  params: { page?: number; limit?: number } = {},
): Promise<EnrollmentItem[]> {
  const { data } = await apiClient.get<
    ApiEnvelope<PaginatedResponse<EnrollmentItem>>
  >(`${classUrl(classId)}/enrollments`, {
    params: { page: params.page ?? 1, limit: params.limit ?? 100 },
  });
  return unwrap(data).data;
}

export async function checkInClass(
  classId: string,
  enrollmentId: string,
): Promise<ClassEnrollment> {
  const { data } = await apiClient.post<ApiEnvelope<ClassEnrollment>>(
    `${enrollmentUrl(classId, enrollmentId)}/check-in`,
  );
  return unwrap(data);
}

export type SetParticipationPayload = {
  startedAt: string;
  endedAt: string;
  pauses?: { startedAt: string; endedAt: string }[];
  reason?: string;
};

export async function setClassParticipation(
  classId: string,
  enrollmentId: string,
  payload: SetParticipationPayload,
): Promise<void> {
  await apiClient.patch(
    `${enrollmentUrl(classId, enrollmentId)}/participation`,
    payload,
  );
}

export async function cancelClassEnrollment(
  classId: string,
  enrollmentId: string,
): Promise<ClassEnrollment> {
  const { data } = await apiClient.post<ApiEnvelope<ClassEnrollment>>(
    `${enrollmentUrl(classId, enrollmentId)}/cancel`,
  );
  return unwrap(data);
}
