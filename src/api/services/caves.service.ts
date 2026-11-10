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
  distanceKm?: number;
};

export type ListUnitsParams = {
  page?: number;
  limit?: number;
  search?: string;
  nearest?: boolean;
  openNow?: boolean;
  classesToday?: boolean;
  latitude?: number;
  longitude?: number;
};

export type Cave = {
  id: string;
  name: string;
  units: CaveUnit[];
  distanceKm?: number;
};

export async function getCave(id: string): Promise<Cave> {
  const { data } = await apiClient.get<ApiEnvelope<Cave>>(
    `${routes.caves}/${id}`,
  );
  return unwrap(data);
}

export async function listUnits(
  caveId: string,
  params: ListUnitsParams = {},
): Promise<CaveUnit[]> {
  return (await listUnitsPage(caveId, params)).data;
}

export async function listUnitsPage(
  caveId: string,
  params: ListUnitsParams = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<CaveUnit>> {
  const { data } = await apiClient.get<
    ApiEnvelope<PaginatedResponse<CaveUnit>>
  >(`${routes.caves}/${caveId}/units`, {
    params: { page: 1, limit: 100, ...params },
    signal,
  });
  return unwrap(data);
}

export async function listCaves(
  search?: string,
  latitude?: number,
  longitude?: number,
): Promise<Cave[]> {
  const params: Record<string, any> = { page: 1, limit: 20 };
  if (search) params.search = search;
  if (latitude !== undefined && longitude !== undefined) {
    params.latitude = latitude;
    params.longitude = longitude;
  }

  const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<Cave>>>(
    routes.caves,
    { params },
  );
  return unwrap(data).data;
}
