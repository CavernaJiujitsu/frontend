/**
 * Mock de UI das telas de faixa (select-belt / belt-info).
 * Espelha as opções exibidas nos chips/cards de faixa e o upload de certificado.
 * Será substituído pelo service real (`GET /belts` + `POST /certificates/upload`)
 * no futuro. Por enquanto mantém o fluxo navegável sem backend.
 */
export type BeltMock = {
  id: string;
  name: string;
};

/** Tamanho máximo aceito para o certificado (5MB). */
export const MAX_CERTIFICATE_SIZE_BYTES = 5 * 1024 * 1024;

/** Latência simulada do upload do certificado. */
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

/**
 * Upload async com latência — espelha o futuro `POST /certificates/upload`.
 * Mantido como mock até o contrato do back estar definido.
 */
export async function uploadCertificateMock(
  beltId: string,
  file: CertificateMock | null,
): Promise<void> {
  void beltId;
  void file;
  await wait(CERTIFICATE_UPLOAD_DELAY_MS);
}
