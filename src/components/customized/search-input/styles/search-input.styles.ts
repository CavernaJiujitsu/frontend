import { StyleSheet } from "react-native";

import { Colors, Spacing } from "@/constants/theme";

export const searchInputStyles = StyleSheet.create({
  searchLayout: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  icon: {
    width: 20,
    height: 20,
  },
  field: {
    flex: 1,
    color: Colors.light.text,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
    minHeight: 32,
  },
  clearText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
});
