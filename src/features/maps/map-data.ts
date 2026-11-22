import type { Cave } from "@/api/services/caves.service";

export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export type Coordinate = { latitude: number; longitude: number };
export type UnitMarker = Coordinate & {
  id: string;
  caveId: string;
  caveName: string;
  unitName: string;
  address: string | null;
};

export type CaveMapProps = {
  center?: Coordinate | null;
  units: UnitMarker[];
  selectedId?: string | null;
  onUnitPress?: (unit: UnitMarker) => void;
  height?: number;
};

export function validCoordinate(value: Coordinate | null | undefined): value is Coordinate {
  return Boolean(value && Number.isFinite(value.latitude) && Number.isFinite(value.longitude)
    && Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180
    && !(value.latitude === 0 && value.longitude === 0));
}

export function caveUnitMarkers(caves: Cave[]): UnitMarker[] {
  return caves.flatMap((cave) => (cave.units ?? []).flatMap((unit) => {
    if (unit.latitude == null || unit.longitude == null || !String(unit.latitude).trim() || !String(unit.longitude).trim()) return [];
    const point = { latitude: Number(unit.latitude), longitude: Number(unit.longitude) };
    return unit.active === false || !validCoordinate(point) ? [] : [{
      ...point,
      id: `${cave.id}:${unit.id}`,
      caveId: cave.id,
      caveName: cave.name,
      unitName: unit.name,
      address: unit.address,
    }];
  }));
}
