import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type ActiveBelt = {
  id: string;
  name: string;
  color: string;
  level: number;
  startedAt: string;
};
export type TrailStats = {
  trailId: string;
  trailName: string;
  percent: number;
  requiredCompleted: number;
  requiredTotal: number;
  currentStageId: string | null;
  stagesCount: number;
  completedStagesCount: number;
};
export type ProfileStatistics = {
  hoursTrained: number;
  hoursUnit: "hours";
  classesCompleted: number;
  trainingStreak: number;
  streakUnit: "days";
  timezone: "America/Sao_Paulo";
  window: "all_time";
  hoursAccuracy: "scheduled_duration_estimate";
};
export type MyProfile = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string | null;
  activeBelt: ActiveBelt | null;
  trailStats: TrailStats | null;
  statistics: ProfileStatistics | null;
};

export async function getMyProfile(): Promise<MyProfile> {
  const { data } = await apiClient.get<ApiEnvelope<MyProfile>>(routes.profileMe);
  return unwrap(data);
}
