export type Coordinates = {
  latitude: number;
  longitude: number;
};

export function normalizeCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): Coordinates | null {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude: Number(latitude.toFixed(8)),
    longitude: Number(longitude.toFixed(8)),
  };
}
