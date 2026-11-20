import { nearbyCavesEmptyMessage } from "@/utils/nearby-caves";

describe("nearbyCavesEmptyMessage", () => {
  it("informa quando não há localização", () => {
    expect(
      nearbyCavesEmptyMessage({
        locationSource: "none",
        radiusKm: 5,
        limit: 5,
        total: 0,
      }),
    ).toContain("Sua localização não está disponível");
  });

  it.each(["request", "profile"] as const)(
    "informa o raio quando a localização vem de %s",
    (locationSource) => {
      expect(
        nearbyCavesEmptyMessage({
          locationSource,
          radiusKm: 5,
          limit: 5,
          total: 0,
        }),
      ).toBe("Nenhuma caverna ativa encontrada em até 5 km da sua localização.");
    },
  );
});
