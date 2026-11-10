import { queryClient } from "@/api/bootstrap/query-client";
import type { LoginResponse } from "@/api/services/auth.service";
import { useAppStore } from "@/store/useAppStore";

export function startSession(
  session: LoginResponse,
  profile: { nome: string; email: string },
): void {
  queryClient.clear();
  useAppStore.getState().setAuthenticatedUser({
    accessToken: session.accessToken,
    practitionerId: session.practitionerId,
    profile,
  });
}

export function endSession(expectedToken?: string): void {
  if (
    expectedToken !== undefined &&
    useAppStore.getState().user.accessToken !== expectedToken
  ) {
    return;
  }
  queryClient.clear();
  useAppStore.getState().resetUser();
}
