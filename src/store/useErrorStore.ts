import { create } from "zustand";

import {
  DEFAULT_ERROR_DURATION_MS,
  getErrorMessage,
} from "@/constants/error-messages";
import { normalizeApiError } from "@/utils/normalize-api-error";

export type ErrorToastOptions = {
  durationMs?: number;
  internalCode?: string;
};

interface ErrorState {
  visible: boolean;
  message: string | null;
  internalCode: string;
  show: (message: string, options?: ErrorToastOptions) => void;
  hide: () => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function clearDismissTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
}

export const useErrorStore = create<ErrorState>((set) => ({
  visible: false,
  message: null,
  internalCode: "UNKNOWN",

  show: (message, options) => {
    clearDismissTimer();
    const duration = options?.durationMs ?? DEFAULT_ERROR_DURATION_MS;
    set({
      visible: true,
      message,
      internalCode: options?.internalCode ?? "UNKNOWN",
    });
    dismissTimer = setTimeout(() => {
      dismissTimer = null;
      set({ visible: false, message: null, internalCode: "UNKNOWN" });
    }, duration);
  },

  hide: () => {
    clearDismissTimer();
    set({ visible: false, message: null, internalCode: "UNKNOWN" });
  },
}));

export function reportError(error: unknown, durationMs?: number): void {
  const normalized = normalizeApiError(error);
  useErrorStore.getState().show(getErrorMessage(normalized), {
    internalCode: normalized.internalCode,
    durationMs,
  });
}
