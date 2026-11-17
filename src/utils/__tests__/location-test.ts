import { normalizeCoordinates } from "@/utils/location";

describe("normalizeCoordinates", () => {
  it("rounds to at most 8 decimal places (backend DTO limit)", () => {
    expect(normalizeCoordinates(-23.123456789123, -46.987654321987)).toEqual({
      latitude: -23.12345679,
      longitude: -46.98765432,
    });
  });

  it("returns null for missing or non-finite values", () => {
    expect(normalizeCoordinates(null, -46.6)).toBeNull();
    expect(normalizeCoordinates(-23.5, undefined)).toBeNull();
    expect(normalizeCoordinates(Number.NaN, -46.6)).toBeNull();
  });

  it("returns null when out of geographic range", () => {
    expect(normalizeCoordinates(91, 0)).toBeNull();
    expect(normalizeCoordinates(0, -181)).toBeNull();
  });
});
