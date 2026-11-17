import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";

import { apiClient } from "@/api/bootstrap/axios-bootstrap";
import { queryClient } from "@/api/bootstrap/query-client";
import { routes } from "@/api/endpoints/routes";
import {
  getErrorMessage,
  SESSION_EXPIRED_MESSAGE,
} from "@/constants/error-messages";
import { useAppStore } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";
import { normalizeApiError } from "@/utils/normalize-api-error";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("@/constants/api", () => ({ API_URL: "http://api.test" }));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

// Bodies copied from `curl` against the real API (17/11/2026).
const errorBody = (message: string, path: string) => ({
  message,
  timestamp: "2026-11-17T09:58:13.270Z",
  path,
});
const TOKEN_INVALID = errorBody("Token de acesso inválido", "/api/v1/profile-readonly/me");
const WRONG_PASSWORD = errorBody("E-mail ou senha inválidos", "/api/v1/mobile/auth/login");

type Reply = { status: number; data: unknown };

// Fake adapter: no network. Rejects like axios' `settle` for status >= 400.
let reply: (config: InternalAxiosRequestConfig) => Reply | Promise<Reply>;
const sent: InternalAxiosRequestConfig[] = [];

apiClient.defaults.adapter = async (config) => {
  sent.push(config);
  const { status, data } = await reply(config);
  const response: AxiosResponse = { status, statusText: "", data, headers: {}, config };
  if (status >= 400) {
    throw new AxiosError(
      `Request failed with status code ${status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response,
    );
  }
  return response;
};

function signIn(token = "token-u1") {
  useAppStore.getState().setAuthIdentity({
    accessToken: token,
    userId: "u1",
    practitionerId: "p1",
    roles: ["STUDENT"],
  });
  queryClient.setQueryData(["home", "p1"], { nextClass: "c1" });
}

const authorizationOf = (config: InternalAxiosRequestConfig) =>
  config.headers.get("Authorization");

async function rejectionOf(request: Promise<unknown>): Promise<unknown> {
  try {
    await request;
  } catch (error) {
    return error;
  }
  throw new Error("request should have failed");
}

let clearSpy: jest.SpyInstance;

beforeEach(async () => {
  await useAppStore.persist.rehydrate();
  useAppStore.getState().resetUser();
  sent.length = 0;
  reply = () => ({ status: 200, data: { message: "ok", data: null } });
  jest.clearAllMocks();
  clearSpy = jest.spyOn(queryClient, "clear");
});

afterEach(() => {
  clearSpy.mockRestore();
  useErrorStore.getState().hide();
  queryClient.clear();
});

describe("request interceptor", () => {
  it("sends the bearer on protected routes", async () => {
    signIn();

    await apiClient.get(routes.profileReadonlyMe);

    expect(authorizationOf(sent[0])).toBe("Bearer token-u1");
  });

  it.each([
    routes.mobileLogin,
    routes.passwordRecoveryRequest,
    routes.passwordRecoveryReset,
  ])("never sends the bearer to the public auth route %s", async (url) => {
    signIn();

    await apiClient.post(url, {});

    expect(authorizationOf(sent[0])).toBeUndefined();
  });
});

describe("401 on an authenticated request", () => {
  it("resets the session, clears the cache, redirects to login and shows the toast", async () => {
    signIn();
    reply = () => ({ status: 401, data: TOKEN_INVALID });

    const error = await rejectionOf(apiClient.get(routes.profileReadonlyHome));

    expect(useAppStore.getState().user).toMatchObject({
      accessToken: null,
      userId: null,
      practitionerId: null,
      roles: [],
    });
    expect(queryClient.getQueryData(["home", "p1"])).toBeUndefined();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/onboarding/login");
    expect(useErrorStore.getState()).toMatchObject({
      visible: true,
      message: SESSION_EXPIRED_MESSAGE,
    });
    // The screen still gets the error, and its text is coherent.
    expect(getErrorMessage(normalizeApiError(error))).toBe(SESSION_EXPIRED_MESSAGE);
  });

  it("N concurrent 401s trigger a single reset and a single redirect", async () => {
    signIn();
    // Barrier: answer only after the three requests left with the token.
    let open: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => (open = resolve));
    reply = async () => {
      if (sent.length === 3) open();
      await gate;
      return { status: 401, data: TOKEN_INVALID };
    };

    const results = await Promise.allSettled([
      apiClient.get(routes.profileReadonlyMe),
      apiClient.get(routes.profileReadonlyHome),
      apiClient.get(routes.profileReadonlyTrail),
    ]);

    expect(sent.map(authorizationOf)).toEqual([
      "Bearer token-u1",
      "Bearer token-u1",
      "Bearer token-u1",
    ]);
    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it("a late 401 from a previous session does not log out the new one", async () => {
    signIn("token-old");
    let answer: (value: Reply) => void = () => undefined;
    reply = () => new Promise<Reply>((resolve) => (answer = resolve));

    const pending = rejectionOf(apiClient.get(routes.profileReadonlyMe));
    await new Promise<void>((resolve) => setImmediate(() => resolve()));
    // Meanwhile the user logged out and logged in again.
    useAppStore.getState().resetUser();
    signIn("token-new");
    answer({ status: 401, data: TOKEN_INVALID });
    await pending;

    expect(useAppStore.getState().user.accessToken).toBe("token-new");
    expect(router.replace).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
  });

  it("expires again after a new login (the guard is per session, not global)", async () => {
    signIn("token-a");
    reply = () => ({ status: 401, data: TOKEN_INVALID });
    await rejectionOf(apiClient.get(routes.profileReadonlyMe));

    signIn("token-b");
    await rejectionOf(apiClient.get(routes.profileReadonlyMe));

    expect(router.replace).toHaveBeenCalledTimes(2);
    expect(useAppStore.getState().user.accessToken).toBeNull();
  });
});

describe("401s that are not an expired session", () => {
  it("login with wrong password shows the backend message and keeps everything", async () => {
    reply = () => ({ status: 401, data: WRONG_PASSWORD });

    const error = await rejectionOf(
      apiClient.post(routes.mobileLogin, { email: "a@teste.caverna", password: "x" }),
    );

    expect(getErrorMessage(normalizeApiError(error))).toBe("E-mail ou senha inválidos");
    expect(router.replace).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
    expect(useErrorStore.getState().visible).toBe(false);
  });

  it("login 401 with a stale token in the store does not reset it", async () => {
    signIn("token-stale");
    reply = () => ({ status: 401, data: WRONG_PASSWORD });

    await rejectionOf(apiClient.post(routes.mobileLogin, {}));

    expect(useAppStore.getState().user.accessToken).toBe("token-stale");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("protected route without a token: nothing to expire", async () => {
    reply = () => ({ status: 401, data: TOKEN_INVALID });

    await rejectionOf(apiClient.get(routes.profileReadonlyMe));

    expect(router.replace).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
    expect(useErrorStore.getState().visible).toBe(false);
  });

  it.each([
    [403, "Você não tem permissão para gerenciar esta aula"],
    [409, "Aula lotada"],
    [500, "Internal server error"],
  ])("%i keeps the session", async (status, message) => {
    signIn();
    reply = () => ({ status, data: errorBody(message, "/api/v1/classes/c1") });

    await rejectionOf(apiClient.get(routes.classes));

    expect(useAppStore.getState().user.accessToken).toBe("token-u1");
    expect(router.replace).not.toHaveBeenCalled();
  });
});
