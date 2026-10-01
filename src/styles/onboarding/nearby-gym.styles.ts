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
});