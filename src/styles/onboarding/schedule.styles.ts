import { StyleSheet } from "react-native";

import { Colors, Spacing } from "@/constants/theme";

/**
 * Deltas específicos da tela schedule.
 * Base vem de `globalStyles.screen/container`. Nenhum hex aqui.
 */
export const scheduleStyles = StyleSheet.create({
  pageGap: {
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
  selectedDate: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    textAlign: "left",
    textTransform: "capitalize",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.five,
    gap: Spacing.one,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
