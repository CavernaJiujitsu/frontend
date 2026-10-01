import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

/**
 * Deltas específicos do MonthSelector (dropdown).
 * Base de superfície vem de `globalStyles`; nenhum hex aqui.
 */
export const monthSelectorStyles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    width: "100%",
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  triggerPressed: {
    opacity: 0.82,
  },
  triggerLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
  },
  chevron: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.light.textSecondary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  backdropLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetLayout: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "70%",
    paddingVertical: Spacing.two,
  },
  optionsContent: {
    gap: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: Spacing.three,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  optionLabelSelected: {
    fontWeight: "800",
    color: Colors.light.text,
  },
  check: {
    fontSize: 14,
    fontWeight: "800",
    color: BrandColors.secondary,
  },
});
