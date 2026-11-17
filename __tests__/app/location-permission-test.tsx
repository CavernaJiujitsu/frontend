import { render, screen, userEvent } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";
import { Alert } from "react-native";

import LocationPermissionScreen from "@/app/onboarding/(location-permission)/location-permission";
import { useAppStore } from "@/store/useAppStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

const mockRequestPermission = jest.fn();
const mockGetPosition = jest.fn();
jest.mock("expo-location", () => ({
  PermissionStatus: { GRANTED: "granted", DENIED: "denied" },
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestPermission(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetPosition(...args),
}));
const mockUpdateLocation = jest.fn();
jest.mock("@/api/services/practitioners.service", () => ({
  updatePractitionerLocation: (...args: unknown[]) => mockUpdateLocation(...args),
}));
const mockNotify = jest.fn();
const mockConfirmAction = jest.fn();
jest.mock("@/utils/dialogs", () => ({
  notify: (...args: unknown[]) => mockNotify(...args),
  confirmAction: (...args: unknown[]) => mockConfirmAction(...args),
}));

// Shape mirrors the API error body (curl, 17/11/2026).
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

const POSITION = {
  coords: { latitude: -23.123456789123, longitude: -46.987654321987, altitude: null, accuracy: 5, altitudeAccuracy: null, heading: null, speed: null },
  timestamp: 0,
};

function setPractitioner(practitionerId: string | null) {
  useAppStore.setState((state) => ({ user: { ...state.user, practitionerId, location: null } }));
}

describe("LocationPermission screen", () => {
  const alertSpy = jest.spyOn(Alert, "alert");

  beforeEach(() => {
    jest.clearAllMocks();
    setPractitioner("practitioner-1");
    mockRequestPermission.mockResolvedValue({ status: "granted" });
    mockGetPosition.mockResolvedValue(POSITION);
  });

  afterEach(() => {
    // Alert.alert is a no-op on the web: the screen must never call it.
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("saves the normalized location and continues", async () => {
    mockUpdateLocation.mockResolvedValue({});

    await render(<LocationPermissionScreen />);

    await screen.findByText("Agora não, prefiro buscar manualmente");
    expect(mockUpdateLocation).toHaveBeenCalledWith("practitioner-1", { latitude: -23.12345679, longitude: -46.98765432 });
    expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding/nearby-gym");
  });

  it("continues without depending on a dialog button when there is no practitioner", async () => {
    setPractitioner(null);

    await render(<LocationPermissionScreen />);

    await screen.findByText("Agora não, prefiro buscar manualmente");
    expect(mockNotify).toHaveBeenCalledWith("Cadastro não encontrado", expect.any(String));
    expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding/nearby-gym");
  });

  it("asks before continuing when saving fails, and continues when confirmed", async () => {
    mockUpdateLocation.mockRejectedValue(apiError(500, "Erro interno", "/api/v1/practitioners/practitioner-1"));
    mockConfirmAction.mockImplementation((_title: string, _message: string, onConfirm: () => void) => onConfirm());

    await render(<LocationPermissionScreen />);

    await screen.findByText("Agora não, prefiro buscar manualmente");
    expect(mockConfirmAction).toHaveBeenCalledWith(
      "Não foi possível salvar a localização",
      expect.stringContaining("Deseja continuar sem sincronizar sua localização?"),
      expect.any(Function),
      "Continuar",
    );
    expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding/nearby-gym");
  });

  it("stays on the screen with a way out when the confirmation is declined", async () => {
    mockUpdateLocation.mockRejectedValue(apiError(500, "Erro interno", "/api/v1/practitioners/practitioner-1"));
    mockConfirmAction.mockImplementation(() => {});

    await render(<LocationPermissionScreen />);
    const skip = await screen.findByText("Agora não, prefiro buscar manualmente");
    expect(mockRouter.replace).not.toHaveBeenCalled();

    await userEvent.setup().press(skip);

    expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding/nearby-gym");
  });

  it("explains a denied permission and keeps the skip option", async () => {
    mockRequestPermission.mockResolvedValue({ status: "denied" });

    await render(<LocationPermissionScreen />);

    const skip = await screen.findByText("Agora não, prefiro buscar manualmente");
    expect(mockNotify).toHaveBeenCalledWith("Localização indisponível", expect.any(String));
    expect(mockRouter.replace).not.toHaveBeenCalled();

    await userEvent.setup().press(skip);
    expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding/nearby-gym");
  });
});
