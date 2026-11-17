import { useQuery } from "@tanstack/react-query";

import type { Cave } from "@/api/services/caves.service";
import { listAllClasses } from "@/api/services/classes.service";
import { endOfDay, startOfDay } from "@/utils/date-time";
import { deriveCaveAvailability, type CaveAvailability } from "@/utils/schedule";

export type CaveAvailabilityMap = Record<string, CaveAvailability>;

function dayId(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/**
 * Today's classes of each cave (public `GET /classes?caveId&from&to`) turned
 * into "open now" / "classes today" flags. It replaces the admin-only
 * `GET /caves/:id/units` filters, which answer 403 for students.
 */
export async function fetchCaveAvailability(
  caves: Cave[],
  now: Date = new Date(),
): Promise<CaveAvailabilityMap> {
  const from = startOfDay(now).toISOString();
  const to = endOfDay(now).toISOString();
  const entries = await Promise.all(
    caves.map(async (cave) => {
      const activeUnits = (cave.units ?? []).filter((unit) => unit.active !== false);
      if (activeUnits.length === 0) {
        return [cave.id, { openNow: false, classesToday: false }] as const;
      }
      const classes = await listAllClasses({ caveId: cave.id, from, to });
      return [cave.id, deriveCaveAvailability(activeUnits, classes, now)] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export function useCaveAvailability(caves: Cave[] | undefined, enabled: boolean) {
  const caveList = caves ?? [];
  const caveIds = caveList.map((cave) => cave.id);
  return useQuery({
    queryKey: ["cave-availability", dayId(new Date()), caveIds],
    queryFn: () => fetchCaveAvailability(caveList),
    enabled: enabled && caves !== undefined,
    // "Open now" changes during the day: keep it fresh but avoid a burst of
    // requests on every filter tap.
    staleTime: 60_000,
  });
}
