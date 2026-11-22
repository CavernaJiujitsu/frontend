import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { login } from "@/api/services/auth.service";
import { localeIcon } from "@/assets/images";
import { DefaultButton } from "@/components/customized/default-button";
import { FormField } from "@/components/customized/form-field/form-field";
import { BrandColors, Colors } from "@/constants/theme";
import { reportError } from "@/store/useErrorStore";
import { useAppStore } from "@/store/useAppStore";
import { globalStyles } from "@/styles/global.styles";
import { styles } from "@/styles/onboarding/login.styles";
import { notify } from "@/utils/dialogs";
import { homeRouteFor } from "@/utils/session";

type LoginForm = {
  email: string;
  senha: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function LoginScreen() {
  const router = useRouter();
  // Set by the signup screen when the account was created but the automatic
  // login failed.
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const prefilledEmail = firstParam(params.email) ?? "";
  const [showSenha, setShowSenha] = useState(false);
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<LoginForm>({
    defaultValues: { email: prefilledEmail, senha: "" },
    reValidateMode: "onChange",
  });

  const handleLogin = async ({ email, senha }: LoginForm) => {
    try {
      const session = await login({
        email: email.trim(),
        password: senha,
      });

      const home = homeRouteFor(session.roles, null);
      if (!home) {
        notify(
          "Acesso indisponível",
          "Esta conta não possui perfil de aluno ou professor. Use o aplicativo desktop.",
        );
        return;
      }
      useAppStore.getState().setAuthIdentity(session);
      useAppStore.getState().setProfile({ nome: email.trim(), email: email.trim() });
      router.replace(home);
    } catch (error) {
      reportError(error);
    }
  };

  const handleForgotPassword = () => {
    router.push("/onboarding/forgot-password");
  };

  const handleCreateAccount = () => {
    router.replace("/onboarding/start");
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <KeyboardAvoidingView
        style={globalStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.header}>
              <Image
                accessibilityLabel="Ícone de localização da Caverna JiuJitsu"
                source={localeIcon}
                style={styles.locationIcon}
              />
              <Text accessibilityRole="header" style={styles.title}>
                Bem-vindo de volta
              </Text>
              <Text style={styles.subtitle}>Entre para continuar sua trilha</Text>
            </View>

            <Controller
              control={control}
              name="email"
              rules={{
                validate: (value) => {
                  if (!value.trim()) return "Informe seu e-mail.";
                  return EMAIL_REGEX.test(value.trim()) || "E-mail inválido.";
                },
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormField
                  accessibilityLabel="E-mail"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                  error={error?.message}
                  keyboardType="email-address"
                  label="E-MAIL"
                  onChangeText={onChange}
                  placeholder="seuemail@exemplo.com"
                  value={value}
                />
              )}
            />

            <Controller
              control={control}
              name="senha"
              rules={{
                validate: (value) => (value ? true : "Informe sua senha."),
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormField
                  accessibilityLabel="Senha"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                  error={error?.message}
                  label="SENHA"
                  onChangeText={onChange}
                  placeholder="••••••••"
                  rightAction={
                    <Pressable
                      accessibilityLabel={showSenha ? "Ocultar senha" : "Mostrar senha"}
                      accessibilityRole="button"
                      accessibilityState={{ checked: showSenha }}
                      hitSlop={10}
                      onPress={() => setShowSenha((value) => !value)}
                      style={styles.passwordAction}
                    >
                      <Svg height={20} width={20} viewBox="0 0 24 24">
                        <Path
                          d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"
                          fill="none"
                          stroke={Colors.light.textSecondary}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                        />
                        <Path
                          d="M12 14.5A2.5 2.5 0 1 0 12 9.5a2.5 2.5 0 0 0 0 5Z"
                          fill="none"
                          stroke={Colors.light.textSecondary}
                          strokeWidth={1.8}
                        />
                      </Svg>
                    </Pressable>
                  }
                  secureTextEntry={!showSenha}
                  value={value}
                />
              )}
            />

            <Pressable
              accessibilityLabel="Esqueci minha senha"
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </Pressable>

            <DefaultButton
              action={handleSubmit(handleLogin)}
              color={BrandColors.secondary}
              disabled={isSubmitting}
              label={isSubmitting ? "Entrando..." : "Entrar"}
            />

            <View accessibilityElementsHidden style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              accessibilityLabel="Criar conta"
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleCreateAccount}
              style={styles.createAccount}
            >
              <Text style={styles.createAccountText}>
                Não tem conta?{" "}
                <Text style={styles.createAccountLink}>Criar conta</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
