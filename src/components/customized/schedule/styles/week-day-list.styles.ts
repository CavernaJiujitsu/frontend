import { StyleSheet } from "react-native";

import { BrandColors, Colors, Spacing } from "@/constants/theme";

/**
 * Deltas específicos do WeekDayList.
 * Nenhum hex aqui — tudo vem de `@/constants/theme`.
 */
export const weekDayListStyles = StyleSheet.create({
  /**
   * Altura travada na altura da célula: sem ela o FlatList horizontal
   * estica e ocupa o espaço livre entre os dias e a lista de aulas.
   */
  list: {
    height: 62,
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    gap: Spacing.two,
  },
  day: {
    width: 56,
    height: 62,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  daySelected: {
    backgroundColor: BrandColors.secondary,
    borderColor: BrandColors.secondary,
  },
  dayPressed: {
    opacity: 0.82,
  },
  weekday: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
  },
  weekdaySelected: {
    color: BrandColors.background,
  },
  date: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.light.text,
  },
  dateSelected: {
    color: BrandColors.background,
  },
});
