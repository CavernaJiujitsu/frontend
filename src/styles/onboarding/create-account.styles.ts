import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
  },
  header: {
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: BrandColors.onPrimary,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  eyeToggle: {
    fontSize: 12,
    fontWeight: "700",
    color: BrandColors.borderSecondary,
    marginLeft: Spacing.two,
  },
  hint: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: -Spacing.two,
    marginBottom: Spacing.three,
  },
  submitError: {
    fontSize: 12,
    color: BrandColors.danger,
    marginBottom: Spacing.two,
    textAlign: "center",
  },
  actions: {
    gap: Spacing.three,
    width: "100%",
    marginTop: Spacing.two,
  },
  loginPressable: {
    alignItems: "center",
    paddingVertical: Spacing.two,
  },
  loginText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  loginLink: {
    color: BrandColors.secondary,
    fontWeight: "700",
  },
});
