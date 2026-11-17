import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { normalizeApiError } from "@/utils/normalize-api-error";

// Bodies copied from `curl` against the real API (17/11/2026).
const LOGIN_PATH = "/api/v1/mobile/auth/login";
const body = (message: string | string[], path = LOGIN_PATH) => ({
  message,
  timestamp: "2026-11-17T09:58:13.262Z",
  path,
});

function requestConfig(url: string, token?: string): InternalAxiosRequestConfig {
  const headers = new AxiosHeaders();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { url, headers };
}

function httpError(
  status: number,
  data: unknown,
  config: InternalAxiosRequestConfig = requestConfig("/api/v1/classes"),
): AxiosError {
  const response: AxiosResponse = {
    status,
    statusText: "",
    data,
    headers: {},
    config,
  };
  return new AxiosError(
    `Request failed with status code ${status}`,
    status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    {},
    response,
  );
}

function noResponseError(code: string, message: string): AxiosError {
  return new AxiosError(message, code, requestConfig("/api/v1/classes"), {});
}

describe("normalizeApiError: backend body { message, timestamp, path }", () => {
  it("401 on login (no bearer) keeps the backend message as a business error", () => {
    const error = httpError(
      401,
      body("E-mail ou senha inválidos"),
      requestConfig(LOGIN_PATH),
    );

    expect(normalizeApiError(error)).toEqual({
      kind: "http",
      status: 401,
      message: "E-mail ou senha inválidos",
      path: LOGIN_PATH,
    });
  });

  it("401 for a request that carried a bearer is an expired session", () => {
    const error = httpError(
      401,
      body("Token de acesso inválido", "/api/v1/profile-readonly/me"),
      requestConfig("/api/v1/profile-readonly/me", "expired-token"),
    );

    expect(normalizeApiError(error)).toMatchObject({
      kind: "session-expired",
      status: 401,
      message: "Token de acesso inválido",
    });
  });

  it("409 keeps the exact business message and does not invent a code", () => {
    const appError = normalizeApiError(
      httpError(409, body("Aula lotada", "/api/v1/classes/c1/enrollments")),
    );

    expect(appError).toEqual({
      kind: "http",
      status: 409,
      message: "Aula lotada",
      path: "/api/v1/classes/c1/enrollments",
    });
    expect(appError).not.toHaveProperty("internalCode");
  });

  it("400 from class-validator keeps the raw technical message for logs", () => {
    const appError = normalizeApiError(
      httpError(400, body("property academyUnitId should not exist", "/api/v1/caves?academyUnitId=1")),
    );

    expect(appError).toMatchObject({
      kind: "http",
      status: 400,
      message: "property academyUnitId should not exist",
    });
  });

  it("joins a message array (defensive: the filter already joins it)", () => {
    const appError = normalizeApiError(
      httpError(400, body(["email must be an email", "Credenciais inválidas"])),
    );

    expect(appError.message).toBe("email must be an email; Credenciais inválidas");
  });

  it("5xx keeps the status and the message", () => {
    expect(
      normalizeApiError(httpError(500, body("Internal server error"))),
    ).toMatchObject({ kind: "http", status: 500, message: "Internal server error" });
  });

  it("a body outside the contract (HTML from a proxy) keeps only the status", () => {
    expect(normalizeApiError(httpError(502, "<html>Bad Gateway</html>"))).toEqual({
      kind: "http",
      status: 502,
    });
  });

  it("an empty message is treated as missing", () => {
    expect(normalizeApiError(httpError(409, body("   ")))).toEqual({
      kind: "http",
      status: 409,
      path: LOGIN_PATH,
    });
  });
});

describe("normalizeApiError: requests without a response", () => {
  it("network failure is offline", () => {
    expect(
      normalizeApiError(noResponseError(AxiosError.ERR_NETWORK, "Network Error")),
    ).toEqual({ kind: "offline" });
  });

  it("ECONNABORTED is a timeout", () => {
    expect(
      normalizeApiError(noResponseError(AxiosError.ECONNABORTED, "timeout of 10000ms exceeded")),
    ).toEqual({ kind: "timeout" });
  });

  it("ETIMEDOUT is a timeout", () => {
    expect(
      normalizeApiError(noResponseError(AxiosError.ETIMEDOUT, "timeout exceeded")),
    ).toEqual({ kind: "timeout" });
  });

  it("a cancelled request is not reported as offline", () => {
    expect(
      normalizeApiError(noResponseError(AxiosError.ERR_CANCELED, "canceled")),
    ).toEqual({ kind: "unknown" });
  });
});

describe("normalizeApiError: non-HTTP values", () => {
  it.each([
    ["an Error", new TypeError("Cannot read properties of undefined")],
    ["a string", "boom"],
    ["undefined", undefined],
  ])("%s becomes unknown without leaking its text", (_label, value) => {
    expect(normalizeApiError(value)).toEqual({ kind: "unknown" });
  });
});
