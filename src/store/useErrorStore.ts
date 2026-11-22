import { create } from "zustand";

import {
  DEFAULT_ERROR_DURATION_MS,
  getErrorMessage,
} from "@/constants/error-messages";
import { normalizeApiError } from "@/utils/normalize-api-error";

export type ErrorToastOptions = {
  durationMs?: number;
};

interface ErrorState {
  visible: boolean;
  message: string | null;
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

  show: (message, options) => {
    clearDismissTimer();
    const duration = options?.durationMs ?? DEFAULT_ERROR_DURATION_MS;
    set({ visible: true, message });
    dismissTimer = setTimeout(() => {
      dismissTimer = null;
      set({ visible: false, message: null });
    }, duration);
  },

  hide: () => {
    clearDismissTimer();
    set({ visible: false, message: null });
  },
}));

export function reportError(error: unknown, durationMs?: number): void {
  useErrorStore
    .getState()
    .show(getErrorMessage(normalizeApiError(error)), { durationMs });
}
