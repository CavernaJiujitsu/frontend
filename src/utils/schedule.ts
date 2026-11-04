import type { ScheduleDay, ScheduleMonth } from "@/types/schedule";

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
