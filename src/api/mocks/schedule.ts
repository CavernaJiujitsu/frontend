import type { ClassItem, ScheduleDay, ScheduleMonth } from "@/types/schedule";

export const DEFAULT_SCHEDULE_CAVERNA_ID = "caverna-mooca";
export const EMPTY_SCHEDULE_CAVERNA_ID = "caverna-sem-horarios";

export const DEFAULT_SCHEDULE_CAVERNA_TITLE = "Caverna Mooca";

type ClassSeed = Omit<ClassItem, "id" | "dateId">;

const CLASS_SEEDS_BY_DAY: Record<string, ClassSeed[]> = {
  "08": [
    {
      startTime: "07:00",
      endTime: "08:30",
      professor: "Camila Nunes",
      enrolled: 30,
      capacity: 50,
      tags: [{ label: "Todos" }],
    },
  ],
  "10": [
    {
      startTime: "07:00",
      endTime: "08:30",
      professor: "Camila Nunes",
      enrolled: 30,
      capacity: 50,
      tags: [{ label: "Todos" }],
    },
    {
      startTime: "12:00",
      endTime: "13:00",
      professor: "Rafael Souza",
      enrolled: 8,
      capacity: 20,
      tags: [
        { label: "Trilha Azul", variant: "highlight" },
        { label: "Qualificação", variant: "highlight" },
      ],
    },
    {
      startTime: "19:00",
      endTime: "21:00",
      professor: "Rafael Souza",
      enrolled: 12,
      capacity: 50,
      tags: [{ label: "Todos" }],
      isEnrolled: true,
    },
  ],
};

function toDateId(year: number, monthIndex: number, day: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayLabel = String(day).padStart(2, "0");
  return `${year}-${month}-${dayLabel}`;
}

function capitalize(word: string) {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function getScheduleMonths(year: number): ScheduleMonth[] {
  return Array.from({ length: 12 }, (_, index) => {
    const sample = new Date(year, index, 1);
    const label = capitalize(
      sample.toLocaleDateString("pt-BR", { month: "long" }),
    );
    return { index, label, year };
  });
}

export function getMonthDays(year: number, monthIndex: number): ScheduleDay[] {
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  return Array.from({ length: totalDays }, (_, offset) => {
    const date = new Date(year, monthIndex, offset + 1);
    const weekday = capitalize(
      date
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", ""),
    );
    return {
      id: toDateId(year, monthIndex, offset + 1),
      weekday,
      day: String(offset + 1).padStart(2, "0"),
      monthIndex,
      date,
    };
  });
}

export function formatScheduleDate(date: Date) {
  const weekday = capitalize(
    date.toLocaleDateString("pt-BR", { weekday: "long" }),
  );
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${weekday}, ${date.getDate()} de ${month}`;
}

export const SCHEDULE_CLASSES_DELAY_MS = 800;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function getClassesForDay(
  cavernaId: string,
  day: ScheduleDay,
): ClassItem[] {
  if (cavernaId === EMPTY_SCHEDULE_CAVERNA_ID) return [];
  const seeds = CLASS_SEEDS_BY_DAY[day.day] ?? [];
  return seeds.map((seed, index) => ({
    ...seed,
    id: `class-${day.id}-${index + 1}`,
    dateId: day.id,
  }));
}

export async function fetchClassesForDay(
  cavernaId: string,
  day: ScheduleDay,
): Promise<ClassItem[]> {
  await wait(SCHEDULE_CLASSES_DELAY_MS);
  return getClassesForDay(cavernaId, day);
}

export function hasAnyClassesInMonth(
  cavernaId: string,
  days: ScheduleDay[],
): boolean {
  return days.some((day) => getClassesForDay(cavernaId, day).length > 0);
}
