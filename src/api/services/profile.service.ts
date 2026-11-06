import { Platform } from "react-native";
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
  hoursAccuracy: "scheduled_duration_estimate" | "measured" | "mixed";
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

export type ProfilePhotoFile = {
  uri: string;
  name: string;
  mimeType?: string;
  file?: File;
};

export async function replaceMyProfilePhoto(
  file: ProfilePhotoFile,
): Promise<MyProfile> {
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = (file.file ?? (await fetch(file.uri).then((response) => response.blob()))) as Blob;
    form.append("file", blob, file.name);
  } else {
    form.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? "image/jpeg",
    } as unknown as Blob);
  }
  const { data } = await apiClient.put<ApiEnvelope<MyProfile>>(
    routes.profilePhoto,
    form,
    { headers: { "Content-Type": Platform.OS === "web" ? undefined : "multipart/form-data" } },
  );
  return unwrap(data);
}

export async function deleteMyProfilePhoto(): Promise<void> {
  await apiClient.delete<ApiEnvelope<MyProfile>>(routes.profilePhoto);
}
