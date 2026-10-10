import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const bottomNavbarStyles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: Colors.light.backgroundElement,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.two,
    minHeight: 84,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  itemPressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  labelSelected: {
    color: Colors.light.text,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: BrandColors.secondary,
  },
  dotSelected: {
    backgroundColor: BrandColors.secondary,
  },
});
