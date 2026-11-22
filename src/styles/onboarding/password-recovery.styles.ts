import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  requestContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    paddingBottom: Spacing.four,
  },
  back: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  backArrow: {
    color: Colors.light.textSecondary,
    fontSize: 22,
    lineHeight: 24,
  },
  backText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
  },
  requestBody: {
    width: "100%",
    marginTop: Spacing.five,
  },
  requestHeader: {
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  lockIcon: {
    marginBottom: Spacing.two,
  },
  title: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 300,
  },
  requestButton: {
    marginTop: Spacing.two,
  },
  loginPrompt: {
    alignItems: "center",
    gap: Spacing.one,
    marginTop: Spacing.four,
  },
  loginPromptText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
  },
  loginLink: {
    color: BrandColors.borderSecondary,
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: Spacing.one,
  },
  confirmationContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    justifyContent: "center",
    paddingBottom: Spacing.four,
  },
  confirmationBody: {
    alignItems: "center",
    width: "100%",
  },
  checkIcon: {
    marginBottom: Spacing.two,
  },
  confirmationMessage: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 310,
    marginBottom: Spacing.five,
  },
  confirmationButton: {
    width: "100%",
  },
  autoReturn: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: Spacing.four,
  },
});
