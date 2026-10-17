import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type HomeSummaryParams = {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  cavesLimit?: number;
};

export type HomeSummary = {
  practitioner: { id: string; fullName: string };
  nextClass: {
    enrollmentId: string;
    enrollmentStatus: string;
    classId: string;
    classType: string;
    startsAt: string;
    endsAt: string;
    caveUnit: {
      id: string;
      name: string;
      caveId: string;
      caveName: string;
      address: string | null;
      neighborhood: string | null;
    };
    teacher: { id: string; name: string };
  } | null;
  nearbyCaves: {
    data: {
      id: string;
      name: string;
      caveId: string;
      caveName: string;
      address: string | null;
      neighborhood: string | null;
      latitude: string;
      longitude: string;
      distanceKm: number;
    }[];
    _meta: {
      total: number;
      limit: number;
      radiusKm: number;
      locationSource: "request" | "profile" | "none";
    };
  };
};

export async function getHomeSummary(
  practitionerId: string,
  params: HomeSummaryParams = {},
): Promise<HomeSummary> {
  const { data } = await apiClient.get<ApiEnvelope<HomeSummary>>(
    routes.practitionerHome(practitionerId),
    {
      params: {
        ...(params.latitude !== undefined && params.longitude !== undefined
          ? { latitude: params.latitude, longitude: params.longitude }
          : {}),
        ...(params.radiusKm !== undefined ? { radiusKm: params.radiusKm } : {}),
        ...(params.cavesLimit !== undefined
          ? { cavesLimit: params.cavesLimit }
          : {}),
      },
    },
  );

  return unwrap(data);
}
