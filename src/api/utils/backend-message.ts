import { getErrorMessage } from "@/constants/error-messages";
import { normalizeApiError } from "@/utils/normalize-api-error";

/**
 * Display-ready PT-BR message for an API error. Delegates to the shared error
 * policy so screens never show raw technical text (class-validator English,
 * axios "Network Error"); `fallback` is used when the backend message is not
 * displayable.
 */
export function backendMessage(error: unknown, fallback: string): string {
  return getErrorMessage(normalizeApiError(error), fallback);
}
