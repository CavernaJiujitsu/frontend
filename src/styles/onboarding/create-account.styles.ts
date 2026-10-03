import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

const danger = "#FF6B6B";

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
  fieldGroup: {
    marginBottom: Spacing.three,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    marginBottom: Spacing.two,
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BrandColors.border,
    paddingHorizontal: Spacing.three,
    minHeight: 56,
  },
  inputWrapError: {
    borderColor: danger,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    paddingVertical: Spacing.two,
  },
  fieldError: {
    fontSize: 11,
    color: danger,
    marginTop: Spacing.one,
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
    color: danger,
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
