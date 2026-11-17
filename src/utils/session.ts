import { router, type Href } from "expo-router";

import { queryClient } from "@/api/bootstrap/query-client";
import type { UserRole } from "@/api/services/auth.service";
import { SESSION_EXPIRED_MESSAGE } from "@/constants/error-messages";
import { useAppStore, type AppMode } from "@/store/useAppStore";
import { useErrorStore } from "@/store/useErrorStore";

export const STUDENT_HOME = "/inicio" satisfies Href;
export const TEACHER_HOME = "/professor" satisfies Href;
export const CHOOSE_MODE = "/escolher-perfil" satisfies Href;
export const LOGIN_ROUTE = "/onboarding/login" satisfies Href;

export function hasRole(roles: UserRole[], role: UserRole): boolean {
  return roles.includes(role);
}

/**
 * Where a logged-in user should land. Accounts with both roles go to the
 * choice screen until they pick a mode; `null` means the account cannot use
 * the mobile app (no student/teacher role).
 */
export function homeRouteFor(
  roles: UserRole[],
  activeMode: AppMode | null,
): Href | null {
  const isStudent = hasRole(roles, "STUDENT");
  const isTeacher = hasRole(roles, "TEACHER");
  if (isStudent && isTeacher) {
    if (activeMode === "teacher") return TEACHER_HOME;
    if (activeMode === "student") return STUDENT_HOME;
    return CHOOSE_MODE;
  }
  if (isTeacher) return TEACHER_HOME;
  if (isStudent) return STUDENT_HOME;
  return null;
}

/** Switches the area of a dual-role account and opens its home tab. */
export function enterMode(mode: AppMode): void {
  useAppStore.getState().setActiveMode(mode);
  router.replace(mode === "teacher" ? TEACHER_HOME : STUDENT_HOME);
}

// Drops everything tied to the account (token, ids, roles, mode, profile,
// cached server data) so nothing leaks into the next login. The device
// location is kept by `resetUser`.
function clearSession(): void {
  useAppStore.getState().resetUser();
  queryClient.clear();
  router.replace(LOGIN_ROUTE);
}

export function logout(): void {
  clearSession();
}

/**
 * Called by the API client when an authenticated request gets a 401. The
 * client guarantees a single call per session (see `axios-bootstrap.ts`).
 */
export function expireSession(): void {
  clearSession();
  useErrorStore.getState().show(SESSION_EXPIRED_MESSAGE);
}
