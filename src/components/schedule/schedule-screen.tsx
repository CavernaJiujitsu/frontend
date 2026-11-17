import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { enrollmentStatusLabel, formatScheduleDate, getMonthDays, getScheduleMonths } from "@/utils/schedule";
import { endOfDay, startOfDay } from "@/utils/date-time";
import { getCave } from "@/api/services/caves.service";
import { enrollClass, listAllClasses, type BackendClass } from "@/api/services/classes.service";
import { BottomNavbar } from "@/components/bottom-navbar/bottom-navbar";
import { ClassSkeleton } from "@/components/customized/class-skeleton/class-skeleton";
import { DefaultButton } from "@/components/customized/default-button";
import { ClassCard } from "@/components/customized/schedule/class-card";
import { MonthSelector } from "@/components/customized/schedule/month-selector";
import { WeekDayList } from "@/components/customized/schedule/week-day-list";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { getErrorMessage } from "@/constants/error-messages";
import { BrandColors } from "@/constants/theme";
import { studentKeys } from "@/hooks/query-keys";
import { useHomeSummary } from "@/hooks/use-home-summary";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { scheduleStyles as styles } from "@/styles/onboarding/schedule.styles";
import type { ClassItem, ScheduleMonth } from "@/types/schedule";
import { normalizeApiError } from "@/utils/normalize-api-error";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function defaultDayId(year: number, monthIndex: number) {
  const today = new Date();
  const month = String(monthIndex + 1).padStart(2, "0");
  if (today.getFullYear() === year && today.getMonth() === monthIndex) {
    return String(year) + "-" + month + "-" + String(today.getDate()).padStart(2, "0");
  }
  return String(year) + "-" + month + "-01";
}

function toDateId(date: Date) {
  return String(date.getFullYear()) + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

function toTime(date: Date) {
  return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
}

function toClassItem(cls: BackendClass): ClassItem {
  const startsAt = new Date(cls.startsAt);
  const endsAt = new Date(cls.endsAt);
  const belts = (cls.belts ?? [])
    .map((item) => item?.belt?.name)
    .filter((name): name is string => typeof name === "string" && name.length > 0);
  return {
    id: cls.id,
    dateId: toDateId(startsAt),
    startTime: toTime(startsAt),
    endTime: toTime(endsAt),
    professor: cls.teacher?.user?.name ?? cls.teacher?.name ?? "Professor",
    // Seat usage from the list endpoint; unknown stays undefined.
    enrolled: cls.enrolledCount,
    capacity: cls.capacity,
    tags: belts.length > 0 ? belts.map((label) => ({ label })) : [{ label: "Todos" }],
  };
}

/**
 * Window of the selected day for `GET /classes` (`from`/`to`). Past days are
 * not queried (`null`); today starts at 00:00 so ongoing classes still show.
 */
export function classWindowForDay(day: Date, today: Date = new Date()): { from: string; to: string } | null {
  const dayEnd = endOfDay(day);
  const todayStart = startOfDay(today);
  if (dayEnd < todayStart) return null;
  return { from: startOfDay(day).toISOString(), to: dayEnd.toISOString() };
}

/** Classes of the cave in the window, limited to its active units. */
async function fetchCaveClasses(caveId: string, window: { from: string; to: string }): Promise<ClassItem[]> {
  const [cave, classes] = await Promise.all([
    getCave(caveId),
    listAllClasses({ caveId, from: window.from, to: window.to }),
  ]);
  const activeUnitIds = new Set((cave.units ?? []).filter((unit) => unit.active !== false).map((unit) => unit.id));
  return classes
    .filter((cls) => cls.caveUnit !== undefined && activeUnitIds.has(cls.caveUnit.id))
    .map(toClassItem);
}

export type ScheduleScreenProps = {
  cavernaId?: string;
  cavernaTitle?: string;
  mode: "onboarding" | "private";
};

export function ScheduleScreen({ cavernaId, cavernaTitle = "Sua caverna", mode }: ScheduleScreenProps) {
  const router = useRouter();
  const isCavernaIdValid = cavernaId !== undefined && UUID_RE.test(cavernaId);
  const today = useMemo(() => new Date(), []);
  const [year] = useState(today.getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(today.getMonth());
  const [selectedDayId, setSelectedDayId] = useState(() => defaultDayId(today.getFullYear(), today.getMonth()));
  const months = useMemo(() => getScheduleMonths(year), [year]);
  const days = useMemo(() => getMonthDays(year, selectedMonthIndex), [year, selectedMonthIndex]);
  const selectedDay = useMemo(() => days.find((day) => day.id === selectedDayId), [days, selectedDayId]);
  const classWindow = useMemo(() => (selectedDay ? classWindowForDay(selectedDay.date) : null), [selectedDay]);
  const query = useQuery({
    queryKey: ["schedule-classes", cavernaId, classWindow?.from ?? null, classWindow?.to ?? null],
    enabled: isCavernaIdValid && classWindow !== null,
    retry: false,
    queryFn: () => fetchCaveClasses(cavernaId!, classWindow!),
  });
  const queryClient = useQueryClient();
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  // The only enrollment status the API exposes to the student today is the
  // one of the next class (home summary): use it to mark that class.
  const homeQuery = useHomeSummary();
  const nextEnrollment = homeQuery.data?.nextClass ?? null;
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollmentFailure, setEnrollmentFailure] = useState<{ caveId: string | undefined; message: string } | null>(null);
  const enrollmentError = enrollmentFailure?.caveId === cavernaId ? enrollmentFailure?.message ?? null : null;
  const enrollmentLock = useRef(false);
  const enrollmentContext = useRef({ active: false });
  const isClassesLoading = classWindow !== null && (query.isPending || query.isFetching);

  useEffect(() => {
    const context = { active: true };
    enrollmentContext.current = context;
    return () => { context.active = false; };
  }, [cavernaId]);

  const classes = useMemo(() => {
    if (!selectedDay || classWindow === null) return [];
    return (query.data ?? [])
      .filter((item) => item.dateId === selectedDay.id)
      .map((item) => {
        if (nextEnrollment?.classId !== item.id) return item;
        const statusLabel = enrollmentStatusLabel(nextEnrollment.enrollmentStatus);
        return {
          ...item,
          isEnrolled: true,
          tags: statusLabel ? [{ label: statusLabel, variant: "highlight" as const }, ...item.tags] : item.tags,
        };
      });
  }, [query.data, selectedDay, classWindow, nextEnrollment]);

  const handleGoBack = () => {
    if (mode === "private") {
      router.replace("/cavernas");
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/onboarding/nearby-gym");
  };

  const handleSelectClass = async (classItem: ClassItem) => {
    // Logged-in students confirm the booking on the class detail screen.
    if (mode === "private") {
      router.push({ pathname: "/reservar-encontro/[classId]", params: { classId: classItem.id } });
      return;
    }
    if (enrollmentLock.current) return;
    if (!practitionerId) {
      setEnrollmentFailure({ caveId: cavernaId, message: "Sua conta não foi criada. Volte e crie sua conta novamente." });
      return;
    }
    const context = enrollmentContext.current;
    enrollmentLock.current = true;
    setEnrollmentFailure(null);
    setEnrollingId(classItem.id);
    try {
      await enrollClass(classItem.id, { practitionerId });
      // The home tab must not show the cached "no class booked" answer.
      void queryClient.invalidateQueries({ queryKey: studentKeys.homeAll(practitionerId) });
      if (context.active) router.replace("/inicio");
    } catch (err: unknown) {
      if (context.active) {
        // 409 messages (full class, already enrolled, belt not eligible) come from the API.
        setEnrollmentFailure({ caveId: cavernaId, message: getErrorMessage(normalizeApiError(err), "Não foi possível reservar sua aula. Tente novamente.") });
      }
    } finally {
      enrollmentLock.current = false;
      setEnrollingId(null);
    }
  };

  return (
    <ScreenLayout bottomNav={mode === "private" ? <BottomNavbar /> : undefined}>
      <View style={[globalStyles.container, styles.pageGap]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar para cavernas" onPress={handleGoBack} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">Escolha o dia e horário</Text>
          <Text style={styles.subtitle}>Escolha sua caverna — {cavernaTitle}</Text>
        </View>
        <MonthSelector
          months={months}
          selectedMonthIndex={selectedMonthIndex}
          onSelectMonth={(month: ScheduleMonth) => {
            setEnrollmentFailure(null);
            setSelectedMonthIndex(month.index);
            setSelectedDayId(defaultDayId(year, month.index));
          }}
        />
        <WeekDayList days={days} selectedDayId={selectedDayId} onSelectDay={(day) => {
          setEnrollmentFailure(null);
          setSelectedDayId(day.id);
        }} />
        {selectedDay ? <Text style={styles.selectedDate}>{formatScheduleDate(selectedDay.date)}</Text> : null}
        {!isCavernaIdValid ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle} accessibilityRole="alert">Escolha uma caverna válida</Text>
            <Text style={styles.emptyText}>Volte para escolher uma caverna e consultar seus horários.</Text>
            <DefaultButton label="Escolher outra caverna" color={BrandColors.primary} action={handleGoBack} />
          </View>
        ) : isClassesLoading ? (
          <ClassSkeleton />
        ) : query.isError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle} accessibilityRole="alert">Não foi possível carregar as aulas</Text>
            <Text style={styles.emptyText}>{getErrorMessage(normalizeApiError(query.error))}</Text>
            <DefaultButton label="Tentar novamente" color={BrandColors.primary} action={() => void query.refetch()} />
          </View>
        ) : (
          <>
            {enrollmentError ? (
              <View style={styles.feedback}>
                <Text style={styles.emptyText} accessibilityRole="alert">{enrollmentError}</Text>
                {!practitionerId ? <DefaultButton label="Criar conta" color={BrandColors.primary} action={() => router.replace("/onboarding/create-account")} /> : null}
              </View>
            ) : null}
            <FlatList
              data={classes}
              extraData={enrollingId}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => <ClassCard classItem={item} onPress={handleSelectClass} loading={enrollingId === item.id} disabled={enrollingId !== null} />}
              ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyTitle}>Nenhuma aula encontrada</Text><Text style={styles.emptyText}>Não existem aulas disponíveis para este dia nesta caverna.</Text></View>}
            />
          </>
        )}
      </View>
    </ScreenLayout>
  );
}
