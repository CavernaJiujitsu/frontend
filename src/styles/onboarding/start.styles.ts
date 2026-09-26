import { StyleSheet } from "react-native";

import { BrandColors } from "@/constants/theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  message: {
    alignItems: "center",
  },
  iconDisplayer: {
    marginBottom: 24,
  },
  title: {
    color: BrandColors.secondary,
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    marginTop: 16,
    color: BrandColors.onPrimary,
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
  },
  actions: {
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
});
