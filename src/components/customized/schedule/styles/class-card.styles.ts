import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

/**
 * Deltas específicos do ClassCard.
 * Compõe `globalStyles.card` (fundo/borda/raio) com este layout local.
 * Nenhum hex aqui — tudo vem de `@/constants/theme`.
 */
export const classCardStyles = StyleSheet.create({
  cardLayout: {
    flexDirection: "column",
    padding: Spacing.three,
    gap: 0,
    marginBottom: Spacing.two,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.light.text,
  },
  separator: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    flexShrink: 1,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: Colors.light.backgroundSelected,
  },
  tagHighlight: {
    backgroundColor: Colors.light.backgroundElement,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: BrandColors.borderSecondary,
  },
  tagTextHighlight: {
    color: BrandColors.borderSecondary,
  },
  professor: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: Spacing.two + Spacing.one,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.two + Spacing.one,
    gap: Spacing.two,
  },
  capacity: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  /**
   * Desvio documentado do DefaultButton (minHeight 56, radius 8):
   * ação secundária densa dentro de lista. Mantém alvo de toque
   * mínimo acessível (minHeight 44) e tokens da marca.
   */
  enrollButton: {
    minWidth: 104,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: BrandColors.secondary,
    borderWidth: 1,
    borderColor: BrandColors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  enrollButtonDisabled: {
    opacity: 0.6,
  },
  enrollButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  enrollButtonEnrolled: {
    backgroundColor: "transparent",
    borderColor: BrandColors.borderSecondary,
  },
  enrollLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: BrandColors.background,
  },
  enrollLabelEnrolled: {
    color: BrandColors.borderSecondary,
  },
});
