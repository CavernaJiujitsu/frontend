import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent, within } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { Cave } from "@/api/services/caves.service";
import type { BackendClass } from "@/api/services/classes.service";
import type { HomeSummary } from "@/api/services/home.service";
import { classWindowForDay, ScheduleScreen } from "@/components/schedule/schedule-screen";
import { useAppStore } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) };
jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useRouter: () => mockRouter,
  usePathname: () => "/cavernas/cave/aulas",
}));

const mockGetCave = jest.fn();
jest.mock("@/api/services/caves.service", () => ({
  getCave: (...args: unknown[]) => mockGetCave(...args),
}));
const mockListAllClasses = jest.fn();
const mockEnrollClass = jest.fn();
jest.mock("@/api/services/classes.service", () => ({
  listAllClasses: (...args: unknown[]) => mockListAllClasses(...args),
  enrollClass: (...args: unknown[]) => mockEnrollClass(...args),
}));
const mockScheduleBeltValidation = jest.fn();
jest.mock("@/api/services/belt-validations.service", () => ({
  scheduleBeltValidation: (...args: unknown[]) => mockScheduleBeltValidation(...args),
}));
const mockGetHomeSummary = jest.fn();
jest.mock("@/api/services/home.service", () => ({
  getHomeSummary: (...args: unknown[]) => mockGetHomeSummary(...args),
}));

const CAVE_ID = "9157d890-613d-43b8-960a-b090a7af17e2";
// Only `Date` is frozen (17/11/2026 19:30 local).
const NOW = new Date(2026, 10, 17, 19, 30);
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 10, day, hours, minutes);

// Shapes mirror `GET /caves/:id`, `GET /classes`, the 409 bodies and
// `GET /profile-readonly/home` (curl, 17/11/2026).
function apiError(status: number, message: string, path: string) {
  const headers = new AxiosHeaders();
  return new AxiosError(message, String(status), { headers }, undefined, {
    status,
    statusText: "",
    headers,
    config: { headers },
    data: { message, timestamp: "2026-11-17T10:00:00.000Z", path },
  });
}

const CAVE: Cave = {
  id: CAVE_ID,
  name: "Caverna Matriz",
  units: [
    { id: "unit-centro", name: "Centro", address: null, neighborhood: null, latitude: "-23.55000000", longitude: "-46.63000000", active: true },
    { id: "unit-archived", name: "Antiga", address: null, neighborhood: null, latitude: "-23.55000000", longitude: "-46.63000000", active: false },
  ],
};

function classFixture(id: string, unitId: string, start: Date, overrides: Partial<BackendClass> = {}): BackendClass {
  return {
    id,
    startsAt: start.toISOString(),
    endsAt: new Date(start.getTime() + 90 * 60_000).toISOString(),
    capacity: 30,
    type: "SCHEDULED",
    caveUnit: { id: unitId, name: unitId, active: true, cave: { id: CAVE_ID, name: "Caverna Matriz" } },
    teacher: { id: "teacher-1", user: { id: "user-1", name: "Mestre Semente" } },
    belts: [],
    enrolledCount: 3,
    presentCount: 0,
    ...overrides,
  };
}

const CLASS_TONIGHT = classFixture("class-tonight", "unit-centro", at(17, 21));
const CLASS_ARCHIVED_UNIT = classFixture("class-archived", "unit-archived", at(17, 21), {
  teacher: { id: "teacher-2", user: { id: "user-2", name: "Professor Arquivado" } },
});

function homeWith(nextClass: HomeSummary["nextClass"]): HomeSummary {
  return {
    practitioner: { id: "practitioner-1", fullName: "Exec B Aluno" },
    nextClass,
    nearbyCaves: { data: [], _meta: { total: 0, limit: 5, radiusKm: 5, locationSource: "none" } },
  };
}

async function renderSchedule(mode: "onboarding" | "private" = "onboarding") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ScheduleScreen mode={mode} cavernaId={CAVE_ID} cavernaTitle="Caverna Matriz" />
    </QueryClientProvider>,
  );
}

const enrollButton = () => screen.getByRole("button", { name: "Inscrever na aula das 21:00 com Mestre Semente" });

describe("classWindowForDay", () => {
  it("covers the whole selected day", () => {
    expect(classWindowForDay(at(18, 10), NOW)).toEqual({
      from: new Date(2026, 10, 18, 0, 0, 0, 0).toISOString(),
      to: new Date(2026, 10, 18, 23, 59, 59, 999).toISOString(),
    });
  });

  it("returns null for a past day (nothing to book)", () => {
    expect(classWindowForDay(at(16, 10), NOW)).toBeNull();
  });
});

describe("ScheduleScreen", () => {
  beforeAll(() => {
    jest.useFakeTimers({
      now: NOW,
      doNotFake: [
        "setTimeout", "clearTimeout", "setInterval", "clearInterval", "setImmediate", "clearImmediate",
        "nextTick", "queueMicrotask", "requestAnimationFrame", "cancelAnimationFrame",
        "requestIdleCallback", "cancelIdleCallback", "hrtime", "performance",
      ],
    });
  });
  afterAll(() => jest.useRealTimers());

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState((state) => ({
      user: { ...state.user, practitionerId: "practitioner-1", beltValidationId: null, accessToken: "token", location: null },
    }));
    mockGetCave.mockResolvedValue(CAVE);
    mockGetHomeSummary.mockResolvedValue(homeWith(null));
  });

  afterEach(() => useErrorStore.getState().hide());

  it("shows the loading skeleton while the classes load", async () => {
    mockListAllClasses.mockReturnValue(new Promise(() => {}));

    await renderSchedule();

    expect(screen.getByLabelText("Buscando aulas")).toBeOnTheScreen();
  });

  it("fetches the selected day with a from/to window and the caveId filter", async () => {
    mockListAllClasses.mockResolvedValue([CLASS_TONIGHT]);

    await renderSchedule();
    await screen.findByText("Prof. Mestre Semente");

    expect(mockListAllClasses).toHaveBeenCalledWith({
      caveId: CAVE_ID,
      from: new Date(2026, 10, 17, 0, 0, 0, 0).toISOString(),
      to: new Date(2026, 10, 17, 23, 59, 59, 999).toISOString(),
    });
  });

  it("lists only classes of active units, with the seat usage from the API", async () => {
    mockListAllClasses.mockResolvedValue([CLASS_TONIGHT, CLASS_ARCHIVED_UNIT]);

    await renderSchedule();

    expect(await screen.findByText("Prof. Mestre Semente")).toBeOnTheScreen();
    expect(screen.getByText("3/30 inscritos")).toBeOnTheScreen();
    expect(screen.queryByText("Prof. Professor Arquivado")).not.toBeOnTheScreen();
  });

  it("shows the empty state only for a successful empty answer", async () => {
    mockListAllClasses.mockResolvedValue([]);

    await renderSchedule();

    expect(await screen.findByText("Nenhuma aula encontrada")).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível carregar as aulas")).not.toBeOnTheScreen();
  });

  it("shows an error state (not an empty list) when loading fails", async () => {
    mockGetCave.mockRejectedValue(apiError(404, "Caverna não encontrada", `/api/v1/caves/${CAVE_ID}`));
    mockListAllClasses.mockResolvedValue([]);

    await renderSchedule();

    expect(await screen.findByText("Não foi possível carregar as aulas")).toBeOnTheScreen();
    expect(screen.getByText("Caverna não encontrada")).toBeOnTheScreen();
    expect(screen.queryByText("Nenhuma aula encontrada")).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeOnTheScreen();
  });

  it("does not query a past day", async () => {
    mockListAllClasses.mockResolvedValue([CLASS_TONIGHT]);
    await renderSchedule();
    await screen.findByText("Prof. Mestre Semente");
    mockListAllClasses.mockClear();

    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Selecionar mês, mês atual Novembro" }));
    await user.press(await screen.findByRole("button", { name: "Selecionar mês Outubro" }));

    expect(await screen.findByText("Nenhuma aula encontrada")).toBeOnTheScreen();
    expect(mockListAllClasses).not.toHaveBeenCalled();
  });

  it("marks the class the student is already enrolled in, with its status", async () => {
    mockListAllClasses.mockResolvedValue([CLASS_TONIGHT]);
    mockGetHomeSummary.mockResolvedValue(
      homeWith({
        enrollmentId: "enrollment-1",
        enrollmentStatus: "PENDING",
        classId: CLASS_TONIGHT.id,
        classType: "SCHEDULED",
        startsAt: CLASS_TONIGHT.startsAt,
        endsAt: CLASS_TONIGHT.endsAt,
        caveUnit: { id: "unit-centro", name: "Centro", caveId: CAVE_ID, caveName: "Caverna Matriz", address: null, neighborhood: null },
        teacher: { id: "teacher-1", name: "Mestre Semente" },
      }),
    );

    await renderSchedule();

    const enrolled = await screen.findByRole("button", { name: "Inscrito na aula das 21:00 com Mestre Semente" });
    expect(enrolled).toBeDisabled();
    expect(screen.getByText("Inscrição pendente")).toBeOnTheScreen();
  });

  it.each([
    "Aula lotada",
    "Aluno já inscrito nesta aula",
    "Faixa atual do aluno não é elegível para esta aula",
  ])("shows the API 409 message '%s' and stays on the screen", async (message) => {
    mockListAllClasses.mockResolvedValue([CLASS_TONIGHT]);
    mockEnrollClass.mockRejectedValue(apiError(409, message, `/api/v1/classes/${CLASS_TONIGHT.id}/enrollments`));
    await renderSchedule();
    await screen.findByText("Prof. Mestre Semente");

    await userEvent.setup().press(enrollButton());

    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("enrolls once even on a double tap and then opens the home tab", async () => {
    mockListAllClasses.mockResolvedValue([CLASS_TONIGHT]);
    let resolveEnroll: (value: unknown) => void = () => {};
    mockEnrollClass.mockReturnValue(new Promise((resolve) => { resolveEnroll = resolve; }));
    await renderSchedule();
    await screen.findByText("Prof. Mestre Semente");
    const user = userEvent.setup();

    await user.press(enrollButton());
    await user.press(screen.getByRole("button", { name: "Inscrevendo… na aula das 21:00 com Mestre Semente" }));
    resolveEnroll({ id: "enrollment-1", status: "PENDING" });

    expect(await screen.findByText("Prof. Mestre Semente")).toBeOnTheScreen();
    expect(mockEnrollClass).toHaveBeenCalledTimes(1);
    expect(mockEnrollClass).toHaveBeenCalledWith(CLASS_TONIGHT.id, { practitionerId: "practitioner-1" });
    expect(mockRouter.replace).toHaveBeenCalledWith("/inicio");
  });

  it("schedules the pending belt validation into the selected class", async () => {
    mockListAllClasses.mockResolvedValue([CLASS_TONIGHT]);
    mockScheduleBeltValidation.mockResolvedValue({ id: "validation-1", status: "SCHEDULED" });
    useAppStore.setState((state) => ({
      user: { ...state.user, beltValidationId: "validation-1" },
    }));

    await renderSchedule();
    await screen.findByText("Prof. Mestre Semente");
    await userEvent.setup().press(enrollButton());

    expect(mockScheduleBeltValidation).toHaveBeenCalledWith("validation-1", CLASS_TONIGHT.id);
    expect(mockEnrollClass).not.toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith("/inicio");
  });

  it("does not navigate when the enrollment finishes after the screen is gone", async () => {
    mockListAllClasses.mockResolvedValue([CLASS_TONIGHT]);
    let resolveEnroll: (value: unknown) => void = () => {};
    mockEnrollClass.mockReturnValue(new Promise((resolve) => { resolveEnroll = resolve; }));
    const view = await renderSchedule();
    await screen.findByText("Prof. Mestre Semente");

    await userEvent.setup().press(enrollButton());
    await view.unmount();
    resolveEnroll({ id: "enrollment-1", status: "PENDING" });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("opens the booking screen in the private area instead of enrolling", async () => {
    mockListAllClasses.mockResolvedValue([CLASS_TONIGHT]);
    await renderSchedule("private");
    await screen.findByText("Prof. Mestre Semente");

    await userEvent.setup().press(enrollButton());

    expect(mockEnrollClass).not.toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/reservar-encontro/[classId]",
      params: { classId: CLASS_TONIGHT.id },
    });
    expect(within(screen.getByRole("button", { name: "Inscrever na aula das 21:00 com Mestre Semente" })).getByText("Inscrever")).toBeOnTheScreen();
  });
});
