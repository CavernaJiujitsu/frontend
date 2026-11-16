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

export async function listCertificates(
  params: { page?: number; limit?: number } = {},
): Promise<CertificateRecord[]> {
  const { data } = await apiClient.get<
    ApiEnvelope<PaginatedResponse<CertificateRecord>>
  >(routes.graduationCertificates, {
    params: { page: params.page ?? 1, limit: params.limit ?? 100 },
  });
  return unwrap(data).data;
}
