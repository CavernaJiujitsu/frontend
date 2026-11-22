import {
  deriveCaveAvailability,
  enrollmentStatusLabel,
  isClassOngoing,
  isClassOnDay,
  type ClassWindow,
} from "@/utils/schedule";

// Local-time dates keep the tests independent of the machine time zone.
const at = (hours: number, minutes = 0, day = 17) =>
  new Date(2026, 10, day, hours, minutes);

function classAt(
  unitId: string,
  start: Date,
  end: Date,
): ClassWindow {
  return { startsAt: start.toISOString(), endsAt: end.toISOString(), caveUnit: { id: unitId } };
}

const ACTIVE = { id: "unit-active", active: true };
const ARCHIVED = { id: "unit-archived", active: false };

describe("isClassOngoing", () => {
  const cls = classAt(ACTIVE.id, at(19), at(20, 30));

  it("is true from the start (inclusive) until the end (exclusive)", () => {
    expect(isClassOngoing(cls, at(19))).toBe(true);
    expect(isClassOngoing(cls, at(20, 29))).toBe(true);
    expect(isClassOngoing(cls, at(20, 30))).toBe(false);
    expect(isClassOngoing(cls, at(18, 59))).toBe(false);
  });
});

describe("isClassOnDay", () => {
  const dayStart = at(0);
  const dayEnd = new Date(2026, 10, 17, 23, 59, 59, 999);

  it("accepts a class that overlaps the day", () => {
    expect(isClassOnDay(classAt(ACTIVE.id, at(6), at(7)), dayStart, dayEnd)).toBe(true);
  });

  it("rejects classes of other days", () => {
    expect(isClassOnDay(classAt(ACTIVE.id, at(6, 0, 18), at(7, 0, 18)), dayStart, dayEnd)).toBe(false);
    expect(isClassOnDay(classAt(ACTIVE.id, at(6, 0, 16), at(7, 0, 16)), dayStart, dayEnd)).toBe(false);
  });
});

describe("deriveCaveAvailability", () => {
  it("flags open now and classes today from a class happening now", () => {
    const result = deriveCaveAvailability(
      [ACTIVE],
      [classAt(ACTIVE.id, at(19), at(20, 30))],
      at(19, 30),
    );
    expect(result).toEqual({ openNow: true, classesToday: true });
  });

  it("flags classes today but not open now when the class is later today", () => {
    const result = deriveCaveAvailability(
      [ACTIVE],
      [classAt(ACTIVE.id, at(21), at(22))],
      at(19, 30),
    );
    expect(result).toEqual({ openNow: false, classesToday: true });
  });

  it("ignores classes held in an archived unit (active: false)", () => {
    const result = deriveCaveAvailability(
      [ACTIVE, ARCHIVED],
      [classAt(ARCHIVED.id, at(19), at(20, 30))],
      at(19, 30),
    );
    expect(result).toEqual({ openNow: false, classesToday: false });
  });

  it("ignores classes of units that are not in the cave list", () => {
    const result = deriveCaveAvailability(
      [ACTIVE],
      [classAt("unit-from-another-cave", at(19), at(20, 30))],
      at(19, 30),
    );
    expect(result).toEqual({ openNow: false, classesToday: false });
  });

  it("returns both flags false without classes", () => {
    expect(deriveCaveAvailability([ACTIVE], [], at(12))).toEqual({
      openNow: false,
      classesToday: false,
    });
  });
});

describe("enrollmentStatusLabel", () => {
  it("maps the API statuses to PT-BR labels", () => {
    expect(enrollmentStatusLabel("PENDING")).toBe("Inscrição pendente");
    expect(enrollmentStatusLabel("CONFIRMED")).toBe("Presença confirmada");
    expect(enrollmentStatusLabel("EXPIRED")).toBe("Inscrição expirada");
  });

  it("returns null for an unknown or missing status", () => {
    expect(enrollmentStatusLabel("SOMETHING_ELSE")).toBeNull();
    expect(enrollmentStatusLabel(undefined)).toBeNull();
  });
});
