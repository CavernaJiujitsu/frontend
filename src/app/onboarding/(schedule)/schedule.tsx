import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mockDuplicateSubscriptionError } from "@/api/mocks/backend-errors";
import {
  DEFAULT_SCHEDULE_CAVERNA_ID,
  DEFAULT_SCHEDULE_CAVERNA_TITLE,
  fetchClassesForDay,
  formatScheduleDate,
  getMonthDays,
  getScheduleMonths,
  hasAnyClassesInMonth,
} from "@/api/mocks/schedule";
import { ClassSkeleton } from "@/components/customized/class-skeleton/class-skeleton";
import { ClassCard } from "@/components/customized/schedule/class-card";
import { MonthSelector } from "@/components/customized/schedule/month-selector";
import { WeekDayList } from "@/components/customized/schedule/week-day-list";
import { reportError } from "@/store/useErrorStore";
import { isLoadingKey, useLoadingStore } from "@/store/useLoadingStore";
import { globalStyles } from "@/styles/global.styles";
import { scheduleStyles as styles } from "@/styles/onboarding/schedule.styles";
import type { ClassItem, ScheduleMonth } from "@/types/schedule";

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

// TODO: substituir o mock pelo service de aulas (GET /classes?cavernaId=&date=)
// quando o contrato do back estiver definido. Componentes já recebem props.
export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cavernaId?: string | string[];
    cavernaTitle?: string | string[];
  }>();
  const cavernaId = firstParam(params.cavernaId) ?? DEFAULT_SCHEDULE_CAVERNA_ID;
  const cavernaTitle =
    firstParam(params.cavernaTitle) ?? DEFAULT_SCHEDULE_CAVERNA_TITLE;

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
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const isClassesLoading = useLoadingStore(isLoadingKey("schedule-classes"));
  const classesRequestRef = useRef(0);

  useEffect(() => {
    const requestId = ++classesRequestRef.current;
    // Sem dia válido não há o que buscar; o id acima invalida respostas antigas.
    if (!selectedDay) return;
    const store = useLoadingStore.getState();
    store.show("schedule-classes");
    void fetchClassesForDay(cavernaId, selectedDay)
      .then((result) => {
        if (classesRequestRef.current === requestId) setClasses(result);
      })
      .finally(() => store.hide("schedule-classes"));
  }, [cavernaId, selectedDay]);
  const hasAnyClasses = useMemo(
    () => hasAnyClassesInMonth(cavernaId, days),
    [cavernaId, days],
  );

  const alertedCavernaRef = useRef<string | null>(null);
  useEffect(() => {
    if (hasAnyClasses) return;
    if (alertedCavernaRef.current === cavernaId) return;
    alertedCavernaRef.current = cavernaId;
    Alert.alert(cavernaTitle, "Essa caverna não possui horários disponíveis");
  }, [cavernaId, cavernaTitle, hasAnyClasses]);

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

  // TODO: trocar o mock por `reportError(e)` no `catch` do POST de inscrição
  // quando o endpoint real existir. Hoje simula um 409 do contrato v1
  // para exercitar o ErrorToast (componente + auto-dismiss + botão fechar).
  const handleSelectClass = (classItem: ClassItem) => {
    void classItem;
    reportError(mockDuplicateSubscriptionError());
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
              <ClassCard classItem={item} onPress={handleSelectClass} />
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
