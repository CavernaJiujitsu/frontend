import { Redirect } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { View } from "react-native";

import type { UserRole } from "@/api/services/auth.service";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { useAppStore, useStoreHydrated } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { homeRouteFor } from "@/utils/session";

export function FullScreenLoader({ label }: { label?: string }) {
  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <LoadingSpinner label={label ?? "Carregando…"} />
    </View>
  );
}

type RoleGuardProps = {
  role: Extract<UserRole, "STUDENT" | "TEACHER">;
  children: ReactNode;
};

/**
 * Protects an area of the app: waits for the persisted session, then requires
 * a token and the given role. Users without the role go to their own home.
 */
export function RoleGuard({ role, children }: RoleGuardProps) {
  const hydrated = useStoreHydrated();
  const accessToken = useAppStore((state) => state.user.accessToken);
  const roles = useAppStore((state) => state.user.roles);
  const activeMode = useAppStore((state) => state.user.activeMode);
  const setActiveMode = useAppStore((state) => state.setActiveMode);
  const allowed = Boolean(accessToken) && roles.includes(role);
  const mode = role === "TEACHER" ? "teacher" : "student";

  // Keep the remembered mode in sync when a dual-role user opens this area.
  useEffect(() => {
    if (hydrated && allowed && activeMode !== mode) setActiveMode(mode);
  }, [activeMode, allowed, hydrated, mode, setActiveMode]);

  if (!hydrated) return <FullScreenLoader />;
  if (!accessToken) return <Redirect href="/onboarding/login" />;
  if (!allowed) {
    return <Redirect href={homeRouteFor(roles, activeMode) ?? "/onboarding/login"} />;
  }
  return <>{children}</>;
}
