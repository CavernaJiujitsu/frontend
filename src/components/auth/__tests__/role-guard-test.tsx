import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, render, screen } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { Text } from "react-native";

import { RoleGuard } from "@/components/auth/role-guard";
import { ACCESS_TOKEN_KEY } from "@/store/session-storage";
import { useAppStore } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";
import { expireSession } from "@/utils/session";

const mockSecureValues = new Map<string, string>();

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureValues.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureValues.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureValues.delete(key);
  }),
}));

// jest-expo has no CSS transform; `constants/theme.ts` imports this file.
jest.mock("@/global.css", () => ({}));

// The real spinner imports "@/assets/images", which the Jest mapping
// generated from tsconfig paths cannot resolve (`@/*` is matched first).
jest.mock("@/components/customized/loading-spinner/loading-spinner", () => {
  const { Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    LoadingSpinner: ({ label }: { label?: string }) => <MockText>{label}</MockText>,
  };
});

jest.mock("expo-router", () => {
  const { Text: MockText } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    router: { replace: jest.fn() },
    Redirect: ({ href }: { href: string }) => <MockText>{`redirect:${href}`}</MockText>,
  };
});

const STORE_KEY = "caverna-user-store";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.student.signature";

const flush = () => new Promise<void>((resolve) => setImmediate(() => resolve()));

function Protected() {
  return <Text>área protegida</Text>;
}

function signIn(roles: ("STUDENT" | "TEACHER" | "CAVE_ADMIN")[]) {
  useAppStore.getState().setAuthIdentity({
    accessToken: TOKEN,
    userId: "u1",
    practitionerId: "p1",
    roles,
  });
}

beforeEach(async () => {
  useAppStore.getState().resetUser();
  await flush();
  await AsyncStorage.clear();
  mockSecureValues.clear();
  await useAppStore.persist.rehydrate();
});

afterEach(() => {
  useErrorStore.getState().hide();
});

describe("RoleGuard: hydration", () => {
  it("shows the loader until the saved session is read, then the area (cold start)", async () => {
    // Saved session: identity in AsyncStorage, token in SecureStore.
    await AsyncStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        state: { user: { userId: "u1", practitionerId: "p1", roles: ["STUDENT"], accessToken: null } },
        version: 0,
      }),
    );
    let releaseToken: (token: string) => void = () => undefined;
    jest.mocked(SecureStore.getItemAsync).mockImplementationOnce(
      () => new Promise<string>((resolve) => (releaseToken = resolve)),
    );
    const hydration = useAppStore.persist.rehydrate();

    await render(
      <RoleGuard role="STUDENT">
        <Protected />
      </RoleGuard>,
    );

    expect(screen.getByText("Carregando…")).toBeOnTheScreen();
    expect(screen.queryByText(/redirect:/)).not.toBeOnTheScreen();

    await act(async () => {
      releaseToken(TOKEN);
      await hydration;
    });

    expect(screen.getByText("área protegida")).toBeOnTheScreen();
    expect(screen.queryByText(/redirect:/)).not.toBeOnTheScreen();
  });
});

describe("RoleGuard: hydrated", () => {
  it("without a token → login", async () => {
    await render(
      <RoleGuard role="STUDENT">
        <Protected />
      </RoleGuard>,
    );

    expect(screen.getByText("redirect:/onboarding/login")).toBeOnTheScreen();
    expect(screen.queryByText("área protegida")).not.toBeOnTheScreen();
  });

  it("student opening the teacher area → student home", async () => {
    signIn(["STUDENT"]);

    await render(
      <RoleGuard role="TEACHER">
        <Protected />
      </RoleGuard>,
    );

    expect(screen.getByText("redirect:/inicio")).toBeOnTheScreen();
  });

  it("account without a mobile role → login", async () => {
    signIn(["CAVE_ADMIN"]);

    await render(
      <RoleGuard role="STUDENT">
        <Protected />
      </RoleGuard>,
    );

    expect(screen.getByText("redirect:/onboarding/login")).toBeOnTheScreen();
  });

  it("dual-role account sees the area and the mode follows it", async () => {
    signIn(["STUDENT", "TEACHER"]);

    await render(
      <RoleGuard role="TEACHER">
        <Protected />
      </RoleGuard>,
    );

    expect(screen.getByText("área protegida")).toBeOnTheScreen();
    expect(useAppStore.getState().user.activeMode).toBe("teacher");
  });

  it("leaves the area as soon as the session expires", async () => {
    signIn(["STUDENT"]);
    await render(
      <RoleGuard role="STUDENT">
        <Protected />
      </RoleGuard>,
    );
    expect(screen.getByText("área protegida")).toBeOnTheScreen();

    await act(async () => {
      expireSession();
    });

    expect(screen.queryByText("área protegida")).not.toBeOnTheScreen();
    expect(screen.getByText("redirect:/onboarding/login")).toBeOnTheScreen();
    expect(mockSecureValues.has(ACCESS_TOKEN_KEY)).toBe(false);
  });
});
