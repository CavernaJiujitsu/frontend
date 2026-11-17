import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { MyTrail, NoActiveBeltTrail } from "@/api/services/trail.service";
import Trilha from "@/app/(private)/trilha/index";
import { useAppStore } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);
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
  usePathname: () => "/trilha",
}));

const mockGetMyTrail = jest.fn();
jest.mock("@/api/services/trail.service", () => ({
  getMyTrail: (...args: unknown[]) => mockGetMyTrail(...args),
}));

// Shape mirrors `GET /profile-readonly/trail` (curl, 17/11/2026).
const NO_ACTIVE_BELT: NoActiveBeltTrail = {
  noActiveBelt: true,
  practitionerId: "practitioner-1",
  belt: null,
  trail: null,
  stages: [],
  percent: 0,
  requiredCompleted: 0,
  requiredTotal: 0,
  currentStageId: null,
};

const ACTIVE_TRAIL: MyTrail = {
  practitionerId: "practitioner-1",
  belt: {
    id: "belt-blue",
    name: "Faixa Azul",
    color: "#1E40AF",
    level: 3,
    startedAt: "2026-01-10T00:00:00.000Z",
  },
  trail: {
    id: "trail-blue",
    name: "Trilha Azul",
    description: null,
    percent: 40,
    requiredCompleted: 2,
    requiredTotal: 5,
    currentStageId: null,
    stagesCount: 0,
    completedStagesCount: 0,
  },
  percent: 40,
  requiredCompleted: 2,
  requiredTotal: 5,
  currentStageId: null,
  noActiveBelt: false,
  stages: [],
};

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

async function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await render(
    <QueryClientProvider client={client}>
      <Trilha />
    </QueryClientProvider>,
  );
}

describe("Trilha screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState((state) => ({
      user: {
        ...state.user,
        practitionerId: "practitioner-1",
        accessToken: "token",
        roles: ["STUDENT"],
      },
    }));
  });

  // The error toast keeps a dismiss timer alive.
  afterEach(() => useErrorStore.getState().hide());

  it("shows the trail loading state while the request is pending", async () => {
    mockGetMyTrail.mockReturnValue(new Promise(() => {}));

    await renderScreen();

    expect(screen.getByText("Carregando sua trilha…")).toBeOnTheScreen();
  });

  it("shows the trail error state instead of the pending-evaluation page", async () => {
    mockGetMyTrail.mockRejectedValue(
      apiError(500, "Internal server error", "/api/v1/profile-readonly/trail"),
    );

    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar sua trilha")).toBeOnTheScreen();
    expect(screen.queryByText("Avaliação pendente")).not.toBeOnTheScreen();
  });

  it("shows the pending-evaluation page only when the API says there is no active belt", async () => {
    mockGetMyTrail.mockResolvedValue(NO_ACTIVE_BELT);

    await renderScreen();

    expect(await screen.findByText("Avaliação pendente")).toBeOnTheScreen();
    expect(screen.getByText("Sua jornada começou")).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível carregar sua trilha")).not.toBeOnTheScreen();
  });

  it("shows the active trail with its belt and progress", async () => {
    mockGetMyTrail.mockResolvedValue(ACTIVE_TRAIL);

    await renderScreen();

    expect(await screen.findByText("Faixa Azul")).toBeOnTheScreen();
    expect(screen.getByText("Trilha Azul")).toBeOnTheScreen();
    expect(screen.getByText("2 / 5 movimentos obrigatórios · 40%")).toBeOnTheScreen();
    expect(screen.getByText("Etapas da trilha")).toBeOnTheScreen();
    expect(screen.queryByText("Avaliação pendente")).not.toBeOnTheScreen();
  });
});
