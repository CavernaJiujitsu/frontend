import { caveUnitMarkers, validCoordinate } from "./map-data";
import type { Cave } from "@/api/services/caves.service";

describe("cave map markers", () => {
  it("keeps only active units with valid geographic coordinates and their cave identity", () => {
    const caves: Cave[] = [{
      id: "cave-1", name: "Caverna A",
      units: [
        { id: "u-1", name: "Centro", address: "Rua A", neighborhood: null, latitude: "-23.55", longitude: "-46.63", active: true },
        { id: "u-2", name: "Fechada", address: null, neighborhood: null, latitude: "-23.55", longitude: "-46.63", active: false },
        { id: "u-3", name: "Inválida", address: null, neighborhood: null, latitude: "91", longitude: "-46.63" },
        { id: "u-4", name: "Vazia", address: null, neighborhood: null, latitude: "", longitude: "-46.63" },
      ],
    }];
    expect(caveUnitMarkers(caves)).toEqual([{
      id: "cave-1:u-1", caveId: "cave-1", caveName: "Caverna A",
      unitName: "Centro", address: "Rua A", latitude: -23.55, longitude: -46.63,
    }]);
  });

  it("does not treat absent, infinite or placeholder coordinates as an origin", () => {
    expect(validCoordinate(undefined)).toBe(false);
    expect(validCoordinate({ latitude: 0, longitude: 0 })).toBe(false);
    expect(validCoordinate({ latitude: Infinity, longitude: -46 })).toBe(false);
    expect(validCoordinate({ latitude: -23, longitude: -46 })).toBe(true);
  });
});
