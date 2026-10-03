export type BeltMock = {
  id: string;
  name: string;
};

export const MAX_CERTIFICATE_SIZE_BYTES = 5 * 1024 * 1024;

export const CERTIFICATE_UPLOAD_DELAY_MS = 1_200;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const beltMocks: BeltMock[] = [
  { id: "white", name: "Branca" },
  { id: "yellow", name: "Amarela" },
  { id: "orange", name: "Laranja" },
  { id: "green", name: "Verde" },
  { id: "blue", name: "Azul" },
  { id: "purple", name: "Roxa" },
  { id: "brown", name: "Marrom" },
  { id: "black", name: "Preta" },
];

export type CertificateMock = {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
};

export async function uploadCertificateMock(
  beltId: string,
  file: CertificateMock | null,
): Promise<void> {
  void beltId;
  void file;
  await wait(CERTIFICATE_UPLOAD_DELAY_MS);
}
