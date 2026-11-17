import type { AppError } from "@/api/types/api-error";

export const DEFAULT_ERROR_DURATION_MS = 5_000;

export const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Entre novamente.";
export const OFFLINE_MESSAGE = "Sem conexão. Verifique sua internet.";
export const TIMEOUT_MESSAGE = "A requisição demorou demais. Tente novamente.";
export const INVALID_DATA_MESSAGE =
  "Alguns dados estão inválidos. Verifique e tente novamente.";
export const SERVER_ERROR_MESSAGE =
  "Erro no servidor. Tente novamente em instantes.";
export const GENERIC_ERROR_MESSAGE = "Algo deu errado. Tente novamente.";

// Used only when the backend message is missing or technical.
const STATUS_MESSAGES: Readonly<Record<number, string>> = {
  400: INVALID_DATA_MESSAGE,
  401: "Não foi possível confirmar seu acesso. Entre novamente.",
  403: "Você não tem permissão para essa ação.",
  404: "Não encontramos o que você procurava.",
  409: "Essa ação entra em conflito com o estado atual.",
  422: INVALID_DATA_MESSAGE,
  429: "Muitas tentativas. Aguarde um pouco e tente novamente.",
};

// Framework defaults in English that must never reach the user. Business
// messages are written in PT-BR by the backend services and DTOs.
const TECHNICAL_MESSAGE_PATTERNS: readonly RegExp[] = [
  // class-validator: "email must be an email", "property x should not exist"
  /\b(must|should)\b/i,
  // Parse*Pipe: "Validation failed (uuid is expected)"
  /^Validation failed\b/i,
  // Unknown route: "Cannot GET /api/v1/..."
  /^Cannot (GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/,
  // Body parser: "JSON Parse error: Expected '}'", "Unexpected token"
  /\bJSON\b|Unexpected token/i,
  // @nestjs/throttler default
  /ThrottlerException/,
  // Default HttpException texts
  /^(Bad Request|Unauthorized|Forbidden|Forbidden resource|Not Found|Conflict|Internal server error|Too Many Requests|Payload Too Large|File too large|Unexpected field)$/i,
];

function isTechnical(segment: string): boolean {
  return TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(segment));
}

/**
 * Returns the backend message when it is safe to show, otherwise undefined.
 * ValidationPipe joins every violation with "; ": duplicates are dropped and
 * one technical segment is enough to hide the whole message (a partial list
 * would mislead the user).
 */
export function displayableBackendMessage(
  message: string | undefined,
): string | undefined {
  if (!message) return undefined;
  const segments = [
    ...new Set(
      message
        .split(";")
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0),
    ),
  ];
  if (segments.length === 0 || segments.some(isTechnical)) return undefined;
  return segments.join("; ");
}

function messageForStatus(status: number | undefined): string {
  if (status !== undefined && status >= 500) return SERVER_ERROR_MESSAGE;
  return (status !== undefined && STATUS_MESSAGES[status]) || GENERIC_ERROR_MESSAGE;
}

/**
 * PT-BR text to show for an error. Order: session/connection states, then
 * the backend business message, then the screen `fallback`, then a generic
 * text for the status.
 */
export function getErrorMessage(appError: AppError, fallback?: string): string {
  if (appError.kind === "session-expired") return SESSION_EXPIRED_MESSAGE;
  if (appError.kind === "offline") return OFFLINE_MESSAGE;
  if (appError.kind === "timeout") return TIMEOUT_MESSAGE;

  const businessMessage = displayableBackendMessage(appError.message);
  if (businessMessage) return businessMessage;
  if (fallback) return fallback;
  return messageForStatus(appError.status);
}
