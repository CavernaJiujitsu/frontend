import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { HomeSummary } from "@/api/services/home.service";
import type { MyProfile } from "@/api/services/profile.service";
import Inicio from "@/app/(private)/inicio/index";
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
  usePathname: () => "/inicio",
}));

const mockGetHomeSummary = jest.fn();
jest.mock("@/api/services/home.service", () => ({
  getHomeSummary: (...args: unknown[]) => mockGetHomeSummary(...args),
}));
const mockGetMyProfile = jest.fn();
jest.mock("@/api/services/profile.service", () => ({
  getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
}));
const mockCancel = jest.fn();
jest.mock("@/api/services/classes.service", () => ({
  cancelClassEnrollment: (...args: unknown[]) => mockCancel(...args),
}));
const mockNotify = jest.fn();
const mockNotifyError = jest.fn();
const mockConfirmAction = jest.fn();
jest.mock("@/utils/dialogs", () => ({
  notify: (...args: unknown[]) => mockNotify(...args),
  notifyError: (...args: unknown[]) => mockNotifyError(...args),
  confirmAction: (...args: unknown[]) => mockConfirmAction(...args),
}));

// Shapes mirror `GET /profile-readonly/home` and `/me` (curl, 17/11/2026).
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

const NEXT_CLASS: NonNullable<HomeSummary["nextClass"]> = {
  enrollmentId: "enrollment-1",
  enrollmentStatus: "PENDING",
  classId: "class-1",
  classType: "SCHEDULED",
  startsAt: "2026-11-18T21:00:00.000Z",
  endsAt: "2026-11-18T22:30:00.000Z",
  caveUnit: {
    id: "unit-1",
    name: "Centro",
    caveId: "cave-1",
    caveName: "Caverna Matriz",
    address: null,
    neighborhood: null,
  },
  teacher: { id: "teacher-1", name: "Mestre Semente" },
};

function homeSummary(overrides: Partial<HomeSummary> = {}): HomeSummary {
  return {
    practitioner: { id: "practitioner-1", fullName: "Exec B Aluno" },
    nextClass: null,
    nearbyCaves: { data: [], _meta: { total: 0, limit: 5, radiusKm: 5, locationSource: "none" } },
    ...overrides,
  };
}

const PROFILE_NO_BELT: MyProfile = {
  practitionerId: "practitioner-1",
  userId: "user-1",
  name: "Exec B Aluno",
  email: "exec-b@teste.caverna",
  photoKey: null,
  activeBelt: null,
  trainingRecord: null,
};

function loginAs(practitionerId: string) {
  useAppStore.setState((state) => ({
    user: { ...state.user, practitionerId, accessToken: `token-${practitionerId}`, location: null },
  }));
}

function makeClient() {
  // `gcTime: Infinity` avoids garbage-collection timers that keep Jest alive.
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } },
  });
}

async function renderScreen(client = makeClient()) {
  return render(
    <QueryClientProvider client={client}>
      <Inicio />
    </QueryClientProvider>,
  );
}

describe("Inicio screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loginAs("practitioner-1");
    mockGetMyProfile.mockResolvedValue(PROFILE_NO_BELT);
  });

  afterEach(() => useErrorStore.getState().hide());

  it("shows loading states while home and profile load", async () => {
    mockGetHomeSummary.mockReturnValue(new Promise(() => {}));
    mockGetMyProfile.mockReturnValue(new Promise(() => {}));

    await renderScreen();

    expect(screen.getByText("Carregando informações da sua próxima aula…")).toBeOnTheScreen();
    expect(screen.getByText("Carregando sua faixa…")).toBeOnTheScreen();
  });

  it("shows the next class with the enrollment status from the API", async () => {
    mockGetHomeSummary.mockResolvedValue(homeSummary({ nextClass: NEXT_CLASS }));

    await renderScreen();

    expect(await screen.findByText("Inscrição pendente")).toBeOnTheScreen();
    expect(screen.getByText("Prof. Mestre Semente")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Cancelar inscrição da próxima aula" })).toBeOnTheScreen();
  });

  it("shows the empty next-class state only for a successful answer without class", async () => {
    mockGetHomeSummary.mockResolvedValue(homeSummary());

    await renderScreen();

    expect(await screen.findByText(/Você ainda não tem aula agendada/)).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível carregar sua próxima aula.")).not.toBeOnTheScreen();
  });

  it("shows an error state (not 'no class') when the home summary fails, with retry", async () => {
    mockGetHomeSummary.mockRejectedValueOnce(apiError(500, "Erro interno", "/api/v1/profile-readonly/home"));

    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar sua próxima aula.")).toBeOnTheScreen();
    expect(screen.queryByText(/Você ainda não tem aula agendada/)).not.toBeOnTheScreen();
    expect(screen.getByText("Não foi possível carregar as cavernas próximas")).toBeOnTheScreen();

    mockGetHomeSummary.mockResolvedValueOnce(homeSummary({ nextClass: NEXT_CLASS }));
    await userEvent.setup().press(screen.getByRole("button", { name: "Tentar carregar sua próxima aula novamente" }));

    expect(await screen.findByText("Prof. Mestre Semente")).toBeOnTheScreen();
  });

  it("shows 'Avaliação pendente' only when the profile loads without a belt", async () => {
    mockGetHomeSummary.mockResolvedValue(homeSummary());

    await renderScreen();

    expect(await screen.findByText("Avaliação pendente")).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível carregar sua faixa")).not.toBeOnTheScreen();
  });

  it("shows a belt error state (not 'Avaliação pendente') when the profile fails", async () => {
    mockGetHomeSummary.mockResolvedValue(homeSummary());
    mockGetMyProfile.mockRejectedValue(apiError(500, "Erro interno", "/api/v1/profile-readonly/me"));

    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar sua faixa")).toBeOnTheScreen();
    expect(screen.queryByText("Avaliação pendente")).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Tentar carregar sua faixa novamente" })).toBeOnTheScreen();
  });

  it("cancels only after the cross-platform confirmation (no Alert.alert)", async () => {
    mockGetHomeSummary.mockResolvedValue(homeSummary({ nextClass: NEXT_CLASS }));
    mockCancel.mockResolvedValue({ id: "enrollment-1", status: "CANCELLED" });
    mockConfirmAction.mockImplementation((_title: string, _message: string, onConfirm: () => void) => onConfirm());
    await renderScreen();

    await userEvent.setup().press(await screen.findByRole("button", { name: "Cancelar inscrição da próxima aula" }));

    expect(mockConfirmAction).toHaveBeenCalledTimes(1);
    expect(mockCancel).toHaveBeenCalledWith("class-1", "enrollment-1");
    await screen.findByText("Inscrição pendente");
    expect(mockNotify).toHaveBeenCalledWith("Inscrição cancelada", "A vaga foi liberada.");
  });

  it("reports a cancel failure with the API error", async () => {
    mockGetHomeSummary.mockResolvedValue(homeSummary({ nextClass: NEXT_CLASS }));
    const conflict = apiError(409, "Só é possível cancelar inscrição pendente", "/api/v1/classes/class-1/enrollments/enrollment-1/cancel");
    mockCancel.mockRejectedValue(conflict);
    mockConfirmAction.mockImplementation((_title: string, _message: string, onConfirm: () => void) => onConfirm());
    await renderScreen();

    await userEvent.setup().press(await screen.findByRole("button", { name: "Cancelar inscrição da próxima aula" }));

    await screen.findByText("Inscrição pendente");
    expect(mockNotifyError).toHaveBeenCalledWith("Não foi possível cancelar", conflict);
  });

  it("hides the cancel action for a confirmed presence (the API refuses it)", async () => {
    mockGetHomeSummary.mockResolvedValue(
      homeSummary({ nextClass: { ...NEXT_CLASS, enrollmentStatus: "CONFIRMED" } }),
    );

    await renderScreen();

    expect(await screen.findByText("Presença confirmada")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Cancelar inscrição da próxima aula" })).not.toBeOnTheScreen();
  });

  it("never shows the previous account's home to the next account (keys carry practitionerId)", async () => {
    const client = makeClient();
    mockGetHomeSummary.mockResolvedValueOnce(
      homeSummary({ practitioner: { id: "practitioner-1", fullName: "Ana Antiga" }, nextClass: NEXT_CLASS }),
    );
    const first = await renderScreen(client);
    expect(await screen.findByText("Olá, Ana 👋")).toBeOnTheScreen();
    await first.unmount();

    loginAs("practitioner-2");
    mockGetHomeSummary.mockReturnValueOnce(new Promise(() => {}));
    mockGetMyProfile.mockReturnValueOnce(new Promise(() => {}));
    await renderScreen(client);

    expect(screen.queryByText("Olá, Ana 👋")).not.toBeOnTheScreen();
    expect(screen.queryByText("Prof. Mestre Semente")).not.toBeOnTheScreen();
    expect(screen.getByText("Carregando informações da sua próxima aula…")).toBeOnTheScreen();
  });
});
