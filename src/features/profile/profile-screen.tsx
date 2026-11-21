import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import {
  getMyProfile,
  getMyTrainingHours,
} from "@/api/services/profile.service";
import { getPractitioner, updatePractitioner } from "@/api/services/practitioners.service";
import { requestPasswordRecovery } from "@/api/services/password-recovery.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { ProfilePhoto } from "@/components/profile-photo";
import { StudentPage } from "@/components/student-preview/preview-kit";
import { LoadingSpinner } from "@/components/customized/loading-spinner/loading-spinner";
import { getErrorMessage } from "@/constants/error-messages";
import { BrandColors } from "@/constants/theme";
import { studentKeys } from "@/hooks/query-keys";
import { useReportQueryError } from "@/hooks/use-report-query-error";
import { useAppStore } from "@/store/useAppStore";
import { usePasswordRecoveryStore } from "@/store/usePasswordRecoveryStore";
import { profileStyles as p } from "@/styles/private/profile.styles";
import { studentStyles as s } from "@/styles/private/student-preview.styles";
import { notify } from "@/utils/dialogs";
import { normalizeApiError } from "@/utils/normalize-api-error";
import { enterMode, logout, logoutToRecovery } from "@/utils/session";

function classTypeLabel(value: string | null | undefined): string | null {
  if (value === "SCHEDULED") return "Treino";
  if (value === "VALIDATION") return "Avaliação";
  if (value === "EXAM") return "Exame";
  return value ?? null;
}

export function ProfileScreen({ section }: { section?: "dados" | "certificados" | "configuracoes" }) {
  const navigation = useRouter();
  const queryClient = useQueryClient();
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const accessToken = useAppStore((state) => state.user.accessToken);
  const isTeacher = useAppStore((state) => state.user.roles.includes("TEACHER"));
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const query = useQuery({
    queryKey: studentKeys.profile(practitionerId),
    queryFn: getMyProfile,
    enabled: Boolean(accessToken),
  });
  useReportQueryError(query.error);
  const hoursQuery = useQuery({
    queryKey: [...studentKeys.profile(practitionerId), "hours"],
    queryFn: getMyTrainingHours,
    enabled: Boolean(accessToken && practitionerId),
  });
  const profile = query.data;
  const practitionerQuery = useQuery({
    queryKey: studentKeys.practitioner(practitionerId),
    queryFn: () => getPractitioner(practitionerId!),
    enabled: Boolean(practitionerId && accessToken),
  });
  const trainingRecord = profile?.trainingRecord;
  const stats = [
    { label: "Horas de treino", value: hoursQuery.data === undefined ? null : `${hoursQuery.data.toLocaleString("pt-BR")} h` },
    { label: "Última aula", value: classTypeLabel(trainingRecord?.class) },
    { label: "Caverna", value: trainingRecord?.caveUnit ?? null },
    { label: "Data", value: trainingRecord ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(trainingRecord.startsAt)) : null },
  ];
  const sectionTitle = section === "dados" ? "Dados do perfil" : section === "certificados" ? "Certificados" : "Configurações";

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
        queryClient.invalidateQueries({ queryKey: studentKeys.profile(practitionerId) }),
        queryClient.invalidateQueries({ queryKey: studentKeys.practitioner(practitionerId) }),
      ]);
      notify("Perfil atualizado", "Seus dados foram salvos.", "success");
    },
    onError: (error: unknown) => notify("Não foi possível salvar", backendMessage(error, "Confira os dados e tente novamente."), "error"),
  });
  const passwordRequest = useMutation({
    mutationFn: async () => {
      const typed = recoveryEmail.trim().toLowerCase();
      if (!typed || !profile?.email || typed !== profile.email.trim().toLowerCase()) {
        // Preserve the generic response without issuing a link for another account.
        return;
      }
      await requestPasswordRecovery({ email: typed });
    },
    onSuccess: () => {
      usePasswordRecoveryStore.getState().setConfirmationMessage(
        "Se houver uma conta com este e-mail, enviaremos um link de recuperação.",
      );
      logoutToRecovery();
    },
    onError: (error: unknown) => notify("Não foi possível solicitar", backendMessage(error, "Tente novamente."), "error"),
  });

  return (
    <StudentPage title={section ? sectionTitle : "Perfil"} subtitle={section ? "Sua conta na Caverna" : "Seus dados e sua graduação"}>
      {!accessToken ? (
        <View style={s.card}>
          <Text style={s.title}>Sua sessão precisa ser renovada</Text>
          <Text style={s.body}>Entre novamente para carregar seu perfil.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/onboarding/login")} style={s.action}>
            <Text style={s.accent}>Voltar para o login</Text>
          </Pressable>
        </View>
      ) : query.isLoading ? <LoadingSpinner label="Carregando seu perfil…" /> : query.isError ? (
        <>
          <View style={s.card}>
            <Text style={s.title} accessibilityRole="alert">Não foi possível carregar seu perfil</Text>
            <Text style={s.body}>{getErrorMessage(normalizeApiError(query.error))}</Text>
            <DefaultButton
              label="Tentar novamente"
              color={BrandColors.secondary}
              action={() => void query.refetch()}
            />
          </View>
          {/* Leaving the account must stay possible when the profile fails. */}
          <DefaultButton label="Sair da conta" color={BrandColors.primary} action={logout} />
        </>
      ) : profile ? (
        <View style={p.page}>
          {section ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao perfil" onPress={() => navigation.replace("/perfil")} style={p.back}>
              <Text style={p.backText}>‹  Voltar ao perfil</Text>
            </Pressable>
          ) : null}
          {!section ? (
            <>
              <View style={p.hero}>
                <ProfilePhoto />
                <Text style={p.name}>{profile.name}</Text>
                <Text style={p.belt}>{profile.activeBelt?.name ?? "Graduação indisponível"}</Text>
                <Text style={p.email}>{profile.email}</Text>
              </View>
              <Text style={p.eyebrow}>SUA JORNADA</Text>
              <View style={p.stats}>
                {stats.map((stat) => (
                  <View key={stat.label} style={p.stat} accessibilityLabel={`${stat.label}: ${stat.value ?? "indisponível"}`}>
                    <Text style={p.statValue}>{stat.value ?? "—"}</Text>
                    <Text style={p.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
              {!trainingRecord ? <Text style={s.body}>Seu registro de treino ainda não está disponível.</Text> : null}
              <Text style={p.eyebrow}>MINHA CONTA</Text>
              <View style={p.links}>
                {([
                  { route: "dados", title: "Dados do perfil", detail: "Nome, e-mail e informações pessoais", icon: "◉" },
                  { route: "certificados", title: "Certificados", detail: "Informações sobre sua graduação", icon: "◇" },
                  { route: "configuracoes", title: "Configurações", detail: "Endereço e segurança da conta", icon: "⚙" },
                ] as const).map((item) => (
                  <Pressable
                    key={item.route}
                    accessibilityRole="button"
                    accessibilityLabel={item.title}
                    onPress={() => navigation.push(`/perfil/${item.route}`)}
                    style={({ pressed }) => [p.link, pressed && s.pressed]}
                  >
                    <Text style={p.linkIcon} accessibilityElementsHidden>{item.icon}</Text>
                    <View style={p.linkCopy}>
                      <Text style={p.linkTitle}>{item.title}</Text>
                      <Text style={p.linkDetail}>{item.detail}</Text>
                    </View>
                    <Text style={p.chevron} accessibilityElementsHidden>›</Text>
                  </Pressable>
                ))}
              </View>
              {isTeacher ? <DefaultButton label="Entrar como professor" color={BrandColors.secondary} action={() => enterMode("teacher")} /> : null}
              <DefaultButton label="Sair da conta" color={BrandColors.primary} action={logout} />
            </>
          ) : null}
          {section === "dados" ? (
            <>
              <View style={p.intro}><Text style={p.sectionTitle}>Informações pessoais</Text><Text style={p.description}>Mantenha seus dados atualizados para sua caverna.</Text></View>
              <View style={p.panel}>
                <Text style={p.fieldLabel}>Nome completo</Text>
                <TextInput accessibilityLabel="Nome completo" value={name ?? profile.name} onChangeText={setName} placeholder="Nome completo" placeholderTextColor={p.placeholder.color} autoCapitalize="words" style={p.input} />
                <Text style={p.fieldLabel}>E-mail</Text>
                <TextInput accessibilityLabel="E-mail" value={email ?? profile.email} onChangeText={setEmail} placeholder="E-mail" placeholderTextColor={p.placeholder.color} autoCapitalize="none" keyboardType="email-address" style={p.input} />
                <Text style={p.fieldLabel}>Idade</Text>
                <TextInput accessibilityLabel="Idade" value={age ?? (practitionerQuery.data?.age === null || practitionerQuery.data?.age === undefined ? "" : String(practitionerQuery.data.age))} onChangeText={setAge} placeholder="Idade" placeholderTextColor={p.placeholder.color} keyboardType="number-pad" style={p.input} />
              </View>
              <DefaultButton label={updateMutation.isPending ? "Salvando…" : "Salvar dados"} color={BrandColors.secondary} action={() => updateMutation.mutate()} disabled={updateMutation.isPending} />
            </>
          ) : null}
          {section === "certificados" ? (
            <>
              <View style={p.intro}><Text style={p.sectionTitle}>Meus certificados</Text><Text style={p.description}>Informações sobre as conquistas da sua jornada.</Text></View>
              <View style={p.empty}>
                <Text style={p.emptyIcon}>◇</Text>
                <Text style={p.sectionTitle}>Nenhum certificado disponível</Text>
                <Text style={p.description}>O certificado é enviado durante a declaração de faixa. A API atual não vincula a listagem de certificados ao aluno, então nenhum arquivo global será exibido como se fosse seu.</Text>
              </View>
            </>
          ) : null}
          {section === "configuracoes" ? (
            <>
              <View style={p.intro}><Text style={p.sectionTitle}>Endereço</Text><Text style={p.description}>Usamos para encontrar as cavernas mais próximas.</Text></View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Alterar endereço"
                onPress={() => navigation.push("/perfil/endereco")}
                style={({ pressed }) => [p.link, p.panel, pressed && s.pressed]}
              >
                <View style={p.linkCopy}>
                  <Text style={p.linkTitle}>{practitionerQuery.data?.address ?? "Escolher endereço"}</Text>
                  <Text style={p.linkDetail}>Buscar ou usar minha localização atual</Text>
                </View>
                <Text style={p.chevron} accessibilityElementsHidden>›</Text>
              </Pressable>
              <View style={p.intro}><Text style={p.sectionTitle}>Trocar senha</Text><Text style={p.description}>Confirme seu e-mail para receber o link. Você sairá da conta ao solicitar.</Text></View>
              <View style={p.panel}>
                <Text style={p.fieldLabel}>E-mail cadastrado</Text>
                <TextInput accessibilityLabel="Confirmar e-mail para trocar senha" value={recoveryEmail} onChangeText={setRecoveryEmail} placeholder="Seu e-mail cadastrado" placeholderTextColor={p.placeholder.color} autoCapitalize="none" keyboardType="email-address" style={p.input} />
                <DefaultButton label={passwordRequest.isPending ? "Enviando…" : "Enviar link e sair"} color={BrandColors.primary} disabled={passwordRequest.isPending || !recoveryEmail.trim()} action={() => passwordRequest.mutate()} />
              </View>
            </>
          ) : null}
        </View>
      ) : null}
    </StudentPage>
  );
}
