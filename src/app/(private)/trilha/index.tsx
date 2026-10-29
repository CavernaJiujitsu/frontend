import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { trailPreview } from '@/api/mocks/student-preview';
import { DefaultButton } from '@/components/customized/default-button';
import { PreviewControls, PreviewFeedback, Progress, StudentPage } from '@/components/student-preview/preview-kit';
import { BrandColors } from '@/constants/theme';
import { studentStyles as s } from '@/styles/private/student-preview.styles';
import type { PreviewScenario } from '@/types/student-preview';

export default function Trilha() {
  const [scenario, setScenario] = useState<PreviewScenario>('ready');
  const visible = scenario === 'ready' || scenario === 'unvalidated';
  return <StudentPage title="Trilha de Faixas" subtitle="Acompanhe as etapas da sua evolução.">
    <PreviewControls scenario={scenario} onChange={setScenario} scenarios={['ready', 'pending', 'unvalidated', 'empty', 'loading', 'error']} />
    <PreviewFeedback scenario={scenario} retry={() => setScenario('ready')} />
    {visible && <>
      <Text style={s.body}>Sequência ilustrativa de faixas. As regras de graduação ainda serão definidas.</Text>
      {trailPreview.map((stage, index) => <View key={stage.id} style={s.row}>
        <View style={s.rail}>
          {index < trailPreview.length - 1 && <View style={s.line} />}
          <View style={stage.state === 'current' ? s.ring : s.marker}><View style={[s.dot, { backgroundColor: stage.color }]} /></View>
        </View>
        <View style={[s.stage, stage.state === 'current' && s.current]}>
          <Text style={s.title}>{stage.name}</Text>
          <Text style={s.accent}>{stage.state === 'current' ? 'Atual' : stage.state === 'completed' ? 'Concluída · exemplo' : 'Futura'}</Text>
          <Text style={s.body}>{stage.description}</Text>
          {stage.state === 'current' && <>
            <Progress percentage={scenario === 'unvalidated' ? 0 : stage.percentage} label={scenario === 'unvalidated' ? 'Nenhum movimento validado' : stage.progressLabel} />
            <DefaultButton label="Ver etapa atual" color={BrandColors.primary} action={() => router.push({ pathname: '/trilha/[stageId]', params: { stageId: stage.id, scenario } })} />
          </>}
        </View>
      </View>)}
    </>}
  </StudentPage>;
}
