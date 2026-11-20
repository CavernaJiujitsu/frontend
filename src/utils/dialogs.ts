import { Alert, Platform } from "react-native";

import { getErrorMessage } from "@/constants/error-messages";
import { useNoticeStore, type NoticeTone } from "@/store/useNoticeStore";
import { normalizeApiError } from "@/utils/normalize-api-error";

export function notify(title: string, message?: string, tone: NoticeTone = "info"): void {
  useNoticeStore.getState().show({ title, message, tone });
}

/**
 * Shows the PT-BR message of an API/unknown error under `title`. An expired
 * session is skipped: the session handler already warns and redirects.
 */
export function notifyError(title: string, error: unknown, fallback?: string): void {
  const appError = normalizeApiError(error);
  if (appError.kind === "session-expired") return;
  notify(title, getErrorMessage(appError, fallback), "error");
}

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = "Confirmar",
): void {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Voltar", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
