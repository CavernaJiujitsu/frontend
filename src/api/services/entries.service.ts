import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type EntryCode = {
  code: string;
  used: boolean;
  classId: string;
  enrollmentId: string;
};

export async function getEntryCode(classId: string, enrollmentId: string): Promise<EntryCode> {
  const { data } = await apiClient.get<ApiEnvelope<EntryCode>>(
    `/entries/classes/${classId}/enrollments/${enrollmentId}/code`,
  );
  return unwrap(data);
}
