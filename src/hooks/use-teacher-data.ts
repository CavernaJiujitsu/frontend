import { useQuery } from "@tanstack/react-query";

import {
  listBeltValidations,
  type BeltValidation,
} from "@/api/services/belt-validations.service";
import { listClasses } from "@/api/services/classes.service";
import { getTeacher } from "@/api/services/teachers.service";
import { useAppStore } from "@/store/useAppStore";
import { startOfToday } from "@/utils/date-time";

// Query keys shared by the teacher screens, so mutations can invalidate them.
// `classes` and `validations` are prefixes; every full key also carries the
// teacher id, so one account never reads the cache of another.
export const teacherKeys = {
  teacher: (teacherId: string | null) => ["teacher", teacherId] as const,
  classes: ["teacher-classes"] as const,
  validations: ["teacher-validations"] as const,
  validation: (teacherId: string | null, validationId: string) =>
    ["teacher-validation", teacherId, validationId] as const,
  enrollments: (teacherId: string | null, classId: string) =>
    ["teacher-class-enrollments", teacherId, classId] as const,
  practitionerSearch: (teacherId: string | null, term: string) =>
    ["teacher-practitioner-search", teacherId, term] as const,
};

/** Logged teacher with name, e-mail and linked cave units. */
export function useCurrentTeacher() {
  const teacherId = useAppStore((state) => state.user.teacherId);
  return useQuery({
    queryKey: teacherKeys.teacher(teacherId),
    queryFn: () => getTeacher(teacherId!),
    enabled: Boolean(teacherId),
    staleTime: 5 * 60_000,
  });
}

/** Teacher's classes starting today or later (ordered by start). */
export function useUpcomingTeacherClasses(limit = 20) {
  const teacherId = useAppStore((state) => state.user.teacherId);
  return useQuery({
    queryKey: [...teacherKeys.classes, "upcoming", teacherId, limit],
    queryFn: () =>
      listClasses({
        teacherId: teacherId!,
        from: startOfToday().toISOString(),
        limit,
      }),
    enabled: Boolean(teacherId),
  });
}

/**
 * Open validations of students linked to any cave where the teacher has a
 * unit. The API filters by cave, so one request per distinct cave is merged.
 */
export function usePendingValidations() {
  const teacherId = useAppStore((state) => state.user.teacherId);
  const teacherQuery = useCurrentTeacher();
  const caveIds = [
    ...new Set((teacherQuery.data?.caveUnits ?? []).map((unit) => unit.caveId)),
  ].sort();
  const query = useQuery({
    queryKey: [...teacherKeys.validations, "OPEN", teacherId, caveIds],
    queryFn: async () => {
      const pages = await Promise.all(
        caveIds.map(async (caveId) => {
          const first = await listBeltValidations({
            status: "OPEN",
            caveId,
            limit: 100,
            page: 1,
          });
          const all = [...first.data];
          for (let page = 2; page <= first._meta.totalPage; page += 1) {
            const next = await listBeltValidations({
              status: "OPEN",
              caveId,
              limit: 100,
              page,
            });
            all.push(...next.data);
          }
          return all;
        }),
      );
      const byId = new Map<string, BeltValidation>();
      pages.forEach((items) => items.forEach((item) => byId.set(item.id, item)));
      return [...byId.values()];
    },
    // New declarations are created from the student's device. Refresh the
    // teacher's queue so an already-open screen sees them after enrollment.
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    enabled: teacherQuery.isSuccess,
  });
  return {
    ...query,
    isLoading: teacherQuery.isLoading || query.isLoading,
    error: teacherQuery.error ?? query.error,
  };
}

/** SCHEDULED validations in the teacher's own classes. */
export function useScheduledValidations() {
  const teacherId = useAppStore((state) => state.user.teacherId);
  return useQuery({
    queryKey: [...teacherKeys.validations, "SCHEDULED", teacherId],
    queryFn: async () =>
      (await listBeltValidations({ status: "SCHEDULED", teacherId: teacherId! })).data,
    enabled: Boolean(teacherId),
  });
}
