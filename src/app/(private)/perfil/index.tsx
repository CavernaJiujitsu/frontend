import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import {
  getMyProfile,
} from "@/api/services/profile.service";
import { getPractitioner, searchAddresses, updatePractitioner, type AddressResult } from "@/api/services/practitioners.service";
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
import { profileAddressStyles as addressStyles } from "@/styles/private/profile-address.styles";
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

export default function Perfil() {
  const queryClient = useQueryClient();
  const practitionerId = useAppStore((state) => state.user.practitionerId);
  const accessToken = useAppStore((state) => state.user.accessToken);
  const isTeacher = useAppStore((state) => state.user.roles.includes("TEACHER"));
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const query = useQuery({
    queryKey: studentKeys.profile(practitionerId),
    queryFn: getMyProfile,
    enabled: Boolean(accessToken),
  });
  useReportQueryError(query.error);
  const profile = query.data;
  const practitionerQuery = useQuery({
    queryKey: studentKeys.practitioner(practitionerId),
    queryFn: () => getPractitioner(practitionerId!),
    enabled: Boolean(practitionerId && accessToken),
  });
  const trainingRecord = profile?.trainingRecord;
  const stats = [
    { label: "Última aula", value: classTypeLabel(trainingRecord?.class) },
    { label: "Caverna", value: trainingRecord?.caveUnit ?? null },
    { label: "Data", value: trainingRecord ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(trainingRecord.startsAt)) : null },
  ];

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
  const addressSearch = useMutation({
    mutationFn: () => searchAddresses(addressQuery.trim()),
    onSuccess: () => setSelectedAddress(null),
    onError: (error: unknown) => notify("Busca indisponível", backendMessage(error, "Tente novamente mais tarde."), "error"),
  });
  const saveAddress = useMutation({
    mutationFn: () => updatePractitioner(practitionerId!, selectedAddress!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.practitioner(practitionerId) });
      notify("Endereço atualizado", "Sua localização foi salva.", "success");
    },
    onError: (error: unknown) => notify("Não foi possível salvar", backendMessage(error, "Tente novamente."), "error"),
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
          ].map((section) => (
            <View key={section.id} style={s.card}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: openSection === section.id }} style={({ pressed }) => [s.action, pressed && s.pressed]} onPress={() => setOpenSection(openSection === section.id ? null : section.id)}>
                <Text style={s.title}>{section.title} {openSection === section.id ? "−" : "+"}</Text>
              </Pressable>
              {openSection === section.id ? <Text style={s.body}>{section.content}</Text> : null}
            </View>
          ))}
          <View style={s.card}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: openSection === "settings" }} style={s.action} onPress={() => setOpenSection(openSection === "settings" ? null : "settings")}>
              <Text style={s.title}>Configurações {openSection === "settings" ? "−" : "+"}</Text>
            </Pressable>
            {openSection === "settings" ? <View style={{ gap: 12 }}>
              <Text style={s.body}>Endereço salvo: {practitionerQuery.data?.address ?? "Não informado"}</Text>
              <TextInput accessibilityLabel="Buscar endereço" value={addressQuery} onChangeText={(value) => { setAddressQuery(value); setSelectedAddress(null); addressSearch.reset(); }} placeholder="Rua, número, cidade e estado" style={s.input} />
              <DefaultButton label={addressSearch.isPending ? "Buscando…" : "Buscar endereço"} color={BrandColors.primary} disabled={addressSearch.isPending || addressQuery.trim().length < 5} action={() => addressSearch.mutate()} />
              {addressSearch.isSuccess && addressSearch.data.length === 0 ? <Text style={s.body}>Nenhum endereço encontrado. Confira os dados e tente novamente.</Text> : null}
              {addressSearch.data?.length ? (
                <View style={addressStyles.list}>
                  <Text style={addressStyles.heading}>Escolha um endereço</Text>
                  <Text style={addressStyles.hint}>Toque em uma opção para confirmar a localização correta.</Text>
                  {addressSearch.data.map((result, index) => {
                    const selected = selectedAddress === result;
                    return (
                      <Pressable
                        key={`${result.address}-${index}`}
                        accessibilityRole="button"
                        accessibilityLabel={result.address}
                        accessibilityState={{ selected }}
                        onPress={() => setSelectedAddress(result)}
                        style={({ pressed }) => [addressStyles.option, selected && addressStyles.optionSelected, pressed && s.pressed]}
                      >
                        <View style={[addressStyles.radio, selected && addressStyles.radioSelected]}>
                          {selected ? <View style={addressStyles.radioDot} /> : null}
                        </View>
                        <View style={addressStyles.optionCopy}>
                          <Text style={addressStyles.optionText}>{result.address}</Text>
                          {selected ? <Text style={addressStyles.selectedTag}>✓ Selecionado</Text> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
              {selectedAddress ? (
                <>
                  <View style={addressStyles.selection}>
                    <Text style={addressStyles.selectedTag}>ENDEREÇO SELECIONADO</Text>
                    <Text style={addressStyles.optionText}>{selectedAddress.address}</Text>
                  </View>
                  <DefaultButton label={saveAddress.isPending ? "Salvando…" : "Salvar endereço selecionado"} color={BrandColors.secondary} disabled={saveAddress.isPending} action={() => saveAddress.mutate()} />
                </>
              ) : null}
              <Text style={s.title}>Trocar senha</Text>
              <Text style={s.body}>Confirme seu e-mail para receber o link. Você sairá da conta ao solicitar.</Text>
              <TextInput accessibilityLabel="Confirmar e-mail para trocar senha" value={recoveryEmail} onChangeText={setRecoveryEmail} placeholder="Seu e-mail cadastrado" autoCapitalize="none" keyboardType="email-address" style={s.input} />
              <DefaultButton label={passwordRequest.isPending ? "Enviando…" : "Enviar link e sair"} color={BrandColors.primary} disabled={passwordRequest.isPending || !recoveryEmail.trim()} action={() => passwordRequest.mutate()} />
            </View> : null}
          </View>
          {isTeacher ? (
            <DefaultButton
              label="Entrar como professor"
              color={BrandColors.secondary}
              action={() => enterMode("teacher")}
            />
          ) : null}
          <DefaultButton
            label="Sair da conta"
            color={BrandColors.primary}
            action={logout}
          />
        </>
      ) : null}
    </StudentPage>
  );
}
