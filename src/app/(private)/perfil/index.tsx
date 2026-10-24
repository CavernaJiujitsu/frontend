import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { profilePreview } from '@/api/mocks/student-preview';
import { PreviewControls, PreviewFeedback, StudentPage } from '@/components/student-preview/preview-kit';
import { studentStyles as s } from '@/styles/private/student-preview.styles';
import type { PreviewScenario } from '@/types/student-preview';

export default function Perfil() {
  const [scenario, setScenario] = useState<PreviewScenario>('ready');
  const [openSection, setOpenSection] = useState<string | null>(null);
  const missing = scenario === 'missing';
  const visible = scenario === 'ready' || missing;
  return <StudentPage title="Perfil" subtitle="Seus dados e sua graduação">
    <PreviewControls scenario={scenario} onChange={setScenario} scenarios={['ready', 'missing', 'empty', 'loading', 'error']} />
    <PreviewFeedback scenario={scenario} retry={() => setScenario('ready')} />
    {visible && <>
      <View style={s.profile}>
        <Image source={require('../../../../assets/images/student-preview/avatar.svg')} style={s.avatar} accessibilityLabel="Avatar de demonstração" />
        <Text style={s.title}>{missing ? 'Nome não informado' : profilePreview.name}</Text>
        <Text style={s.accent}>{missing ? 'Graduação indisponível' : profilePreview.belt}</Text>
      </View>
      <View style={s.stats}>{profilePreview.stats.map(stat => <View key={stat.label} style={s.stat} accessibilityLabel={`${stat.label}: ${missing ? 'indisponível' : stat.value}`}>
        <Text style={s.value}>{missing ? '—' : stat.value}</Text><Text style={s.body}>{stat.label}</Text>
      </View>)}</View>
      {missing && <Text style={s.body}>Os indicadores ainda não estão disponíveis. Ausência de dados não significa zero.</Text>}
      {[
        { id: 'profile', title: 'Dados do perfil', content: `${missing ? 'E-mail não informado' : profilePreview.email}\nA edição do perfil estará disponível em breve.` },
        { id: 'certificates', title: 'Certificados', content: 'A consulta de certificados estará disponível em breve.' },
        { id: 'settings', title: 'Configurações', content: 'As configurações estarão disponíveis em breve.' },
      ].map(section => <View key={section.id} style={s.card}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: openSection === section.id }} style={({ pressed }) => [s.action, pressed && s.pressed]} onPress={() => setOpenSection(openSection === section.id ? null : section.id)}>
          <Text style={s.title}>{section.title} {openSection === section.id ? '−' : '+'}</Text>
        </Pressable>
        {openSection === section.id && <Text style={s.body}>{section.content}</Text>}
      </View>)}
    </>}
  </StudentPage>;
}
