import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type ClassSchedule = {
  id: string;
  caveUnitId: string;
  teacherId: string;
  title: string;
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
  startDate: string;
  endDate: string;
  capacity: number;
  active: boolean;
};

export type UpdateClassSchedulePayload = {
  scope: "single" | "all";
  caveUnitId?: string;
  teacherId?: string;
  title?: string;
  dayOfWeek?: number;
  startsAt?: string;
  endsAt?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  active?: boolean;
};

export async function listClassSchedules(): Promise<ClassSchedule[]> {
  const { data } = await apiClient.get<ApiEnvelope<ClassSchedule[]>>(
    routes.trainingSchedules,
  );
  return unwrap(data);
}

export async function getClassSchedule(id: string): Promise<ClassSchedule> {
  const { data } = await apiClient.get<ApiEnvelope<ClassSchedule>>(
    `${routes.trainingSchedules}/${id}`,
  );
  return unwrap(data);
}

export type UpdateClassScheduleResult = {
  scope: "single" | "all";
  updated: number;
  schedules: ClassSchedule[];
};

export async function updateClassSchedule(
  id: string,
  payload: UpdateClassSchedulePayload,
): Promise<UpdateClassScheduleResult> {
  const { data } = await apiClient.patch<ApiEnvelope<UpdateClassScheduleResult>>(
    `${routes.trainingSchedules}/${id}`,
    payload,
  );
  return unwrap(data);
}
