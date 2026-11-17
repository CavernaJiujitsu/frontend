// Small date helpers shared by the class and attendance screens. Inputs use
// the Brazilian formats DD/MM/AAAA and HH:MM in the device time zone.

const pad = (value: number) => String(value).padStart(2, "0");

/** 00:00:00.000 of `date` in the device time zone. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 23:59:59.999 of `date` in the device time zone. */
export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function endOfToday(): Date {
  return endOfDay(new Date());
}

export function toDateInput(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function toTimeInput(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Combines "DD/MM/AAAA" and "HH:MM" into a local Date, or null if invalid. */
export function parseDateTime(dateText: string, timeText: string): Date | null {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateText.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeText.trim());
  if (!dateMatch || !timeMatch) return null;
  const [, day, month, year] = dateMatch.map(Number);
  const [, hours, minutes] = timeMatch.map(Number);
  if (hours > 23 || minutes > 59) return null;
  const date = new Date(year, month - 1, day, hours, minutes);
  // Rejects overflow such as 31/02 being turned into March.
  if (date.getDate() !== day || date.getMonth() !== month - 1) return null;
  return date;
}

/** Returns the date of `base` with the time "HH:MM", or null if invalid. */
export function withTime(base: Date, timeText: string): Date | null {
  return parseDateTime(toDateInput(base), timeText);
}

export function formatTime(iso: string): string {
  return toTimeInput(new Date(iso));
}

export function formatDay(iso: string): string {
  const date = new Date(iso);
  const weekday = date
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "");
  return `${weekday}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

/** "seg, 17/11 • 19:00–20:30" */
export function formatClassWhen(startsAt: string, endsAt: string): string {
  return `${formatDay(startsAt)} • ${formatTime(startsAt)}–${formatTime(endsAt)}`;
}

export function classTypeLabel(type: string | null | undefined): string {
  if (type === "VALIDATION") return "Validação";
  if (type === "EXAM") return "Exame";
  return "Treino";
}
