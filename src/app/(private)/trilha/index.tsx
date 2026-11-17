import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Text, View } from "react-native";

import { getMyTrail, type ActiveTrail, type TrailStage } from "@/api/services/trail.service";
import { DefaultButton } from "@/components/customized/default-button";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { Progress, StudentPage } from "@/components/student-preview/preview-kit";
import { BrandColors } from "@/constants/theme";
import { studentKeys } from "@/hooks/query-keys";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";

const stageStatusLabels: Record<TrailStage["status"], string> = {
  PENDING: "Futura",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
};

function isActiveTrail(trail: Awaited<ReturnType<typeof getMyTrail>>): trail is ActiveTrail {
  return trail.noActiveBelt === false;
}

function PendingEvaluation() {
  return (
    <View style={s.pendingPage}>
      <Text style={s.pendingEyebrow}>CAVERNA</Text>
      <Text style={s.pendingHeading}>Sua jornada começou</Text>
      <View style={s.card}>
        <Text style={s.title}>Avaliação pendente</Text>
        <Text style={s.body}>Sua faixa será confirmada presencialmente por um professor.</Text>
        <View style={s.pendingBadge}>
          <Text style={s.accent}>Aguardando avaliação</Text>
        </View>
      </View>
    </View>
  );
}

function TrailContent({ trail }: { trail: ActiveTrail }) {
  const stages = [...trail.stages].sort((a, b) => a.position - b.position);
  const beltColor = trail.belt?.color ?? BrandColors.border;
  const title = trail.belt?.name ?? trail.trail?.name ?? "Trilha de progressão";
  const subtitle = trail.belt && trail.trail ? trail.trail.name : null;
  return (
    <>
      <View style={s.card}>
        <View style={s.beltRow}>
          <View style={[s.beltDot, { backgroundColor: beltColor }]} />
          <View>
            <Text style={s.title}>{title}</Text>
            {subtitle ? <Text style={s.body}>{subtitle}</Text> : null}
          </View>
        </View>
        <Progress percentage={trail.percent} label={`${trail.requiredCompleted} / ${trail.requiredTotal} movimentos obrigatórios`} />
        {trail.trail?.description ? <Text style={s.body}>{trail.trail.description}</Text> : null}
      </View>
      <Text style={s.title} accessibilityRole="header">Etapas da trilha</Text>
      {stages.map((stage, index) => (
        <View key={stage.id} style={s.row}>
          <View style={s.rail}>
            {index < stages.length - 1 && <View style={s.line} />}
            <View style={stage.isCurrent ? s.ring : s.marker}>
              <View style={[s.dot, { backgroundColor: beltColor }]} />
            </View>
          </View>
          <View style={[s.stage, stage.isCurrent && s.current]}>
            <Text style={s.title}>{stage.name}</Text>
            <Text style={s.accent}>{stageStatusLabels[stage.status]}</Text>
            {stage.description ? <Text style={s.body}>{stage.description}</Text> : null}
            <Progress percentage={stage.percent} label={`${stage.requiredCompleted} / ${stage.requiredTotal} obrigatórios`} />
            {stage.isCurrent ? (
              <DefaultButton
                label="Ver etapa atual"
                color={BrandColors.primary}
                action={() => router.push({ pathname: "/trilha/[stageId]", params: { stageId: stage.id } })}
              />
            ) : null}
          </View>
        </View>
      ))}
    </>
  );
}

export default function Trilha() {
  const accessToken = useAppStore((state) => state.user.accessToken);
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const query = useQuery({
    queryKey: studentKeys.trail(practitionerId),
    queryFn: getMyTrail,
    enabled: Boolean(accessToken),
  });
  useReportQueryError(query.error);

  return (
    <StudentPage title="Trilha de Faixas" subtitle="Acompanhe as etapas da sua evolução.">
      {!accessToken ? (
        <View style={s.card}>
          <Text style={s.title}>Sua sessão precisa ser renovada</Text>
          <Text style={s.body}>Entre novamente para carregar sua trilha.</Text>
          <DefaultButton label="Voltar para o login" color={BrandColors.primary} action={() => router.replace("/onboarding/login")} />
        </View>
      ) : query.isLoading ? <LoadingSpinner label="Carregando sua trilha…" /> : query.isError ? (
        <View style={s.card}>
          <Text style={s.title}>Não foi possível carregar sua trilha</Text>
          <Text style={s.body}>Verifique sua conexão e tente novamente.</Text>
          <DefaultButton label="Tentar novamente" color={BrandColors.primary} action={() => query.refetch()} />
        </View>
      ) : query.data && !isActiveTrail(query.data) ? <PendingEvaluation /> : query.data ? <TrailContent trail={query.data} /> : null}
    </StudentPage>
  );
}
