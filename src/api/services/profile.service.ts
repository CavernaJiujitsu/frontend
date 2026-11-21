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
export type MyProfile = {
  practitionerId: string;
  userId: string;
  name: string;
  email: string;
  photoKey?: string | null;
  activeBelt: ActiveBelt | null;
  trainingRecord: {
    id: string;
    startsAt: string;
    endsAt: string;
    caveUnit: string | null;
    class: string | null;
  } | null;
};

export async function getMyProfile(): Promise<MyProfile> {
  const { data } = await apiClient.get<ApiEnvelope<MyProfile>>(
    routes.profileReadonlyMe,
  );
  return unwrap(data);
}

export async function getMyTrainingHours(): Promise<number> {
  const { data } = await apiClient.get<ApiEnvelope<{ statistics: { hoursTrained: number } }>>(
    routes.profileMe,
  );
  return unwrap(data).statistics.hoursTrained;
}

export type ProfilePhotoFile = {
  uri: string;
  name: string;
  mimeType?: string;
  file?: File;
};

export type ProfilePhotoResponse = {
  photoUrl: string | null;
};

export async function getMyProfilePhoto(): Promise<ProfilePhotoResponse> {
  const { data } = await apiClient.get<ApiEnvelope<ProfilePhotoResponse>>(
    routes.profileMe,
  );
  return unwrap(data);
}

export async function replaceMyProfilePhoto(
  file: ProfilePhotoFile,
): Promise<ProfilePhotoResponse> {
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
  const { data } = await apiClient.put<ApiEnvelope<ProfilePhotoResponse>>(
    routes.profilePhoto,
    form,
    { headers: { "Content-Type": Platform.OS === "web" ? undefined : "multipart/form-data" } },
  );
  return unwrap(data);
}

export async function deleteMyProfilePhoto(): Promise<void> {
  await apiClient.delete<ApiEnvelope<ProfilePhotoResponse>>(routes.profilePhoto);
}
