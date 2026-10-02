import { StyleSheet } from "react-native";

import { Colors, Spacing } from "@/constants/theme";

/**
 * Deltas específicos da tela nearby-gym.
 * Base vem de `globalStyles.screen/container`. Nenhum hex aqui.
 */
export const nearbyGymStyles = StyleSheet.create({
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
  listContent: {
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    gap: Spacing.two,
  },
  emptyTitle: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
