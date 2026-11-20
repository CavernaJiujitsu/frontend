import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const profileAddressStyles = StyleSheet.create({
  heading: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: "700",
  },
  hint: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  list: { gap: Spacing.two },
  option: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: Colors.light.backgroundSelected,
  },
  optionSelected: {
    borderColor: BrandColors.borderSecondary,
    borderWidth: 2,
    backgroundColor: Colors.light.backgroundElement,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: BrandColors.borderSecondary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.borderSecondary,
  },
  optionCopy: { flex: 1, gap: Spacing.one },
  optionText: { color: Colors.light.text, fontSize: 13, lineHeight: 19 },
  selectedTag: {
    color: BrandColors.borderSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  selection: {
    padding: Spacing.three,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.borderSecondary,
    backgroundColor: Colors.light.backgroundSelected,
    gap: Spacing.one,
  },
});
