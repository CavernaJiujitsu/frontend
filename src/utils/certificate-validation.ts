import { MAX_CERTIFICATE_SIZE_BYTES } from "@/api/mocks/belts";

type CertificateFile = {
  name: string;
  size?: number;
  mimeType?: string;
};

type ValidationError = {
  title: string;
  message: string;
};

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "avif",
  "gif",
  "bmp",
  "tif",
  "tiff",
]);

export function validateCertificateFile(
  file: CertificateFile,
): ValidationError | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const isPdf = extension === "pdf";
  const isImage = extension !== undefined && IMAGE_EXTENSIONS.has(extension);
  const mimeType = file.mimeType?.toLowerCase();
  const hasKnownMimeType = mimeType && mimeType !== "application/octet-stream";
  const mimeMatches =
    !hasKnownMimeType ||
    (isPdf && mimeType === "application/pdf") ||
    (isImage && mimeType.startsWith("image/") && mimeType !== "image/svg+xml");

  if ((!isPdf && !isImage) || !mimeMatches) {
    return {
      title: "Formato não permitido",
      message: "Selecione uma foto ou um PDF para o certificado.",
    };
  }

  if (file.size === undefined || !Number.isFinite(file.size) || file.size <= 0) {
    return {
      title: "Tamanho indisponível",
      message: "Não foi possível verificar o tamanho do arquivo. Escolha outro arquivo.",
    };
  }

  if (file.size > MAX_CERTIFICATE_SIZE_BYTES) {
    return {
      title: "Arquivo muito grande",
      message: "O tamanho máximo permitido para o certificado é de 5MB.",
    };
  }

  return null;
}
