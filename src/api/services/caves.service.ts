import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import type { PaginatedResponse } from "@/api/types/pagination";

export type CaveUnit = {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  latitude: string;
  longitude: string;
};

export type Cave = {
  id: string;
  name: string;
  units: CaveUnit[];
};

export async function listCaves(search?: string): Promise<Cave[]> {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<Cave>>>(
    routes.caves,
    { params: { page: 1, limit: 20, ...(search ? { search } : {}) } },
  );
  return unwrap(data).data;
}
