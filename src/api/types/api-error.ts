import { z } from "zod";

/**
 * Error body sent by the backend global filter
 * (`backend/src/modules/shared/filters/http-exception.filter.ts`):
 * `{ message, timestamp, path }`. The filter already joins ValidationPipe
 * arrays with "; ", but an array is still accepted defensively.
 */
export const BackendErrorBodySchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
  timestamp: z.string().optional(),
  path: z.string().optional(),
});

export type BackendErrorBody = z.infer<typeof BackendErrorBodySchema>;

/**
 * - `http`: the backend answered with an error status.
 * - `session-expired`: 401 for a request that carried a bearer token.
 * - `offline` / `timeout`: the request got no response.
 * - `unknown`: anything else (cancelled request, non-HTTP error).
 */
export type AppErrorKind =
  | "http"
  | "session-expired"
  | "offline"
  | "timeout"
  | "unknown";

export type AppError = {
  kind: AppErrorKind;
  /** HTTP status; undefined when the request got no response. */
  status?: number;
  /**
   * Raw backend `message`. It can be technical English (class-validator),
   * so screens must show `getErrorMessage(appError)`, never this field.
   */
  message?: string;
  /** Request path echoed by the backend, useful for logs. */
  path?: string;
};
