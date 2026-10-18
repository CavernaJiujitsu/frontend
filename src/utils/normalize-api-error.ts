import { isAxiosError } from "axios";

import {
  BackendErrorSchema,
  type AppError,
} from "@/api/types/api-error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(...candidates: unknown[]): string | undefined {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return undefined;
}

function errorTypeForStatus(status?: number): string {
  if (status === 409) return "DUPLICATE_RESOURCE";
  if (status === 404) return "NOT_FOUND";
  if (status === 401) return "AUTH";
  if (status === 403) return "FORBIDDEN";
  if (status === 422 || status === 400) return "VALIDATION";
  if (status === 429) return "RATE_LIMIT";
  if (status !== undefined && status >= 500) return "SERVER_ERROR";
  return "SERVER_ERROR";
}

function internalCodeForStatus(status?: number, fallback?: string): string {
  if (fallback) return fallback;
  if (status === 409) return "CAVERNA_ALREADY_EXISTS";
  if (status === 404) return "RESOURCE_NOT_FOUND";
  if (status === 401) return "INVALID_CREDENTIALS";
  if (status === 403) return "FORBIDDEN";
  if (status === 422 || status === 400) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (status === 503) return "SERVICE_UNAVAILABLE";
  if (status !== undefined && status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

export function normalizeApiError(error: unknown): AppError {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const axiosCode = error.code;

    if (!error.response) {
      if (axiosCode === "ECONNABORTED" || axiosCode === "ETIMEDOUT") {
        return {
          status: undefined,
          errorType: "SERVER_ERROR",
          internalCode: "TIMEOUT",
          domain: "server",
          fallbackMessage: error.message,
        };
      }
      return {
        status: undefined,
        errorType: "SERVER_ERROR",
        internalCode: "OFFLINE",
        domain: "server",
        fallbackMessage: error.message,
      };
    }

    const data = error.response.data;

    const parsed = BackendErrorSchema.safeParse(data);
    if (parsed.success) {
      const { errorType, errorDescription } = parsed.data;
      return {
        status,
        errorType,
        internalCode: errorDescription.internalCode,
        domain: errorDescription.domain,
        field: errorDescription.field,
        params: errorDescription.params,
        details: errorDescription.details,
        traceId: errorDescription.traceId,
        fallbackMessage: errorDescription.message,
      };
    }

    if (isRecord(data)) {
      const fallbackMessage = readString(
        data.message,
        data.error,
        data.msg,
        error.message,
      );
      const legacyCode = readString(data.code, data.internalCode);
      return {
        status,
        errorType: errorTypeForStatus(status),
        internalCode: internalCodeForStatus(status, legacyCode),
        domain: readString(data.domain) ?? "server",
        field:
          typeof data.field === "string"
            ? data.field
            : typeof data.key === "string"
              ? data.key
              : null,
        fallbackMessage,
      };
    }

    if (typeof data === "string" && data.trim().length > 0) {
      return {
        status,
        errorType: errorTypeForStatus(status),
        internalCode: internalCodeForStatus(status),
        domain: "server",
        fallbackMessage: data,
      };
    }

    return {
      status,
      errorType: errorTypeForStatus(status),
      internalCode: internalCodeForStatus(status),
      domain: "server",
      fallbackMessage: error.message,
    };
  }

  if (error instanceof Error) {
    const parsed = BackendErrorSchema.safeParse(
      (error as Error & { data?: unknown }).data,
    );
    if (parsed.success) {
      const { errorType, errorDescription } = parsed.data;
      return {
        status: undefined,
        errorType,
        internalCode: errorDescription.internalCode,
        domain: errorDescription.domain,
        field: errorDescription.field,
        params: errorDescription.params,
        details: errorDescription.details,
        traceId: errorDescription.traceId,
        fallbackMessage: errorDescription.message,
      };
    }
    return {
      status: undefined,
      errorType: "SERVER_ERROR",
      internalCode: "UNKNOWN",
      domain: "server",
      fallbackMessage: error.message,
    };
  }

  if (typeof error === "string") {
    return {
      status: undefined,
      errorType: "SERVER_ERROR",
      internalCode: "UNKNOWN",
      domain: "server",
      fallbackMessage: error,
    };
  }

  return {
    status: undefined,
    errorType: "SERVER_ERROR",
    internalCode: "UNKNOWN",
    domain: "server",
  };
}
