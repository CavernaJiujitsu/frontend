import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Text, View } from "react-native";

import { queryClient } from "@/api/bootstrap/query-client";
import {
  scheduleBeltValidation,
  type BeltValidation,
} from "@/api/services/belt-validations.service";
import { backendMessage } from "@/api/utils/backend-message";
import { toAbsoluteUrl } from "@/constants/api";
import { getErrorMessage } from "@/constants/error-messages";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { Chip, SmallButton, StatusBadge, TeacherPage, ui } from "@/components/teacher/teacher-ui";
import {
  teacherKeys,
  usePendingValidations,
  useScheduledValidations,
  useUpcomingTeacherClasses,
} from "@/hooks/use-teacher-data";
import { studentStyles as s } from "@/styles/private/student-preview.styles";
import { classTypeLabel, formatClassWhen } from "@/utils/date-time";
import { notify, notifyError } from "@/utils/dialogs";
import { normalizeApiError } from "@/utils/normalize-api-error";

type Tab = "pending" | "scheduled";

function beltChange(validation: BeltValidation): string {
  const target = validation.targetBelt?.name ?? "sem faixa declarada";
  return validation.currentBelt?.name
    ? `${validation.currentBelt.name} → ${target}`
    : `Faixa declarada: ${target}`;
}

export default function TeacherValidations() {
  const [tab, setTab] = useState<Tab>("pending");
  const pendingQuery = usePendingValidations();
  const scheduledQuery = useScheduledValidations();

  return (
    <TeacherPage title="Validações de faixa" subtitle="Agende e avalie as faixas dos alunos">
      <View style={ui.row}>
        <Chip
          label={`Em aberto (${pendingQuery.data?.length ?? "…"})`}
          selected={tab === "pending"}
          onPress={() => setTab("pending")}
        />
        <Chip
          label={`Agendadas (${scheduledQuery.data?.length ?? "…"})`}
          selected={tab === "scheduled"}
          onPress={() => setTab("scheduled")}
        />
      </View>
      {tab === "pending" ? <PendingList /> : <ScheduledList />}
    </TeacherPage>
  );
}

function PendingList() {
  const router = useRouter();
  const query = usePendingValidations();
  const [openId, setOpenId] = useState<string | null>(null);

  if (query.isLoading) return <LoadingSpinner label="Carregando validações…" />;
  if (query.isError) {
    return <Text style={s.body}>{backendMessage(query.error, "Não foi possível carregar as validações.")}</Text>;
  }
  const items = query.data ?? [];

  return (
    <>
      <Text style={s.body}>
        Alunos das suas cavernas aguardando agendamento ou avaliação de faixa.
        Validações já agendadas podem ser avaliadas após o check-in na aula.
      </Text>
      {items.length === 0 ? (
        <View style={s.card}>
          <Text style={s.body}>Nenhuma validação em aberto nas suas cavernas.</Text>
        </View>
      ) : (
        items.map((validation) => (
          <View key={validation.id} style={s.card}>
            <View style={ui.between}>
              <Text style={[s.title, { flex: 1 }]}>
                {validation.practitioner?.user?.name ?? "Aluno"}
              </Text>
              <StatusBadge label={validation.status === "SCHEDULED" ? "Agendada" : "Pendente"} tone="warning" />
            </View>
            <Text style={s.body}>{beltChange(validation)}</Text>
            <View style={ui.row}>
              {validation.certificateUrl ? (
                <SmallButton
                  label="Ver certificado"
                  // Certificates referenced by id are stored with a relative URL.
                  onPress={() => void Linking.openURL(toAbsoluteUrl(validation.certificateUrl!))}
                />
              ) : (
                <Text style={s.accent}>Sem certificado</Text>
              )}
              {validation.status === "PENDING" ? (
                <SmallButton
                  label={openId === validation.id ? "Fechar" : "Agendar"}
                  variant="primary"
                  onPress={() => setOpenId(openId === validation.id ? null : validation.id)}
                />
              ) : validation.class ? (
                <SmallButton
                  label="Abrir chamada"
                  variant="primary"
                  onPress={() => router.push({
                    pathname: "/professor/aulas/[classId]/chamada",
                    params: { classId: validation.class!.id },
                  })}
                />
              ) : null}
            </View>
            {openId === validation.id ? (
              <ClassPicker validationId={validation.id} onDone={() => setOpenId(null)} />
            ) : null}
          </View>
        ))
      )}
    </>
  );
}

function ClassPicker({ validationId, onDone }: { validationId: string; onDone: () => void }) {
  const classesQuery = useUpcomingTeacherClasses(50);
  // Only VALIDATION or SCHEDULED classes accept a belt validation.
  const classes = (classesQuery.data ?? []).filter((item) => item.type !== "EXAM");
  const mutation = useMutation({
    mutationFn: (classId: string) => scheduleBeltValidation(validationId, classId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.validations });
      notify("Validação agendada", "O aluno foi inscrito na aula escolhida.");
      onDone();
    },
    onError: (error) => notifyError("Não foi possível agendar", error),
  });

  if (classesQuery.isLoading) return <LoadingSpinner label="Carregando suas aulas…" size={40} />;
  if (classesQuery.isError) {
    // A failed load must not read as "you have no classes".
    return (
      <View style={{ gap: 8 }}>
        <Text style={s.body} accessibilityRole="alert">
          Não foi possível carregar suas aulas. {getErrorMessage(normalizeApiError(classesQuery.error))}
        </Text>
        <SmallButton label="Tentar novamente" onPress={() => void classesQuery.refetch()} />
      </View>
    );
  }
  if (classes.length === 0) {
    return (
      <Text style={s.body}>
        Você não tem aulas futuras de treino ou validação. Crie uma na aba Aulas.
      </Text>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      <Text style={ui.label}>ESCOLHA A AULA</Text>
      {classes.map((item) => (
        <View key={item.id} style={ui.between}>
          <Text style={[s.body, { flex: 1 }]}>
            {formatClassWhen(item.startsAt, item.endsAt)} • {classTypeLabel(item.type)} •{" "}
            {item.caveUnit?.name ?? "Unidade"}
          </Text>
          <SmallButton
            label="Escolher"
            disabled={mutation.isPending}
            onPress={() => mutation.mutate(item.id)}
          />
        </View>
      ))}
    </View>
  );
}

function ScheduledList() {
  const router = useRouter();
  const query = useScheduledValidations();

  if (query.isLoading) return <LoadingSpinner label="Carregando validações…" />;
  if (query.isError) {
    return <Text style={s.body}>{backendMessage(query.error, "Não foi possível carregar as validações.")}</Text>;
  }
  const items = query.data ?? [];

  return (
    <>
      <Text style={s.body}>
        Validações marcadas nas suas aulas. Para aprovar, o aluno precisa estar com a
        presença confirmada (check-in) na chamada da aula.
      </Text>
      {items.length === 0 ? (
        <View style={s.card}>
          <Text style={s.body}>Nenhuma validação agendada nas suas aulas.</Text>
        </View>
      ) : (
        items.map((validation) => (
          <View key={validation.id} style={s.card}>
            <View style={ui.between}>
              <Text style={[s.title, { flex: 1 }]}>
                {validation.practitioner?.user?.name ?? "Aluno"}
              </Text>
              <StatusBadge label="Agendada" />
            </View>
            <Text style={s.body}>{beltChange(validation)}</Text>
            {validation.class ? (
              <Text style={s.body}>
                Aula: {formatClassWhen(validation.class.startsAt, validation.class.endsAt)}
                {validation.class.caveUnit?.name ? ` • ${validation.class.caveUnit.name}` : ""}
              </Text>
            ) : null}
            <View style={ui.row}>
              {validation.class ? (
                <SmallButton
                  label="Abrir chamada"
                  onPress={() =>
                    router.push({
                      pathname: "/professor/aulas/[classId]/chamada",
                      params: { classId: validation.class!.id },
                    })
                  }
                />
              ) : null}
              <SmallButton
                label="Avaliar faixa"
                variant="primary"
                onPress={() =>
                  router.push({
                    pathname: "/professor/validacoes/[validationId]",
                    params: { validationId: validation.id },
                  })
                }
              />
            </View>
          </View>
        ))
      )}
    </>
  );
}
