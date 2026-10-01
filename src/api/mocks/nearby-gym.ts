/**
 * Mock de UI da tela de cavernas próximas.
 * Espelha as props do CardComponent (menos `onPress`).
 * Será substituído pelo service de nearby (geolocalização +
 * basicOperationsService.getPaginated) no futuro.
 */
export type NearbyGymMock = {
  id: string;
  image: string;
  title: string;
  tags: string[];
  subtitle: string;
};

/** Latência simulada da busca de cavernas (request pesada de nearby). */
export const NEARBY_GYMS_DELAY_MS = 1_200;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export const nearbyGymMocks: NearbyGymMock[] = [
  {
    id: "caverna-mooca",
    image: "https://picsum.photos/seed/caverna-mooca/200/200",
    title: "Caverna Mooca",
    tags: ["Gi"],
    subtitle: "1,2 km • Mooca",
  },
  {
    id: "caverna-vila-matilde",
    image: "https://picsum.photos/seed/caverna-vila-matilde/200/200",
    title: "Caverna Vila Matilde",
    tags: ["No-Gi"],
    subtitle: "2,0 km • Vila Matilde",
  },
  {
    id: "caverna-tatuape",
    image: "https://picsum.photos/seed/caverna-tatuape/200/200",
    title: "Caverna Tatuapé",
    tags: ["Gi", "Kids"],
    subtitle: "3,5 km • Tatuapé",
  },
  {
    id: "caverna-penha",
    image: "https://picsum.photos/seed/caverna-penha/200/200",
    title: "Caverna Penha",
    tags: ["Gi"],
    subtitle: "4,1 km • Penha",
  },
  {
    id: "caverna-itaquera",
    image: "https://picsum.photos/seed/caverna-itaquera/200/200",
    title: "Caverna Itaquera",
    tags: ["No-Gi", "Competição"],
    subtitle: "5,8 km • Itaquera",
  },
];

/**
 * Busca async com latência — espelha o futuro `GET /gyms/nearby`.
 * A tela aciona `useLoadingStore.show("nearby-gyms")` antes e `hide` no `finally`.
 */
export async function fetchNearbyGyms(search: string): Promise<NearbyGymMock[]> {
  await wait(NEARBY_GYMS_DELAY_MS);
  const term = search.trim().toLowerCase();
  if (term.length === 0) return nearbyGymMocks;
  return nearbyGymMocks.filter((gym) =>
    gym.title.toLowerCase().includes(term),
  );
}
