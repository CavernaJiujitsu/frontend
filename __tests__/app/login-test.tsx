import { render, screen } from "@testing-library/react-native";

import LoginScreen from "@/app/onboarding/(login)/login";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

let mockParams: Record<string, string | string[] | undefined> = {};
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));
jest.mock("@/api/services/auth.service", () => ({ login: jest.fn() }));

describe("Login screen", () => {
  beforeEach(() => {
    mockParams = {};
  });

  it("fills the e-mail sent by the signup screen", async () => {
    mockParams = { email: "exec-b-1794909640@teste.caverna" };

    await render(<LoginScreen />);

    expect(screen.getByLabelText("E-mail")).toHaveDisplayValue("exec-b-1794909640@teste.caverna");
    expect(screen.getByLabelText("Senha")).toHaveDisplayValue("");
  });

  it("starts empty without the parameter", async () => {
    await render(<LoginScreen />);

    expect(screen.getByLabelText("E-mail")).toHaveDisplayValue("");
  });
});
