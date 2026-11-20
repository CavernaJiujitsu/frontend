import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { DefaultButton } from "@/components/customized/default-button";
import { RecoveryCheckIcon } from "@/components/customized/password-recovery-icons";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors } from "@/constants/theme";
import { usePasswordRecoveryStore } from "@/store/usePasswordRecoveryStore";
import { styles } from "@/styles/onboarding/password-recovery.styles";

export default function CheckEmailScreen() {
  const router = useRouter();
  const message = usePasswordRecoveryStore((state) => state.confirmationMessage);
  const clearMessage = usePasswordRecoveryStore((state) => state.clearConfirmationMessage);

  if (!message) return null;

  const goToLogin = () => {
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
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
