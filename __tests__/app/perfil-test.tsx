import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { MyProfile } from "@/api/services/profile.service";
import type { Practitioner } from "@/api/services/practitioners.service";
import Perfil from "@/app/(private)/perfil/index";
import { useAppStore } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);
jest.mock("@/components/customized/loading-spinner/loading-spinner", () => {
  const { Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return { LoadingSpinner: ({ label }: { label?: string }) => <MockText>{label}</MockText> };
});
// The photo pickers pull native modules; the profile states do not need them.
jest.mock("@/components/profile-photo", () => ({ ProfilePhoto: () => null }));

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/perfil",
}));

const mockGetMyProfile = jest.fn();
jest.mock("@/api/services/profile.service", () => ({
  getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
}));
const mockGetPractitioner = jest.fn();
const mockUpdatePractitioner = jest.fn();
jest.mock("@/api/services/practitioners.service", () => ({
  getPractitioner: (...args: unknown[]) => mockGetPractitioner(...args),
  updatePractitioner: (...args: unknown[]) => mockUpdatePractitioner(...args),
}));

// Shape mirrors `GET /profile-readonly/me` (curl, 17/11/2026).
const PROFILE: MyProfile = {
  practitionerId: "practitioner-1",
  userId: "user-1",
  name: "Aluno Teste",
  email: "aluno@teste.caverna",
  activeBelt: {
    id: "belt-blue",
    name: "Faixa Azul",
    color: "#1E40AF",
    level: 3,
    startedAt: "2026-01-10T00:00:00.000Z",
  },
  trainingRecord: null,
};

const PRACTITIONER: Practitioner = {
  id: "practitioner-1",
  user: { id: "user-1", name: "Aluno Teste", email: "aluno@teste.caverna" },
  latitude: null,
  longitude: null,
  age: 30,
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
      <Perfil />
    </QueryClientProvider>,
  );
}

describe("Perfil screen", () => {
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
    mockGetPractitioner.mockResolvedValue(PRACTITIONER);
  });

  // The error toast keeps a dismiss timer alive.
  afterEach(() => useErrorStore.getState().hide());

  it("shows the profile loading state while the request is pending", async () => {
    mockGetMyProfile.mockReturnValue(new Promise(() => {}));

    await renderScreen();

    expect(screen.getByText("Carregando seu perfil…")).toBeOnTheScreen();
  });

  it("shows the profile error state instead of an empty/success shell", async () => {
    mockGetMyProfile.mockRejectedValue(
      apiError(500, "Internal server error", "/api/v1/profile-readonly/me"),
    );

    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar seu perfil")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeOnTheScreen();
    // Logout stays reachable even when the profile request fails.
    expect(screen.getByRole("button", { name: "Sair da conta" })).toBeOnTheScreen();
    expect(screen.queryByText("Seu registro de treino ainda não está disponível.")).not.toBeOnTheScreen();
    expect(screen.queryByText("Aluno Teste")).not.toBeOnTheScreen();
  });

  it("recovers when the retry succeeds", async () => {
    mockGetMyProfile
      .mockRejectedValueOnce(apiError(500, "Internal server error", "/api/v1/profile-readonly/me"))
      .mockResolvedValueOnce(PROFILE);

    await renderScreen();
    await screen.findByText("Não foi possível carregar seu perfil");

    await userEvent.setup().press(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Aluno Teste")).toBeOnTheScreen();
    expect(screen.getByText("Faixa Azul")).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível carregar seu perfil")).not.toBeOnTheScreen();
  });

  it("shows the loaded profile with the missing-record notice only on success", async () => {
    mockGetMyProfile.mockResolvedValue(PROFILE);

    await renderScreen();

    expect(await screen.findByText("Aluno Teste")).toBeOnTheScreen();
    expect(screen.getByText("Faixa Azul")).toBeOnTheScreen();
    expect(screen.getByText("Seu registro de treino ainda não está disponível.")).toBeOnTheScreen();
    expect(screen.queryByText("Não foi possível carregar seu perfil")).not.toBeOnTheScreen();
  });
});
