import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Text, View } from "react-native";

import { queryClient } from "@/api/bootstrap/query-client";
import {
  approveBeltValidation,
  getBeltValidation,
  rejectBeltValidation,
} from "@/api/services/belt-validations.service";
import { listBelts } from "@/api/services/belts.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { FormField } from "@/components/customized/form-field/form-field";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { Chip, SmallButton, TeacherPage, ui } from "@/components/teacher/teacher-ui";
import { toAbsoluteUrl } from "@/constants/api";
import { BrandColors } from "@/constants/theme";
import { teacherKeys } from "@/hooks/use-teacher-data";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";
import { formatClassWhen } from "@/utils/date-time";
import { confirmAction, notify } from "@/utils/dialogs";

export default function ValidationReview() {
  const router = useRouter();
  const { validationId } = useLocalSearchParams<{ validationId: string }>();
  const teacherId = useAppStore((state) => state.user.teacherId);
  const validationQuery = useQuery({
    queryKey: teacherKeys.validation(teacherId, validationId),
    queryFn: () => getBeltValidation(validationId),
    enabled: Boolean(validationId),
  });
  const beltsQuery = useQuery({ queryKey: ["belts"], queryFn: listBelts, staleTime: Infinity });
  const validation = validationQuery.data;
  const belts = beltsQuery.data ?? [];

  // `null` means "use the belt the student declared".
  const [approvedBeltId, setApprovedBeltId] = useState<string | null>(null);
  const [suggestedBeltId, setSuggestedBeltId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const approveBelt = approvedBeltId ?? validation?.targetBelt?.id ?? null;

  const finish = async (title: string) => {
    await queryClient.invalidateQueries({ queryKey: teacherKeys.validations });
    await queryClient.invalidateQueries({ queryKey: teacherKeys.validation(teacherId, validationId) });
    notify(title);
    router.replace("/professor/validacoes");
  };
  const approve = useMutation({
    mutationFn: () =>
      approveBeltValidation(validationId, {
        ...(approveBelt ? { approvedBeltId: approveBelt } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: () => finish("Faixa aprovada"),
    onError: (error) => notify("Não foi possível aprovar", backendMessage(error, "Tente novamente.")),
  });
  const reject = useMutation({
    mutationFn: () =>
      rejectBeltValidation(validationId, {
        suggestedBeltId: suggestedBeltId!,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: () => finish("Validação rejeitada"),
    onError: (error) => notify("Não foi possível rejeitar", backendMessage(error, "Tente novamente.")),
  });
  const busy = approve.isPending || reject.isPending;

  if (validationQuery.isLoading) {
    return (
      <TeacherPage title="Avaliar faixa" showBack>
        <LoadingSpinner label="Carregando validação…" />
      </TeacherPage>
    );
  }
  if (!validation) {
    return (
      <TeacherPage title="Avaliar faixa" showBack>
        <Text style={s.body}>
          {backendMessage(validationQuery.error, "Validação não encontrada.")}
        </Text>
      </TeacherPage>
    );
  }

  const isScheduled = validation.status === "SCHEDULED";

  return (
    <TeacherPage title="Avaliar faixa" subtitle={validation.practitioner?.user?.name ?? "Aluno"} showBack>
      <View style={s.card}>
        <Text style={s.body}>Faixa atual: {validation.currentBelt?.name ?? "sem graduação"}</Text>
        <Text style={s.body}>Faixa declarada: {validation.targetBelt?.name ?? "não informada"}</Text>
        {validation.class ? (
          <Text style={s.body}>
            Aula: {formatClassWhen(validation.class.startsAt, validation.class.endsAt)}
          </Text>
        ) : null}
        {validation.certificateUrl ? (
          <SmallButton label="Ver certificado" onPress={() => void Linking.openURL(toAbsoluteUrl(validation.certificateUrl!))} />
        ) : null}
      </View>

      {!isScheduled ? (
        <View style={s.card}>
          <Text style={s.body}>
            Esta validação está com status {validation.status} e não pode ser avaliada aqui.
          </Text>
        </View>
      ) : (
        <>
          <View style={s.notice}>
            <Text style={s.body}>
              A aprovação só é aceita quando o aluno está com presença confirmada (check-in) na
              aula agendada.
            </Text>
            {validation.class ? (
              <SmallButton
                label="Abrir chamada da aula"
                onPress={() =>
                  router.push({
                    pathname: "/professor/aulas/[classId]/chamada",
                    params: { classId: validation.class!.id },
                  })
                }
              />
            ) : null}
          </View>

          <View style={s.card}>
            <Text style={s.title}>Aprovar</Text>
            <Text style={s.body}>Escolha outra faixa se a declarada não for a correta.</Text>
            <View style={ui.row}>
              {belts.map((belt) => (
                <Chip
                  key={belt.id}
                  label={belt.name}
                  selected={approveBelt === belt.id}
                  onPress={() => setApprovedBeltId(belt.id)}
                />
              ))}
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Rejeitar</Text>
            <Text style={s.body}>Indique a faixa que o aluno deve usar.</Text>
            <View style={ui.row}>
              {belts.map((belt) => (
                <Chip
                  key={belt.id}
                  label={belt.name}
                  selected={suggestedBeltId === belt.id}
                  onPress={() => setSuggestedBeltId(belt.id)}
                />
              ))}
            </View>
          </View>

          <FormField label="OBSERVAÇÕES (OPCIONAL)" value={notes} onChangeText={setNotes} placeholder="Comentário para o aluno" />

          <DefaultButton
            label={approve.isPending ? "Aprovando…" : "Aprovar faixa"}
            color={BrandColors.secondary}
            disabled={busy}
            action={() => approve.mutate()}
          />
          <DefaultButton
            label={reject.isPending ? "Rejeitando…" : "Rejeitar declaração"}
            color={BrandColors.primary}
            disabled={busy || !suggestedBeltId}
            action={() =>
              confirmAction(
                "Rejeitar declaração?",
                "O aluno receberá a faixa sugerida.",
                () => reject.mutate(),
                "Rejeitar",
              )
            }
          />
        </>
      )}
    </TeacherPage>
  );
}
