import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const formFieldStyles = StyleSheet.create({
  group: {
    marginBottom: Spacing.three,
  },
  label: {
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
    borderColor: BrandColors.danger,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    paddingVertical: Spacing.two,
  },
  error: {
    fontSize: 11,
    color: BrandColors.danger,
    marginTop: Spacing.one,
  },
});
