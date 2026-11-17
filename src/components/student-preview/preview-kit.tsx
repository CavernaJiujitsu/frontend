import type { PropsWithChildren } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BottomNavbar } from '@/components/bottom-navbar/bottom-navbar';
import { ScreenLayout } from '@/components/screen-layout/screen-layout';
import { inicioStyles } from '@/styles/private/inicio.styles';
import { studentStyles as s } from '@/styles/private/student-preview.styles';

export function StudentPage({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return <ScreenLayout bottomNav={<BottomNavbar />}><View style={s.content}>
    <View style={inicioStyles.header}><Text accessibilityRole="header" style={inicioStyles.greeting}>{title}</Text><Text style={inicioStyles.greetingSub}>{subtitle}</Text></View>
    <ScrollView contentContainerStyle={s.scroll}>{children}</ScrollView>
  </View></ScreenLayout>;
}

export function Progress({ percentage, label }: { percentage: number; label: string }) {
  return <View style={{ gap: 8 }}><Text style={s.body}>{label} · {percentage}%</Text><View style={s.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percentage }}><View style={[s.fill, { width: `${percentage}%` }]} /></View></View>;
}
