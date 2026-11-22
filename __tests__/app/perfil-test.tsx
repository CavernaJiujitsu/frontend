import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { MyProfile } from "@/api/services/profile.service";
import type { Practitioner } from "@/api/services/practitioners.service";
import Perfil from "@/app/(private)/perfil/index";
import { ProfileAddressScreen } from "@/features/profile/profile-address-screen";
import { ProfileScreen } from "@/features/profile/profile-screen";
import { useAppStore } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";
import { useNoticeStore } from "@/store/useNoticeStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);
jest.mock("@/features/maps/cave-map", () => ({ CaveMap: () => null }));
const mockListCaves = jest.fn().mockResolvedValue([]);
jest.mock("@/api/services/caves.service", () => ({ listCaves: (...args: unknown[]) => mockListCaves(...args) }));
jest.mock("@/components/customized/loading-spinner/loading-spinner", () => {
  const { Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return { LoadingSpinner: ({ label }: { label?: string }) => <MockText>{label}</MockText> };
});
// The photo pickers pull native modules; the profile states do not need them.
jest.mock("@/components/profile-photo", () => ({ ProfilePhoto: () => null }));
const mockRequestLocationPermission = jest.fn();
const mockGetCurrentPosition = jest.fn();
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestLocationPermission(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetCurrentPosition(...args),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([]),
  Accuracy: { Balanced: 3 },
}));

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) };
jest.mock("expo-router", () => ({
  router: mockRouter,
  useRouter: () => mockRouter,
  usePathname: () => "/perfil",
}));

const mockGetMyProfile = jest.fn();
jest.mock("@/api/services/profile.service", () => ({
  getMyProfile: (...args: unknown[]) => mockGetMyProfile(...args),
  getMyTrainingHours: jest.fn().mockResolvedValue(0),
}));
const mockGetPractitioner = jest.fn();
const mockUpdatePractitioner = jest.fn();
const mockSearchAddresses = jest.fn();
jest.mock("@/api/services/practitioners.service", () => ({
  getPractitioner: (...args: unknown[]) => mockGetPractitioner(...args),
  updatePractitioner: (...args: unknown[]) => mockUpdatePractitioner(...args),
  searchAddresses: (...args: unknown[]) => mockSearchAddresses(...args),
}));
const mockRequestPasswordRecovery = jest.fn();
jest.mock("@/api/services/password-recovery.service", () => ({
  requestPasswordRecovery: (...args: unknown[]) => mockRequestPasswordRecovery(...args),
}));
const mockLogoutToRecovery = jest.fn();
jest.mock("@/utils/session", () => ({
  enterMode: jest.fn(),
  logout: jest.fn(),
  logoutToRecovery: () => mockLogoutToRecovery(),
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

async function renderScreen(section?: "dados" | "certificados" | "configuracoes" | "endereco") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  await render(
    <QueryClientProvider client={client}>
      {section === "endereco" ? <ProfileAddressScreen /> : section ? <ProfileScreen section={section} /> : <Perfil />}
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
  afterEach(() => {
    useErrorStore.getState().hide();
    useNoticeStore.getState().hide();
  });

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
    expect(screen.getByRole("button", { name: "Dados do perfil" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Certificados" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Configurações" })).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole("button", { name: "Dados do perfil" }));
    expect(mockRouter.push).toHaveBeenCalledWith("/perfil/dados");
  });

  it("shows certificates without claiming unlinked files belong to the student", async () => {
    mockGetMyProfile.mockResolvedValue(PROFILE);
    await renderScreen("certificados");
    expect(await screen.findByText("Nenhum certificado disponível")).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole("button", { name: "Voltar ao perfil" }));
    expect(mockRouter.replace).toHaveBeenCalledWith("/perfil");
  });

  it("requires choosing a geocoded address before saving coordinates", async () => {
    mockGetMyProfile.mockResolvedValue(PROFILE);
    mockSearchAddresses.mockResolvedValue([
      { address: "Rua A, São Paulo", latitude: -23.55, longitude: -46.63 },
      { address: "Rua B, São Paulo", latitude: -23.56, longitude: -46.64 },
    ]);
    mockUpdatePractitioner.mockResolvedValue(PRACTITIONER);
    await renderScreen("endereco");
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Endereço para busca"), "Rua A, São Paulo");
    await user.press(screen.getByRole("button", { name: "Buscar endereço" }));
    expect(await screen.findByText("ESCOLHA UM ENDEREÇO")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Confirmar endereço" }).props.accessibilityState).toMatchObject({ disabled: true });
    const option = screen.getByRole("button", { name: "Rua B, São Paulo" });
    await user.press(option);
    expect(option.props.accessibilityState).toMatchObject({ selected: true });
    await user.press(screen.getByRole("button", { name: "Confirmar endereço" }));

    expect(mockSearchAddresses).toHaveBeenCalledWith("Rua A, São Paulo");
    expect(mockUpdatePractitioner).toHaveBeenCalledWith("practitioner-1", {
      address: "Rua B, São Paulo",
      latitude: -23.56,
      longitude: -46.64,
    });
    await waitFor(() => expect(useNoticeStore.getState().notice).toMatchObject({
      title: "Endereço atualizado",
      tone: "success",
    }));
  });

  it("opens the dedicated address page from settings", async () => {
    mockGetMyProfile.mockResolvedValue(PROFILE);
    await renderScreen("configuracoes");
    await screen.findByText("Trocar senha");
    await userEvent.setup().press(screen.getByRole("button", { name: "Alterar endereço" }));
    expect(mockRouter.push).toHaveBeenCalledWith("/perfil/endereco");
  });

  it("uses the current coordinates when the user grants location permission", async () => {
    mockRequestLocationPermission.mockResolvedValue({ granted: true });
    mockGetCurrentPosition.mockResolvedValue({ coords: { latitude: -23.55, longitude: -46.63 } });
    mockUpdatePractitioner.mockResolvedValue(PRACTITIONER);
    await renderScreen("endereco");
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Usar minha localização atual" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirmar endereço" }).props.accessibilityState).toMatchObject({ disabled: false }));
    await user.press(screen.getByRole("button", { name: "Confirmar endereço" }));
    await waitFor(() => expect(mockUpdatePractitioner).toHaveBeenCalledWith("practitioner-1", expect.objectContaining({
      latitude: -23.55,
      longitude: -46.63,
    })));
  });

  it("does not enable confirmation when location permission is denied", async () => {
    mockRequestLocationPermission.mockResolvedValue({ granted: false });
    await renderScreen("endereco");
    await userEvent.setup().press(screen.getByRole("button", { name: "Usar minha localização atual" }));
    expect(await screen.findByText("Permita o acesso à localização para usar sua posição atual.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Confirmar endereço" }).props.accessibilityState).toMatchObject({ disabled: true });
    expect(mockUpdatePractitioner).not.toHaveBeenCalled();
  });

  it("confirms profile updates with a branded success notice", async () => {
    mockGetMyProfile.mockResolvedValue(PROFILE);
    mockUpdatePractitioner.mockResolvedValue(PRACTITIONER);
    await renderScreen("dados");
    await screen.findByText("Informações pessoais");
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Salvar dados" }));
    await waitFor(() => expect(useNoticeStore.getState().notice).toMatchObject({
      title: "Perfil atualizado",
      message: "Seus dados foram salvos.",
      tone: "success",
    }));
  });

  it("requests a reset link and clears the local session before confirmation", async () => {
    mockGetMyProfile.mockResolvedValue(PROFILE);
    mockRequestPasswordRecovery.mockResolvedValue(undefined);
    await renderScreen("configuracoes");
    await screen.findByText("Trocar senha");
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Confirmar e-mail para trocar senha"), "aluno@teste.caverna");
    await user.press(screen.getByRole("button", { name: "Enviar link e sair" }));

    expect(mockRequestPasswordRecovery).toHaveBeenCalledWith({ email: PROFILE.email });
    await waitFor(() => expect(mockLogoutToRecovery).toHaveBeenCalled());
  });
});
