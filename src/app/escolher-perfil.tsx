import { Redirect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FullScreenLoader } from "@/components/auth/role-guard";
import { DefaultButton } from "@/components/customized/default-button";
import { ScreenLayout } from "@/components/screen-layout/screen-layout";
import { BrandColors, Colors, Spacing } from "@/constants/theme";
import { useAppStore, useStoreHydrated } from "@/store/useAppStore";
import { enterMode, hasRole, logout } from "@/utils/session";

export default function ChooseModeScreen() {
  const hydrated = useStoreHydrated();
  const accessToken = useAppStore((state) => state.user.accessToken);
  const roles = useAppStore((state) => state.user.roles);

  if (!hydrated) return <FullScreenLoader />;
  if (!accessToken) return <Redirect href="/onboarding/login" />;
  if (!hasRole(roles, "STUDENT") || !hasRole(roles, "TEACHER")) {
    return <Redirect href="/" />;
  }

  return (
    <ScreenLayout>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            Como você quer entrar?
          </Text>
          <Text style={styles.subtitle}>
            Sua conta é de aluno e de professor. Você pode trocar depois pela
            tela de perfil.
          </Text>
        </View>
        <DefaultButton
          label="Entrar como aluno"
          color={BrandColors.secondary}
          action={() => enterMode("student")}
        />
        <DefaultButton
          label="Entrar como professor"
          color={BrandColors.primary}
          action={() => enterMode("teacher")}
        />
        <Pressable accessibilityRole="button" onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: "center", gap: Spacing.three },
  header: { gap: Spacing.two, marginBottom: Spacing.three },
  title: { color: Colors.light.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: Colors.light.textSecondary, fontSize: 14, lineHeight: 20 },
  logout: { alignItems: "center", minHeight: 48, justifyContent: "center" },
  logoutText: { color: Colors.light.textSecondary, fontWeight: "600" },
});
