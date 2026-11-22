import { Platform } from "react-native";
import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";

export type CertificateFile = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

export type CertificateRecord = {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  certificateUrl?: string | null;
  createdAt: string;
};

export type UploadedCertificate = CertificateRecord & {
  url: string;
};

export async function uploadCertificate(
  file: CertificateFile,
): Promise<UploadedCertificate> {
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await fetch(file.uri).then((response) => response.blob());
    form.append("file", blob, file.name);
  } else {
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? "application/octet-stream",
    } as unknown as Blob);
  }

  const { data } = await apiClient.post<ApiEnvelope<UploadedCertificate>>(
    routes.certificatesUpload,
    form,
  );
  return unwrap(data);
}
