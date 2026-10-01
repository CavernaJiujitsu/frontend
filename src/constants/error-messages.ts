import type { AppError } from "@/api/types/api-error";

export const DEFAULT_ERROR_DURATION_MS = 5_000;

function param(params: AppError["params"], key: string): string | undefined {
  const value = params?.[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Dicionário pt-BR indexado por `internalCode` — fonte da verdade do texto
 * exibido no popup. O `message` em inglês vindo do back é só fallback/log,
 * nunca exibido diretamente quando há tradução aqui.
 */
const INTERNAL_CODE_MESSAGES: Record<
  string,
  (error: AppError) => string | undefined
> = {
  CAVERNA_ALREADY_EXISTS: (error) => {
    const title = param(error.params, "title");
    return title
      ? `A caverna "${title}" já existe.`
      : "Essa caverna já existe.";
  },
  SCHEDULE_CONFLICT: () =>
    "Esse horário entra em conflito com outro já cadastrado.",
  CLASS_FULL: () => "Essa aula já está lotada.",
  DUPLICATE_SUBSCRIPTION: () => "Você já está inscrito nessa aula.",
  VALIDATION_FAILED: (error) => {
    const firstDetail = error.details?.[0];
    if (firstDetail?.field) {
      return `Verifique o campo ${firstDetail.field} e tente novamente.`;
    }
    return "Alguns dados estão inválidos. Verifique e tente novamente.";
  },
  RESOURCE_NOT_FOUND: () => "Não encontramos esse recurso.",
  INVALID_CREDENTIALS: () => "Credenciais inválidas. Tente novamente.",
  TOKEN_EXPIRED: () => "Sua sessão expirou. Entre novamente.",
  FORBIDDEN: () => "Você não tem permissão para essa ação.",
  RATE_LIMITED: () => "Muitas tentativas. Aguarde um pouco.",
  OFFLINE: () => "Sem conexão. Verifique sua internet.",
  TIMEOUT: () => "A requisição demorou demais. Tente novamente.",
  SERVER_ERROR: () => "Erro no servidor. Tente novamente em instantes.",
  SERVICE_UNAVAILABLE: () => "Serviço indisponível no momento.",
};

const ERROR_TYPE_FALLBACK: Record<string, string> = {
  VALIDATION: "Alguns dados estão inválidos. Verifique e tente novamente.",
  DUPLICATE_RESOURCE: "Esse registro já existe.",
  CONFLICT: "Essa ação entra em conflito com o estado atual.",
  NOT_FOUND: "Não encontramos esse recurso.",
  AUTH: "Sua sessão expirou. Entre novamente.",
  FORBIDDEN: "Você não tem permissão para essa ação.",
  RATE_LIMIT: "Muitas tentativas. Aguarde um pouco.",
  SERVER_ERROR: "Algo deu errado. Tente novamente em instantes.",
};

/** Resolve o texto pt-BR para um `AppError` normalizado. Nunca retorna inglês do back. */
export function getErrorMessage(error: AppError): string {
  const byCode = INTERNAL_CODE_MESSAGES[error.internalCode]?.(error);
  if (byCode) return byCode;

  const byType = ERROR_TYPE_FALLBACK[error.errorType];
  if (byType) return byType;

  if (error.status !== undefined && error.status >= 500) {
    return "Erro no servidor. Tente novamente em instantes.";
  }

  return "Algo deu errado. Tente novamente.";
}
