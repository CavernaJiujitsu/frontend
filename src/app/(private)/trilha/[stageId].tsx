import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { trailPreview } from '@/api/mocks/student-preview';
import { DefaultButton } from '@/components/customized/default-button';
import { Progress, StudentPage } from '@/components/student-preview/preview-kit';
import { BrandColors } from '@/constants/theme';
import { studentStyles as s } from '@/styles/private/student-preview.styles';

const movementLabels = { VALIDATED: 'Validado pelo professor', COMPLETED: 'Concluído · registro legado', PENDING: 'Aguardando validação' } as const;

export default function StageDetail() {
  const { stageId, scenario } = useLocalSearchParams<{ stageId: string; scenario?: string }>();
  const stage = trailPreview.find(item => item.id === stageId);
  const unvalidated = scenario === 'unvalidated';
  return <StudentPage title={stage?.name ?? 'Etapa não encontrada'} subtitle="Detalhes da etapa e dos movimentos.">
    <DefaultButton label="Voltar para trilha" color={BrandColors.primary} action={() => router.canGoBack() ? router.back() : router.replace('/trilha')} />
    <View style={s.notice}><Text style={s.accent}>Demonstração · dados fictícios</Text><Text style={s.body}>Os movimentos e as evidências abaixo são exemplos, sem efeito na sua progressão.</Text></View>
    {!stage ? <View style={s.card}><Text style={s.title}>Esta etapa não está disponível</Text><Text style={s.body}>Volte à trilha e selecione uma etapa válida.</Text></View> : <>
      <View style={s.card}><Text style={s.title}>{stage.name}</Text><Text style={s.body}>{stage.description}</Text><Progress percentage={unvalidated ? 0 : stage.percentage} label={unvalidated ? 'Nenhum movimento validado' : stage.progressLabel} /></View>
      <Text style={s.title} accessibilityRole="header">Movimentos da etapa</Text>
      {unvalidated && <Text style={s.body}>Trilha ativa, ainda sem movimentos validados pelo professor.</Text>}
      {!stage.movements.length && <Text style={s.body}>Não há detalhes de movimentos neste exemplo.</Text>}
      {stage.movements.map(movement => {
        const status = unvalidated ? 'PENDING' : movement.status;
        return <View key={movement.trailStageMovementId} style={s.card}>
          <Text style={s.title}>{movement.name}</Text>
          <Text style={s.accent}>{movementLabels[status]}</Text>
          {status === 'COMPLETED' && <Text style={s.body}>Registro legado sem evidência de validação. Professor, aula, unidade e data indisponíveis.</Text>}
          {status === 'PENDING' && <Text style={s.body}>Nenhuma validação registrada para este item.</Text>}
          {status === 'VALIDATED' && (movement.evidence.length ? movement.evidence.map(evidence => <View key={evidence.id}>
            <Text style={s.body}>Professor: {evidence.teacher}</Text>
            <Text style={s.body}>Aula: {evidence.className}</Text>
            <Text style={s.body}>Unidade: {evidence.caveUnit}</Text>
            <Text style={s.body}>Validado em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(evidence.validatedAt))} (Brasília)</Text>
          </View>) : <Text style={s.body}>Evidência de validação indisponível.</Text>)}
        </View>;
      })}
      <Text style={s.body}>Esta é uma lista parcial de movimentos para demonstração.</Text>
    </>}
  </StudentPage>;
}
