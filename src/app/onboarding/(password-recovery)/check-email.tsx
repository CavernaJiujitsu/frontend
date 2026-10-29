import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";

import { DefaultButton } from "@/components/customized/default-button";
import { RecoveryCheckIcon } from "@/components/customized/password-recovery-icons";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors } from "@/constants/theme";
import { usePasswordRecoveryStore } from "@/store/usePasswordRecoveryStore";
import { styles } from "@/styles/onboarding/password-recovery.styles";

const AUTO_RETURN_MS = 60_000;

export default function CheckEmailScreen() {
  const router = useRouter();
  const message = usePasswordRecoveryStore((state) => state.confirmationMessage);
  const clearMessage = usePasswordRecoveryStore((state) => state.clearConfirmationMessage);
  const leaving = useRef(false);

  useEffect(() => {
    if (!message && !leaving.current) {
      router.replace("/onboarding/forgot-password");
      return;
    }
    if (!message) return;

    const timer = setTimeout(() => {
      leaving.current = true;
      clearMessage();
      router.replace("/onboarding/login");
    }, AUTO_RETURN_MS);
    return () => clearTimeout(timer);
  }, [clearMessage, message, router]);

  if (!message) return null;

  const goToLogin = () => {
    leaving.current = true;
    clearMessage();
    router.replace("/onboarding/login");
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.confirmationContent}>
        <View style={styles.confirmationBody}>
          <View accessible accessibilityLabel="Solicitação enviada com sucesso" style={styles.checkIcon}>
            <RecoveryCheckIcon />
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            Confira seu e-mail
          </Text>
          <Text style={styles.confirmationMessage}>{message}</Text>
          <View style={styles.confirmationButton}>
            <DefaultButton
              action={goToLogin}
              color={BrandColors.secondary}
              label="Voltar para o login"
              textColor={BrandColors.background}
            />
          </View>
          <Text style={styles.autoReturn}>
            Você voltará ao login automaticamente em 1 minuto.
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
