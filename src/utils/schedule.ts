import type { EnrollmentStatus } from "@/api/services/classes.service";
import type { ScheduleDay, ScheduleMonth } from "@/types/schedule";
import { endOfDay, startOfDay } from "@/utils/date-time";

function capitalize(word: string) {
  return word.length === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
}

function toDateId(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getScheduleMonths(year: number): ScheduleMonth[] {
  return Array.from({ length: 12 }, (_, index) => ({
    index,
    label: capitalize(new Date(year, index, 1).toLocaleDateString("pt-BR", { month: "long" })),
    year,
  }));
}

export function getMonthDays(year: number, monthIndex: number): ScheduleDay[] {
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  return Array.from({ length: totalDays }, (_, offset) => {
    const date = new Date(year, monthIndex, offset + 1);
    return {
      id: toDateId(year, monthIndex, offset + 1),
      weekday: capitalize(date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")),
      day: String(offset + 1).padStart(2, "0"),
      monthIndex,
      date,
    };
  });
}

export function formatScheduleDate(date: Date) {
  return `${capitalize(date.toLocaleDateString("pt-BR", { weekday: "long" }))}, ${date.getDate()} de ${date.toLocaleDateString("pt-BR", { month: "long" })}`;
}

/** Minimal class shape used by the availability rules below. */
export type ClassWindow = {
  startsAt: string;
  endsAt: string;
  caveUnit?: { id: string } | null;
};

export type UnitRef = { id: string; active?: boolean };

export type CaveAvailability = { openNow: boolean; classesToday: boolean };

/** Same rule the API uses for `openNow`: started and not finished yet. */
export function isClassOngoing(cls: ClassWindow, now: Date): boolean {
  const startsAt = new Date(cls.startsAt).getTime();
  const endsAt = new Date(cls.endsAt).getTime();
  return startsAt <= now.getTime() && now.getTime() < endsAt;
}

/** Same rule the API uses for `classesToday`: the class overlaps the day. */
export function isClassOnDay(cls: ClassWindow, dayStart: Date, dayEnd: Date): boolean {
  const startsAt = new Date(cls.startsAt).getTime();
  const endsAt = new Date(cls.endsAt).getTime();
  return startsAt <= dayEnd.getTime() && endsAt > dayStart.getTime();
}

/**
 * Derives the "open now" / "classes today" flags of a cave from real classes.
 * Only classes held in an active unit of the cave count: archived units
 * (`active: false`) and classes of units outside the list are ignored.
 */
export function deriveCaveAvailability(
  units: UnitRef[],
  classes: ClassWindow[],
  now: Date,
): CaveAvailability {
  const activeUnitIds = new Set(
    units.filter((unit) => unit.active !== false).map((unit) => unit.id),
  );
  const counted = classes.filter(
    (cls) => cls.caveUnit != null && activeUnitIds.has(cls.caveUnit.id),
  );
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  return {
    openNow: counted.some((cls) => isClassOngoing(cls, now)),
    classesToday: counted.some((cls) => isClassOnDay(cls, dayStart, dayEnd)),
  };
}

const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  PENDING: "Inscrição pendente",
  IN_PROGRESS: "Inscrição em andamento",
  CONFIRMED: "Presença confirmada",
  EXPIRED: "Inscrição expirada",
  CANCELLED: "Inscrição cancelada",
};

function isEnrollmentStatus(value: string): value is EnrollmentStatus {
  return Object.prototype.hasOwnProperty.call(ENROLLMENT_STATUS_LABELS, value);
}

/** PT-BR label of an enrollment status, or null for an unknown value. */
export function enrollmentStatusLabel(status: string | null | undefined): string | null {
  return status && isEnrollmentStatus(status) ? ENROLLMENT_STATUS_LABELS[status] : null;
}
