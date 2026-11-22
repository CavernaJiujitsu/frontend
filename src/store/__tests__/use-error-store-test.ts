import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import { DEFAULT_ERROR_DURATION_MS, OFFLINE_MESSAGE } from "@/constants/error-messages";
import { reportError, useErrorStore } from "@/store/useErrorStore";

const config: InternalAxiosRequestConfig = {
  url: "/api/v1/classes/c1/enrollments",
  headers: new AxiosHeaders({ Authorization: "Bearer t" }),
};

function conflict(message: string): AxiosError {
  return new AxiosError("Request failed with status code 409", AxiosError.ERR_BAD_REQUEST, config, {}, {
    status: 409,
    statusText: "",
    headers: {},
    config,
    // Body copied from `curl` against the real API (17/11/2026).
    data: { message, timestamp: "2026-11-17T09:59:17.396Z", path: config.url },
  });
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  useErrorStore.getState().hide();
  jest.useRealTimers();
});

describe("reportError", () => {
  it("shows the backend business message in the global toast", () => {
    reportError(conflict("Aula lotada"));

    expect(useErrorStore.getState()).toMatchObject({ visible: true, message: "Aula lotada" });
  });

  it("shows the offline text when there is no response", () => {
    reportError(new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, {}));

    expect(useErrorStore.getState().message).toBe(OFFLINE_MESSAGE);
  });

  it("hides the toast after the default duration", () => {
    reportError(conflict("Aluno já inscrito nesta aula"));

    jest.advanceTimersByTime(DEFAULT_ERROR_DURATION_MS);

    expect(useErrorStore.getState()).toMatchObject({ visible: false, message: null });
  });
});
