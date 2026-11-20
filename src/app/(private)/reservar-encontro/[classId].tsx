import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";

import { enrollClass, getClass } from "@/api/services/classes.service";
import { DefaultButton } from "@/components/customized/default-button";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { StudentPage } from "@/components/student-preview/preview-kit";
import { getErrorMessage } from "@/constants/error-messages";
import { BrandColors } from "@/constants/theme";
import { studentKeys } from "@/hooks/query-keys";
import { useHomeSummary } from "@/hooks/use-home-summary";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";
import { classTypeLabel, formatClassWhen } from "@/utils/date-time";
import { notify } from "@/utils/dialogs";
import { normalizeApiError } from "@/utils/normalize-api-error";
import { enrollmentStatusLabel } from "@/utils/schedule";

export default function ReservarEncontro() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  // Navigation and dialogs must not run once the student left the screen.
  const isMounted = useRef(true);
  // Synchronous guard against a double tap before `isPending` re-renders.
  const enrollLock = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const classQuery = useQuery({
    queryKey: ["class", classId],
    queryFn: () => getClass(classId),
    enabled: Boolean(classId),
  });
  const classItem = classQuery.data;
  // The next-class summary is the only place where the API exposes the
  // student's own enrollment status.
  const homeQuery = useHomeSummary();
  const nextEnrollment = homeQuery.data?.nextClass;
  const currentEnrollment = nextEnrollment?.classId === classId ? nextEnrollment : null;

  const enrollMutation = useMutation({
    mutationFn: () => enrollClass(classId, { practitionerId: practitionerId!, requestInitialValidation: true }),
    onSuccess: (enrollment) => {
      void queryClient.invalidateQueries({ queryKey: studentKeys.homeAll(practitionerId) });
      if (!isMounted.current) return;
      const status = enrollmentStatusLabel(enrollment.status);
      notify(
        "Aula reservada",
        status
          ? `Sua vaga foi reservada (${status.toLowerCase()}). O professor confirma sua presença na aula.`
          : "Sua vaga foi reservada com sucesso.",
      );
      router.replace("/inicio");
    },
    onSettled: () => {
      enrollLock.current = false;
    },
  });

  const handleEnroll = () => {
    if (enrollLock.current || enrollMutation.isPending) return;
    enrollLock.current = true;
    enrollMutation.mutate();
  };

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/cavernas");

  const belts = (classItem?.belts ?? [])
    .map((item) => item.belt?.name)
    .filter(Boolean)
    .join(", ");
  const currentStatus = currentEnrollment
    ? enrollmentStatusLabel(currentEnrollment.enrollmentStatus)
    : null;

  return (
    <StudentPage title="Reserve sua aula" subtitle="Você está reservando somente esta aula.">
      {classQuery.isLoading ? (
        <LoadingSpinner label="Carregando aula…" />
      ) : classQuery.isError || !classItem ? (
        <View style={s.card}>
          <Text style={s.title} accessibilityRole="alert">Não foi possível carregar a aula</Text>
          <Text style={s.body}>
            {classQuery.isError
              ? getErrorMessage(normalizeApiError(classQuery.error))
              : "Tente novamente."}
          </Text>
          {classQuery.isError ? (
            <DefaultButton
              label="Tentar novamente"
              color={BrandColors.secondary}
              action={() => void classQuery.refetch()}
            />
          ) : null}
          <DefaultButton label="Voltar" color={BrandColors.primary} action={goBack} />
        </View>
      ) : (
        <>
          <View style={s.card}>
            <Text style={s.accent}>{classTypeLabel(classItem.type).toUpperCase()}</Text>
            <Text style={s.title}>{formatClassWhen(classItem.startsAt, classItem.endsAt)}</Text>
            <Text style={s.body}>
              {classItem.caveUnit?.cave?.name ?? "Caverna"} • {classItem.caveUnit?.name ?? "Unidade"}
            </Text>
            {classItem.teacher?.user?.name ? (
              <Text style={s.body}>Professor: {classItem.teacher.user.name}</Text>
            ) : null}
            <Text style={s.body}>Faixas: {belts || "Todas"}</Text>
            <Text style={s.body}>Capacidade: {classItem.capacity} alunos</Text>
          </View>

          {currentEnrollment ? (
            <View style={s.card} accessibilityLiveRegion="polite">
              <Text style={s.title}>Você já está inscrito nesta aula</Text>
              {currentStatus ? <Text style={s.body}>{currentStatus}</Text> : null}
            </View>
          ) : null}

          {enrollMutation.isError ? (
            <View style={s.card} accessibilityLiveRegion="polite">
              <Text style={s.title} accessibilityRole="alert">Não foi possível reservar</Text>
              <Text style={s.body}>
                {getErrorMessage(normalizeApiError(enrollMutation.error), "Não foi possível reservar sua aula. Tente novamente.")}
              </Text>
            </View>
          ) : null}

          {currentEnrollment ? null : (
            <DefaultButton
              label={enrollMutation.isPending ? "Reservando…" : "Confirmar reserva"}
              color={BrandColors.secondary}
              action={handleEnroll}
              disabled={!practitionerId || enrollMutation.isPending}
            />
          )}
          <DefaultButton label="Escolher outra aula" color={BrandColors.primary} action={goBack} />
        </>
      )}
    </StudentPage>
  );
}
