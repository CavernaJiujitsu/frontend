import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export async function listMobileWorkouts(): Promise<unknown> {
  const { data } = await apiClient.get<ApiEnvelope<unknown>>(routes.workouts);
  return unwrap(data);
}
