import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
import { ClassCard } from "@/components/customized/schedule/class-card";
import { MonthSelector } from "@/components/customized/schedule/month-selector";
import { WeekDayList } from "@/components/customized/schedule/week-day-list";
import { useAppStore } from "@/store/useAppStore";
import { reportError } from "@/store/useErrorStore";
import { isLoadingKey, useLoadingStore } from "@/store/useLoadingStore";
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
  return `${year}-${month}-10`;
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
    .filter((name): name is string => typeof name === "string" && name.length > 0);
  return {
    id: cls.id,
    dateId: toDateId(startsAt),
    startTime: toTime(startsAt),
    endTime: toTime(endsAt),
    professor: cls.teacher?.user?.name ?? cls.teacher?.name ?? "Professor",
    enrolled: 0,
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
  const [allClasses, setAllClasses] = useState<ClassItem[]>([]);
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const isClassesLoading = useLoadingStore(isLoadingKey("schedule-classes"));
  const classesRequestRef = useRef(0);

  useEffect(() => {
    if (!cavernaId || !isCavernaIdValid) {
      Alert.alert(
        "Atenção",
        "Escolha uma caverna válida para ver os horários.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/onboarding/nearby-gym"),
          },
        ],
      );
      return;
    }
    const requestId = ++classesRequestRef.current;
    const store = useLoadingStore.getState();
    store.show("schedule-classes");
    void (async () => {
      try {
        const cave = await getCave(cavernaId);
        const units = cave.units ?? [];
        if (units.length === 0) {
          if (classesRequestRef.current === requestId) setAllClasses([]);
          return;
        }
        const results = await Promise.all(
          units.map((unit) => listClasses({ caveUnitId: unit.id })),
        );
        if (classesRequestRef.current === requestId) {
          setAllClasses(results.flat().map(toClassItem));
        }
      } catch (err: unknown) {
        if (classesRequestRef.current === requestId) {
          setAllClasses([]);
          Alert.alert(
            "Erro",
            backendMessage(err, "Não foi possível carregar as aulas."),
          );
        }
      } finally {
        store.hide("schedule-classes");
      }
    })();
  }, [cavernaId, isCavernaIdValid, router]);

  const classes = useMemo(() => {
    if (!selectedDay) return [];
    return allClasses.filter((classItem) => classItem.dateId === selectedDay.id);
  }, [allClasses, selectedDay]);

  const hasAnyClasses = useMemo(() => {
    if (allClasses.length === 0) return false;
    const dayIds = new Set(days.map((day) => day.id));
    return allClasses.some((classItem) => dayIds.has(classItem.dateId));
  }, [allClasses, days]);

  const alertedCavernaRef = useRef<string | null>(null);
  useEffect(() => {
    if (!cavernaId || !isCavernaIdValid) return;
    if (isClassesLoading || hasAnyClasses) return;
    if (alertedCavernaRef.current === cavernaId) return;
    alertedCavernaRef.current = cavernaId;
    Alert.alert(cavernaTitle, "Essa caverna não possui horários disponíveis");
  }, [cavernaId, cavernaTitle, hasAnyClasses, isCavernaIdValid, isClassesLoading]);

  const handleSelectMonth = (month: ScheduleMonth) => {
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
    if (enrollingId !== null) return;
    if (!practitionerId) {
      Alert.alert(
        "Atenção",
        "Sua conta não foi criada. Volte e crie sua conta novamente.",
      );
      return;
    }
    setEnrollingId(classItem.id);
    try {
      await enrollClass(classItem.id, { practitionerId });
      router.replace("/inicio");
    } catch (err: unknown) {
      reportError(err);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
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
          onSelectDay={(day) => setSelectedDayId(day.id)}
        />

        {selectedDay ? (
          <Text style={styles.selectedDate}>
            {formatScheduleDate(selectedDay.date)}
          </Text>
        ) : null}

        {isClassesLoading ? (
          <ClassSkeleton />
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ClassCard
                classItem={item}
                onPress={handleSelectClass}
                loading={enrollingId === item.id}
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
        )}
      </View>
    </SafeAreaView>
  );
}
