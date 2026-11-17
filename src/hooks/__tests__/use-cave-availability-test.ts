import type { Cave } from "@/api/services/caves.service";
import type { BackendClass } from "@/api/services/classes.service";
import { fetchCaveAvailability } from "@/hooks/use-cave-availability";

const mockListAllClasses = jest.fn();
jest.mock("@/api/services/classes.service", () => ({
  listAllClasses: (...args: unknown[]) => mockListAllClasses(...args),
}));

const NOW = new Date(2026, 10, 17, 19, 30);

function unit(id: string, active: boolean) {
  return {
    id,
    name: id,
    address: null,
    neighborhood: null,
    latitude: "-23.55000000",
    longitude: "-46.63000000",
    active,
  };
}

function classIn(unitId: string, start: Date, end: Date): BackendClass {
  return {
    id: `class-${unitId}-${start.getHours()}`,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    capacity: 30,
    caveUnit: { id: unitId, name: unitId, active: true },
    teacher: { id: "t1", user: { id: "u1", name: "Mestre Semente" } },
    belts: [],
    enrolledCount: 0,
    presentCount: 0,
  };
}

describe("fetchCaveAvailability", () => {
  beforeEach(() => mockListAllClasses.mockReset());

  it("asks the public classes listing for today's window of each cave", async () => {
    mockListAllClasses.mockResolvedValue([]);
    const caves: Cave[] = [{ id: "cave-1", name: "Caverna Matriz", units: [unit("u1", true)] }];

    await fetchCaveAvailability(caves, NOW);

    expect(mockListAllClasses).toHaveBeenCalledWith({
      caveId: "cave-1",
      from: new Date(2026, 10, 17, 0, 0, 0, 0).toISOString(),
      to: new Date(2026, 10, 17, 23, 59, 59, 999).toISOString(),
    });
  });

  it("derives the flags only from classes of active units", async () => {
    mockListAllClasses.mockImplementation(({ caveId }: { caveId: string }) =>
      Promise.resolve(
        caveId === "open"
          ? [classIn("u-open", new Date(2026, 10, 17, 19), new Date(2026, 10, 17, 20))]
          : [classIn("u-archived", new Date(2026, 10, 17, 19), new Date(2026, 10, 17, 20))],
      ),
    );
    const caves: Cave[] = [
      { id: "open", name: "Aberta", units: [unit("u-open", true)] },
      { id: "archived-only", name: "Arquivada", units: [unit("u-live", true), unit("u-archived", false)] },
    ];

    const result = await fetchCaveAvailability(caves, NOW);

    expect(result).toEqual({
      open: { openNow: true, classesToday: true },
      "archived-only": { openNow: false, classesToday: false },
    });
  });

  it("does not query a cave without active units", async () => {
    const caves: Cave[] = [{ id: "cave-1", name: "Sem unidades", units: [unit("u1", false)] }];

    const result = await fetchCaveAvailability(caves, NOW);

    expect(mockListAllClasses).not.toHaveBeenCalled();
    expect(result).toEqual({ "cave-1": { openNow: false, classesToday: false } });
  });

  it("propagates an API failure (the screen shows an error, not an empty list)", async () => {
    mockListAllClasses.mockRejectedValue(new Error("boom"));
    const caves: Cave[] = [{ id: "cave-1", name: "Caverna", units: [unit("u1", true)] }];

    await expect(fetchCaveAvailability(caves, NOW)).rejects.toThrow("boom");
  });
});
