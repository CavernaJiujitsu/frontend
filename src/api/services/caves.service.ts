import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import type { PaginatedResponse } from "@/api/types/pagination";
import { normalizeCoordinates } from "@/utils/location";

export type CaveUnit = {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  latitude: string;
  longitude: string;
  /** Archived units come back as `false` and must not count anywhere. */
  active?: boolean;
  distanceKm?: number;
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

export async function listCaves(
  search?: string,
  latitude?: number,
  longitude?: number,
): Promise<Cave[]> {
  // The API accepts at most 8 decimal places; raw GPS readings carry more.
  const coordinates = normalizeCoordinates(latitude, longitude);
  const params = {
    page: 1,
    limit: 20,
    ...(search ? { search } : {}),
    ...(coordinates ?? {}),
  };

  const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<Cave>>>(
    routes.caves,
    { params },
  );
  return unwrap(data).data;
}
