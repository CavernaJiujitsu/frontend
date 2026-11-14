import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import type { HomeSummary, HomeSummaryParams } from "@/api/services/home.service";
import type { BeltValidationStatus } from "@/api/services/belt-validations.service";
import type { MyProfile } from "@/api/services/profile.service";
import type { MyTrail } from "@/api/services/trail.service";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import type { PaginatedResponse } from "@/api/types/pagination";

export type GraduationClass = {
  id: string;
  title: string;
  startsAt: string;
};

export type GraduationBeltValidation = {
  id: string;
  status: BeltValidationStatus;
  practitioner?: { id: string } | null;
  teacher?: { id: string } | null;
  currentBelt?: { id: string; name: string } | null;
  targetBelt?: { id: string; name: string } | null;
  classId?: string | null;
  certificateUrl?: string | null;
  certificateId?: string | null;
  scheduledAt?: string | null;
  validatedAt?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type GraduationCertificateSummary = {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  createdAt: string;
};

export type MyGraduations = {
  belts: { id: string; name: string; color: string; level: number }[];
  beltValidations: {
    id: string;
    status: BeltValidationStatus;
    targetBelt: { id: string; name: string } | null;
    createdAt: string;
  }[];
  certificates: GraduationCertificateSummary[];
};

export type ReadonlyDashboard = {
  profile: MyProfile;
  home: HomeSummary;
  graduations: MyGraduations;
  trail: MyTrail;
};

export async function listGraduationClasses(
  caveUnitId?: string,
): Promise<GraduationClass[]> {
  const { data } = await apiClient.get<ApiEnvelope<GraduationClass[]>>(
    routes.graduationClasses,
    { params: caveUnitId ? { caveUnitId } : undefined },
  );
  return unwrap(data);
}

export async function listGraduationBeltValidations(
  practitionerId?: string,
): Promise<GraduationBeltValidation[]> {
  const { data } = await apiClient.get<
    ApiEnvelope<PaginatedResponse<GraduationBeltValidation>>
  >(routes.graduationBeltValidations, {
    params: practitionerId ? { practitionerId } : undefined,
  });
  return unwrap(data).data;
}

export async function getMyGraduations(): Promise<MyGraduations> {
  const { data } = await apiClient.get<ApiEnvelope<MyGraduations>>(
    routes.profileReadonlyGraduations,
  );
  return unwrap(data);
}

export async function getReadonlyDashboard(
  params: HomeSummaryParams = {},
): Promise<ReadonlyDashboard> {
  const { data } = await apiClient.get<ApiEnvelope<ReadonlyDashboard>>(
    routes.profileReadonlyDashboard,
    { params },
  );
  return unwrap(data);
}
