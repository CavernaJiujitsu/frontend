import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import type { PageParams, PaginatedResponse } from "@/api/types/pagination";

export async function getById<T>(
  route: string,
  id: string | number,
): Promise<T> {
  const { data } = await apiClient.get<T>(`${route}/${id}`);
  return data;
}

export async function getPaginated<T>(
  route: string,
  params?: PageParams,
): Promise<PaginatedResponse<T>> {
  const { data } = await apiClient.get<PaginatedResponse<T>>(route, {
    params,
  });
  return data;
}

export const basicOperationsService = {
  getById,
  getPaginated,
};
