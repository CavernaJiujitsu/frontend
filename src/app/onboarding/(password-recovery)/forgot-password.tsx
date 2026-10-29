import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { requestPasswordRecovery } from "@/api/services/password-recovery.service";
import { DefaultButton } from "@/components/customized/default-button";
import { FormField } from "@/components/customized/form-field/form-field";
import { RecoveryLockIcon } from "@/components/customized/password-recovery-icons";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors } from "@/constants/theme";
import { reportError } from "@/store/useErrorStore";
import { usePasswordRecoveryStore } from "@/store/usePasswordRecoveryStore";
import { styles } from "@/styles/onboarding/password-recovery.styles";

type RequestForm = { email: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const submissionLocked = useRef(false);
  const requestGeneration = useRef(0);
  useFocusEffect(
    useCallback(() => {
      return () => {
        requestGeneration.current += 1;
        submissionLocked.current = false;
      };
    }, []),
  );
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RequestForm>({
    defaultValues: { email: "" },
    reValidateMode: "onChange",
  });

  const goToLogin = () => {
    requestGeneration.current += 1;
    router.replace("/onboarding/login");
  };

  const onSubmit = async ({ email }: RequestForm) => {
    if (submissionLocked.current) return;
    submissionLocked.current = true;
    const currentRequest = ++requestGeneration.current;
    usePasswordRecoveryStore.getState().clearConfirmationMessage();

    try {
      const message = await requestPasswordRecovery({ email });
      if (currentRequest !== requestGeneration.current) return;
      usePasswordRecoveryStore.getState().setConfirmationMessage(message);
      router.replace("/onboarding/check-email");
    } catch (error) {
      if (currentRequest !== requestGeneration.current) return;
      submissionLocked.current = false;
      reportError(error);
    }
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        style={styles.scroll}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.requestContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar para o login"
            onPress={goToLogin}
            style={styles.back}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Voltar para o login</Text>
          </Pressable>

          <View style={styles.requestBody}>
            <View style={styles.requestHeader}>
              <View accessible accessibilityLabel="Ícone de cadeado" style={styles.lockIcon}>
                <RecoveryLockIcon />
              </View>
              <Text accessibilityRole="header" style={styles.title}>
                Esqueceu sua senha?
              </Text>
              <Text style={styles.subtitle}>
                Informe o e-mail da sua conta para receber um link de recuperação.
              </Text>
            </View>

            <Controller
              control={control}
              name="email"
              rules={{
                validate: (value) => {
                  if (!value) return "Informe seu e-mail.";
                  if (value.length > 160) return "O e-mail deve ter até 160 caracteres.";
                  if (/\s/.test(value)) return "O e-mail não pode conter espaços.";
                  return EMAIL_REGEX.test(value) || "E-mail inválido.";
                },
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormField
                  accessibilityLabel="E-mail"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
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

            <View style={styles.requestButton}>
              <DefaultButton
                action={() => {
                  void handleSubmit(onSubmit)();
                }}
                color={BrandColors.secondary}
                disabled={isSubmitting}
                label={isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
                textColor={BrandColors.background}
              />
            </View>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Lembrou a senha?</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar para o login"
                onPress={goToLogin}
              >
                <Text style={styles.loginLink}>Voltar para o login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}
