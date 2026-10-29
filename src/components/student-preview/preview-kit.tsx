import { useState, type PropsWithChildren } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BottomNavbar } from '@/components/bottom-navbar/bottom-navbar';
import { DefaultButton } from '@/components/customized/default-button';
import { LoadingSpinner } from '@/components/customized/loading-spinner/loading-spinner';
import { ScreenLayout } from '@/components/screen-layout/screen-layout';
import { BrandColors } from '@/constants/theme';
import { inicioStyles } from '@/styles/private/inicio.styles';
import { studentStyles as s } from '@/styles/private/student-preview.styles';
import type { PreviewScenario } from '@/types/student-preview';

export function StudentPage({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return <ScreenLayout bottomNav={<BottomNavbar />}><View style={s.content}>
    <View style={inicioStyles.header}><Text accessibilityRole="header" style={inicioStyles.greeting}>{title}</Text><Text style={inicioStyles.greetingSub}>{subtitle}</Text></View>
    <ScrollView contentContainerStyle={s.scroll}>{children}</ScrollView>
  </View></ScreenLayout>;
}

const labels: Record<PreviewScenario, string> = { ready: 'Exemplo completo', loading: 'Carregando', error: 'Erro', empty: 'Sem dados', pending: 'Avaliação pendente', unvalidated: 'Sem validações', missing: 'Dados incompletos' };
export function PreviewControls({ scenario, onChange, scenarios }: { scenario: PreviewScenario; onChange: (value: PreviewScenario) => void; scenarios: PreviewScenario[] }) {
  const [expanded, setExpanded] = useState(false);
  return <View style={s.notice}>
    <Text style={s.accent}>Demonstração · dados fictícios</Text>
    <Text style={s.body}>Este exemplo não representa seu perfil ou sua progressão.</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={s.action}><Text style={s.accent}>{expanded ? 'Ocultar cenários' : 'Explorar cenários'}</Text></Pressable>
    {expanded && <View style={s.controls}>{scenarios.map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: scenario === value }} onPress={() => onChange(value)} style={[s.chip, scenario === value && s.selected]}><Text style={s.body}>{labels[value]}</Text></Pressable>)}</View>}
  </View>;
}
export function PreviewFeedback({ scenario, retry }: { scenario: PreviewScenario; retry: () => void }) {
  if (scenario === 'loading') return <LoadingSpinner label="Carregando dados de demonstração…" />;
  const copy = {
    error: ['Não foi possível carregar', 'Tente novamente para voltar ao exemplo.'],
    empty: ['Nenhum dado disponível', 'Quando houver informações, elas aparecerão aqui.'],
    pending: ['Avaliação de faixa pendente', 'A faixa declarada ainda precisa de aprovação. Sua trilha será apresentada após a avaliação.'],
  } as const;
  if (scenario !== 'error' && scenario !== 'empty' && scenario !== 'pending') return null;
  return <View style={s.card} accessibilityLiveRegion="polite"><Text style={s.title}>{copy[scenario][0]}</Text><Text style={s.body}>{copy[scenario][1]}</Text>{scenario === 'error' && <DefaultButton label="Tentar novamente" color={BrandColors.primary} action={retry} />}</View>;
}
export function Progress({ percentage, label }: { percentage: number; label: string }) {
  return <View style={{ gap: 8 }}><Text style={s.body}>{label} · {percentage}%</Text><View style={s.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percentage }}><View style={[s.fill, { width: `${percentage}%` }]} /></View></View>;
}
