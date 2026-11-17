/**
 * Discovers a bookable `VALIDATION` class from the real API. The UI flow needs
 * a real cave name and a day with availability; querying the public listing
 * keeps the E2E independent from hardcoded seed ids while the assertions stay
 * focused on what the student sees.
 */
const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000/api/v1";
const TIME_ZONE = "America/Sao_Paulo";

type Envelope<T> = { data: T };
type Paginated<T> = { data: T[] };

type RawClass = {
  id: string;
  startsAt: string;
  capacity: number;
  enrolledCount?: number;
  caveUnit?: {
    id: string;
    name: string;
    cave?: { id: string; name: string } | null;
  } | null;
  teacher?: { name?: string; user?: { name?: string } } | null;
};

type RawCave = {
  name: string;
  units?: { active?: boolean }[];
};

export type ValidationClass = {
  classId: string;
  caveName: string;
  unitName: string;
  teacherName: string;
  localDay: string;
  localMonth: number;
  localYear: number;
  monthLabel: string;
  /** Lowercase short weekday without the trailing dot, e.g. `sáb`. */
  weekdayLabel: string;
  /** Local start time in `HH:MM`, e.g. `07:30`. */
  timeLabel: string;
  /** Same text the home card renders, e.g. `sáb • 07:30`. */
  homeWhenLabel: string;
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
}

function localPart(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    ...options,
  }).format(date);
}

function localMonthNumber(date: Date): string {
  // `numeric` alone can include a trailing dot in some ICU versions; `2-digit`
  // keeps the month stable across Node and browser builds.
  return localPart(date, { month: "2-digit" });
}

/** Target month of the schedule selector for `date`, in the browser time zone. */
export function scheduleMonthFor(date: Date): {
  month: number;
  year: number;
  label: string;
} {
  return {
    month: Number(localMonthNumber(date)),
    year: Number(localPart(date, { year: "numeric" })),
    label: capitalize(localPart(date, { month: "long" })),
  };
}

export async function discoverValidationClass(now = new Date()): Promise<ValidationClass> {
  const from = new Date(now.getTime() - 60 * 60 * 1000);
  const to = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
  const query = new URLSearchParams({
    type: "VALIDATION",
    from: from.toISOString(),
    to: to.toISOString(),
    limit: "100",
  });

  const [classesEnvelope, cavesEnvelope] = await Promise.all([
    getJson<Envelope<Paginated<RawClass>>>(`/classes?${query.toString()}`),
    getJson<Envelope<Paginated<RawCave>>>("/caves?limit=100"),
  ]);

  // A cave with a single unit makes the class button unambiguous on the day
  // list; multi-unit caves can show several classes at the same time.
  const activeUnitCount = new Map(
    cavesEnvelope.data.data.map((cave) => [
      cave.name,
      (cave.units ?? []).filter((unit) => unit.active !== false).length,
    ]),
  );

  const candidates = classesEnvelope.data.data
    .filter((item) => item.caveUnit?.cave?.name && item.caveUnit.name)
    .filter((item) => new Date(item.startsAt).getTime() > now.getTime())
    .filter((item) => (item.enrolledCount ?? 0) < item.capacity)
    .sort((left, right) => {
      const leftUnits = activeUnitCount.get(left.caveUnit?.cave?.name ?? "") ?? 0;
      const rightUnits = activeUnitCount.get(right.caveUnit?.cave?.name ?? "") ?? 0;
      const singleUnitOrder = Number(leftUnits !== 1) - Number(rightUnits !== 1);
      if (singleUnitOrder !== 0) return singleUnitOrder;

      const timeOrder =
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime();
      if (timeOrder !== 0) return timeOrder;

      return (left.enrolledCount ?? 0) - (right.enrolledCount ?? 0);
    });

  const target = candidates[0];
  if (!target) {
    throw new Error(
      "No bookable VALIDATION class found in the next 21 days. Check the real API seed before running the E2E.",
    );
  }

  const startsAt = new Date(target.startsAt);
  const month = scheduleMonthFor(startsAt);
  const weekday = localPart(startsAt, { weekday: "short" }).replace(".", "");
  const time = localPart(startsAt, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  return {
    classId: target.id,
    caveName: target.caveUnit?.cave?.name ?? "",
    unitName: target.caveUnit?.name ?? "",
    teacherName: target.teacher?.user?.name ?? target.teacher?.name ?? "Professor",
    localDay: localPart(startsAt, { day: "2-digit" }),
    localMonth: month.month,
    localYear: month.year,
    monthLabel: month.label,
    weekdayLabel: weekday,
    timeLabel: time,
    homeWhenLabel: `${weekday} • ${time}`,
  };
}
