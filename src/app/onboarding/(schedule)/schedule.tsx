import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  formatScheduleDate,
  getMonthDays,
  getScheduleMonths,
} from "@/api/mocks/schedule";
import { getCave } from "@/api/services/caves.service";
import {
  listClasses,
  enrollClass,
  type BackendClass,
} from "@/api/services/classes.service";
import { backendMessage } from "@/api/utils/backend-message";
import { ClassSkeleton } from "@/components/customized/class-skeleton/class-skeleton";
import { DefaultButton } from "@/components/customized/default-button";
import { ClassCard } from "@/components/customized/schedule/class-card";
import { MonthSelector } from "@/components/customized/schedule/month-selector";
import { WeekDayList } from "@/components/customized/schedule/week-day-list";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { scheduleStyles as styles } from "@/styles/onboarding/schedule.styles";
import type { ClassItem, ScheduleMonth } from "@/types/schedule";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function defaultDayId(year: number, monthIndex: number) {
  const today = new Date();
  if (today.getFullYear() === year && today.getMonth() === monthIndex) {
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(monthIndex + 1).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function toDateId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function toClassItem(cls: BackendClass): ClassItem {
  const startsAt = new Date(cls.startsAt);
  const endsAt = new Date(cls.endsAt);
  const belts = (cls.belts ?? [])
    .map((item) => item?.belt?.name)
    .filter(
      (name): name is string => typeof name === "string" && name.length > 0,
    );
  return {
    id: cls.id,
    dateId: toDateId(startsAt),
    startTime: toTime(startsAt),
    endTime: toTime(endsAt),
    professor: cls.teacher?.user?.name ?? cls.teacher?.name ?? "Professor",
    capacity: cls.capacity,
    tags:
      belts.length > 0
        ? belts.map((label) => ({ label }))
        : [{ label: "Todos" }],
  };
}

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cavernaId?: string | string[];
    cavernaTitle?: string | string[];
  }>();
  const cavernaId = firstParam(params.cavernaId);
  const cavernaTitle = firstParam(params.cavernaTitle) ?? "Sua caverna";
  const isCavernaIdValid = cavernaId !== undefined && UUID_RE.test(cavernaId);

  const today = useMemo(() => new Date(), []);
  const [year] = useState(today.getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    today.getMonth(),
  );
  const [selectedDayId, setSelectedDayId] = useState(() =>
    defaultDayId(today.getFullYear(), today.getMonth()),
  );

  const months = useMemo(() => getScheduleMonths(year), [year]);
  const days = useMemo(
    () => getMonthDays(year, selectedMonthIndex),
    [year, selectedMonthIndex],
  );
  const selectedDay = useMemo(
    () => days.find((day) => day.id === selectedDayId),
    [days, selectedDayId],
  );
  const query = useQuery({
    queryKey: ["schedule-classes", cavernaId],
    enabled: isCavernaIdValid,
    retry: false,
    queryFn: async () => {
      const cave = await getCave(cavernaId!);
      const results = await Promise.all(
        (cave.units ?? []).map((unit) => listClasses({ caveUnitId: unit.id })),
      );
      return results.flat().map(toClassItem);
    },
  });
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollmentFailure, setEnrollmentFailure] = useState<{
    caveId: string | undefined;
    message: string;
  } | null>(null);
  const enrollmentError =
    enrollmentFailure?.caveId === cavernaId ? enrollmentFailure?.message : null;
  const enrollmentLock = useRef(false);
  const enrollmentContext = useRef({ active: false });
  const isClassesLoading = query.isPending || query.isFetching;

  useEffect(() => {
    const context = { active: true };
    enrollmentContext.current = context;
    return () => {
      context.active = false;
    };
  }, [cavernaId]);

  const classes = useMemo(() => {
    if (!selectedDay) return [];
    return (query.data ?? []).filter(
      (classItem) => classItem.dateId === selectedDay.id,
    );
  }, [query.data, selectedDay]);

  const handleSelectMonth = (month: ScheduleMonth) => {
    setEnrollmentFailure(null);
    setSelectedMonthIndex(month.index);
    setSelectedDayId(defaultDayId(year, month.index));
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/onboarding/nearby-gym");
    }
  };

  const handleSelectClass = async (classItem: ClassItem) => {
    if (enrollmentLock.current) return;
    if (!practitionerId) {
      setEnrollmentFailure({
        caveId: cavernaId,
        message: "Sua conta não foi criada. Volte e crie sua conta novamente.",
      });
      return;
    }
    const context = enrollmentContext.current;
    enrollmentLock.current = true;
    setEnrollmentFailure(null);
    setEnrollingId(classItem.id);
    try {
      await enrollClass(classItem.id, { practitionerId });
      if (context.active) router.replace("/inicio");
    } catch (err: unknown) {
      if (context.active) {
        setEnrollmentFailure({
          caveId: cavernaId,
          message: backendMessage(
            err,
            "Não foi possível reservar sua aula. Tente novamente.",
          ),
        });
      }
    } finally {
      enrollmentLock.current = false;
      setEnrollingId(null);
    }
  };

  return (
    <ScreenLayout>
      <View style={[globalStyles.container, styles.pageGap]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para escolha de caverna"
          onPress={handleGoBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Escolha o dia e horário
          </Text>
          <Text style={styles.subtitle}>
            Escolha sua caverna — {cavernaTitle}
          </Text>
        </View>

        <MonthSelector
          months={months}
          selectedMonthIndex={selectedMonthIndex}
          onSelectMonth={handleSelectMonth}
        />

        <WeekDayList
          days={days}
          selectedDayId={selectedDayId}
          onSelectDay={(day) => {
            setEnrollmentFailure(null);
            setSelectedDayId(day.id);
          }}
        />

        {selectedDay ? (
          <Text style={styles.selectedDate}>
            {formatScheduleDate(selectedDay.date)}
          </Text>
        ) : null}

        {!isCavernaIdValid ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle} accessibilityRole="alert">
              Escolha uma caverna válida
            </Text>
            <Text style={styles.emptyText}>
              Volte para escolher uma caverna e consultar seus horários.
            </Text>
            <DefaultButton
              label="Escolher outra caverna"
              color={BrandColors.primary}
              action={() => router.replace("/onboarding/nearby-gym")}
            />
          </View>
        ) : isClassesLoading ? (
          <ClassSkeleton />
        ) : query.isError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle} accessibilityRole="alert">
              Não foi possível carregar as aulas
            </Text>
            <Text style={styles.emptyText}>
              {backendMessage(
                query.error,
                "Não foi possível carregar as aulas.",
              )}
            </Text>
            <DefaultButton
              label="Tentar novamente"
              color={BrandColors.primary}
              action={() => {
                void query.refetch();
              }}
            />
          </View>
        ) : (
          <>
            {enrollmentError ? (
              <View style={styles.feedback}>
                <Text style={styles.emptyText} accessibilityRole="alert">
                  {enrollmentError}
                </Text>
                {!practitionerId ? (
                  <DefaultButton
                    label="Criar conta"
                    color={BrandColors.primary}
                    action={() => router.replace("/onboarding/create-account")}
                  />
                ) : null}
              </View>
            ) : null}
            <FlatList
              data={classes}
              extraData={enrollingId}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <ClassCard
                  classItem={item}
                  onPress={handleSelectClass}
                  loading={enrollingId === item.id}
                  disabled={enrollingId !== null}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>Nenhuma aula encontrada</Text>
                  <Text style={styles.emptyText}>
                    Não existem aulas disponíveis para este dia nesta caverna.
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </ScreenLayout>
  );
}
