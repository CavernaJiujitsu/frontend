import { AxiosError, type AxiosResponse } from "axios";

import type { BackendError } from "@/api/types/api-error";

function toAxiosError(status: number, body: BackendError): AxiosError {
  return new AxiosError(
    body.errorDescription.message,
    String(status),
    undefined,
    {},
    { status, data: body } as AxiosResponse,
  );
}

/**
 * Simuladores de erro no formato do contrato v1 — temporários, só para
 * exercitar o `ErrorToast` (componente + auto-dismiss + botão fechar)
 * enquanto o backend real não existe.
 */
export function mockDuplicateSubscriptionError(): AxiosError {
  return toAxiosError(409, {
    errorType: "DUPLICATE_RESOURCE",
    errorDescription: {
      internalCode: "DUPLICATE_SUBSCRIPTION",
      message: "User already subscribed to this class",
      domain: "schedule",
      field: null,
      traceId: "req_test_409",
    },
  });
}
