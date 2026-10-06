import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import type { PaginatedResponse } from "@/api/types/pagination";

export type Belt = {
  id: string;
  name: string;
  color: string;
  level: number;
};

export async function listBelts(): Promise<Belt[]> {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<Belt>>>(
    routes.belts,
    { params: { page: 1, limit: 20 } },
  );
  return unwrap(data).data;
}
