import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { routes } from "@/api/endpoints/routes";
import { unwrap, type ApiEnvelope } from "@/api/types/envelope";
import type { PaginatedResponse } from "@/api/types/pagination";

export type CertificateFile = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

export type UploadedCertificate = {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  url: string;
};

export async function uploadCertificate(
  file: CertificateFile,
): Promise<UploadedCertificate> {
  const form = new FormData();
  form.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? "application/octet-stream",
  } as unknown as Blob);

  const { data } = await apiClient.post<ApiEnvelope<UploadedCertificate>>(
    routes.certificatesUpload,
    form,
  );
  return unwrap(data);
}

export async function listCertificates(): Promise<UploadedCertificate[]> {
  const { data } = await apiClient.get<
    ApiEnvelope<PaginatedResponse<UploadedCertificate>>
  >(routes.certificates, {
    params: { page: 1, limit: 100 },
  });
  return unwrap(data).data;
}
