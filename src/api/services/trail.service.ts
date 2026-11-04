import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type TrailMovementStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "VALIDATED";
export type TrailStageStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type TrailMovement = {
  id: string;
  trailStageMovementId: string;
  movementId: string;
  movementName: string;
  videoUrl: string | null;
  required: boolean;
  position: number;
  status: TrailMovementStatus;
  validatedAt: string | null;
  evidenceId: string | null;
};

export type TrailStage = {
  id: string;
  trailStageId: string;
  name: string;
  description: string | null;
  position: number;
  status: TrailStageStatus;
  percent: number;
  requiredCompleted: number;
  requiredTotal: number;
  isCurrent: boolean;
  movements: TrailMovement[];
};

export type ActiveTrail = {
  practitionerId: string;
  beltId: string;
  beltName: string;
  beltColor: string;
  beltLevel: number;
  trailId: string;
  trailName: string;
  trailDescription: string | null;
  percent: number;
  requiredCompleted: number;
  requiredTotal: number;
  currentStageId: string | null;
  noActiveBelt: false;
  stages: TrailStage[];
};

export type NoActiveBeltTrail = {
  noActiveBelt: true;
  message: string;
  practitionerId: string;
};

export type MyTrail = ActiveTrail | NoActiveBeltTrail;

export async function getMyTrail(): Promise<MyTrail> {
  const { data } = await apiClient.get<ApiEnvelope<MyTrail>>(
    routes.practitionerTrail,
  );
  return unwrap(data);
}
