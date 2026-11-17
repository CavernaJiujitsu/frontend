import { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import { routes } from "@/api/endpoints/routes";

// Public auth endpoints answer 401 for wrong credentials or a bad reset link.
// They never carry the bearer, so that 401 is never read as an expired session.
const PUBLIC_AUTH_ROUTES: ReadonlySet<string> = new Set([
  routes.mobileLogin,
  routes.passwordRecoveryRequest,
  routes.passwordRecoveryReset,
]);

export function isPublicAuthRoute(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_ROUTES.has(url.split("?")[0]);
}

/** Token sent in `Authorization: Bearer <token>`, or null if none was sent. */
export function bearerTokenOf(
  config: Pick<InternalAxiosRequestConfig, "headers"> | undefined,
): string | null {
  if (!config?.headers) return null;
  const value = AxiosHeaders.from(config.headers).get("Authorization");
  if (typeof value !== "string" || !value.startsWith("Bearer ")) return null;
  const token = value.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}
