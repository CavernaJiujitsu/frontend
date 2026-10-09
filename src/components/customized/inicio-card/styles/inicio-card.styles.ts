import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const inicioCardStyles = StyleSheet.create({
  card: {
    width: "100%",
  },
  pressed: {
    opacity: 0.85,
  },
  contentGap: {
    gap: Spacing.two,
  },
});
