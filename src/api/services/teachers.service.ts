import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type TeacherCaveUnit = {
  id: string;
  name: string;
  caveId: string;
  caveName: string;
};

export type Teacher = {
  id: string;
  userId: string;
  name: string;
  email: string;
  caveUnits: TeacherCaveUnit[];
};

export async function getTeacher(teacherId: string): Promise<Teacher> {
  const { data } = await apiClient.get<ApiEnvelope<Teacher>>(
    `${routes.teachers}/${teacherId}`,
  );
  return unwrap(data);
}
