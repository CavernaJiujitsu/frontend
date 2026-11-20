import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type EntryCode = {
  code: string;
  used: boolean;
  classId: string;
  enrollmentId: string;
};

export async function getEntryCode(classId: string, enrollmentId: string): Promise<EntryCode> {
  const { data } = await apiClient.get<ApiEnvelope<EntryCode>>(
    routes.entryCode(classId, enrollmentId),
  );
  return unwrap(data);
}
