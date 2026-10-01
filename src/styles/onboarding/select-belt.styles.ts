import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

/**
 * Deltas específicos da tela select-belt.
 * Base vem de `globalStyles.screen/container`. Nenhum hex aqui.
 */
export const selectBeltStyles = StyleSheet.create({
  pageGap: {
    gap: Spacing.three,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.text,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "left",
    lineHeight: 20,
  },
  optionCard: {
    width: "100%",
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOptionCard: {
    borderColor: BrandColors.borderSecondary,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  optionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.text,
  },
  selectedBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.borderSecondary,
  },
  selectedBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: BrandColors.borderSecondary,
  },
  optionDescription: {
    marginTop: Spacing.two,
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  actions: {
    width: "100%",
  },
});
