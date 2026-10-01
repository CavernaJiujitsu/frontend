import { StyleSheet } from "react-native";

import { Colors, Spacing } from "@/constants/theme";

export const DEFAULT_SPINNER_SIZE = 144;

export const loadingSpinnerStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  artwork: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
  },
  label: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
