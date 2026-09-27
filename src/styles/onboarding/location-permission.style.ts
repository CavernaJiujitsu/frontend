import { StyleSheet } from "react-native";

import { BrandColors, Colors } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },

  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    minHeight: 280,
    maxHeight: 430,
  },

  illustration: {
    width: "100%",
    height: "100%",
  },

  textContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 28,
  },

  title: {
    color: BrandColors.onPrimary,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    color: Colors.light.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 340,
  },

  secondaryDescription: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 320,
    marginTop: 10,
  },

  actions: {
    width: "100%",
    alignItems: "center",
  },

  skipButton: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  skipButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
