import { isAxiosError } from "axios";

import { bearerTokenOf } from "@/api/bootstrap/auth-header";
import { BackendErrorBodySchema, type AppError } from "@/api/types/api-error";

const TIMEOUT_CODES: ReadonlySet<string> = new Set(["ECONNABORTED", "ETIMEDOUT"]);

function readBody(data: unknown): Pick<AppError, "message" | "path"> {
  const parsed = BackendErrorBodySchema.safeParse(data);
  if (!parsed.success) return {};
  const { message, path } = parsed.data;
  const text = (Array.isArray(message) ? message.join("; ") : message).trim();
  return { message: text.length > 0 ? text : undefined, path };
}

/**
 * Turns any thrown value into an `AppError`. It only reads what the backend
 * sent (status + `message`); it never guesses a business reason from the
 * status. Display rules live in `getErrorMessage`.
 */
export function normalizeApiError(error: unknown): AppError {
  if (!isAxiosError(error)) return { kind: "unknown" };

  if (!error.response) {
    if (error.code === "ERR_CANCELED") return { kind: "unknown" };
    if (error.code && TIMEOUT_CODES.has(error.code)) return { kind: "timeout" };
    return { kind: "offline" };
  }

  const status = error.response.status;
  // A 401 for a request that carried a token means that session is over.
  // Without a token (login, reset link) it is a regular business error.
  const kind =
    status === 401 && bearerTokenOf(error.config) !== null
      ? "session-expired"
      : "http";

  return { kind, status, ...readBody(error.response.data) };
}
