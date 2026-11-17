import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { resetPassword } from "@/api/services/password-recovery.service";
import { backendMessage } from "@/api/utils/backend-message";
import { DefaultButton } from "@/components/customized/default-button";
import { FormField } from "@/components/customized/form-field/form-field";
import {
  RecoveryCheckIcon,
  RecoveryLockIcon,
} from "@/components/customized/password-recovery-icons";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors } from "@/constants/theme";
import { styles } from "@/styles/onboarding/password-recovery.styles";

// Same rule as the sign-up form.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

/** Opened from the e-mail link: /reset-password?token=... */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const goToLogin = () => router.replace("/onboarding/login");

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!PASSWORD_REGEX.test(password)) {
      setFieldError("Mínimo de 8 caracteres, com letras e números.");
      return;
    }
    if (password !== confirmation) {
      setFieldError("As senhas não conferem.");
      return;
    }
    setFieldError(null);
    setLoading(true);
    try {
      await resetPassword({ token: token!, password });
      setDone(true);
    } catch (error) {
      setSubmitError(
        backendMessage(error, "Não foi possível redefinir sua senha. Solicite um novo link."),
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <ScreenLayout>
        <ScrollView contentContainerStyle={styles.confirmationContent}>
          <View style={styles.confirmationBody}>
            <View style={styles.checkIcon}>
              <RecoveryCheckIcon />
            </View>
            <Text accessibilityRole="header" style={styles.title}>
              Senha redefinida
            </Text>
            <Text style={styles.confirmationMessage}>
              Agora é só entrar com a sua nova senha.
            </Text>
            <View style={styles.confirmationButton}>
              <DefaultButton
                action={goToLogin}
                color={BrandColors.secondary}
                label="Ir para o login"
                textColor={BrandColors.background}
              />
            </View>
          </View>
        </ScrollView>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        style={styles.scroll}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.requestContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.requestBody}>
            <View style={styles.requestHeader}>
              <View style={styles.lockIcon}>
                <RecoveryLockIcon />
              </View>
              <Text accessibilityRole="header" style={styles.title}>
                Criar nova senha
              </Text>
              <Text style={styles.subtitle}>
                {token
                  ? "Escolha uma nova senha para a sua conta."
                  : "Link inválido. Solicite uma nova recuperação de senha."}
              </Text>
            </View>

            {token ? (
              <>
                <FormField
                  label="NOVA SENHA"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
                <FormField
                  label="CONFIRMAR SENHA"
                  placeholder="••••••••"
                  value={confirmation}
                  onChangeText={setConfirmation}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                  error={fieldError ?? submitError ?? undefined}
                />
                <View style={styles.requestButton}>
                  <DefaultButton
                    action={() => void handleSubmit()}
                    color={BrandColors.secondary}
                    disabled={loading}
                    label={loading ? "Salvando..." : "Redefinir senha"}
                    textColor={BrandColors.background}
                  />
                </View>
              </>
            ) : (
              <DefaultButton
                action={() => router.replace("/onboarding/forgot-password")}
                color={BrandColors.secondary}
                label="Solicitar novo link"
                textColor={BrandColors.background}
              />
            )}

            <View style={styles.loginPrompt}>
              <Pressable accessibilityRole="button" onPress={goToLogin}>
                <Text style={styles.loginLink}>Voltar para o login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}
