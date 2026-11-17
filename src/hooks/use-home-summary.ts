import { useQuery } from "@tanstack/react-query";

import { getHomeSummary } from "@/api/services/home.service";
import { studentKeys } from "@/hooks/query-keys";
import { useAppStore } from "@/store/useAppStore";

/**
 * Home summary of the logged student (next class + nearby caves). Screens
 * that only need the next enrollment share this cache entry with the home tab
 * because the key uses the same stored device location.
 */
export function useHomeSummary() {
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const accessToken = useAppStore((state) => state.user.accessToken);
  const latitude = useAppStore((state) => state.user.location?.coords.latitude);
  const longitude = useAppStore((state) => state.user.location?.coords.longitude);
  return useQuery({
    queryKey: studentKeys.home(practitionerId, latitude, longitude),
    queryFn: () => getHomeSummary({ latitude, longitude }),
    enabled: Boolean(accessToken && practitionerId),
  });
}
