import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { queryClient } from "@/api/bootstrap/query-client";
import {
  cancelClassEnrollment,
  checkInClass,
  enrollClass,
  getClass,
  listEnrollments,
  setClassParticipation,
  type BackendClass,
  type EnrollmentItem,
  type EnrollmentStatus,
} from "@/api/services/classes.service";
import { searchPractitioners } from "@/api/services/practitioners.service";
import { backendMessage } from "@/api/utils/backend-message";
import { FormField } from "@/components/customized/form-field/form-field";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { SmallButton, StatusBadge, TeacherPage, ui } from "@/components/teacher/teacher-ui";
import { getErrorMessage } from "@/constants/error-messages";
import { teacherKeys, useScheduledValidations } from "@/hooks/use-teacher-data";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";
import { classTypeLabel, formatClassWhen, formatTime, withTime } from "@/utils/date-time";
import { confirmAction, notify } from "@/utils/dialogs";
import { normalizeApiError } from "@/utils/normalize-api-error";

const STATUS: Record<EnrollmentStatus, { label: string; tone: "neutral" | "success" | "warning" | "danger" }> = {
  PENDING: { label: "Inscrito", tone: "warning" },
  IN_PROGRESS: { label: "Em andamento", tone: "warning" },
  CONFIRMED: { label: "Presente", tone: "success" },
  EXPIRED: { label: "Expirado", tone: "neutral" },
  CANCELLED: { label: "Cancelado", tone: "danger" },
};

export default function AttendanceScreen() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const teacherId = useAppStore((state) => state.user.teacherId);

  const classQuery = useQuery({
    queryKey: ["class", classId],
    queryFn: () => getClass(classId),
    enabled: Boolean(classId),
  });
  const enrollmentsQuery = useQuery({
    queryKey: teacherKeys.enrollments(teacherId, classId),
    queryFn: () => listEnrollments(classId),
    enabled: Boolean(classId),
  });
  const scheduledQuery = useScheduledValidations();
  const validations = (scheduledQuery.data ?? []).filter((v) => v.class?.id === classId);
  const classItem = classQuery.data;
  const enrollments = enrollmentsQuery.data ?? [];
  const confirmed = enrollments.filter((e) => e.status === "CONFIRMED").length;
  const active = enrollments.filter((e) => e.status !== "CANCELLED" && e.status !== "EXPIRED").length;

  return (
    <TeacherPage title="Chamada" subtitle="Confirme a presença dos alunos" showBack>
      {classQuery.isLoading ? (
        <LoadingSpinner label="Carregando aula…" />
      ) : !classItem ? (
        <Text style={s.body}>{backendMessage(classQuery.error, "Aula não encontrada.")}</Text>
      ) : (
        <>
          <View style={s.card}>
            <Text style={s.accent}>{classTypeLabel(classItem.type).toUpperCase()}</Text>
            <Text style={s.title}>{formatClassWhen(classItem.startsAt, classItem.endsAt)}</Text>
            <Text style={s.body}>
              {classItem.caveUnit?.name ?? "Unidade"} • {active}/{classItem.capacity} inscritos •{" "}
              {confirmed} presentes
            </Text>
          </View>

          {validations.length > 0 ? (
            <View style={s.card}>
              <Text style={s.title}>Validações de faixa nesta aula</Text>
              <Text style={s.body}>
                Confirme a presença do aluno antes de aprovar a faixa.
              </Text>
              {validations.map((validation) => (
                <View key={validation.id} style={ui.between}>
                  <Text style={[s.body, { flex: 1 }]}>
                    {validation.practitioner?.user?.name ?? "Aluno"} →{" "}
                    {validation.targetBelt?.name ?? "faixa declarada"}
                  </Text>
                  <SmallButton
                    label="Avaliar"
                    variant="primary"
                    onPress={() =>
                      router.push({
                        pathname: "/professor/validacoes/[validationId]",
                        params: { validationId: validation.id },
                      })
                    }
                  />
                </View>
              ))}
            </View>
          ) : null}

          <Text style={ui.label}>ALUNOS INSCRITOS</Text>
          {enrollmentsQuery.isLoading ? (
            <LoadingSpinner label="Carregando inscrições…" size={40} />
          ) : enrollmentsQuery.isError ? (
            <Text style={s.body}>
              {backendMessage(enrollmentsQuery.error, "Não foi possível carregar as inscrições.")}
            </Text>
          ) : enrollments.length === 0 ? (
            <View style={s.card}>
              <Text style={s.body}>Nenhum aluno inscrito nesta aula.</Text>
            </View>
          ) : (
            enrollments.map((enrollment) => (
              <EnrollmentRow key={enrollment.id} classItem={classItem} enrollment={enrollment} />
            ))
          )}

          <EnrollStudent classId={classItem.id} />
        </>
      )}
    </TeacherPage>
  );
}

function refreshAttendance(classId: string) {
  const teacherId = useAppStore.getState().user.teacherId;
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: teacherKeys.enrollments(teacherId, classId) }),
    queryClient.invalidateQueries({ queryKey: teacherKeys.validations }),
  ]);
}

function EnrollmentRow({ classItem, enrollment }: { classItem: BackendClass; enrollment: EnrollmentItem }) {
  const [showParticipation, setShowParticipation] = useState(false);
  const [startTime, setStartTime] = useState(formatTime(enrollment.participationStartedAt ?? classItem.startsAt));
  const [endTime, setEndTime] = useState(formatTime(enrollment.participationEndedAt ?? classItem.endsAt));
  const [reason, setReason] = useState("");
  const status = STATUS[enrollment.status] ?? STATUS.PENDING;
  const canCheckIn = enrollment.status === "PENDING" || enrollment.status === "IN_PROGRESS";
  const onError = (title: string) => (error: unknown) =>
    notify(title, backendMessage(error, "Tente novamente."));

  const checkIn = useMutation({
    mutationFn: () => checkInClass(classItem.id, enrollment.id),
    onSuccess: () => refreshAttendance(classItem.id),
    onError: onError("Não foi possível confirmar a presença"),
  });
  const cancel = useMutation({
    mutationFn: () => cancelClassEnrollment(classItem.id, enrollment.id),
    onSuccess: () => refreshAttendance(classItem.id),
    onError: onError("Não foi possível cancelar"),
  });
  const participation = useMutation({
    mutationFn: async () => {
      const base = new Date(classItem.startsAt);
      const startedAt = withTime(base, startTime);
      const endedAt = withTime(base, endTime);
      if (!startedAt || !endedAt || endedAt <= startedAt) {
        throw new Error("Use horários HH:MM, com o término depois do início.");
      }
      await setClassParticipation(classItem.id, enrollment.id, {
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
    },
    onSuccess: async () => {
      setShowParticipation(false);
      await refreshAttendance(classItem.id);
      notify("Participação registrada");
    },
    onError: onError("Não foi possível registrar a participação"),
  });

  const busy = checkIn.isPending || cancel.isPending || participation.isPending;

  return (
    <View style={s.card}>
      <View style={ui.between}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{enrollment.practitioner?.user?.name ?? "Aluno"}</Text>
          <Text style={s.body}>{enrollment.practitioner?.user?.email ?? ""}</Text>
        </View>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
      <View style={ui.row}>
        {canCheckIn ? (
          <SmallButton label="Confirmar presença" variant="primary" disabled={busy} onPress={() => checkIn.mutate()} />
        ) : null}
        {enrollment.status === "CONFIRMED" ? (
          <SmallButton
            label={showParticipation ? "Fechar" : "Registrar participação"}
            disabled={busy}
            onPress={() => setShowParticipation((value) => !value)}
          />
        ) : null}
        {canCheckIn ? (
          <SmallButton
            label="Cancelar inscrição"
            variant="danger"
            disabled={busy}
            onPress={() =>
              confirmAction("Cancelar inscrição?", "A vaga será liberada.", () => cancel.mutate(), "Cancelar inscrição")
            }
          />
        ) : null}
      </View>
      {showParticipation ? (
        <View>
          <Text style={s.body}>
            Horário em que o aluno treinou (padrão: horário da aula).
          </Text>
          <View style={ui.row}>
            <FormField label="INÍCIO" value={startTime} onChangeText={setStartTime} width={48} keyboardType="numbers-and-punctuation" />
            <FormField label="TÉRMINO" value={endTime} onChangeText={setEndTime} width={48} keyboardType="numbers-and-punctuation" />
          </View>
          <FormField
            label="MOTIVO (OBRIGATÓRIO AO CORRIGIR UM REGISTRO)"
            value={reason}
            onChangeText={setReason}
            placeholder="Ex.: chegou atrasado"
          />
          <SmallButton label="Salvar participação" variant="primary" disabled={busy} onPress={() => participation.mutate()} />
        </View>
      ) : null}
    </View>
  );
}

function EnrollStudent({ classId }: { classId: string }) {
  const teacherId = useAppStore((state) => state.user.teacherId);
  const [search, setSearch] = useState("");
  const term = search.trim();
  const searchQuery = useQuery({
    queryKey: teacherKeys.practitionerSearch(teacherId, term),
    queryFn: () => searchPractitioners(term),
    enabled: term.length >= 2,
  });
  const enroll = useMutation({
    mutationFn: (practitionerId: string) => enrollClass(classId, { practitionerId }),
    onSuccess: async () => {
      setSearch("");
      await refreshAttendance(classId);
      notify("Aluno inscrito");
    },
    onError: (error) => notify("Não foi possível inscrever", backendMessage(error, "Tente novamente.")),
  });

  return (
    <View style={s.card}>
      <Text style={s.title}>Inscrever aluno</Text>
      <FormField
        label="BUSCAR POR NOME OU E-MAIL"
        value={search}
        onChangeText={setSearch}
        placeholder="Digite pelo menos 2 letras"
        autoCapitalize="none"
      />
      {searchQuery.isFetching ? <Text style={s.body}>Buscando…</Text> : null}
      {term.length >= 2 && searchQuery.isError && !searchQuery.isFetching ? (
        // Its own state: a failed search is not "no student found".
        <View style={ui.between}>
          <Text style={[s.body, { flex: 1 }]} accessibilityRole="alert">
            Não foi possível buscar alunos. {getErrorMessage(normalizeApiError(searchQuery.error))}
          </Text>
          <SmallButton label="Tentar novamente" onPress={() => void searchQuery.refetch()} />
        </View>
      ) : null}
      {term.length >= 2 && searchQuery.isSuccess && searchQuery.data.length === 0 ? (
        <Text style={s.body}>Nenhum aluno encontrado.</Text>
      ) : null}
      {(term.length >= 2 ? searchQuery.data ?? [] : []).map((practitioner) => (
        <View key={practitioner.id} style={ui.between}>
          <View style={{ flex: 1 }}>
            <Text style={s.body}>{practitioner.user.name}</Text>
            <Text style={s.accent}>{practitioner.user.email}</Text>
          </View>
          <SmallButton
            label="Inscrever"
            disabled={enroll.isPending}
            onPress={() => enroll.mutate(practitioner.id)}
          />
        </View>
      ))}
    </View>
  );
}
