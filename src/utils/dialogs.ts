import { Alert, Platform } from "react-native";

import { getErrorMessage } from "@/constants/error-messages";
import { normalizeApiError } from "@/utils/normalize-api-error";

// react-native-web ships Alert.alert as a no-op, so the web build falls back
// to the browser dialogs.

export function notify(title: string, message?: string): void {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

/**
 * Shows the PT-BR message of an API/unknown error under `title`. An expired
 * session is skipped: the session handler already warns and redirects.
 */
export function notifyError(title: string, error: unknown, fallback?: string): void {
  const appError = normalizeApiError(error);
  if (appError.kind === "session-expired") return;
  notify(title, getErrorMessage(appError, fallback));
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
