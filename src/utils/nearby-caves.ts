import type { HomeSummary } from "@/api/services/home.service";

type NearbyMeta = HomeSummary["nearbyCaves"]["_meta"];

export function nearbyCavesEmptyMessage({ locationSource, radiusKm }: NearbyMeta): string {
  if (locationSource === "none") {
    return "Sua localização não está disponível. Ative a localização no dispositivo para ver cavernas próximas.";
  }

  return `Nenhuma caverna ativa encontrada em até ${radiusKm} km da sua localização.`;
}
