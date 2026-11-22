import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent, waitFor, within } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { Cave } from "@/api/services/caves.service";
import type { BackendClass } from "@/api/services/classes.service";
import Cavernas from "@/app/(private)/cavernas/index";
import { studentKeys } from "@/hooks/query-keys";
import { useAppStore } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);
jest.mock("@/features/maps/cave-map", () => {
  const { Pressable, Text, View } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    CaveMap: ({ units, onUnitPress }: { units: import("@/features/maps/map-data").UnitMarker[]; onUnitPress: (unit: import("@/features/maps/map-data").UnitMarker) => void }) => (
      <View>{units.map((unit) => <Pressable key={unit.id} accessibilityRole="button" accessibilityLabel={`Pino ${unit.unitName}`} onPress={() => onUnitPress(unit)}>
        <Text>{unit.unitName}</Text>
      </Pressable>)}</View>
    ),
  };
});
// The real spinner runs an endless animation; its label is what matters here.
jest.mock("@/components/customized/loading-spinner/loading-spinner", () => {
  const { Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return { LoadingSpinner: ({ label }: { label?: string }) => <MockText>{label}</MockText> };
});

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) };
jest.mock("expo-router", () => ({
  get router() {
    return mockRouter;
  },
  useRouter: () => mockRouter,
  usePathname: () => "/cavernas",
  useLocalSearchParams: () => ({}),
}));

const mockListCaves = jest.fn();
jest.mock("@/api/services/caves.service", () => ({
  listCaves: (...args: unknown[]) => mockListCaves(...args),
}));
const mockListAllClasses = jest.fn();
const mockListClassesPage = jest.fn();
jest.mock("@/api/services/classes.service", () => ({
  listAllClasses: (...args: unknown[]) => mockListAllClasses(...args),
  listClassesPage: (...args: unknown[]) => mockListClassesPage(...args),
}));
const mockGetPractitioner = jest.fn();
jest.mock("@/api/services/practitioners.service", () => ({
  getPractitioner: (...args: unknown[]) => mockGetPractitioner(...args),
}));

// Shapes mirror the API answers checked with curl on 17/11/2026.
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

function unit(id: string, active = true) {
  return {
    id,
    name: `Unidade ${id}`,
    address: null,
    neighborhood: `Bairro ${id}`,
    latitude: "-23.55000000",
    longitude: "-46.63000000",
    active,
  };
}

const OPEN_CAVE: Cave = { id: "cave-open", name: "Caverna Aberta", units: [unit("u-open")] };
const LATER_CAVE: Cave = { id: "cave-later", name: "Caverna Mais Tarde", units: [unit("u-later")] };
const ARCHIVED_CAVE: Cave = {
  id: "cave-archived",
  name: "Caverna Arquivada",
  units: [unit("u-live"), unit("u-archived", false)],
};

function classIn(unitId: string, start: Date, end: Date): BackendClass {
  return {
    id: `class-${unitId}`,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    capacity: 30,
    type: "SCHEDULED",
    caveUnit: { id: unitId, name: unitId, active: true },
    teacher: { id: "t1", user: { id: "u1", name: "Mestre Semente" } },
    belts: [],
    enrolledCount: 0,
    presentCount: 0,
  };
}

// Only `Date` is frozen (19:30 local); real timers keep react-query and
// userEvent working.
const NOW = new Date(2026, 10, 17, 19, 30);
const at = (hours: number, minutes = 0) => new Date(2026, 10, 17, hours, minutes);

/** One class happening now, one later today and one in an archived unit. */
function classesByCave({ caveId }: { caveId: string }): Promise<BackendClass[]> {
  if (caveId === OPEN_CAVE.id) return Promise.resolve([classIn("u-open", at(19), at(20, 30))]);
  if (caveId === LATER_CAVE.id) return Promise.resolve([classIn("u-later", at(21), at(22))]);
  return Promise.resolve([classIn("u-archived", at(19), at(20, 30))]);
}

async function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await render(
    <QueryClientProvider client={client}>
      <Cavernas />
    </QueryClientProvider>,
  );
  return client;
}

describe("Cavernas screen", () => {
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
      user: {
        ...state.user,
        practitionerId: "practitioner-1",
        accessToken: "token",
        // Device coordinates are used when no saved address is available.
        location: {
          coords: { latitude: -23.55, longitude: -46.63, altitude: null, accuracy: 10, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: 0,
        },
      },
    }));
    mockGetPractitioner.mockResolvedValue({ id: "practitioner-1", latitude: null, longitude: null });
  });

  // The error toast keeps a dismiss timer alive.
  afterEach(() => useErrorStore.getState().hide());

  it("shows a loading state while the caves load", async () => {
    mockListCaves.mockReturnValue(new Promise(() => {}));

    await renderScreen();

    expect(screen.getByText("Buscando cavernas…")).toBeOnTheScreen();
  });

  it("lists the caves without availability labels in the default filter", async () => {
    mockListCaves.mockResolvedValue([OPEN_CAVE, LATER_CAVE]);

    await renderScreen();

    const card = await screen.findByRole("button", { name: "Caverna Aberta" });
    expect(within(card).queryByText("Aberta agora")).not.toBeOnTheScreen();
    expect(within(card).queryByText("Aulas hoje")).not.toBeOnTheScreen();
    expect(mockListAllClasses).not.toHaveBeenCalled();
  });

  it("keeps map pins in sync with the list and opens the selected cave", async () => {
    mockListCaves.mockResolvedValue([OPEN_CAVE, ARCHIVED_CAVE]);
    mockListAllClasses.mockImplementation(classesByCave);
    await renderScreen();
    const pin = await screen.findByRole("button", { name: "Pino Unidade u-open" });
    expect(screen.queryByRole("button", { name: "Pino Unidade u-archived" })).not.toBeOnTheScreen();
    await userEvent.setup().press(pin);
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/cavernas/[cavernaId]/aulas",
      params: { cavernaId: "cave-open", cavernaTitle: "Caverna Aberta" },
    });
    await userEvent.setup().press(screen.getByRole("button", { name: "Filtrar por Abertas agora" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Pino Unidade u-live" })).not.toBeOnTheScreen());
    expect(screen.getByRole("button", { name: "Pino Unidade u-open" })).toBeOnTheScreen();
  });

  it("uses the saved address by default, allows GPS, and reacts to profile changes", async () => {
    mockGetPractitioner.mockResolvedValue({
      id: "practitioner-1",
      address: "Franco da Rocha, SP",
      latitude: "-23.32192070",
      longitude: "-46.72204140",
    });
    mockListCaves.mockImplementation(async (_search: string, latitude: number) => [
      { ...OPEN_CAVE, distanceKm: latitude === -23.55 ? 0 : 27 },
    ]);

    const client = await renderScreen();
    await screen.findByRole("button", { name: "Caverna Aberta" });
    expect(screen.getByText("Distâncias a partir de seu endereço salvo")).toBeOnTheScreen();
    expect(mockListCaves).toHaveBeenCalledWith("", -23.3219207, -46.7220414);
    expect(screen.getByText("27,0 km")).toBeOnTheScreen();

    await userEvent.setup().press(screen.getByRole("button", { name: "Usar localização do dispositivo" }));
    await waitFor(() => expect(mockListCaves).toHaveBeenCalledWith("", -23.55, -46.63));
    expect(screen.getByText("Distâncias a partir de sua localização do dispositivo")).toBeOnTheScreen();
    expect(await screen.findByText("0,0 km")).toBeOnTheScreen();

    await userEvent.setup().press(screen.getByRole("button", { name: "Usar endereço salvo" }));
    client.setQueryData(studentKeys.practitioner("practitioner-1"), {
      id: "practitioner-1",
      address: "Outro endereço",
      latitude: "-23.40000000",
      longitude: "-46.80000000",
    });
    await waitFor(() => expect(mockListCaves).toHaveBeenCalledWith("", -23.4, -46.8));
  });

  it("still uses device location without a saved address", async () => {
    mockListCaves.mockResolvedValue([OPEN_CAVE]);
    await renderScreen();
    await screen.findByRole("button", { name: "Caverna Aberta" });
    expect(mockListCaves).toHaveBeenCalledWith("", -23.55, -46.63);
    expect(screen.getByText("Distâncias a partir de sua localização do dispositivo")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Usar endereço salvo" })).not.toBeOnTheScreen();
  });

  it("shows the empty state only for a successful empty answer", async () => {
    mockListCaves.mockResolvedValue([]);

    await renderScreen();

    expect(await screen.findByText("Nenhuma caverna encontrada.")).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível carregar as cavernas")).not.toBeOnTheScreen();
  });

  it("shows an error state with retry when the caves fail to load", async () => {
    mockListCaves.mockRejectedValueOnce(apiError(500, "Erro interno", "/api/v1/caves"));

    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar as cavernas")).toBeOnTheScreen();
    expect(screen.queryByText("Nenhuma caverna encontrada.")).not.toBeOnTheScreen();

    mockListCaves.mockResolvedValueOnce([OPEN_CAVE]);
    await userEvent.setup().press(screen.getByRole("button", { name: "Tentar carregar as cavernas novamente" }));

    expect(await screen.findByRole("button", { name: "Caverna Aberta" })).toBeOnTheScreen();
  });

  it("'Abertas agora' keeps only caves with a class happening now, labelled from data", async () => {
    mockListCaves.mockResolvedValue([OPEN_CAVE, LATER_CAVE, ARCHIVED_CAVE]);
    mockListAllClasses.mockImplementation(classesByCave);
    await renderScreen();
    await screen.findByRole("button", { name: "Caverna Aberta" });

    await userEvent.setup().press(screen.getByRole("button", { name: "Filtrar por Abertas agora" }));

    const openCard = await screen.findByRole("button", { name: "Caverna Aberta" });
    expect(within(openCard).getByText("Aberta agora")).toBeOnTheScreen();
    expect(within(openCard).getByText("Aulas hoje")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Caverna Mais Tarde" })).not.toBeOnTheScreen();
    // A class in an archived unit does not count.
    expect(screen.queryByRole("button", { name: "Caverna Arquivada" })).not.toBeOnTheScreen();
    // Only the public classes listing (the services mock has no admin route).
    expect(mockListAllClasses).toHaveBeenCalledWith(expect.objectContaining({ caveId: OPEN_CAVE.id }));
  });

  it("'Aulas hoje' never shows 'Aberta agora' for a cave whose class is later", async () => {
    mockListCaves.mockResolvedValue([LATER_CAVE]);
    mockListAllClasses.mockImplementation(classesByCave);
    await renderScreen();
    await screen.findByRole("button", { name: "Caverna Mais Tarde" });

    await userEvent.setup().press(screen.getByRole("button", { name: "Filtrar por Aulas hoje" }));

    const card = await screen.findByRole("button", { name: "Caverna Mais Tarde" });
    expect(within(card).getByText("Aulas hoje")).toBeOnTheScreen();
    expect(within(card).queryByText("Aberta agora")).not.toBeOnTheScreen();
  });

  it("shows an empty state (not an error) when no cave is open now", async () => {
    mockListCaves.mockResolvedValue([LATER_CAVE]);
    mockListAllClasses.mockResolvedValue([]);
    await renderScreen();
    await screen.findByRole("button", { name: "Caverna Mais Tarde" });

    await userEvent.setup().press(screen.getByRole("button", { name: "Filtrar por Abertas agora" }));

    expect(await screen.findByText("Nenhuma caverna com aula acontecendo agora.")).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível consultar as aulas de hoje")).not.toBeOnTheScreen();
  });

  it("shows an error state (not an empty list) when today's classes fail to load", async () => {
    mockListCaves.mockResolvedValue([OPEN_CAVE]);
    mockListAllClasses.mockRejectedValue(apiError(500, "Erro interno", "/api/v1/classes"));
    await renderScreen();
    await screen.findByRole("button", { name: "Caverna Aberta" });

    await userEvent.setup().press(screen.getByRole("button", { name: "Filtrar por Abertas agora" }));

    expect(await screen.findByText("Não foi possível consultar as aulas de hoje")).toBeOnTheScreen();
    expect(screen.queryByText("Nenhuma caverna com aula acontecendo agora.")).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Tentar carregar as cavernas novamente" })).toBeOnTheScreen();
  });
});
