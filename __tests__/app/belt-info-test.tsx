import { act, render, screen, userEvent } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import type { Belt } from "@/api/services/belts.service";
import BeltInfoScreen from "@/app/onboarding/(belt-info)/belt-info";
import { useAppStore } from "@/store/useAppStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ cavernaId: "cave-1", cavernaTitle: "Caverna Matriz" }),
}));

const mockListBelts = jest.fn();
jest.mock("@/api/services/belts.service", () => ({
  listBelts: (...args: unknown[]) => mockListBelts(...args),
}));
const mockUploadCertificate = jest.fn();
jest.mock("@/api/services/certificates.service", () => ({
  uploadCertificate: (...args: unknown[]) => mockUploadCertificate(...args),
}));
const mockDeclare = jest.fn();
jest.mock("@/api/services/belt-validations.service", () => ({
  declareBeltValidation: (...args: unknown[]) => mockDeclare(...args),
}));
const mockGetDocument = jest.fn();
jest.mock("expo-document-picker", () => ({
  getDocumentAsync: (...args: unknown[]) => mockGetDocument(...args),
}));
const mockNotify = jest.fn();
const mockNotifyError = jest.fn();
jest.mock("@/utils/dialogs", () => ({
  notify: (...args: unknown[]) => mockNotify(...args),
  notifyError: (...args: unknown[]) => mockNotifyError(...args),
}));

// Shapes mirror `GET /belts`, `POST /certificates/upload` and
// `POST /belt-validations` (curl, 17/11/2026).
function apiError(status: number, message: string, path: string) {
  const headers = new AxiosHeaders();
  return new AxiosError(message, String(status), { headers }, undefined, {
    status,
    statusText: "",
    headers,
    config: { headers },
    data: { message, timestamp: "2026-11-17T10:01:23.301Z", path },
  });
}

const BELTS: Belt[] = [
  { id: "63bfbdc9-461a-47fd-aae0-3bb1cb830fd4", name: "Branca", color: "WHITE", level: 1 },
  { id: "f0f27fd3-c3bb-4145-ae45-9c23d55f4c89", name: "Azul", color: "BLUE", level: 2 },
];
const UPLOADED = {
  id: "9fec799b-dbdd-4736-8c4e-270b38fada8a",
  originalName: "cert.png",
  fileName: "2308a3f7-32d5-448a-9536-aced39f31736.png",
  filePath: "uploads/2308a3f7-32d5-448a-9536-aced39f31736.png",
  certificateUrl: "/uploads/2308a3f7-32d5-448a-9536-aced39f31736.png",
  mimeType: "image/png",
  createdAt: "2026-11-17T10:01:23.187Z",
  url: "/uploads/2308a3f7-32d5-448a-9536-aced39f31736.png",
};

async function pickCertificate(user: ReturnType<typeof userEvent.setup>) {
  mockGetDocument.mockResolvedValue({
    canceled: false,
    assets: [{ name: "cert.png", uri: "file:///cert.png", size: 1024, mimeType: "image/png" }],
  });
  await user.press(screen.getByText("Enviar certificado (opcional)"));
  await screen.findByText("cert.png");
}

describe("BeltInfo screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState((state) => ({
      user: { ...state.user, practitionerId: "2228afc1-8268-4ffd-92fc-3c4da9cdf7b6", beltValidationId: null },
    }));
    mockDeclare.mockResolvedValue({ id: "3df27d74-da76-4ac2-85ad-755654a4a311", status: "PENDING" });
  });

  afterEach(() => jest.useRealTimers());

  it("keeps 'Continuar' disabled while the belts load", async () => {
    mockListBelts.mockReturnValue(new Promise(() => {}));

    await render(<BeltInfoScreen />);

    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });

  it("shows an inline error with retry when the belts fail to load", async () => {
    mockListBelts.mockRejectedValueOnce(apiError(500, "Erro interno", "/api/v1/belts"));

    await render(<BeltInfoScreen />);

    expect(await screen.findByText(/Não foi possível carregar as faixas/)).toBeOnTheScreen();

    mockListBelts.mockResolvedValueOnce(BELTS);
    await userEvent.setup().press(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Azul")).toBeOnTheScreen();
    expect(screen.queryByText(/Não foi possível carregar as faixas/)).not.toBeOnTheScreen();
  });

  it("shows no belt and no error for a successful empty catalog", async () => {
    mockListBelts.mockResolvedValue([]);

    await render(<BeltInfoScreen />);

    expect(await screen.findByRole("button", { name: "Continuar" })).toBeDisabled();
    expect(screen.queryByText(/Não foi possível carregar as faixas/)).not.toBeOnTheScreen();
  });

  it("sends the uploaded certificate id (not a URL) in the belt declaration", async () => {
    mockListBelts.mockResolvedValue(BELTS);
    mockUploadCertificate.mockResolvedValue(UPLOADED);
    await render(<BeltInfoScreen />);
    await screen.findByText("Azul");
    const user = userEvent.setup();
    await pickCertificate(user);

    await user.press(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Dados e certificado enviados com sucesso!")).toBeOnTheScreen();
    expect(mockDeclare).toHaveBeenCalledWith({
      practitionerId: "2228afc1-8268-4ffd-92fc-3c4da9cdf7b6",
      targetBeltId: BELTS[1].id,
      certificateId: UPLOADED.id,
    });
    expect(mockDeclare.mock.calls[0][0]).not.toHaveProperty("certificateUrl");
  });

  it("declares the belt without certificate fields when no file was chosen", async () => {
    mockListBelts.mockResolvedValue(BELTS);
    await render(<BeltInfoScreen />);
    await screen.findByText("Azul");

    await userEvent.setup().press(screen.getByRole("button", { name: "Continuar" }));

    await screen.findByText("Dados e certificado enviados com sucesso!");
    expect(mockUploadCertificate).not.toHaveBeenCalled();
    expect(mockDeclare).toHaveBeenCalledWith({
      practitionerId: "2228afc1-8268-4ffd-92fc-3c4da9cdf7b6",
      targetBeltId: BELTS[1].id,
    });
  });

  it("reports the 403 of a certificate owned by someone else", async () => {
    mockListBelts.mockResolvedValue(BELTS);
    mockUploadCertificate.mockResolvedValue(UPLOADED);
    const forbidden = apiError(403, "Certificado não pertence a você", "/api/v1/belt-validations");
    mockDeclare.mockRejectedValue(forbidden);
    await render(<BeltInfoScreen />);
    await screen.findByText("Azul");
    const user = userEvent.setup();
    await pickCertificate(user);

    await user.press(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByRole("button", { name: "Continuar" })).toBeEnabled();
    expect(mockNotifyError).toHaveBeenCalledWith("Não foi possível salvar os dados", forbidden);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("moves on to the schedule after the success banner", async () => {
    jest.useFakeTimers();
    mockListBelts.mockResolvedValue(BELTS);
    await render(<BeltInfoScreen />);
    await screen.findByText("Azul");

    await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).press(
      screen.getByRole("button", { name: "Continuar" }),
    );
    await screen.findByText("Dados e certificado enviados com sucesso!");
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/onboarding/schedule",
      params: { cavernaId: "cave-1", cavernaTitle: "Caverna Matriz" },
    });
  });

  it("clears the pending redirect when the screen unmounts", async () => {
    jest.useFakeTimers();
    mockListBelts.mockResolvedValue(BELTS);
    const view = await render(<BeltInfoScreen />);
    await screen.findByText("Azul");

    await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).press(
      screen.getByRole("button", { name: "Continuar" }),
    );
    await screen.findByText("Dados e certificado enviados com sucesso!");
    await view.unmount();
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
