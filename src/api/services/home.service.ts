import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import { normalizeCoordinates } from "@/utils/location";

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
  params: HomeSummaryParams = {},
): Promise<HomeSummary> {
  // The API accepts at most 8 decimal places; raw GPS readings carry more.
  const coordinates = normalizeCoordinates(params.latitude, params.longitude);
  const { data } = await apiClient.get<ApiEnvelope<HomeSummary>>(
    routes.profileReadonlyHome,
    {
      params: {
        ...(coordinates ?? {}),
        ...(params.radiusKm !== undefined ? { radiusKm: params.radiusKm } : {}),
        ...(params.cavesLimit !== undefined
          ? { cavesLimit: params.cavesLimit }
          : {}),
      },
    },
  );

  return unwrap(data);
}
