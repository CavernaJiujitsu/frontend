import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import {
  getMyProfile,
} from "@/api/services/profile.service";
import { getPractitioner, updatePractitioner } from "@/api/services/practitioners.service";
import { backendMessage } from "@/api/utils/backend-message";
import { queryClient } from "@/api/bootstrap/query-client";
import { DefaultButton } from "@/components/customized/default-button";
import { ProfilePhoto } from "@/components/profile-photo";
import { StudentPage } from "@/components/student-preview/preview-kit";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { BrandColors } from "@/constants/theme";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { useAppStore } from "@/store/useAppStore";
import { useSessionStore } from "@/store/useSessionStore";
import { studentStyles as s } from "@/styles/private/student-preview.styles";

function classTypeLabel(value: string | null | undefined): string | null {
  if (value === "SCHEDULED") return "Treino";
  if (value === "VALIDATION") return "Avaliação";
  if (value === "EXAM") return "Exame";
  return value ?? null;
}

export default function Perfil() {
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const accessToken = useAppStore((state) => state.user.accessToken);
  const resetUser = useAppStore((state) => state.resetUser);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["profile-me"],
    queryFn: getMyProfile,
    enabled: Boolean(accessToken),
  });
  useReportQueryError(query.error);
  const profile = query.data;
  const practitionerQuery = useQuery({
    queryKey: ["practitioner-me", practitionerId],
    queryFn: () => getPractitioner(practitionerId!),
    enabled: Boolean(practitionerId && accessToken),
  });
  const trainingRecord = profile?.trainingRecord;
  const stats = [
    { label: "Última aula", value: classTypeLabel(trainingRecord?.class) },
    { label: "Caverna", value: trainingRecord?.caveUnit ?? null },
    { label: "Data", value: trainingRecord ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(trainingRecord.startsAt)) : null },
  ];

  const handleLogout = () => {
    resetUser();
    useSessionStore.getState().clearSession();
    queryClient.clear();
    router.replace("/onboarding/login");
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!practitionerId) throw new Error("Praticante não encontrado");
      const trimmedName = (name ?? profile?.name ?? "").trim();
      const trimmedEmail = (email ?? profile?.email ?? "").trim();
      const ageValue = age ?? (practitionerQuery.data?.age === null || practitionerQuery.data?.age === undefined ? "" : String(practitionerQuery.data.age));
      const parsedAge = ageValue.trim() === "" ? undefined : Number(ageValue);
      if (!trimmedName || !trimmedEmail) throw new Error("Nome e e-mail são obrigatórios");
      if (parsedAge !== undefined && (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 120)) {
        throw new Error("Informe uma idade entre 0 e 120 anos");
      }
      return updatePractitioner(practitionerId, {
        name: trimmedName,
        email: trimmedEmail,
        ...(parsedAge === undefined ? {} : { age: parsedAge }),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile-me"] }),
        queryClient.invalidateQueries({ queryKey: ["practitioner-me", practitionerId] }),
      ]);
      Alert.alert("Perfil atualizado", "Seus dados foram salvos.");
    },
    onError: (error: unknown) => Alert.alert("Não foi possível salvar", backendMessage(error, "Confira os dados e tente novamente.")),
  });

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
      ) : query.isLoading ? <LoadingSpinner label="Carregando seu perfil…" /> : query.isError ? (
        <View style={s.card}>
          <Text style={s.title}>Não foi possível carregar seu perfil</Text>
          <Text style={s.body}>Verifique sua conexão e tente novamente.</Text>
        </View>
      ) : profile ? (
        <>
          <View style={s.profile}>
            <ProfilePhoto />
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
          {!trainingRecord ? <Text style={s.body}>Seu registro de treino ainda não está disponível.</Text> : null}
          <View style={s.card}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: openSection === "profile" }} style={({ pressed }) => [s.action, pressed && s.pressed]} onPress={() => setOpenSection(openSection === "profile" ? null : "profile")}>
              <Text style={s.title}>Dados do perfil {openSection === "profile" ? "−" : "+"}</Text>
            </Pressable>
            {openSection === "profile" ? <View style={{ gap: 10 }}>
              <TextInput value={name ?? profile.name} onChangeText={setName} placeholder="Nome completo" autoCapitalize="words" style={s.input} />
              <TextInput value={email ?? profile.email} onChangeText={setEmail} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" style={s.input} />
              <TextInput value={age ?? (practitionerQuery.data?.age === null || practitionerQuery.data?.age === undefined ? "" : String(practitionerQuery.data.age))} onChangeText={setAge} placeholder="Idade" keyboardType="number-pad" style={s.input} />
              <DefaultButton label={updateMutation.isPending ? "Salvando…" : "Salvar dados"} color={BrandColors.primary} action={() => updateMutation.mutate()} disabled={updateMutation.isPending} />
            </View> : null}
          </View>
          {[
            { id: "certificates", title: "Certificados", content: "O certificado é enviado durante a declaração de faixa. A API atual não vincula a listagem de certificados ao aluno, então nenhum arquivo global será exibido como se fosse seu." },
            { id: "settings", title: "Configurações", content: "Ainda não há operações de configuração de conta disponíveis no contrato da API." },
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
