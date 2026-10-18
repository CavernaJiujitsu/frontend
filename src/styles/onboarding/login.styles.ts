import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    justifyContent: "center",
    paddingVertical: Spacing.four,
  },
  form: {
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.five,
  },
  locationIcon: {
    width: 56,
    height: 56,
    marginBottom: Spacing.three,
  },
  title: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: Spacing.one,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
  passwordAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: Spacing.two,
    paddingVertical: Spacing.two,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -Spacing.two,
    marginBottom: Spacing.four,
    paddingVertical: Spacing.one,
  },
  forgotPasswordText: {
    color: BrandColors.borderSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginVertical: Spacing.four,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BrandColors.border,
  },
  dividerText: {
    color: Colors.light.textSecondary,
    fontSize: 11,
  },
  createAccount: {
    alignSelf: "center",
    padding: Spacing.two,
  },
  createAccountText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
  createAccountLink: {
    color: BrandColors.borderSecondary,
    fontWeight: "700",
  },
});
