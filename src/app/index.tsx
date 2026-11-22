import { Redirect } from "expo-router";

import { FullScreenLoader } from "@/components/auth/role-guard";
import { useAppStore, useStoreHydrated } from "@/store/useAppStore";
import { homeRouteFor } from "@/utils/session";

export default function IndexScreen() {
  const hydrated = useStoreHydrated();
  const accessToken = useAppStore((state) => state.user.accessToken);
  const roles = useAppStore((state) => state.user.roles);
  const activeMode = useAppStore((state) => state.user.activeMode);

  if (!hydrated) return <FullScreenLoader />;

  const home = accessToken ? homeRouteFor(roles, activeMode) : null;
  return <Redirect href={home ?? "/onboarding/start"} />;
}
