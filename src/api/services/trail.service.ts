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
  // The backend view declares `belt`/`trail` as an object, but the current
  // response can return `null` for either. Keep them nullable so the screen does
  // not crash while the backend contract is not fixed.
  belt: {
    id: string;
    name: string;
    color: string;
    level: number;
    startedAt: string;
  } | null;
  trail: {
    id: string;
    name: string;
    description: string | null;
    percent: number;
    requiredCompleted: number;
    requiredTotal: number;
    currentStageId: string | null;
    stagesCount: number;
    completedStagesCount: number;
  } | null;
  percent: number;
  requiredCompleted: number;
  requiredTotal: number;
  currentStageId: string | null;
  noActiveBelt: false;
  stages: TrailStage[];
};

export type NoActiveBeltTrail = {
  noActiveBelt: true;
  practitionerId: string;
  belt: null;
  trail: null;
  stages: [];
  percent: 0;
  requiredCompleted: 0;
  requiredTotal: 0;
  currentStageId: null;
};

export type MyTrail = ActiveTrail | NoActiveBeltTrail;

export async function getMyTrail(): Promise<MyTrail> {
  const { data } = await apiClient.get<ApiEnvelope<MyTrail>>(
    routes.profileReadonlyTrail,
  );
  return unwrap(data);
}
