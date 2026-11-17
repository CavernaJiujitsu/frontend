import { listCaves } from "@/api/services/caves.service";

const mockGet = jest.fn();
jest.mock("@/api/bootstrap/axios-bootstrap", () => ({
  apiClient: { get: (...args: unknown[]) => mockGet(...args) },
}));

// Mirrors the public `GET /api/v1/caves` (checked with curl on 17/11/2026).
const cavesResponse = {
  data: {
    message: "Cavernas listadas",
    data: {
      data: [
        {
          id: "cave-1",
          name: "Caverna Lapa",
          active: true,
          units: [
            {
              id: "unit-1",
              name: "Pirituba",
              address: "Av. Paula Ferreira, 1200",
              neighborhood: "Pirituba",
              latitude: "-23.48700000",
              longitude: "-46.72250000",
              active: true,
            },
          ],
        },
      ],
      _meta: { page: 1, totalPage: 1, total: 1 },
      _links: { self: { href: "/api/v1/caves" }, first: { href: "" }, prev: null, next: null, last: { href: "" } },
    },
    timestamp: "2026-11-17T10:00:00.000Z",
  },
};

describe("listCaves", () => {
  beforeEach(() => mockGet.mockReset().mockResolvedValue(cavesResponse));

  it("sends coordinates with at most 8 decimal places (API limit)", async () => {
    await listCaves(undefined, -23.123456789123, -46.987654321987);

    expect(mockGet).toHaveBeenCalledWith("/api/v1/caves", {
      params: { page: 1, limit: 20, latitude: -23.12345679, longitude: -46.98765432 },
    });
  });

  it("returns the caves with their units (active flag included)", async () => {
    const caves = await listCaves();

    expect(caves[0].units[0]).toMatchObject({ id: "unit-1", active: true });
  });
});
