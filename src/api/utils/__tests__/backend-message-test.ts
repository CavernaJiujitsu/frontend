import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { backendMessage } from "@/api/utils/backend-message";

// Bodies mirror `curl` against the real API (17/11/2026).
function httpError(status: number, message: string): AxiosError {
  const config: InternalAxiosRequestConfig = {
    url: "/api/v1/classes",
    headers: new AxiosHeaders(),
  };
  const response: AxiosResponse = {
    status,
    statusText: "",
    data: { message, timestamp: "2026-11-17T09:58:13.262Z", path: "/api/v1/classes" },
    headers: {},
    config,
  };
  return new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_REQUEST,
    config,
    {},
    response,
  );
}

describe("backendMessage", () => {
  it("shows a PT-BR business message from the backend", () => {
    expect(backendMessage(httpError(409, "Aula lotada"), "Falhou.")).toBe(
      "Aula lotada",
    );
  });

  it("hides technical class-validator English and uses the screen fallback", () => {
    expect(
      backendMessage(
        httpError(400, "practitionerId must be a UUID"),
        "Não foi possível carregar.",
      ),
    ).toBe("Não foi possível carregar.");
  });

  it("never shows axios' raw 'Network Error' when there is no response", () => {
    const offline = new AxiosError(
      "Network Error",
      AxiosError.ERR_NETWORK,
      { url: "/api/v1/classes", headers: new AxiosHeaders() },
      {},
    );
    const message = backendMessage(offline, "Não foi possível carregar.");
    expect(message).not.toBe("Network Error");
    expect(message).toMatch(/conex/i);
  });
});
