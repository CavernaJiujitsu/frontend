import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { getMyProfile } from "@/api/services/profile.service";
import { queryClient } from "@/api/bootstrap/query-client";
import { DefaultButton } from "@/components/customized/default-button";
import { StudentPage } from "@/components/student-preview/preview-kit";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { BrandColors } from "@/constants/theme";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { useAppStore } from "@/store/useAppStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";

export default function Perfil() {
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const accessToken = useAppStore((state) => state.user.accessToken);
  const resetUser = useAppStore((state) => state.resetUser);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["profile-me", practitionerId],
    queryFn: getMyProfile,
    enabled: Boolean(practitionerId && accessToken),
  });
  useReportQueryError(query.error);
  const profile = query.data;
  const statistics = profile?.statistics;
  const stats = [
    { label: "Horas", value: statistics ? `${statistics.hoursTrained}h` : null },
    { label: "Aulas", value: statistics ? String(statistics.classesCompleted) : null },
    { label: "Sequência", value: statistics ? String(statistics.trainingStreak) : null },
  ];

  const handleLogout = () => {
    resetUser();
    queryClient.clear();
    router.replace("/onboarding/login");
  };

  return (
    <StudentPage title="Perfil" subtitle="Seus dados e sua graduação">
      {!accessToken ? (
        <View style={s.card}>
          <Text style={s.title}>Sua sessão precisa ser renovada</Text>
          <Text style={s.body}>Entre novamente para carregar seu perfil.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/onboarding/login")} style={s.action}>
            <Text style={s.accent}>Voltar para o login</Text>
          </Pressable>
        </View>
      ) : query.isLoading || !practitionerId ? <LoadingSpinner label="Carregando seu perfil…" /> : query.isError ? (
        <View style={s.card}>
          <Text style={s.title}>Não foi possível carregar seu perfil</Text>
          <Text style={s.body}>Verifique sua conexão e tente novamente.</Text>
        </View>
      ) : profile ? (
        <>
          <View style={s.profile}>
            <Image source={profile.photoUrl ? { uri: profile.photoUrl } : require("../../../../assets/images/student-preview/avatar.svg")} style={s.avatar} accessibilityLabel="Foto do perfil" />
            <Text style={s.title}>{profile.name}</Text>
            <Text style={s.accent}>{profile.activeBelt?.name ?? "Graduação indisponível"}</Text>
          </View>
          <View style={s.stats}>
            {stats.map((stat) => (
              <View key={stat.label} style={s.stat} accessibilityLabel={`${stat.label}: ${stat.value ?? "indisponível"}`}>
                <Text style={s.value}>{stat.value ?? "—"}</Text>
                <Text style={s.body}>{stat.label}</Text>
              </View>
            ))}
          </View>
          {!profile.statistics ? <Text style={s.body}>Os indicadores ainda não estão disponíveis. Ausência de dados não significa zero.</Text> : null}
          {[
            { id: "profile", title: "Dados do perfil", content: `${profile.email}\nA edição do perfil estará disponível em breve.` },
            { id: "certificates", title: "Certificados", content: "A consulta de certificados estará disponível em breve." },
            { id: "settings", title: "Configurações", content: "As configurações estarão disponíveis em breve." },
          ].map((section) => (
            <View key={section.id} style={s.card}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: openSection === section.id }} style={({ pressed }) => [s.action, pressed && s.pressed]} onPress={() => setOpenSection(openSection === section.id ? null : section.id)}>
                <Text style={s.title}>{section.title} {openSection === section.id ? "−" : "+"}</Text>
              </Pressable>
              {openSection === section.id ? <Text style={s.body}>{section.content}</Text> : null}
            </View>
          ))}
          <DefaultButton
            label="Sair da conta"
            color={BrandColors.primary}
            action={handleLogout}
          />
        </>
      ) : null}
    </StudentPage>
  );
}
