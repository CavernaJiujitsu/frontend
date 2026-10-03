import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

export const errorToastStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.four,
    zIndex: 999,
    elevation: 8,
  },
  hidden: {
    opacity: 0,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.secondary,
    borderRadius: 12,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.text,
    textAlign: "left",
  },
  closeHitArea: {
    padding: Spacing.one,
  },
  close: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.light.textSecondary,
  },
});
