import { render, screen, userEvent } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import CreateAccountScreen from "@/app/onboarding/(create-account)/create-account";
import { useAppStore } from "@/store/useAppStore";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

const mockCreatePractitioner = jest.fn();
jest.mock("@/api/services/practitioners.service", () => ({
  createPractitioner: (...args: unknown[]) => mockCreatePractitioner(...args),
}));
const mockLogin = jest.fn();
jest.mock("@/api/services/auth.service", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}));
const mockNotify = jest.fn();
jest.mock("@/utils/dialogs", () => ({
  notify: (...args: unknown[]) => mockNotify(...args),
}));

// Shapes mirror `POST /practitioners` and `POST /mobile/auth/login`
// (curl, 17/11/2026).
function apiError(status: number, message: string, path: string) {
  const headers = new AxiosHeaders();
  return new AxiosError(message, String(status), { headers }, undefined, {
    status,
    statusText: "",
    headers,
    config: { headers },
    data: { message, timestamp: "2026-11-17T10:00:40.268Z", path },
  });
}

const EMAIL = "exec-b-1794909640@teste.caverna";
const PRACTITIONER = {
  id: "2228afc1-8268-4ffd-92fc-3c4da9cdf7b6",
  user: { id: "ede1cbca-4995-47ce-9793-23ad46c31f1e", name: "Exec B Aluno", email: EMAIL },
  latitude: null,
  longitude: null,
  age: null,
};
const SESSION = {
  accessToken: "jwt",
  tokenType: "Bearer" as const,
  expiresIn: 7200,
  userId: "ede1cbca-4995-47ce-9793-23ad46c31f1e",
  roles: ["STUDENT" as const],
  practitionerId: PRACTITIONER.id,
};

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Seu nome"), "Exec B Aluno");
  await user.type(screen.getByLabelText("seuemail@exemplo.com"), ` ${EMAIL} `);
  await user.type(screen.getByLabelText("••••••••"), "senha1234");
  await user.press(screen.getByRole("button", { name: "Criar conta" }));
  return user;
}

describe("CreateAccount screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.getState().resetUser();
  });

  it("creates the account, logs in and continues the onboarding", async () => {
    mockCreatePractitioner.mockResolvedValue(PRACTITIONER);
    mockLogin.mockResolvedValue(SESSION);
    await render(<CreateAccountScreen />);

    await fillAndSubmit();

    expect(mockLogin).toHaveBeenCalledWith({ email: EMAIL, password: "senha1234" });
    expect(useAppStore.getState().user.practitionerId).toBe(PRACTITIONER.id);
    expect(mockRouter.replace).toHaveBeenCalledWith("/onboarding/location-permission");
  });

  it("goes to the login with the e-mail filled when the account was created but the login failed", async () => {
    mockCreatePractitioner.mockResolvedValue(PRACTITIONER);
    mockLogin.mockRejectedValue(apiError(500, "Erro interno", "/api/v1/mobile/auth/login"));
    await render(<CreateAccountScreen />);

    await fillAndSubmit();

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/onboarding/login",
      params: { email: EMAIL },
    });
    expect(mockNotify).toHaveBeenCalledWith("Conta criada", expect.stringContaining("Entre com seu e-mail e senha"));
    // The account exists: no second signup attempt (it would only answer 409).
    expect(mockCreatePractitioner).toHaveBeenCalledTimes(1);
    expect(useAppStore.getState().user.accessToken).toBeNull();
  });

  it("offers the login with the e-mail when the API says it is already registered (409)", async () => {
    mockCreatePractitioner.mockRejectedValue(apiError(409, "Email já cadastrado", "/api/v1/practitioners"));
    await render(<CreateAccountScreen />);

    const user = await fillAndSubmit();

    expect(await screen.findByText("Email já cadastrado")).toBeOnTheScreen();
    expect(mockLogin).not.toHaveBeenCalled();

    await user.press(screen.getByRole("button", { name: "Entrar com este e-mail" }));

    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/onboarding/login",
      params: { email: EMAIL },
    });
  });

  it("shows the API message of another signup error without the login shortcut", async () => {
    mockCreatePractitioner.mockRejectedValue(apiError(400, "user.email must be an email", "/api/v1/practitioners"));
    await render(<CreateAccountScreen />);

    await fillAndSubmit();

    // Technical English text is replaced by the screen fallback.
    expect(await screen.findByText("Não foi possível criar sua conta. Tente novamente.")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Entrar com este e-mail" })).not.toBeOnTheScreen();
  });
});
