import { queryClient } from "@/api/bootstrap/query-client";
import type { LoginResponse } from "@/api/services/auth.service";
import { useAppStore } from "@/store/useAppStore";

export class StudentProfileRequiredError extends Error {
  constructor() {
    super(
      "Sua conta não possui perfil de aluno. Para acessar seus recursos de gestão, use a aplicação da gestão.",
    );
    this.name = "StudentProfileRequiredError";
  }
}

export function startSession(
  session: LoginResponse,
  profile: { nome: string; email: string },
): void {
  if (!session.practitionerId) {
    throw new StudentProfileRequiredError();
  }
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
