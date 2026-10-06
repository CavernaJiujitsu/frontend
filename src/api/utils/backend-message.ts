import { AxiosError } from "axios";

export function backendMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: unknown } | undefined;
    if (data && typeof data.message === "string" && data.message.length > 0) {
      return data.message;
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
