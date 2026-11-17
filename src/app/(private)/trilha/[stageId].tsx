import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { getMyTrail } from "@/api/services/trail.service";
import { DefaultButton } from "@/components/customized/default-button";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { Progress, StudentPage } from "@/components/student-preview/preview-kit";
import { BrandColors } from "@/constants/theme";
import { studentKeys } from "@/hooks/query-keys";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";

const movementLabels = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  VALIDATED: "Validado pelo professor",
} as const;

export default function StageDetail() {
  const { stageId } = useLocalSearchParams<{ stageId: string }>();
  const accessToken = useAppStore((state) => state.user.accessToken);
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const query = useQuery({
    queryKey: studentKeys.trail(practitionerId),
    queryFn: getMyTrail,
    enabled: Boolean(accessToken),
  });
  useReportQueryError(query.error);

  const stage = query.data && !query.data.noActiveBelt
    ? query.data.stages.find((item) => item.id === stageId || item.trailStageId === stageId)
    : undefined;

  return (
    <StudentPage title={stage?.name ?? "Detalhe da etapa"} subtitle="Detalhes da etapa e dos movimentos.">
      <DefaultButton label="Voltar para trilha" color={BrandColors.primary} action={() => (router.canGoBack() ? router.back() : router.replace("/trilha"))} />
      {!accessToken ? (
        <View style={s.card}>
          <Text style={s.title}>Sua sessão precisa ser renovada</Text>
          <Text style={s.body}>Entre novamente para carregar esta etapa.</Text>
          <DefaultButton label="Voltar para o login" color={BrandColors.primary} action={() => router.replace("/onboarding/login")} />
        </View>
      ) : query.isLoading ? <LoadingSpinner label="Carregando etapa…" /> : query.isError ? (
        <View style={s.card}>
          <Text style={s.title}>Não foi possível carregar a etapa</Text>
          <Text style={s.body}>Verifique sua conexão e tente novamente.</Text>
          <DefaultButton label="Tentar novamente" color={BrandColors.primary} action={() => query.refetch()} />
        </View>
      ) : query.data?.noActiveBelt ? (
        <View style={s.card}>
          <Text style={s.title}>Avaliação pendente</Text>
          <Text style={s.body}>Sua faixa será confirmada presencialmente por um professor.</Text>
        </View>
      ) : !stage ? (
        <View style={s.card}>
          <Text style={s.title}>Esta etapa não está disponível</Text>
          <Text style={s.body}>Volte à trilha e selecione uma etapa válida.</Text>
        </View>
      ) : (
        <>
          <View style={s.card}>
            <Text style={s.title}>{stage.name}</Text>
            {stage.description ? <Text style={s.body}>{stage.description}</Text> : null}
            <Progress percentage={stage.percent} label={`${stage.requiredCompleted} / ${stage.requiredTotal} obrigatórios`} />
          </View>
          <Text style={s.title} accessibilityRole="header">Movimentos da etapa</Text>
          {[...stage.movements].sort((a, b) => a.position - b.position).map((movement) => (
            <View key={movement.id} style={s.card}>
              <Text style={s.title}>{movement.movementName}</Text>
              <Text style={s.accent}>{movementLabels[movement.status]}</Text>
              <Text style={s.body}>{movement.required ? "Obrigatório" : "Opcional"}</Text>
              {movement.validatedAt ? <Text style={s.body}>Validado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(movement.validatedAt))} (Brasília)</Text> : null}
            </View>
          ))}
          {!stage.movements.length ? <Text style={s.body}>Nenhum movimento disponível nesta etapa.</Text> : null}
        </>
      )}
    </StudentPage>
  );
}
