import { listAllClasses, MAX_CLASS_PAGES, type BackendClass } from "@/api/services/classes.service";

const mockGet = jest.fn();
jest.mock("@/api/bootstrap/axios-bootstrap", () => ({
  apiClient: { get: (...args: unknown[]) => mockGet(...args) },
}));

// Mirrors `GET /api/v1/classes` (checked with curl on 17/11/2026).
function classFixture(id: string): BackendClass {
  return {
    id,
    startsAt: "2026-11-17T21:00:00.000Z",
    endsAt: "2026-11-17T22:30:00.000Z",
    capacity: 30,
    type: "SCHEDULED",
    caveUnit: { id: "unit-1", name: "Centro", neighborhood: null, active: true, cave: { id: "cave-1", name: "Caverna Matriz" } },
    teacher: { id: "teacher-1", user: { id: "user-1", name: "Mestre Semente" } },
    belts: [],
    enrolledCount: 0,
    presentCount: 0,
  };
}

function pageResponse(items: BackendClass[], page: number, totalPage: number) {
  return {
    data: {
      message: "Aulas listadas",
      data: {
        data: items,
        _meta: { page, totalPage, total: totalPage * items.length },
        _links: { self: { href: "/api/v1/classes" }, first: { href: "" }, prev: null, next: null, last: { href: "" } },
      },
      timestamp: "2026-11-17T10:00:00.000Z",
    },
  };
}

const WINDOW = { caveId: "cave-1", from: "2026-11-17T03:00:00.000Z", to: "2026-11-18T02:59:59.999Z" };

describe("listAllClasses", () => {
  beforeEach(() => mockGet.mockReset());

  it("sends the from/to window and the caveId filter", async () => {
    mockGet.mockResolvedValueOnce(pageResponse([classFixture("a")], 1, 1));

    await listAllClasses(WINDOW);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith("/api/v1/classes", {
      params: { ...WINDOW, page: 1, limit: 100 },
    });
  });

  it("reads every page instead of stopping at the first 100 classes", async () => {
    mockGet
      .mockResolvedValueOnce(pageResponse([classFixture("a")], 1, 2))
      .mockResolvedValueOnce(pageResponse([classFixture("b")], 2, 2));

    const classes = await listAllClasses(WINDOW);

    expect(classes.map((cls) => cls.id)).toEqual(["a", "b"]);
    expect(mockGet).toHaveBeenLastCalledWith("/api/v1/classes", {
      params: { ...WINDOW, page: 2, limit: 100 },
    });
  });

  it("stops after an empty listing (total 0)", async () => {
    mockGet.mockResolvedValueOnce(pageResponse([], 1, 0));

    await expect(listAllClasses(WINDOW)).resolves.toEqual([]);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it("never reads more than MAX_CLASS_PAGES pages", async () => {
    mockGet.mockImplementation((_url: string, config: { params: { page: number } }) =>
      Promise.resolve(pageResponse([classFixture(`p${config.params.page}`)], config.params.page, 999)),
    );

    const classes = await listAllClasses(WINDOW);

    expect(mockGet).toHaveBeenCalledTimes(MAX_CLASS_PAGES);
    expect(classes).toHaveLength(MAX_CLASS_PAGES);
  });
});
